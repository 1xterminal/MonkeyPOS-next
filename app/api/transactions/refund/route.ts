import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function POST(request: Request) {
    try {
        const { transactionId } = await request.json();

        if (!transactionId) {
            return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
        }

        // 1. Fetch the transaction with its items
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { items: true },
        });

        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        if (transaction.status === 'REFUNDED') {
            return NextResponse.json({ error: 'Transaction is already refunded' }, { status: 400 });
        }

        // 2. Start a transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // A. Update transaction status
            await tx.transaction.update({
                where: { id: transactionId },
                data: { status: 'REFUNDED' },
            });

            // B. Restore stock for each item
            for (const item of transaction.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.quantity,
                        },
                    },
                });
            }
        });

        return NextResponse.json({ success: true, message: 'Transaction refunded successfully' });

    } catch (error) {
        console.error('Refund error:', error);
        return NextResponse.json({ error: 'Failed to process refund' }, { status: 500 });
    }
}
