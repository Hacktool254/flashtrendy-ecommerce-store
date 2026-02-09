"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
  searchParams: Record<string, string | undefined>;
}

export function ProductFilters({ categories, searchParams }: ProductFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();

  // Local state for filters (not applied until "Apply Filters" is clicked)
  const [localCategory, setLocalCategory] = useState(params.get("category") || "all");
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([
    parseInt(params.get("minPrice") || "0"),
    parseInt(params.get("maxPrice") || "1000"),
  ]);
  const [localSort, setLocalSort] = useState(params.get("sort") || "price-asc");

  // Initialize from URL params
  useEffect(() => {
    setLocalCategory(params.get("category") || "all");
    setLocalPriceRange([
      parseInt(params.get("minPrice") || "0"),
      parseInt(params.get("maxPrice") || "1000"),
    ]);
    setLocalSort(params.get("sort") || "price-asc");
  }, [params]);

  const applyFilters = () => {
    const newParams = new URLSearchParams();
    
    if (localCategory && localCategory !== "all") {
      newParams.set("category", localCategory);
    }
    
    if (localPriceRange[0] > 0) {
      newParams.set("minPrice", localPriceRange[0].toString());
    }
    
    if (localPriceRange[1] < 1000) {
      newParams.set("maxPrice", localPriceRange[1].toString());
    }
    
    if (localSort && localSort !== "price-asc") {
      newParams.set("sort", localSort);
    }
    
    router.push(`/products?${newParams.toString()}`);
  };

  const resetFilters = () => {
    setLocalCategory("all");
    setLocalPriceRange([0, 1000]);
    setLocalSort("price-asc");
    router.push("/products");
  };

  const handlePriceRangeChange = (values: number[]) => {
    setLocalPriceRange([values[0], values[1]]);
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Category</Label>
        <Select value={localCategory} onValueChange={setLocalCategory}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Price Range</Label>
        <div className="space-y-4">
          <Slider
            min={0}
            max={1000}
            step={10}
            value={localPriceRange}
            onValueChange={handlePriceRangeChange}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${localPriceRange[0]}</span>
            <span>${localPriceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Sort By Filter */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Sort By</Label>
        <Select value={localSort} onValueChange={setLocalSort}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-4">
        <Button onClick={applyFilters} className="w-full">
          Apply Filters
        </Button>
        <Button onClick={resetFilters} variant="outline" className="w-full">
          Reset Filters
        </Button>
      </div>
    </div>
  );
}

