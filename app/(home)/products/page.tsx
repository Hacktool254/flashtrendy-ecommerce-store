import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { MobileFilters } from "@/components/MobileFilters";
import { trackSearch } from "@/app/actions/search";
import { Suspense } from "react";
import { Pagination } from "@/components/Pagination";

export const revalidate = 3600; // Revalidate every hour

const ITEMS_PER_PAGE = 12;

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

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  const search = params.search || "";
  const category = params.category || "";
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const minRating = params.minRating ? parseFloat(params.minRating) : undefined;
  const sort = params.sort || "newest";
  const currentPage = Math.max(1, parseInt(params.page || "1"));

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
      orderBy = { createdAt: "desc" };
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  // Fetch data with pagination
  const [allCategories, totalCount, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: {
        category: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Group products by category (only for the products on the current page)
  const productsWithRatings = products.map((product) => {
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

  // Filter by rating if minRating is set (this is still after-the-fact because rating is computed)
  let filteredProducts = productsWithRatings;
  if (minRating !== undefined) {
    filteredProducts = filteredProducts.filter((p) => p.rating >= minRating);
  }

  // Grouping by category
  const categoriesGrouped = allCategories.map((cat) => ({
    ...cat,
    products: filteredProducts.filter((p) => p.categoryId === cat.id),
  })).filter((cat) => cat.products.length > 0);

  // If no products match the current page because of rating filter, try to handle gracefully
  // (In a real scenario, rating should be a DB field for proper pagination)

  // Track the search in the background
  if (search) {
    trackSearch(search, totalCount).catch((err: Error) => console.error("Search tracking failed:", err));
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block lg:w-64 flex-shrink-0">
          <Suspense fallback={<div>Loading filters...</div>}>
            <ProductFilters
              categories={allCategories}
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
                <MobileFilters categories={allCategories} searchParams={params} />
              </div>
            </div>
          </div>

          {/* Products Grouped by Category */}
          {categoriesGrouped.length > 0 ? (
            <div className="space-y-12">
              {categoriesGrouped.map((category) => (
                <div key={category.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{category.name}</h2>
                    <span className="text-sm text-muted-foreground">
                      {category.products.length} {category.products.length === 1 ? "product" : "products"}
                    </span>
                  </div>
                  {category.description && (
                    <p className="text-muted-foreground">{category.description}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {category.products.map((product) => (
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No products found. Try adjusting your filters.
              </p>
            </div>
          )}

          {/* Pagination */}
          <Pagination totalPages={totalPages} currentPage={currentPage} />
        </div>
      </div>
    </div>
  );
}

