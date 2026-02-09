"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { startOfDay, endOfDay, subDays, format, startOfMonth, endOfMonth } from "date-fns";

export async function getSalesReports(period: "7days" | "30days" | "month" | "year") {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

        let startDate: Date;
        const endDate = endOfDay(new Date());

        switch (period) {
            case "7days":
                startDate = startOfDay(subDays(new Date(), 6));
                break;
            case "30days":
                startDate = startOfDay(subDays(new Date(), 29));
                break;
            case "month":
                startDate = startOfMonth(new Date());
                break;
            case "year":
                startDate = new Date(new Date().getFullYear(), 0, 1);
                break;
            default:
                startDate = startOfDay(subDays(new Date(), 6));
        }

        const salesData = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                status: { not: "CANCELLED" },
            },
            select: {
                total: true,
                createdAt: true,
                items: {
                    select: {
                        price: true,
                        quantity: true,
                        product: {
                            select: {
                                category: {
                                    select: {
                                        name: true,
                                    }
                                }
                            }
                        }
                    }
                }
            },
        });

        // Process for chart: Revenue by day
        const revenueByDay: Record<string, { total: number; count: number }> = {};
        salesData.forEach(order => {
            const day = format(order.createdAt, "yyyy-MM-dd"); // Use ISO-like for chart keys
            if (!revenueByDay[day]) {
                revenueByDay[day] = { total: 0, count: 0 };
            }
            revenueByDay[day].total += Number(order.total || 0);
            revenueByDay[day].count += 1;
        });

        const revenueChartData = Object.entries(revenueByDay)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([name, data]) => ({
                name,
                total: Number(data.total.toFixed(2)),
                orders: data.count,
            }));

        // Process for chart: Revenue by category
        const revenueByCategory: Record<string, number> = {};
        salesData.forEach(order => {
            order.items.forEach(item => {
                const categoryName = item.product?.category?.name || "Uncategorized";
                revenueByCategory[categoryName] = (revenueByCategory[categoryName] || 0) + (Number(item.price || 0) * (item.quantity || 0));
            });
        });

        const categoryChartData = Object.entries(revenueByCategory).map(([name, value]) => ({
            name,
            value: Number(value.toFixed(2)),
        }));

        return {
            revenueChartData,
            categoryChartData,
            totalRevenue: Number(salesData.reduce((acc, curr) => acc + Number(curr.total || 0), 0).toFixed(2)),
            orderCount: salesData.length,
        };
    } catch (error) {
        console.error("getSalesReports error:", error);
        return {
            revenueChartData: [],
            categoryChartData: [],
            totalRevenue: 0,
            orderCount: 0,
        };
    }
}

export async function getProductPerformance() {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

        const topProducts = await prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
            },
            orderBy: {
                _sum: {
                    quantity: 'desc',
                },
            },
            take: 10,
        });

        if (topProducts.length === 0) return [];

        const productDetails = await prisma.product.findMany({
            where: {
                id: { in: topProducts.map(tp => tp.productId) },
            },
            select: {
                id: true,
                name: true,
                price: true,
                images: true,
                category: { select: { name: true } },
            },
        });

        const performanceData = topProducts.map(tp => {
            const product = productDetails.find(p => p.id === tp.productId);
            const quantity = tp._sum.quantity || 0;
            const price = Number(product?.price || 0);
            return {
                id: product?.id || tp.productId,
                name: product?.name || "Unknown Product",
                sales: quantity,
                totalRevenue: Number((quantity * price).toFixed(2)),
                images: product?.images || [],
                category: product?.category || { name: "N/A" },
            };
        });

        return performanceData;
    } catch (error) {
        console.error("getProductPerformance error:", error);
        return [];
    }
}

export async function getOrderStats(): Promise<{ status: string; count: number }[]> {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

        const stats = await prisma.order.groupBy({
            by: ["status"],
            _count: { id: true },
        });

        // Flatten for Recharts
        return stats.map((s: any) => ({
            status: s.status as string,
            count: Number(s._count?.id || 0),
        }));
    } catch (error) {
        console.error("getOrderStats error:", error);
        return [];
    }
}

export async function getCustomerBehavior() {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

        const totalUsers = await prisma.user.count({ where: { role: "USER" } });
        const customersWithOrdersQuery = await prisma.order.findMany({
            distinct: ['userId'],
            select: { userId: true },
        });

        const conversionRate = totalUsers > 0
            ? (customersWithOrdersQuery.length / totalUsers) * 100
            : 0;

        const aggregate = await prisma.order.aggregate({
            _avg: {
                total: true,
            },
            _count: {
                id: true,
            },
            where: {
                status: { not: "CANCELLED" },
            }
        });

        return {
            conversionRate: Number(conversionRate.toFixed(1)),
            averageOrderValue: Number(Number(aggregate._avg.total || 0).toFixed(2)),
            totalOrders: aggregate._count.id,
            totalCustomers: customersWithOrdersQuery.length,
        };
    } catch (error) {
        console.error("getCustomerBehavior error:", error);
        return {
            conversionRate: 0,
            averageOrderValue: 0,
            totalOrders: 0,
            totalCustomers: 0,
        };
    }
}
