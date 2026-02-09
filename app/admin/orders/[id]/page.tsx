import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Package, User, MapPin, CreditCard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

export default async function OrderDetailsPage({
    params,
}: {
    params: { id: string };
}) {
    const order = await prisma.order.findUnique({
        where: { id: params.id },
        include: {
            user: true,
            items: {
                include: {
                    product: true,
                },
            },
        },
    });

    if (!order) {
        notFound();
    }

    const shippingAddress = order.shippingAddress as any;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/orders">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">Order Details</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                            <CardDescription>
                                {order.items.length} items in this order
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-10 h-10 rounded overflow-hidden">
                                                        <Image
                                                            src={item.product.images[0] || "/placeholder.jpg"}
                                                            alt={item.product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <span className="font-medium">
                                                        {item.product.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell className="text-right">
                                                ${Number(item.price).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                ${(Number(item.price) * item.quantity).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-right font-bold">
                                            Total
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-lg">
                                            ${Number(order.total).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Update Order Status</p>
                                    <p className="text-xs text-muted-foreground">
                                        Notify customer of progress
                                    </p>
                                </div>
                                <OrderStatusSelect
                                    orderId={order.id}
                                    currentStatus={order.status}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-4 w-4" /> Customer Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium">{order.user.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {order.user.email}
                                </p>
                            </div>
                            <div className="pt-2 border-t text-xs">
                                <p>Ordered on: {format(new Date(order.createdAt), "PPP p")}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-1">
                            <p>{shippingAddress.street}</p>
                            <p>
                                {shippingAddress.city}, {shippingAddress.state}{" "}
                                {shippingAddress.zipCode}
                            </p>
                            <p>{shippingAddress.country}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" /> Payment Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Method:</span>
                                <span className="font-medium">Stripe</span>
                            </div>
                            {order.paymentIntentId && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground text-xs font-mono break-all">
                                        ID: {order.paymentIntentId}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
