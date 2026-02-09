import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { ReviewForm } from "@/components/ReviewForm";
import { ProductAddToCart } from "@/components/ProductAddToCart";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { Metadata } from "next";

export const revalidate = 3600; // Revalidate every hour

type Params = Promise<{ id: string }>;

interface ProductPageProps {
  params: Params;
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    take: 100, // Pre-render top 100 products
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });

  return products.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      name: true,
      description: true,
      images: true,
    },
  });

  if (!product) {
    return {
      title: "Product Not Found | FlashTrendy",
    };
  }

  return {
    title: `${product.name} | FlashTrendy`,
    description: product.description?.substring(0, 160) || `Buy ${product.name} at FlashTrendy`,
    openGraph: {
      title: product.name,
      description: product.description || "",
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const session = await auth();

  // Fetch product with all related data
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Calculate average rating
  const ratings = product.reviews.map((r) => r.rating);
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0;

  // Fetch related products (same category, excluding current product)
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    include: {
      reviews: {
        select: {
          rating: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate ratings for related products
  const relatedWithRatings = relatedProducts.map((p) => {
    const productRatings = p.reviews.map((r) => r.rating);
    const productAvgRating = productRatings.length > 0
      ? productRatings.reduce((sum, r) => sum + r, 0) / productRatings.length
      : 0;
    return {
      ...p,
      rating: productAvgRating,
      reviewCount: productRatings.length,
      price: Number(p.price),
    };
  });

  const price = Number(product.price);
  const inStock = product.stock > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <ProductImageGallery images={product.images} productName={product.name} />

        {/* Product Information */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              {avgRating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 font-semibold">{avgRating.toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">
                    ({product.reviews.length} {product.reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}
              <Badge variant={inStock ? "default" : "destructive"}>
                {inStock ? `In Stock (${product.stock} available)` : "Out of Stock"}
              </Badge>
            </div>
            <p className="text-4xl font-bold text-primary">${price.toFixed(2)}</p>
          </div>

          {product.description && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-2">Category</h2>
            <Badge variant="outline">{product.category.name}</Badge>
          </div>

          {/* Quantity Selector and Actions */}
          <ProductAddToCart
            productId={product.id}
            name={product.name}
            price={price}
            image={product.images[0] || "/placeholder-product.jpg"}
            stock={product.stock}
          />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 space-y-6">
        <h2 className="text-2xl font-bold">
          Reviews ({product.reviews.length})
        </h2>

        {product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="border rounded-lg p-6 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{review.user.name || review.user.email}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-muted-foreground">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
        )}

        {/* Review Form - Only show for authenticated users */}
        {session?.user && (
          <ReviewForm productId={product.id} />
        )}
      </div>

      {/* Related Products */}
      {relatedWithRatings.length > 0 && (
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold">Related Products</h2>
          <Carousel className="w-full">
            <CarouselContent>
              {relatedWithRatings.map((product) => (
                <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/4">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    images={product.images}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    stock={product.stock}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}
    </div>
  );
}

