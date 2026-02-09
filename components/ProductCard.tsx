"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { toggleWishlist } from "@/app/actions/wishlist";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  images: string[];
  rating?: number;
  reviewCount?: number;
  stock?: number;
  isWishlisted?: boolean;
}

export function ProductCard({
  id,
  name,
  price,
  images,
  rating = 0,
  reviewCount = 0,
  stock = 0,
  isWishlisted = false,
}: ProductCardProps) {
  const mainImage = images[0] || "/placeholder-product.jpg";
  const inStock = stock > 0;
  const { addItem } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const [isInWishlist, setIsInWishlist] = useState(isWishlisted);
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock) return;

    setIsAdding(true);
    try {
      const result = await addItem({
        productId: id,
        name,
        price,
        image: mainImage,
        quantity: 1,
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

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      // Optimistic update
      setIsInWishlist((prev) => !prev);

      const result = await toggleWishlist(id);

      if (result.error) {
        // Revert on error
        setIsInWishlist((prev) => !prev);
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: result.action === "added" ? "Added to wishlist" : "Removed from wishlist",
          description: `${name} has been ${result.action === "added" ? "added to" : "removed from"} your wishlist.`,
        });
      }
    });
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow relative">
      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        disabled={isPending}
        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors"
      >
        <Heart
          className={cn(
            "h-5 w-5 transition-colors",
            isInWishlist ? "fill-red-500 text-red-500" : "text-gray-500"
          )}
        />
      </button>

      <Link href={`/products/${id}`}>
        <CardHeader className="p-0 relative aspect-square overflow-hidden bg-muted">
          <Image
            src={mainImage}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                const isFilled = rating >= starValue;
                const isHalfFilled = rating >= starValue - 0.5 && rating < starValue;

                return (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${isFilled
                        ? "fill-yellow-400 text-yellow-400"
                        : isHalfFilled
                          ? "fill-yellow-400/50 text-yellow-400"
                          : "fill-none text-gray-300"
                      }`}
                  />
                );
              })}
            </div>
            {rating > 0 && (
              <>
                <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
                {reviewCount > 0 && (
                  <span className="text-sm text-muted-foreground">({reviewCount})</span>
                )}
              </>
            )}
          </div>
          <p className="text-2xl font-bold text-primary mb-4">${price.toFixed(2)}</p>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={!inStock || isAdding}
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isAdding ? "Adding..." : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}

