import Link from "next/link";
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
import { cn } from "@/lib/utils";

interface RecentOrdersTableProps {
  orders: any[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500",
  PROCESSING: "bg-blue-500",
  SHIPPED: "bg-purple-500",
  DELIVERED: "bg-green-500",
  CANCELLED: "bg-red-500",
  REFUNDED: "bg-gray-500",
};

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4">
              No recent orders found.
            </TableCell>
          </TableRow>
        ) : (
          orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{order.user?.name || "Guest"}</span>
                  <span className="text-xs text-muted-foreground">
                    {order.user?.email}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    "text-white hover:bg-opacity-80",
                    statusColors[order.status] || "bg-gray-500"
                  )}
                >
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">${Number(order.total).toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/orders/${order.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
