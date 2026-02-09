import { prisma } from "@/lib/prisma";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { format } from "date-fns";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { ExportButton } from "@/components/admin/ExportButton";
import { exportOrdersCSV } from "@/app/actions/reports";

export default async function AdminOrdersPage() {
    const orders = await prisma.order.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case "PENDING":
                return "secondary";
            case "PROCESSING":
                return "default";
            case "SHIPPED":
                return "outline";
            case "DELIVERED":
                return "success";
            case "CANCELLED":
                return "destructive";
            default:
                return "default";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Orders</h1>
                <ExportButton exportAction={exportOrdersCSV} filename="orders" />
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs">
                                        {order.id}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{order.user.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {order.user.email}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(order.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <OrderStatusSelect
                                            orderId={order.id}
                                            currentStatus={order.status}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={`/admin/orders/${order.id}`}>
                                                View Details
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
