"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/QuantitySelector";
import { useCartStore } from "@/store/cart-store";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface CartItemData {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartItemProps {
  item: CartItemData;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityChange = async (quantity: number) => {
    await updateQuantity(item.productId, quantity);
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    await removeItem(item.productId);
    setIsRemoving(false);
  };

  const itemTotal = item.price * item.quantity;

  return (
    <div className="border rounded-lg p-4 flex flex-col sm:flex-row gap-4">
      {/* Product Image */}
      <Link href={`/products/${item.productId}`} className="flex-shrink-0">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-muted">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 96px, 128px"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <Link
            href={`/products/${item.productId}`}
            className="font-semibold text-lg hover:text-primary transition-colors"
          >
            {item.name}
          </Link>
          <p className="text-muted-foreground mt-1">
            ${item.price.toFixed(2)} each
          </p>
          {item.stock < item.quantity && (
            <p className="text-sm text-destructive mt-1">
              Only {item.stock} available in stock
            </p>
          )}
        </div>

        {/* Quantity and Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Qty:</label>
            <QuantitySelector
              min={1}
              max={item.stock}
              defaultValue={item.quantity}
              onQuantityChange={handleQuantityChange}
            />
          </div>

          <div className="text-right min-w-[100px]">
            <p className="font-semibold text-lg">${itemTotal.toFixed(2)}</p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={isRemoving}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

