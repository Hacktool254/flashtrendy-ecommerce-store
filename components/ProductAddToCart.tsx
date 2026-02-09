"use client";

import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/QuantitySelector";
import { AddToCartButton } from "@/components/AddToCartButton";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProductAddToCartProps {
  productId: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

export function ProductAddToCart({
  productId,
  name,
  price,
  image,
  stock,
}: ProductAddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const handleBuyNow = () => {
    // TODO: Implement buy now functionality (direct to checkout)
    router.push(`/checkout?product=${productId}&quantity=${quantity}`);
  };

  if (stock === 0) {
    return (
      <Button size="lg" disabled className="w-full">
        Out of Stock
      </Button>
    );
  }

  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="flex items-center gap-4">
        <label className="font-semibold">Quantity:</label>
        <QuantitySelector
          min={1}
          max={stock}
          value={quantity}
          onQuantityChange={setQuantity}
        />
      </div>
      <div className="flex gap-4">
        <AddToCartButton
          productId={productId}
          name={name}
          price={price}
          image={image}
          stock={stock}
          quantity={quantity}
          size="lg"
          className="flex-1"
        />
        <Button size="lg" variant="outline" className="flex-1" onClick={handleBuyNow}>
          Buy Now
        </Button>
      </div>
    </div>
  );
}

