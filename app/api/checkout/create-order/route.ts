import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const {
      items,
      shippingAddress,
      subtotal,
      tax,
      shipping,
      total,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Verify products exist and get their details
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: "Some products not found" },
        { status: 400 }
      );
    }

    // Handle guest checkout - create or find guest user
    let userId: string;
    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      // Create or find guest user
      const guestEmail = shippingAddress.email || `guest-${Date.now()}@example.com`;
      let guestUser = await prisma.user.findUnique({
        where: { email: guestEmail },
      });
      
      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: {
            email: guestEmail,
            name: shippingAddress.name || "Guest",
            password: "", // Guest users don't have passwords
            role: "USER",
          },
        });
      }
      userId = guestUser.id;
    }

    // Create order with PENDING status
    // Include shipping, tax, and subtotal in shippingAddress for display on success page
    const order = await prisma.order.create({
      data: {
        userId: userId,
        total: total,
        status: "PENDING",
        shippingAddress: {
          ...shippingAddress,
          subtotal: subtotal,
          tax: tax,
          shipping: shipping,
        },
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      orderId: order.id,
      order: order 
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      {
        error: "Failed to create order",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

