'use client';

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

import { Button } from "@/app/components/ui/Button";

import './style.scss';
import Link from "next/link";

// Types matching Prisma schema
interface TransactionItem {
    id: string;
    quantity: number;
    price: number;
    product: {
        id: string;
        name: string;
        sku: string;
    };
}

interface Transaction {
    id: string;
    invoiceId: string;
    total: number;
    subtotal: number;
    tax: number;
    discount: number;
    amountReceived: number;
    change: number;
    paymentMethod: string;
    createdAt: string;
    items: TransactionItem[];
    member?: {
        id: string;
        name: string;
        phone: string;
    } | null;
    user?: {
        id: string;
        name: string;
        username: string;
    };
}

interface TransactionDetailProps {
    params: Promise<{
        id: string;
    }>;
}

export default function ReceiptPage({ params }: TransactionDetailProps) {
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const transactionId = decodeURIComponent(resolvedParams.id);

  useEffect(() => {
      const fetchTransaction = async () => {
          try {
              setLoading(true);
              const response = await fetch(`/api/transaction/${encodeURIComponent(transactionId)}`);

              if (!response.ok) {
                  if (response.status === 404) {
                      setError('Transaksi tidak ditemukan.');
                  } else {
                      throw new Error('Gagal mengambil data transaksi');
                  }
                  return;
              }

              const data = await response.json();
              setTransaction(data);
          } catch (err) {
              console.error('Error fetching transaction:', err);
              setError('Gagal memuat detail transaksi dari database.');
          } finally {
              setLoading(false);
          }
      };

      if (transactionId) {
          fetchTransaction();
      }
  }, [transactionId]);

  // Format Rupiah
  const formatRupiah = (num: number) => {
      return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
      }).format(num);
  };

  // Format Date
  const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
      });
  };

  // Format Time
  const formatTime = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('id-ID');
  };


  const handlePrint = () => {
    window.print();
  }

  if (loading) {
      return (
          <div className="text-center py-5">
              <div className="spinner-border text-warning" role="status">
                  <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Memuat struk transaksi...</p>
          </div>
      );
  }

  if (error || !transaction) {
      return (
          <div>
              <h1>{error || 'Transaksi tidak ditemukan.'}</h1>
              <button
                  className="btn btn-warning mt-3"
                  onClick={() => router.push('/sales-history')}
              >
                  Kembali ke Riwayat
              </button>
          </div>
      );
  }

  return (
    <>
      {/* <h1 className="text-2xl font-bold mb-4">Receipt</h1> */}
      <main className="container">
          <div className="wrapper">
            <div className="actions">
              <Button variant="flat" onClick={() => router.back()}>
                <span className="material-symbols-outlined">arrow_back</span>
                Back
              </Button>
              <Button variant="flat" onClick={() => handlePrint()}>
                <span className="material-symbols-outlined">print</span>
                Cetak
              </Button>
            </div>
            <div className="receipt">
              <img
                src="/logo.svg"
                alt="MonkeyPOS Logo"
                className="logo"
                // style={{ width: "150px" }}
              />
              <div className="datetime">
                <div>
                  <span className="material-symbols-outlined">
                    calendar_month
                  </span>
                  <span className="date">
                    {formatDate(transaction.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="material-symbols-outlined">
                    nest_clock_farsight_analog
                  </span>
                  <span className="time">
                    {formatTime(transaction.createdAt)}
                  </span>
                </div>
              </div>
              <div className="details">
                <div id="carts">{
                  transaction.items.map((cart, index) => (
                    <div key={index} className="cart">
                      <div className="detail">
                        <span className="name">{cart.product?.name}</span>
                        <span className="qty">{formatRupiah(cart.price)} × {cart.quantity}</span>
                      </div>
                      <span className="total-price">{formatRupiah(cart.price * cart.quantity)}</span>
                    </div>
                  ))
                }</div>
                <div className="payment">
                  <div className="tax">
                    <span className="label">Pajak</span>
                    <span className="val">{formatRupiah(transaction.tax)}</span>
                  </div>
                  <div className="discount">
                    <span className="label">Diskon</span>
                    <span className="val">{formatRupiah(transaction.discount)}</span>
                  </div>
                  <div className="total">
                    <span className="label">Total</span>
                    <span className="val">{formatRupiah(transaction.total)}</span>
                  </div>
                  <div className="receive">
                    <span className="label">Bayar</span>
                    <span className="val">{formatRupiah(transaction.amountReceived)}</span>
                  </div>
                  <div className="change">
                    <span className="label">Kembali</span>
                    <span className="val">{formatRupiah(transaction.change)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
    </>
  );
}