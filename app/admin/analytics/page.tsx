import { getSalesReports, getProductPerformance, getCustomerBehavior, getOrderStats } from "@/app/actions/analytics";
import { getSearchAnalytics } from "@/app/actions/search";
import { AdminDashboardCharts } from "@/components/admin/AdminDashboardCharts";
import { TopProductsList } from "@/components/admin/TopProductsList";
import { CustomerInsights } from "@/components/admin/CustomerInsights";
import { SearchAnalytics } from "@/components/admin/SearchAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

type SearchParams = {
    period?: "7days" | "30days" | "month" | "year";
};

interface AdminAnalyticsPageProps {
    searchParams: SearchParams;
}

export default async function AdminAnalyticsPage({ searchParams }: AdminAnalyticsPageProps) {
    let period: "7days" | "30days" | "month" | "year" = "7days";

    const params = searchParams;
    if (params.period && ["7days", "30days", "month", "year"].includes(params.period)) {
        period = params.period as any;
    }

    let data;
    try {
        const [
            searchAnalyticsData,
            salesReports,
            productPerformance,
            behaviorInsights,
            orderStats
        ] = await Promise.all([
            getSearchAnalytics(),
            getSalesReports(period),
            getProductPerformance(),
            getCustomerBehavior(),
            getOrderStats()
        ]);

        data = {
            searchAnalyticsData,
            salesReports,
            productPerformance,
            behaviorInsights,
            orderStats
        };
    } catch (error) {
        console.error("Analytics Page Data Fetch Error:", error);
        // Provide minimal fallback data to prevent crash
        return (
            <div className="p-8 text-center space-y-4">
                <h1 className="text-2xl font-bold text-destructive">Dashboard Error</h1>
                <p className="text-muted-foreground">We encountered an issue loading the analytics data. Please try again later.</p>
                <Card className="max-w-md mx-auto">
                    <CardContent className="pt-6">
                        <p className="text-sm text-left bg-muted p-4 rounded font-mono">
                            {error instanceof Error ? error.message : "Internal Server Error"}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { salesReports, behaviorInsights, orderStats, productPerformance, searchAnalyticsData } = data;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Analytics</h1>
                    <p className="text-muted-foreground">Detailed insights and performance metrics</p>
                </div>

                <div className="flex items-center gap-2">
                    <Tabs defaultValue={period} className="w-full md:w-auto">
                        <TabsList>
                            <TabsTrigger value="7days" asChild>
                                <a href="?period=7days">7 Days</a>
                            </TabsTrigger>
                            <TabsTrigger value="30days" asChild>
                                <a href="?period=30days">30 Days</a>
                            </TabsTrigger>
                            <TabsTrigger value="month" asChild>
                                <a href="?period=month">Month</a>
                            </TabsTrigger>
                            <TabsTrigger value="year" asChild>
                                <a href="?period=year">Year</a>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${(salesReports.totalRevenue || 0).toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">For the selected period</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Order Count</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{salesReports.orderCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Successful transactions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(behaviorInsights.conversionRate || 0).toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">Visitors to customers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${(behaviorInsights.averageOrderValue || 0).toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Revenue per order</p>
                    </CardContent>
                </Card>
            </div>

            <AdminDashboardCharts
                salesData={(salesReports.revenueChartData || []).map(d => ({
                    date: d.name,
                    revenue: Number(d.total || 0),
                    orders: Number(d.orders || 0)
                }))}
                orderStats={orderStats as { status: string; count: number }[]}
                categoryRevenue={salesReports.categoryChartData || []}
            />

            <div className="grid gap-8 lg:grid-cols-2">
                <TopProductsList products={productPerformance} />
                <CustomerInsights insights={{
                    newCustomers: behaviorInsights.totalCustomers || 0,
                    returningCustomers: 0,
                    topCustomers: []
                }} />
            </div>

            <SearchAnalytics data={searchAnalyticsData} />
        </div>
    );
}
