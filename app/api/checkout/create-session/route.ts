import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// Initialize Stripe - use default API version for compatibility
// Initialize Stripe lazily
let stripePromise: Stripe | null = null;
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }
  if (!stripePromise) {
    stripePromise = new Stripe(secretKey);
  }
  return stripePromise;
};

// Helper function to validate HTTP/HTTPS URLs
function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      console.error("Stripe not initialized - missing STRIPE_SECRET_KEY");
      return NextResponse.json(
        { error: "Stripe is not configured on the server" },
        { status: 500 }
      );
    }
    console.log("=== Starting checkout session creation ===");
    const session = await auth();
    console.log("Auth session:", session?.user?.id || "guest");

    // Get base URL first - needed for both image URLs and success/cancel URLs
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    // If not set, try to get from request headers (for local dev)
    if (!baseUrl) {
      const origin = request.headers.get("origin") || request.headers.get("referer");
      if (origin) {
        try {
          const url = new URL(origin);
          baseUrl = `${url.protocol}//${url.host}`;
        } catch {
          // Fallback to localhost
          baseUrl = "http://localhost:3000";
        }
      } else {
        baseUrl = "http://localhost:3000";
      }
    }

    // Ensure baseUrl has protocol
    if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
      baseUrl = `http://${baseUrl}`;
    }

    // Remove trailing slash
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    console.log("Base URL for checkout:", cleanBaseUrl);

    const body = await request.json();
    console.log("Request body keys:", Object.keys(body));
    console.log("Items count:", body.items?.length);
    const {
      orderId,
      items,
      shippingAddress,
      shippingMethod,
      subtotal,
      tax,
      shipping,
      total,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Verify products exist and get their details
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: "Some products not found" },
        { status: 400 }
      );
    }

    // Create line items for Stripe
    const lineItems = items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      // Ensure price is valid
      const price = Number(item.price);
      if (isNaN(price) || price <= 0) {
        throw new Error(`Invalid price for product ${product.name}: ${item.price}`);
      }

      // Prepare product data
      const productData: any = {
        name: product.name,
      };

      // Only add images if they are absolute http(s) URLs
      // Stripe requires absolute URLs, not relative paths
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        const firstImage = product.images[0];
        if (typeof firstImage === "string" && firstImage.trim().length > 0) {
          let imageUrl = firstImage.trim();

          // If it's not already an absolute URL, try to convert it
          if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
            // It's a relative path, convert to absolute URL using the base URL we determined earlier
            // Ensure image path starts with /
            if (!imageUrl.startsWith("/")) {
              imageUrl = `/${imageUrl}`;
            }

            // Construct absolute URL
            try {
              imageUrl = new URL(imageUrl, cleanBaseUrl).toString();
            } catch (urlError) {
              console.warn(`Failed to convert image path to URL: ${imageUrl}`, urlError);
              imageUrl = ""; // Will be skipped below
            }
          }

          // Only add if it's a valid absolute URL
          if (imageUrl && isValidHttpUrl(imageUrl)) {
            productData.images = [imageUrl];
            console.log(`Added product image for ${product.name}:`, imageUrl);
          } else {
            console.warn(`Skipping invalid image URL for product ${product.name}:`, firstImage);
          }
        }
      }

      return {
        price_data: {
          currency: "usd",
          product_data: productData,
          unit_amount: Math.round(price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Add shipping as a line item if applicable
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: `Shipping (${shippingMethod === "express" ? "Express" : "Standard"})`,
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    // Construct success and cancel URLs using the base URL we determined earlier
    const successUrl = `${cleanBaseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${cleanBaseUrl}/checkout/cancel`;

    // Validate URLs are properly formatted
    let validatedSuccessUrl: string;
    let validatedCancelUrl: string;
    try {
      // Test URL construction with a placeholder
      const testSuccessUrl = successUrl.replace("{CHECKOUT_SESSION_ID}", "test");
      const successUrlObj = new URL(testSuccessUrl);
      validatedSuccessUrl = successUrl;

      const cancelUrlObj = new URL(cancelUrl);
      validatedCancelUrl = cancelUrl;

      console.log("Validated URLs:", { successUrl: validatedSuccessUrl, cancelUrl: validatedCancelUrl });
    } catch (urlError) {
      console.error("Invalid URL format:", {
        baseUrl,
        cleanBaseUrl,
        successUrl,
        cancelUrl,
        error: urlError
      });
      throw new Error(
        `Invalid URL format: ${urlError instanceof Error ? urlError.message : "Unknown URL error"}. ` +
        `Base URL: ${baseUrl}, Success URL: ${successUrl}, Cancel URL: ${cancelUrl}`
      );
    }

    console.log("Creating Stripe checkout session with URLs:", { successUrl: validatedSuccessUrl, cancelUrl: validatedCancelUrl });
    console.log("Line items count:", lineItems.length);
    console.log("Line items sample:", JSON.stringify(lineItems[0], null, 2));

    // Create Stripe Checkout Session
    console.log("Calling Stripe API...");
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: validatedSuccessUrl,
      cancel_url: validatedCancelUrl,
      customer_email: session?.user?.email || shippingAddress?.email || undefined,
      metadata: {
        orderId: orderId || "",
        userId: session?.user?.id || "guest",
        shippingAddress: JSON.stringify(shippingAddress),
        shippingMethod,
        items: JSON.stringify(items),
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        shipping: shipping.toString(),
        total: total.toString(),
      },
    });

    // Update order with payment intent ID if orderId is provided
    if (orderId) {
      try {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentIntentId: checkoutSession.payment_intent as string,
          },
        });
      } catch (error) {
        console.error("Failed to update order with payment intent:", error);
        // Don't fail the request if order update fails
      }
    }

    console.log("Stripe checkout session created:", checkoutSession.id);
    console.log("Initial session URL:", checkoutSession.url);

    // The checkout session should have a URL immediately
    // If it doesn't, retrieve it
    let checkoutUrl = checkoutSession.url;
    if (!checkoutUrl) {
      console.log("URL not in initial response, retrieving session...");
      const sessionWithUrl = await stripe.checkout.sessions.retrieve(checkoutSession.id);
      checkoutUrl = sessionWithUrl.url;
      console.log("Retrieved session URL:", checkoutUrl);
    }

    // Validate URL before returning
    if (!checkoutUrl) {
      console.error("No URL available in checkout session:", checkoutSession);
      throw new Error("Stripe checkout session created but no URL is available");
    }

    // Ensure URL is a valid string
    if (typeof checkoutUrl !== "string" || !checkoutUrl.startsWith("https://")) {
      console.error("Invalid URL format:", checkoutUrl);
      throw new Error(`Invalid checkout URL format: ${checkoutUrl}`);
    }

    console.log("Returning checkout URL:", checkoutUrl);

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutUrl
    });
  } catch (error: any) {
    console.error("=== STRIPE CHECKOUT ERROR ===");
    console.error("Error:", error);
    console.error("Error type:", error?.type);
    console.error("Error code:", error?.code);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);
    console.error("Error raw:", error?.raw);

    // Extract more detailed error message
    let errorMessage = "Failed to create checkout session";
    let statusCode = 500;
    let errorDetails: any = {};

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = { name: error.name, message: error.message, stack: error.stack };
    } else if (error?.message) {
      errorMessage = error.message;
      errorDetails = error;
    } else if (error?.raw?.message) {
      errorMessage = error.raw.message;
      errorDetails = error.raw;
    } else {
      errorDetails = error;
    }

    // Handle Stripe-specific errors
    if (error?.type === "StripeInvalidRequestError") {
      statusCode = 400;
      errorMessage = error.message || "Invalid Stripe request";
    } else if (error?.type === "StripeAuthenticationError") {
      statusCode = 401;
      errorMessage = "Stripe authentication failed. Please check your API keys.";
    } else if (error?.type === "StripeAPIError") {
      statusCode = 502;
      errorMessage = "Stripe API error. Please try again later.";
    }

    // Always return detailed error in development
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        message: errorMessage,
        type: error?.type,
        code: error?.code,
        details: errorDetails,
      },
      { status: statusCode }
    );
  }
}

