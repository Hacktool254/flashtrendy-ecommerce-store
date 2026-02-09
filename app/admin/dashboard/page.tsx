import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminDashboardCharts } from "@/components/admin/AdminDashboardCharts";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";
import { TopProductsList } from "@/components/admin/TopProductsList";
import { LowStockAlerts } from "@/components/admin/LowStockAlerts";
import { CustomerInsights } from "@/components/admin/CustomerInsights";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
} from "lucide-react";

export default async function AdminDashboardPage() {
  // Get key metrics
  const totalRevenue = await prisma.order.aggregate({
    _sum: { total: true },
    where: { status: { not: "CANCELLED" } },
  });

  const totalOrders = await prisma.order.count();
  const totalCustomers = await prisma.user.count();

  const averageOrderValue = totalOrders > 0
    ? Number(totalRevenue._sum.total || 0) / totalOrders
    : 0;

  // Get low stock products
  const lowStockProducts = await prisma.product.findMany({
    where: { stock: { lte: 10 } },
    include: { category: true },
    orderBy: { stock: "asc" },
    take: 5,
  });

  // Get recent orders
  const recentOrders = await prisma.order.findMany({
    include: {
      user: true,
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Get top products
  const topProducts = await prisma.product.findMany({
    include: {
      category: true,
      orderItems: {
        select: { quantity: true, price: true },
      },
    },
    take: 5,
  });

  const topProductsWithRevenue = topProducts
    .map((product) => ({
      ...product,
      totalRevenue: product.orderItems.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
      ),
      totalQuantity: product.orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  // Get sales data for charts
  const salesData = await getSalesData();

  // Get customer insights
  const customerInsights = await getCustomerInsights();

  // Get category revenue
  const categoryRevenue = await getCategoryRevenue();

  // Get order statistics
  const orderStats = await prisma.order.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Number(totalRevenue._sum.total || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Total orders placed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per order average</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <AdminDashboardCharts
        salesData={salesData}
        orderStats={orderStats.map((s: any) => ({
          status: s.status,
          count: s._count.id,
        })) as { status: string; count: number }[]}
        categoryRevenue={categoryRevenue}
      />

      {/* Alerts and Top Products */}
      <div className="grid gap-8 lg:grid-cols-2">
        <LowStockAlerts products={lowStockProducts} />
        <TopProductsList products={topProductsWithRevenue} />
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentOrdersTable orders={recentOrders} />
        </CardContent>
      </Card>

      {/* Customer Insights */}
      <CustomerInsights insights={customerInsights} />
    </div>
  );
}

async function getSalesData() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: thirtyDaysAgo },
      status: { not: "CANCELLED" },
    },
    select: {
      createdAt: true,
      total: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by date
  const dailyData: Record<string, { revenue: number; orders: number }> = {};

  for (const order of orders) {
    const date = order.createdAt.toISOString().split("T")[0];
    if (!dailyData[date]) {
      dailyData[date] = { revenue: 0, orders: 0 };
    }
    dailyData[date].revenue += Number(order.total);
    dailyData[date].orders += 1;
  }

  // Fill in missing dates with zeros
  const allDates: string[] = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    allDates.push(date.toISOString().split("T")[0]);
  }

  return allDates.map((date) => ({
    date,
    revenue: dailyData[date]?.revenue || 0,
    orders: dailyData[date]?.orders || 0,
  }));
}

async function getCustomerInsights() {
  const totalCustomers = await prisma.user.count();

  const customersWithOrders = await prisma.user.count({
    where: { orders: { some: {} } },
  });

  const topCustomers = await prisma.user.findMany({
    include: {
      orders: {
        select: { total: true },
      },
    },
    take: 5,
  });

  const customersWithTotalSpent = topCustomers.map((customer) => ({
    ...customer,
    totalSpent: customer.orders.reduce((sum, order) => sum + Number(order.total), 0),
    orderCount: customer.orders.length,
  })).sort((a, b) => b.totalSpent - a.totalSpent);

  return {
    newCustomers: totalCustomers - customersWithOrders,
    returningCustomers: customersWithOrders,
    topCustomers: customersWithTotalSpent,
  };
}

async function getCategoryRevenue() {
  const categories = await prisma.category.findMany({
    include: {
      products: {
        include: {
          orderItems: {
            where: {
              order: {
                status: { not: "CANCELLED" },
              },
            },
            select: {
              quantity: true,
              price: true,
            },
          },
        },
      },
    },
  });

  return categories.map((category) => {
    const revenue = category.products.reduce((acc, product) => {
      return acc + product.orderItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
    }, 0);

    return {
      name: category.name,
      value: revenue,
    };
  }).filter(c => c.value > 0);
}
