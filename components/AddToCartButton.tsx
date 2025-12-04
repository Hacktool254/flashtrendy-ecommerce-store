"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import Link from "next/link";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  quantity: number;
  disabled?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function AddToCartButton({
  productId,
  name,
  price,
  image,
  stock,
  quantity,
  disabled = false,
  size = "default",
  className,
}: AddToCartButtonProps) {
  const { addItem } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const handleAddToCart = async () => {
    if (disabled || stock === 0) return;

    setIsAdding(true);
    try {
      const result = await addItem({
        productId,
        name,
        price,
        image,
        quantity,
        stock,
      });

      if (result?.success) {
        toast({
          title: "Added to cart",
          description: `${name} has been added to your cart.`,
          action: (
            <ToastAction altText="View cart" asChild>
              <Link href="/cart">View Cart</Link>
            </ToastAction>
          ),
        });
      } else {
        toast({
          title: "Error",
          description: result?.error || "Failed to add item to cart. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || stock === 0 || isAdding}
      size={size}
      className={className}
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      {isAdding ? "Adding..." : "Add to Cart"}
    </Button>
  );
}

