'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './TransactionDetail.module.css';
import { use } from 'react';

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

export default function TransactionDetailPage({ params }: TransactionDetailProps) {
    const router = useRouter();
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Unwrap params using React.use()
    const resolvedParams = use(params);
    const transactionId = decodeURIComponent(resolvedParams.id);

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
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Fetch transaction from API
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

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Memuat detail transaksi...</p>
            </div>
        );
    }

    if (error || !transaction) {
        return (
            <div className={styles.transactionCard}>
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

    // Payment method display
    const getPaymentMethodDisplay = (method: string) => {
        switch (method) {
            case 'CASH': return 'Tunai';
            case 'CARD': return 'Kartu Kredit/Debit';
            case 'E_WALLET': return 'E-Wallet (QRIS)';
            default: return method;
        }
    };

    const isCash = transaction.paymentMethod === 'CASH';

    return (
        <>
            <h1>Detail Transaksi</h1>

            <div className={styles.transactionCard}>
                {/* Transaction Header */}
                <div className={styles.transactionHeader}>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <div className={styles.label}>ID Transaksi</div>
                            <div className={styles.value}>{transaction.invoiceId}</div>
                        </div>
                        <div className={styles.infoItem}>
                            <div className={styles.label}>Tanggal</div>
                            <div className={styles.value}>{formatDate(transaction.createdAt)}</div>
                        </div>
                        <div className={styles.infoItem}>
                            <div className={styles.label}>Waktu</div>
                            <div className={styles.value}>{formatTime(transaction.createdAt)}</div>
                        </div>
                    </div>
                </div>

                {/* Items Section */}
                <section className={styles.itemsSection}>
                    <h2>Daftar Item</h2>
                    <div className={styles.tableResponsive}>
                        <table className={styles.itemsTable}>
                            <thead>
                                <tr>
                                    <th>Nama Produk</th>
                                    <th className={styles.textRight}>Harga Satuan</th>
                                    <th className={styles.textCenter}>Jumlah</th>
                                    <th className={styles.textRight}>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transaction.items.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '14px' }}>
                                            Tidak ada item untuk transaksi ini.
                                        </td>
                                    </tr>
                                ) : (
                                    transaction.items.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.product?.name || '-'}</td>
                                            <td className={styles.textRight}>{formatRupiah(item.price)}</td>
                                            <td className={styles.textCenter}>{item.quantity}</td>
                                            <td className={styles.textRight}>{formatRupiah(item.price * item.quantity)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Payment Summary */}
                <section className={styles.paymentSummary}>
                    <div className={styles.summaryLeft}>
                        <div className={styles.meta}>
                            <strong>Metode Pembayaran:</strong> <span>{getPaymentMethodDisplay(transaction.paymentMethod)}</span>
                        </div>
                        <div className={styles.meta}>
                            <strong>Kasir:</strong> <span>{transaction.user?.name || '-'}</span>
                        </div>
                        {transaction.member && (
                            <div className={styles.meta}>
                                <strong>Member:</strong> <span>{transaction.member.name} ({transaction.member.phone})</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.summaryRight}>
                        <div className={styles.summaryRow}>
                            <span>Subtotal:</span>
                            <span>{formatRupiah(transaction.subtotal)}</span>
                        </div>
                        {transaction.discount > 0 && (
                            <div className={styles.summaryRow}>
                                <span>Diskon Member (5%):</span>
                                <span className="text-success">- {formatRupiah(transaction.discount)}</span>
                            </div>
                        )}
                        <div className={styles.summaryRow}>
                            <span>Pajak (11%):</span>
                            <span>{formatRupiah(transaction.tax)}</span>
                        </div>
                        {isCash && (
                            <>
                                <div className={`${styles.summaryRow} ${styles.cashDetail}`}>
                                    <span>Uang Diterima:</span>
                                    <span>{formatRupiah(transaction.amountReceived)}</span>
                                </div>
                                <div className={`${styles.summaryRow} ${styles.cashDetail}`}>
                                    <span>Kembalian:</span>
                                    <span>{formatRupiah(transaction.change)}</span>
                                </div>
                            </>
                        )}
                        <div className={`${styles.summaryRow} ${styles.total}`}>
                            <span>Total:</span>
                            <span>{formatRupiah(transaction.total)}</span>
                        </div>
                        <div className={styles.actions}>
                            <button
                                className="btn filled"
                                onClick={() => router.push('/sales-history')}
                            >
                                Kembali ke Riwayat
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
