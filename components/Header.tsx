import Link from "next/link";
import { Search, ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/SearchBar";
import { UserAccountDropdown } from "@/components/UserAccountDropdown";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Products Catalog */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">FlashTrendy</span>
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium transition-colors hover:text-primary hidden sm:block"
            >
              Products Catalog
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <SearchBar />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* User Account Dropdown */}
            <UserAccountDropdown />

            {/* Shopping Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  0
                </Badge>
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation Menu - Categories */}
        <nav className="hidden md:flex items-center space-x-6 h-12 border-t">
          <Link
            href="/products"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            All Products
          </Link>
          <Link
            href="/products?category=t-shirts"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            T-Shirts
          </Link>
          <Link
            href="/products?category=jeans"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Jeans
          </Link>
          <Link
            href="/products?category=shoes"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Shoes
          </Link>
        </nav>
      </div>
    </header>
  );
}

