import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { z } from "zod";

const compatibilitySchema = z.object({
  productId: z.string(),
  vehicleId: z.string(),
  notes: z.string().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const vehicleId = searchParams.get("vehicleId");

    if (!productId && !vehicleId) {
      return new NextResponse("Product ID or Vehicle ID is required", {
        status: 400,
      });
    }

    let where = {};
    if (productId) {
      where = { ...where, productId };
    }
    if (vehicleId) {
      where = { ...where, vehicleId };
    }

    const compatibilities = await prisma.vehicleCompatibility.findMany({
      where,
      include: {
        product: true,
        vehicle: true,
      },
    });

    return NextResponse.json(compatibilities);
  } catch (error) {
    console.error('Error fetching compatibility:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = compatibilitySchema.parse(body);

    const compatibility = await prisma.vehicleCompatibility.create({
      data: validatedData,
      include: {
        product: true,
        vehicle: true,
      },
    });

    return NextResponse.json(compatibility);
  } catch (error) {
    console.error('Error creating compatibility:', error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;
    const validatedData = compatibilitySchema.parse(data);

    const compatibility = await prisma.vehicleCompatibility.update({
      where: {
        id,
      },
      data: validatedData,
      include: {
        product: true,
        vehicle: true,
      },
    });

    return NextResponse.json(compatibility);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Compatibility ID is required", { status: 400 });
    }

    await prisma.vehicleCompatibility.delete({
      where: {
        id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting compatibility:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 