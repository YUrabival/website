import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { z } from "zod";
import { Prisma } from "@prisma/client";

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

interface OrderCreateData {
  userId: string;
  status: string;
  addressId: string;
  phoneNumber: string;
  items: OrderItem[];
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        user: {
          email: session.user.email,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { addressId, phoneNumber } = body;

    if (!addressId || !phoneNumber) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: {
        cart: {
          userId: session.user.id,
        },
      },
      include: {
        product: true,
      },
    });

    if (cartItems.length === 0) {
      return new NextResponse("Cart is empty", { status: 400 });
    }

    const orderData: OrderCreateData = {
      userId: session.user.id,
      status: "PENDING",
      addressId,
      phoneNumber,
      items: cartItems.map((item: { productId: string; quantity: number; product: { price: number; name: string } }) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
        name: item.product.name,
      })),
    };

    const totalAmount = cartItems.reduce(
      (sum: number, item: { product: { price: number }; quantity: number }) => sum + item.product.price * item.quantity,
      0
    );

    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newOrder = await tx.order.create({
        data: {
          userId: orderData.userId,
          status: orderData.status,
          addressId: orderData.addressId,
          total: totalAmount,
          items: {
            create: orderData.items.map((item) => ({
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

      await tx.cartItem.deleteMany({
        where: {
          cart: {
            userId: session.user.id,
          },
        },
      });

      return newOrder;
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "MANAGER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { orderId, status } = z
      .object({
        orderId: z.string(),
        status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"]),
      })
      .parse(body);

    const order = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    return new NextResponse("Internal error", { status: 500 });
  }
} 