import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Repeat } from "lucide-react";

interface CustomerInsightsProps {
    insights: {
        newCustomers: number;
        returningCustomers: number;
        topCustomers: any[];
    };
}

export function CustomerInsights({ insights }: CustomerInsightsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Customer Acquisition</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <UserPlus className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">New Customers</p>
                                    <p className="text-xs text-muted-foreground">First-time buyers</p>
                                </div>
                            </div>
                            <p className="text-2xl font-bold">{insights.newCustomers}</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <Repeat className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Returning Customers</p>
                                    <p className="text-xs text-muted-foreground">Multiple orders</p>
                                </div>
                            </div>
                            <p className="text-2xl font-bold">{insights.returningCustomers}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Top Spenders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {insights.topCustomers.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No customer data available.</p>
                        ) : (
                            insights.topCustomers.map((customer, i) => (
                                <div key={customer.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted font-bold text-xs">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{customer.name || "Guest"}</p>
                                            <p className="text-xs text-muted-foreground">{customer.orderCount} orders</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-sm">
                                        ${customer.totalSpent.toFixed(2)}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
