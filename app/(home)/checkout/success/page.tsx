import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Stripe from "stripe";
import { ClearCartOnMount } from "@/components/ClearCartOnMount";

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

type SearchParams = Promise<{
  session_id?: string;
}>;

interface ShippingAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  shipping?: number;
  tax?: number;
  name?: string;
  email?: string;
}

interface CheckoutSuccessPageProps {
  searchParams: SearchParams;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const stripe = getStripe();
  if (!stripe) {
    console.error("Stripe not initialized - missing STRIPE_SECRET_KEY");
    redirect("/");
  }
  const session = await auth();
  const params = await searchParams;

  if (!params.session_id) {
    redirect("/cart");
  }

  // Verify the Stripe session
  let stripeSession;
  try {
    stripeSession = await stripe.checkout.sessions.retrieve(params.session_id);
  } catch (error) {
    console.error("Error retrieving Stripe session:", error);
    redirect("/cart");
  }

  // Check if order already exists
  const existingOrder = await prisma.order.findUnique({
    where: {
      paymentIntentId: stripeSession.payment_intent as string,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  let order = existingOrder;

  // If order doesn't exist, create it (webhook might not have fired yet)
  if (!order && stripeSession.payment_status === "paid") {
    const metadata = stripeSession.metadata;
    if (metadata) {
      const shippingAddress = JSON.parse(metadata.shippingAddress || "{}");
      const items = JSON.parse(metadata.items || "[]");

      // Handle guest checkout - create or find guest user
      let userId = metadata.userId;
      if (userId === "guest" || !userId) {
        const guestEmail = shippingAddress.email || stripeSession.customer_email || `guest-${Date.now()}@example.com`;
        // Try to find existing guest user with this email, or create one
        let guestUser = await prisma.user.findUnique({
          where: { email: guestEmail },
        });

        if (!guestUser) {
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

      // Create order
      order = await prisma.order.create({
        data: {
          userId: userId,
          total: parseFloat(metadata.total || "0"),
          status: "PENDING",
          shippingAddress,
          paymentIntentId: stripeSession.payment_intent as string,
          items: {
            create: items.map((item: any) => {
              const product = products.find((p) => p.id === item.productId);
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              };
            }),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Clear cart (only if user is logged in)
      if (session?.user?.id && metadata.userId !== "guest") {
        await prisma.cart.deleteMany({
          where: {
            userId: session.user.id,
          },
        });
      }
    }
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Processing your order...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ClearCartOnMount />
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <div>
                <h1 className="text-3xl font-bold">Order Confirmed!</h1>
                <p className="text-muted-foreground mt-2">
                  Thank you for your purchase. Your order has been received.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Number</span>
              <span className="font-semibold">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-semibold capitalize">{order.status.toLowerCase()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0).toFixed(2)}</span>
              </div>
              {(() => {
                const shippingAddress = order.shippingAddress as ShippingAddress;
                if (typeof shippingAddress !== "object" || !shippingAddress) return null;

                return (
                  <>
                    {shippingAddress.shipping !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>
                          ${Number(shippingAddress.shipping || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {shippingAddress.tax !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span>
                          ${Number(shippingAddress.tax || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {(() => {
          const shippingAddress = order.shippingAddress as ShippingAddress;
          if (!shippingAddress || typeof shippingAddress !== "object") return null;

          return (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {shippingAddress.street && <p>{shippingAddress.street}</p>}
                  {(shippingAddress.city ||
                    shippingAddress.state ||
                    shippingAddress.zipCode) && (
                      <p>
                        {[
                          shippingAddress.city,
                          shippingAddress.state,
                          shippingAddress.zipCode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  {shippingAddress.country && <p>{shippingAddress.country}</p>}
                </div>
              </CardContent>
            </Card>
          );
        })()}

        <div className="flex gap-4">
          <Button asChild className="flex-1">
            <Link href="/dashboard">View Orders</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

