import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Fetch single transaction by invoiceId
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const invoiceId = decodeURIComponent(id);

        const transaction = await prisma.transaction.findFirst({
            where: {
                OR: [
                    { invoiceId: invoiceId },
                    { id: invoiceId }
                ]
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                member: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    }
                },
            },
        });

        if (!transaction) {
            return NextResponse.json(
                { error: "Transaction not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(transaction);
    } catch (error) {
        console.error("Error fetching transaction:", error);
        return NextResponse.json(
            { error: "Failed to fetch transaction" },
            { status: 500 }
        );
    }
}
