"use client";

import { CartItem } from "@/components/CartItem";
import { useCartStore } from "@/store/cart-store";
import { useEffect } from "react";

interface CartItemData {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartItemsListProps {
  items: CartItemData[];
}

export function CartItemsList({ items: initialItems }: CartItemsListProps) {
  const { items, syncWithServer } = useCartStore();

  useEffect(() => {
    // Always use Zustand items first (they're the source of truth)
    // Only sync with server if we have no local items and server has items
    if (items.length === 0 && initialItems.length > 0) {
      // If no local items but server has items, sync from server
      syncWithServer();
    } else if (items.length > 0) {
      // If we have local items, they take precedence - just sync to update server
      syncWithServer();
    }
  }, [syncWithServer, items.length, initialItems.length]);

  // Always prioritize Zustand items (localStorage) - they're always saved
  const displayItems = items.length > 0 ? items : initialItems;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Cart Items ({displayItems.length})</h2>
      {displayItems.length === 0 ? (
        <p className="text-muted-foreground">No items in cart</p>
      ) : (
        <div className="space-y-4">
          {displayItems.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

