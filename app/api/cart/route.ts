import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch user's cart
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

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

    const items = cartItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      price: Number(item.product.price),
      image: item.product.images[0] || "/placeholder-product.jpg",
      quantity: item.quantity,
      stock: item.product.stock,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Verify product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { message: "Insufficient stock" },
        { status: 400 }
      );
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cart.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    let cartItem;
    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return NextResponse.json(
          { message: "Insufficient stock" },
          { status: 400 }
        );
      }

      cartItem = await prisma.cart.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
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
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cart.create({
        data: {
          userId: session.user.id,
          productId,
          quantity,
        },
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
      });
    }

    return NextResponse.json({
      id: cartItem.id,
      productId: cartItem.productId,
      name: cartItem.product.name,
      price: Number(cartItem.product.price),
      image: cartItem.product.images[0] || "/placeholder-product.jpg",
      quantity: cartItem.quantity,
      stock: cartItem.product.stock,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update cart item quantity
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { message: "Product ID and quantity are required" },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await prisma.cart.deleteMany({
        where: {
          userId: session.user.id,
          productId,
        },
      });
      return NextResponse.json({ message: "Item removed" });
    }

    // Verify product exists and has enough stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { message: "Insufficient stock" },
        { status: 400 }
      );
    }

    // Update cart item
    const cartItem = await prisma.cart.updateMany({
      where: {
        userId: session.user.id,
        productId,
      },
      data: { quantity },
    });

    if (cartItem.count === 0) {
      return NextResponse.json(
        { message: "Cart item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Cart updated" });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart or clear entire cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { productId } = body;

    if (productId) {
      // Remove specific item
      await prisma.cart.deleteMany({
        where: {
          userId: session.user.id,
          productId,
        },
      });
    } else {
      // Clear entire cart
      await prisma.cart.deleteMany({
        where: { userId: session.user.id },
      });
    }

    return NextResponse.json({ message: "Cart updated" });
  } catch (error) {
    console.error("Error deleting from cart:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

