"use client";

import { useCartStore } from "@/store/cart-store";
import { useEffect } from "react";
import { CartItemsList } from "@/components/CartItemsList";
import { CartSummary } from "@/components/CartSummary";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

interface CartPageContentProps {
  serverItems: Array<{
    id: string;
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    stock: number;
  }>;
}

export function CartPageContent({ serverItems }: CartPageContentProps) {
  const { items: storeItems, syncWithServer } = useCartStore();

  useEffect(() => {
    // Always prioritize Zustand items (they're always saved)
    // Sync with server to update server-side cart, but Zustand items take precedence
    if (storeItems.length > 0) {
      // If we have local items, sync to update server (but keep local items)
      syncWithServer();
    } else if (serverItems.length > 0) {
      // If no local items but server has items, sync from server
      syncWithServer();
    }
  }, [syncWithServer, storeItems.length, serverItems.length]);

  // Always prioritize Zustand items (localStorage) - they're always saved and are the source of truth
  const items = storeItems.length > 0 ? storeItems : serverItems;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingBag className="h-24 w-24 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">
          Looks like you haven&apos;t added any items to your cart yet.
        </p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <CartItemsList items={items} />
      </div>

      {/* Cart Summary */}
      <div className="lg:col-span-1">
        <CartSummary itemCount={items.length} />
      </div>
    </div>
  );
}

