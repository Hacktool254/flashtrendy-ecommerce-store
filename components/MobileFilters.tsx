"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductFilters } from "@/components/ProductFilters";
import { Filter } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface MobileFiltersProps {
  categories: Category[];
  searchParams: Record<string, string | undefined>;
}

export function MobileFilters({ categories, searchParams }: MobileFiltersProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <ProductFilters categories={categories} searchParams={searchParams} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

