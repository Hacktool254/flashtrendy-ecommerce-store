"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";

export function ClearCartOnMount() {
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Clear cart when component mounts (on success page)
    clearCart();
  }, [clearCart]);

  return null;
}

