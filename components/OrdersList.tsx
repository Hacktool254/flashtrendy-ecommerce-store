"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/store/cart-store";
import {
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string;
    stock: number;
  };
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  shippingAddress: any;
  items: OrderItem[];
}

interface OrdersListProps {
  orders: Order[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500",
  PROCESSING: "bg-blue-500",
  SHIPPED: "bg-purple-500",
  DELIVERED: "bg-green-500",
  CANCELLED: "bg-red-500",
  REFUNDED: "bg-gray-500",
};

export function OrdersList({ orders }: OrdersListProps) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { addItem } = useCartStore();

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleReorder = async (order: Order) => {
    setIsReordering(true);
    const results = [];

    for (const item of order.items) {
      if (item.product.stock > 0) {
        const result = await addItem({
          productId: item.product.id,
          name: item.product.name,
          price: item.price,
          image: item.product.image,
          quantity: Math.min(item.quantity, item.product.stock),
          stock: item.product.stock,
        });
        results.push(result);
      }
    }

    const successCount = results.filter((r) => r.success).length;

    if (successCount > 0) {
      toast({
        title: "Added to cart",
        description: `${successCount} items from order #${order.id.slice(0, 8)} added to your cart.`,
      });
      router.push("/cart");
    } else {
      toast({
        title: "Unable to reorder",
        description: "Some items may be out of stock.",
        variant: "destructive",
      });
    }

    setIsReordering(false);
  };

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">You haven&apos;t placed any orders yet.</p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <>
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <TableCell className="font-medium">
                      #{order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-white",
                          statusColors[order.status] || "bg-gray-500"
                        )}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                        >
                          {expandedOrder === order.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedOrder === order.id && (
                    <TableRow key={`${order.id}-details`}>
                      <TableCell colSpan={5} className="bg-muted/30 p-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Order Items</h4>
                            <div className="space-y-2">
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-4 p-2 bg-background rounded-lg"
                                >
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="h-16 w-16 object-cover rounded-md"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium">{item.product.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                                    </p>
                                  </div>
                                  <p className="font-semibold">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReorder(order)}
                              disabled={isReordering}
                            >
                              {isReordering ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <RotateCcw className="h-4 w-4 mr-2" />
                              )}
                              Reorder
                            </Button>
                            <p className="font-bold text-lg">
                              Total: ${order.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id.slice(0, 8)} -{" "}
              {selectedOrder &&
                new Date(selectedOrder.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-white",
                    statusColors[selectedOrder.status] || "bg-gray-500"
                  )}
                >
                  {selectedOrder.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Items</h4>
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 bg-muted rounded-lg"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-16 w-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleReorder(selectedOrder)}
                  disabled={isReordering}
                >
                  {isReordering ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  Reorder All Items
                </Button>
                <p className="text-xl font-bold">${selectedOrder.total.toFixed(2)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
