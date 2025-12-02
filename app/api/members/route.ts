import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching members" }, { status: 500 });
  }
}