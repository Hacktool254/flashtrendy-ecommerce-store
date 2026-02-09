"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
    totalPages: number;
    currentPage: number;
}

export function Pagination({ totalPages, currentPage }: PaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const getPageNumbers = () => {
        const pages = [];
        const showMax = 5;

        if (totalPages <= showMax) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push("...");
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push("...");
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <nav className="flex items-center justify-center space-x-2 py-8">
            <Button
                variant="outline"
                size="icon"
                asChild
                className={cn(currentPage <= 1 && "pointer-events-none opacity-50")}
            >
                <Link href={createPageURL(currentPage - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous page</span>
                </Link>
            </Button>

            <div className="flex items-center space-x-1">
                {getPageNumbers().map((page, index) => {
                    if (page === "...") {
                        return (
                            <div
                                key={`ellipsis-${index}`}
                                className="flex h-9 w-9 items-center justify-center"
                            >
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </div>
                        );
                    }

                    const isCurrent = currentPage === page;

                    return (
                        <Button
                            key={`page-${page}`}
                            variant={isCurrent ? "default" : "outline"}
                            size="icon"
                            asChild={!isCurrent}
                            className={cn("h-9 w-9", isCurrent && "pointer-events-none")}
                        >
                            {isCurrent ? (
                                <span>{page}</span>
                            ) : (
                                <Link href={createPageURL(page as number)}>{page}</Link>
                            )}
                        </Button>
                    );
                })}
            </div>

            <Button
                variant="outline"
                size="icon"
                asChild
                className={cn(currentPage >= totalPages && "pointer-events-none opacity-50")}
            >
                <Link href={createPageURL(currentPage + 1)}>
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next page</span>
                </Link>
            </Button>
        </nav>
    );
}
