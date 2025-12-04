import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Fetch all transactions for sales history
export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        member: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error("Error fetching transactions:", error);

    let errorMessage = "Failed to fetch transactions";

    if (error.code === 'P1001') {
      errorMessage = "Cannot connect to database. Make sure PostgreSQL is running and .env has correct DATABASE_URL";
    } else if (error.code === 'P1003') {
      errorMessage = "Database does not exist. Run: npx prisma migrate dev";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      total, subtotal, tax, discount, paymentMethod, amountReceived, change,
      items, memberId, userId
    } = body;

    const result = await prisma.$transaction(async (tx: any) => {
      const transaction = await tx.transaction.create({
        data: {
          invoiceId: `INV-${Date.now()}`,
          total: Math.round(total),
          subtotal: Math.round(subtotal),
          tax: Math.round(tax),
          discount: Math.round(discount),
          paymentMethod,
          amountReceived: Math.round(amountReceived),
          change: Math.round(change),
          userId,
          memberId: memberId || null,
        },
      });

      for (const item of items) {
        await tx.transactionItem.create({
          data: {
            transactionId: transaction.id,
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          },
        });

        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return transaction;
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Transaction Error:", error);

    let errorMessage = "Transaction failed";

    if (error.code === 'P1001') {
      errorMessage = "Cannot connect to database";
    } else if (error.code === 'P2003') {
      errorMessage = "Invalid userId or memberId. Make sure to run: npx prisma db seed";
    } else if (error.code === 'P2025') {
      errorMessage = "Product not found";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}