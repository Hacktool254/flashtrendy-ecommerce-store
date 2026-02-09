import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TopProductsListProps {
    products: any[];
}

export function TopProductsList({ products }: TopProductsListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {products.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                            No sales data yet.
                        </p>
                    ) : (
                        products.map((product) => (
                            <div key={product.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={product.images[0]} alt={product.name} />
                                    <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        <Link href={`/admin/products/${product.id}/edit`} className="hover:underline">
                                            {product.name}
                                        </Link>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {product.category?.name}
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">
                                    +${product.totalRevenue.toFixed(2)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
