"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function searchProducts(query: string) {
    if (!query || query.trim().length === 0) {
        return [];
    }

    const products = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { category: { name: { contains: query, mode: "insensitive" } } },
                { sku: { contains: query, mode: "insensitive" } },
            ],
        },
        include: {
            category: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // Track the search
    await trackSearch(query, products.length);

    return products;
}

export async function getSearchSuggestions(query: string) {
    if (!query || query.trim().length < 2) {
        return { products: [], categories: [] };
    }

    const [products, categories] = await Promise.all([
        prisma.product.findMany({
            where: {
                name: { contains: query, mode: "insensitive" },
            },
            take: 5,
            select: {
                id: true,
                name: true,
                price: true,
                images: true,
            },
        }),
        prisma.category.findMany({
            where: {
                name: { contains: query, mode: "insensitive" },
            },
            take: 3,
            select: {
                id: true,
                name: true,
                slug: true,
            },
        }),
    ]);

    return { products, categories };
}

export async function trackSearch(query: string, resultsCount: number) {
    try {
        const session = await auth();
        await prisma.searchLog.create({
            data: {
                query,
                resultsCount,
                userId: session?.user?.id || null,
            },
        });
    } catch (error) {
        console.error("Failed to track search:", error);
    }
}

export async function getSearchAnalytics() {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const [topSearches, emptySearches] = await Promise.all([
            prisma.searchLog.groupBy({
                by: ["query"],
                _count: {
                    query: true,
                },
                orderBy: {
                    _count: {
                        query: "desc",
                    },
                },
                take: 10,
            }),
            prisma.searchLog.findMany({
                where: {
                    resultsCount: 0,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 10,
            }),
        ]);

        return {
            topSearches: topSearches.map((s: any) => ({
                query: String(s.query),
                count: Number(s._count?.query || 0)
            })),
            emptySearches: emptySearches.map((s: any) => ({
                query: String(s.query),
                createdAt: String(s.createdAt?.toISOString() || new Date().toISOString())
            }))
        };
    } catch (error) {
        console.error("getSearchAnalytics error:", error);
        return { topSearches: [], emptySearches: [] };
    }
}
