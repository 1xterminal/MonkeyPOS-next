import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const employees = await prisma.user.findMany({
            where: { role: 'CASHIER' },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                // Exclude password
            }
        });
        return NextResponse.json(employees);
    } catch (error) {
        console.error("Error fetching employees:", error);
        return NextResponse.json({ error: "Error fetching employees" }, { status: 500 });
    }
}
