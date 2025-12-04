import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Get current user (temporary: returns first cashier user)
// TODO: Replace with actual authentication
export async function GET() {
    try {
        // For now, get the first cashier user from database
        // In production, this should use proper authentication (NextAuth, etc.)
        const user = await prisma.user.findFirst({
            where: {
                role: 'CASHIER'
            },
            select: {
                id: true,
                name: true,
                username: true,
                role: true,
            }
        });

        if (!user) {
            // Fallback to any user if no cashier exists
            const anyUser = await prisma.user.findFirst({
                select: {
                    id: true,
                    name: true,
                    username: true,
                    role: true,
                }
            });

            if (!anyUser) {
                return NextResponse.json(
                    { error: "No users found. Please run: npx prisma db seed" },
                    { status: 404 }
                );
            }

            return NextResponse.json(anyUser);
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Failed to fetch user" },
            { status: 500 }
        );
    }
}
