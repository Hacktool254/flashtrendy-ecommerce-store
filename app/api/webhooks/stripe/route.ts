import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      console.error("Stripe not initialized - missing STRIPE_SECRET_KEY");
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Check if order already exists by payment intent ID
      const existingOrderByPayment = await prisma.order.findUnique({
        where: {
          paymentIntentId: session.payment_intent as string,
        },
      });

      if (existingOrderByPayment) {
        // Order already exists, just update status
        await prisma.order.update({
          where: { id: existingOrderByPayment.id },
          data: { status: "PROCESSING" },
        });

        const { notifyAdmins } = await import("@/app/actions/notifications");
        await notifyAdmins({
          title: "Payment Confirmed",
          message: `Payment confirmed for Order #${existingOrderByPayment.id.slice(-8)}`,
          type: "ORDER",
          link: `/admin/orders/${existingOrderByPayment.id}`
        });

        return NextResponse.json({ received: true });
      }

      // Get metadata
      const metadata = session.metadata;
      if (!metadata) {
        console.error("Missing metadata in Stripe session");
        return NextResponse.json(
          { error: "Missing metadata" },
          { status: 400 }
        );
      }

      // If orderId exists in metadata, order was already created - just update status
      if (metadata.orderId) {
        const existingOrder = await prisma.order.findUnique({
          where: { id: metadata.orderId },
        });

        if (existingOrder) {
          await prisma.order.update({
            where: { id: metadata.orderId },
            data: {
              status: "PROCESSING",
              paymentIntentId: session.payment_intent as string,
            },
          });

          // Update product stock and notify admins
          const items = JSON.parse(metadata.items || "[]");
          const { notifyAdmins } = await import("@/app/actions/notifications");

          await notifyAdmins({
            title: "Order Payment Received",
            message: `Order #${metadata.orderId.slice(-8)} has been paid and is ready for processing.`,
            type: "ORDER",
            link: `/admin/orders/${metadata.orderId}`
          });

          for (const item of items) {
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          }

          // Clear cart if user is logged in
          if (metadata.userId && metadata.userId !== "guest") {
            await prisma.cart.deleteMany({
              where: {
                userId: metadata.userId,
              },
            });
          }

          console.log(`Order updated: ${metadata.orderId}`);
          return NextResponse.json({ received: true });
        }
      }

      const shippingAddress = JSON.parse(metadata.shippingAddress || "{}");
      const items = JSON.parse(metadata.items || "[]");

      // Handle guest checkout - create or find guest user
      let userId = metadata.userId;
      if (userId === "guest" || !userId) {
        const guestEmail = shippingAddress.email || session.customer_email || `guest-${Date.now()}@example.com`;
        // Try to find existing guest user with this email, or create one
        let guestUser = await prisma.user.findUnique({
          where: { email: guestEmail },
        });

        if (!guestUser) {
          // Create a guest user (you might want to use a different approach)
          // For now, we'll use a placeholder - in production you might want to make userId optional
          guestUser = await prisma.user.create({
            data: {
              email: guestEmail,
              name: shippingAddress.name || "Guest",
              password: "", // Guest users don't have passwords
              role: "USER",
            },
          });
        }
        userId = guestUser.id;
      }

      // Get product details
      const productIds = items.map((item: any) => item.productId);
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
      });

      // Verify all products exist
      if (products.length !== items.length) {
        console.error("Some products not found");
        return NextResponse.json(
          { error: "Some products not found" },
          { status: 400 }
        );
      }

      // Create order
      const order = await prisma.order.create({
        data: {
          userId: userId,
          total: parseFloat(metadata.total || "0"),
          status: "PROCESSING",
          shippingAddress,
          paymentIntentId: session.payment_intent as string,
          items: {
            create: items.map((item: any) => {
              const product = products.find((p) => p.id === item.productId);
              if (!product) {
                throw new Error(`Product ${item.productId} not found`);
              }
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              };
            }),
          },
        },
        include: {
          user: true,
        },
      });

      // Clear user's cart (only if not guest)
      if (metadata.userId !== "guest" && metadata.userId) {
        await prisma.cart.deleteMany({
          where: {
            userId: metadata.userId,
          },
        });
      }

      // Update product stock
      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // Send order confirmation email and notify admins
      try {
        const { sendOrderConfirmationEmail } = await import("@/app/actions/emails");
        const { notifyAdmins } = await import("@/app/actions/notifications");

        await Promise.all([
          sendOrderConfirmationEmail(order),
          notifyAdmins({
            title: "New Order Received",
            message: `Order #${order.id.slice(-8)} from ${order.user.name} for $${Number(order.total).toFixed(2)}`,
            type: "ORDER",
            link: `/admin/orders/${order.id}`
          })
        ]);
      } catch (error) {
        console.error("Failed to send order notifications:", error);
      }

      console.log(`Order created and confirmation email sent: ${order.id}`);
    } else if (event.type === "payment_intent.succeeded") {
      // Payment succeeded - order should already be created by checkout.session.completed
      console.log("Payment succeeded");
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      {
        error: "Webhook handler failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

