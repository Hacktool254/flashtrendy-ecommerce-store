"use client";

import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart-store";
import { useEffect, useState } from "react";

export function CartBadge() {
  const { getTotalItems, syncWithServer } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sync cart on mount
    syncWithServer();
  }, [syncWithServer]);

  // Prevent hydration mismatch by only rendering on client
  if (!mounted) {
    return null;
  }

  const totalItems = getTotalItems();

  if (totalItems === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        backgroundColor: "#000000",
        borderRadius: "50%",
        right: "-10px",
        top: "-10px",
        width: "20px",
        height: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          color: "white",
          fontSize: "10px",
          fontWeight: "600",
        }}
      >
        {totalItems > 99 ? "99+" : totalItems}
      </span>
    </div>
  );
}

