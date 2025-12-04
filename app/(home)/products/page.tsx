import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { ProductPagination } from "@/components/ProductPagination";
import { MobileFilters } from "@/components/MobileFilters";
import { Suspense } from "react";

type SearchParams = Promise<{
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  sort?: string;
  page?: string;
}>;

interface ProductsPageProps {
  searchParams: SearchParams;
}

const ITEMS_PER_PAGE = 12;

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const category = params.category || "";
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const minRating = params.minRating ? parseFloat(params.minRating) : undefined;
  const sort = params.sort || "newest";

  // Build where clause
  const where: any = {};

  // Search filter
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Category filter
  if (category && category !== "all") {
    where.category = {
      slug: category,
    };
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) {
      where.price.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      where.price.lte = maxPrice;
    }
  }

  // Rating filter (if minRating is set, filter products with average rating >= minRating)
  // Note: This requires a more complex query, so we'll filter after fetching for now
  // In production, you might want to use a database view or computed field

  // Build orderBy clause
  let orderBy: any = {};
  switch (sort) {
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "rating":
      // For rating, we'll need to sort after calculating averages
      orderBy = { createdAt: "desc" };
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  // Fetch products with reviews for rating calculation
  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  // Calculate ratings and filter by minRating if needed
  let productsWithRatings = products.map((product) => {
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

  // Filter by rating if minRating is set
  if (minRating !== undefined) {
    productsWithRatings = productsWithRatings.filter(
      (p) => p.rating >= minRating
    );
  }

  // Sort by rating if needed (after filtering)
  if (sort === "rating") {
    productsWithRatings.sort((a, b) => b.rating - a.rating);
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block lg:w-64 flex-shrink-0">
          <Suspense fallback={<div>Loading filters...</div>}>
            <ProductFilters
              categories={categories}
              searchParams={params}
            />
          </Suspense>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header with Mobile Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">
                  {search ? `Search: "${search}"` : "Products Catalog"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {totalCount} {totalCount === 1 ? "product" : "products"} found
                </p>
              </div>
              {/* Mobile Filters Button */}
              <div className="lg:hidden">
                <MobileFilters categories={categories} searchParams={params} />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {productsWithRatings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
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

              {/* Pagination */}
              {totalPages > 1 && (
                <ProductPagination
                  currentPage={page}
                  totalPages={totalPages}
                  searchParams={params}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No products found. Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

