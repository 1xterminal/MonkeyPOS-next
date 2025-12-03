import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Ambil semua produk dari database
    const products = await prisma.product.findMany({
      include: {
        category: true, // Include Category Data
      },
      orderBy: {
        name: 'asc', // Urutkan berdasarkan nama A-Z
      },
    });

    // Kembalikan data dalam format JSON
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}