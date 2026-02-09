"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { useMemo } from "react";

interface CartSummaryProps {
  subtotal?: number;
  tax?: number;
  shipping?: number;
  total?: number;
  itemCount?: number;
}

export function CartSummary({ 
  subtotal: serverSubtotal, 
  tax: serverTax, 
  shipping: serverShipping, 
  total: serverTotal, 
  itemCount: serverItemCount 
}: CartSummaryProps) {
  const router = useRouter();
  const { items, getTotalPrice, getTotalItems } = useCartStore();

  // Use store values if available (for unauthenticated users), otherwise use server values
  const storeSubtotal = getTotalPrice();
  const storeItemCount = getTotalItems();
  
  const subtotal = items.length > 0 ? storeSubtotal : (serverSubtotal || 0);
  const tax = items.length > 0 ? subtotal * 0.1 : (serverTax || 0);
  const shipping = items.length > 0 ? (subtotal > 100 ? 0 : 10) : (serverShipping || 0);
  const total = items.length > 0 ? subtotal + tax + shipping : (serverTotal || 0);
  const itemCount = items.length > 0 ? storeItemCount : (serverItemCount || 0);

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>
              {shipping === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                `$${shipping.toFixed(2)}`
              )}
            </span>
          </div>
          {subtotal < 100 && (
            <p className="text-xs text-muted-foreground">
              Add ${(100 - subtotal).toFixed(2)} more for free shipping!
            </p>
          )}
        </div>

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <Button
          onClick={handleCheckout}
          className="w-full"
          size="lg"
          disabled={itemCount === 0}
        >
          Proceed to Checkout
        </Button>

        <Link href="/products">
          <Button variant="outline" className="w-full" size="lg">
            Continue Shopping
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

