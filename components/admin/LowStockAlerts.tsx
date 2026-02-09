import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { Progress } from "@/components/ui/progress";

interface LowStockAlertsProps {
    products: any[];
}

export function LowStockAlerts({ products }: LowStockAlertsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    Low Stock Alerts
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {products.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                            All products are well stocked.
                        </p>
                    ) : (
                        products.map((product) => {
                            const stockPercentage = Math.min((product.stock / 20) * 100, 100);
                            return (
                                <div key={product.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Link
                                                href={`/admin/products/${product.id}/edit`}
                                                className="font-medium hover:underline text-sm"
                                            >
                                                {product.name}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                {product.category?.name}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-muted-foreground">
                                                {product.stock} / 20
                                            </span>
                                            <Badge
                                                variant={product.stock === 0 ? "destructive" : "secondary"}
                                                className="h-5 text-[10px]"
                                            >
                                                {product.stock === 0 ? "OUT OF STOCK" : "LOW"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Progress
                                        value={stockPercentage}
                                        className={cn(
                                            "h-1.5",
                                            product.stock === 0 ? "bg-destructive/20" : ""
                                        )}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
