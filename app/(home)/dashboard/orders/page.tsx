import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrdersList } from "@/components/OrdersList";

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?redirect=/dashboard/orders");
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              stock: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Serialize orders for client component
  const serializedOrders = orders.map((order) => ({
    id: order.id,
    total: Number(order.total),
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    shippingAddress: order.shippingAddress,
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      product: {
        id: item.product.id,
        name: item.product.name,
        image: item.product.images[0] || "/placeholder-product.jpg",
        stock: item.product.stock,
      },
    })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">View and track your order history</p>
      </div>

      <OrdersList orders={serializedOrders} />
    </div>
  );
}
