import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function Home() {
  // Fetch data from database
  const [categories, latestProducts, featuredProducts] = await Promise.all([
    prisma.category.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    }),
    prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    }),
  ]);

  // Calculate average ratings for products
  const productsWithRatings = latestProducts.map((product) => {
    const ratings = product.reviews.map((r) => r.rating);
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;
    return {
      ...product,
      rating: avgRating,
      reviewCount: ratings.length,
      price: Number(product.price),
    };
  });

  const featuredWithRatings = featuredProducts.map((product) => {
    const ratings = product.reviews.map((r) => r.rating);
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;
    return {
      ...product,
      rating: avgRating,
      reviewCount: ratings.length,
      price: Number(product.price),
    };
  });

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner Carousel */}
      <section className="relative">
        <Carousel className="w-full">
          <CarouselContent>
            {featuredWithRatings.slice(0, 3).map((product) => (
              <CarouselItem key={product.id} className="relative">
                <div className="relative h-[500px] md:h-[600px] overflow-hidden bg-muted rounded-lg">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${product.images[0] || "/placeholder-product.jpg"})`,
                    }}
                  >
                    <div className="absolute inset-0 bg-black/40" />
                  </div>
                  <div className="relative z-10 h-full flex items-center">
                    <div className="container mx-auto px-4">
                      <div className="max-w-2xl text-white">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                          {product.name}
                        </h1>
                        <p className="text-xl md:text-2xl mb-6 text-white/90">
                          Discover the latest trends
                        </p>
                        <div className="flex gap-4">
                          <Button asChild size="lg">
                            <Link href={`/products/${product.id}`}>
                              Shop Now
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                            <Link href="/products">Browse All</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Shop by Category</h2>
          <Button asChild variant="ghost">
            <Link href="/products">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              id={category.id}
              name={category.name}
              slug={category.slug}
              image={category.image}
              description={category.description}
            />
          ))}
        </div>
      </section>

      {/* Latest Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Latest Products</h2>
          <Button asChild variant="ghost">
            <Link href="/products">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productsWithRatings.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              images={product.images}
              rating={product.rating}
              reviewCount={product.reviewCount}
              stock={product.stock}
            />
          ))}
        </div>
      </section>

      {/* Best Sellers - Using products with most reviews */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Best Sellers</h2>
          <Button asChild variant="ghost">
            <Link href="/products?sort=popular">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productsWithRatings
            .sort((a, b) => b.reviewCount - a.reviewCount)
            .slice(0, 4)
            .map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                images={product.images}
                rating={product.rating}
                reviewCount={product.reviewCount}
                stock={product.stock}
              />
            ))}
        </div>
      </section>

      {/* Special Offers */}
      <section className="container mx-auto px-4">
        <div className="bg-primary/10 rounded-lg p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Special Offers
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Get up to 50% off on selected items. Limited time only!
            </p>
            <Button asChild size="lg">
              <Link href="/products?sort=price&order=asc">
                Shop Deals
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
