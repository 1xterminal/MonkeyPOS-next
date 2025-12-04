'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './SalesHistory.module.css';
import Header from '@/app/components/ui/Header';

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
    };
    status?: 'COMPLETED' | 'REFUNDED';
}

export default function SalesHistoryPage() {
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Format Rupiah
    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(num);
    };

    // Format DateTime
    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Load transactions from API on mount
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/transaction');
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Gagal mengambil data transaksi');
                }

                // Check if data is an array (success) or has error
                if (Array.isArray(data)) {
                    setAllTransactions(data);
                    setFilteredTransactions(data);
                } else {
                    throw new Error(data.error || 'Format data tidak valid');
                }
            } catch (err: any) {
                console.error('Error fetching transactions:', err);
                setError(err.message || 'Gagal memuat riwayat transaksi dari database.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    // Get product names from transaction
    const getProductNames = (tx: Transaction): string => {
        const names = tx.items.map(item => item.product?.name || '-').filter(Boolean);

        if (names.length === 0) return '-';
        if (names.length <= 3) return names.join(', ');
        return names.slice(0, 3).join(', ') + ` (+${names.length - 3})`;
    };

    // Filter by date range
    const filterByDateRange = (filter: 'today' | 'week' | 'month') => {
        setActiveFilter(filter);
        const now = new Date();
        let start: Date, end: Date;

        if (filter === 'today') {
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            end = new Date(start);
            end.setDate(start.getDate() + 1);
        } else if (filter === 'week') {
            start = new Date(now);
            start.setDate(now.getDate() - 6);
            start.setHours(0, 0, 0, 0);
            end = new Date(now);
            end.setHours(23, 59, 59, 999);
        } else {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        }

        const filtered = allTransactions.filter(tx => {
            const d = new Date(tx.createdAt);
            return d >= start && d <= end;
        });

        setFilteredTransactions(filtered);
        setSearchQuery('');
    };

    // Search transactions
    const handleSearch = () => {
        const q = searchQuery.trim().toLowerCase();

        if (q === '') {
            setFilteredTransactions(allTransactions);
            setActiveFilter(null);
            return;
        }

        const filtered = allTransactions.filter(tx => {
            const id = tx.invoiceId.toLowerCase();
            const items = tx.items
                .map(item => item.product?.name?.toLowerCase() || '')
                .join(' ');

            return id.includes(q) || items.includes(q);
        });

        setFilteredTransactions(filtered);
        setActiveFilter(null);
    };

    // Reset filters
    const handleReset = () => {
        setFilteredTransactions(allTransactions);
        setActiveFilter(null);
        setSearchQuery('');
    };

    // Handle row click
    const handleRowClick = (id: string, e: React.MouseEvent) => {
        // Don't navigate if clicking on a link
        if ((e.target as HTMLElement).tagName === 'A' || (e.target as HTMLElement).closest('a')) {
            return;
        }
        window.location.href = `/transaction-detail/${encodeURIComponent(id)}`;
    };

    // Handle refund
    const handleRefund = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click
        if (!confirm('Are you sure you want to refund this transaction? This action cannot be undone.')) return;

        try {
            setIsLoading(true);
            const response = await fetch('/api/transactions/refund', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId: id }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Refund successful');
                window.location.reload();
            } else {
                alert(data.error || 'Refund failed');
            }
        } catch (error) {
            console.error('Refund error:', error);
            alert('Refund failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header title="Riwayat Penjualan"/>

            {/* Filter & Search */}
            <div className={styles.filterBox}>
                <button
                    className={activeFilter === 'today' ? styles.active : ''}
                    onClick={() => filterByDateRange('today')}
                >
                    Hari Ini
                </button>
                <button
                    className={activeFilter === 'week' ? styles.active : ''}
                    onClick={() => filterByDateRange('week')}
                >
                    Minggu Ini
                </button>
                <button
                    className={activeFilter === 'month' ? styles.active : ''}
                    onClick={() => filterByDateRange('month')}
                >
                    Bulan Ini
                </button>
                <button onClick={handleReset}>
                    Reset
                </button>
                <input
                    type="text"
                    placeholder="Cari ID atau Produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSearch();
                    }}
                />
                <button className={styles.filled} onClick={handleSearch}>
                    Cari
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-warning" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Memuat riwayat transaksi...</p>
                </div>
            ) : (
                /* Table */
                <div className={styles.tableWrapper}>
                    <table className={styles.salesTable}>
                        <thead>
                            <tr>
                                <th>ID Transaksi</th>
                                <th>Tanggal</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Nama Produk</th>
                                <th>Detail</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '18px' }}>
                                        Belum ada transaksi.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx) => (
                                    <tr
                                        key={tx.id}
                                        onClick={(e) => handleRowClick(tx.invoiceId, e)}
                                        style={{ cursor: 'pointer', opacity: tx.status === 'REFUNDED' ? 0.6 : 1 }}
                                    >
                                        <td>{tx.invoiceId}</td>
                                        <td>{formatDateTime(tx.createdAt)}</td>
                                        <td>{formatRupiah(tx.total)}</td>
                                        <td>
                                            <span className={`badge ${tx.status === 'REFUNDED' ? 'bg-danger' : 'bg-success'}`}>
                                                {tx.status || 'COMPLETED'}
                                            </span>
                                        </td>
                                        <td>{getProductNames(tx)}</td>
                                        <td>
                                            <Link
                                                href={`/transaction-detail/${encodeURIComponent(tx.invoiceId)}`}
                                                className={styles.actionLink}
                                            >
                                                <span className="material-symbols-outlined">visibility</span>
                                                Lihat
                                            </Link>
                                        </td>
                                        <td>
                                            {tx.status !== 'REFUNDED' && (
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={(e) => handleRefund(tx.id, e)}
                                                >
                                                    Refund
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
