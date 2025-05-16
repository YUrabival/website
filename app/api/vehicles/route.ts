import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { z } from "zod";

const vehicleSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  yearStart: z.number().int().positive(),
  yearEnd: z.number().int().positive().nullable(),
  generation: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const make = searchParams.get("make");
    const model = searchParams.get("model");

    let where = {};
    if (make) {
      where = { ...where, make };
    }
    if (model) {
      where = { ...where, model };
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: [
        { make: "asc" },
        { model: "asc" }
      ],
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
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
    const validatedData = vehicleSchema.parse(body);

    const vehicle = await prisma.vehicle.create({
      data: {
        ...validatedData,
        year: validatedData.yearStart,
      },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
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
    const validatedData = vehicleSchema.parse(data);

    const vehicle = await prisma.vehicle.update({
      where: {
        id,
      },
      data: validatedData,
    });

    return NextResponse.json(vehicle);
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
      return new NextResponse("Vehicle ID is required", { status: 400 });
    }

    await prisma.vehicle.delete({
      where: {
        id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 