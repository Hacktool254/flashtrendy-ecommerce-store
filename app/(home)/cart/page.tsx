import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CartPageContent } from "@/components/CartPageContent";
import { ArrowLeft } from "lucide-react";

export default async function CartPage() {
  const session = await auth();

  let items: Array<{
    id: string;
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    stock: number;
  }> = [];

  // If authenticated, fetch cart items from database
  if (session?.user?.id) {
    const cartItems = await prisma.cart.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            stock: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    items = cartItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      price: Number(item.product.price),
      image: item.product.images[0] || "/placeholder-product.jpg",
      quantity: item.quantity,
      stock: item.product.stock,
    }));
  }
  // If not authenticated, items will be loaded from localStorage by CartPageContent component

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
        <Link
          href="/products"
          className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
      </div>

      <CartPageContent serverItems={items} />
    </div>
  );
}

