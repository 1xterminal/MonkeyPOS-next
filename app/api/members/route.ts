import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json({ error: "Error fetching members" }, { status: 500 });
  }
}