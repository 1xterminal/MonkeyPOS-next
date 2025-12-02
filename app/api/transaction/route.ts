import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      total, subtotal, tax, discount, paymentMethod, amountReceived, change, 
      items, memberId, userId 
    } = body;

    // pake database Transaction agar aman (Semua sukses atau gagal semua)
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Header Transaksi
      const transaction = await tx.transaction.create({
        data: {
          invoiceId: `INV-${Date.now()}`,
          total,
          subtotal,
          tax,
          discount,
          paymentMethod,
          amountReceived,
          change,
          userId, // ID Kasir (nanti kita hardcode dulu kalau belum login)
          memberId: memberId || null, // ID Member jika ada
        },
      });

      // 2. Proses Setiap Item Belanja
      for (const item of items) {
        // A. Simpan item ke tabel TransactionItem
        await tx.transactionItem.create({
          data: {
            transactionId: transaction.id,
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          },
        });

        // B. KURANGI STOK PRODUK (Real-time inventory deduction)
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity, // Kurangi stok sesuai jumlah beli
            },
          },
        });
      }

      return transaction;
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("Transaction Error:", error);
    return NextResponse.json({ error: "Transaction failed" }, { status: 500 });
  }
}