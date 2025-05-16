import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({ take: 1 });
    return NextResponse.json(products);
  } catch (error) {
    console.error('API test error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 