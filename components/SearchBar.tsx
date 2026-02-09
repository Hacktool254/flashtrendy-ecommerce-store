"use client";

import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getSearchSuggestions } from "@/app/actions/search";
import Link from "next/link";
import Image from "next/image";

export function SearchBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{
    products: any[];
    categories: any[];
  }>({ products: [], categories: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions({ products: [], categories: [] });
        return;
      }

      setIsLoading(true);
      try {
        const result = await getSearchSuggestions(searchQuery);
        setSuggestions(result);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <form onSubmit={handleSearch} className="relative w-full">
        <Input
          type="search"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
          className="w-full pr-10"
        />
        <div className="absolute right-0 top-0 h-full flex items-center pr-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
          ) : (
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="h-full"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {showSuggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {suggestions.categories.length > 0 && (
            <div className="p-2 border-b">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-1">
                Categories
              </h3>
              {suggestions.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  onClick={() => setShowSuggestions(false)}
                  className="block px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          {suggestions.products.length > 0 && (
            <div className="p-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-1">
                Products
              </h3>
              {suggestions.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center gap-3 px-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm"
                >
                  <div className="relative h-10 w-10 flex-shrink-0">
                    <Image
                      src={product.images[0] || "/placeholder.png"}
                      alt={product.name}
                      fill
                      className="object-cover rounded-sm"
                    />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">{product.name}</span>
                    <span className="text-xs text-muted-foreground">${Number(product.price).toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

