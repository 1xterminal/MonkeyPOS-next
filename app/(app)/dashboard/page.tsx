"use client";

import React, { useEffect, useState } from 'react';
import Header from '@/app/components/ui/Header';
import Link from 'next/link';
import { BarChart } from '@mui/x-charts/BarChart';

interface DashboardStats {
    totalSales: number;
    todaySales: number;
    transactionCount: number;
    lowStockCount: number;
    recentTransactions: any[];
    chartData: { date: string; sales: number }[];
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/dashboard/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to load stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(num);
    };

    return (
        <div className="container-fluid p-4">
            <h1 className="fw-bold mb-4">Dashboard</h1>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-3 bg-primary text-white h-100">
                        <div className="card-body">
                            <h5 className="card-title opacity-75">Total Penjualan</h5>
                            {loading ? (
                                <div className="spinner-border spinner-border-sm text-light" role="status"></div>
                            ) : (
                                <h2 className="fw-bold">{formatRupiah(stats?.totalSales || 0)}</h2>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-3 bg-success text-white h-100">
                        <div className="card-body">
                            <h5 className="card-title opacity-75">Penjualan Hari Ini</h5>
                            {loading ? (
                                <div className="spinner-border spinner-border-sm text-light" role="status"></div>
                            ) : (
                                <h2 className="fw-bold">{formatRupiah(stats?.todaySales || 0)}</h2>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-3 bg-warning text-dark h-100">
                        <div className="card-body">
                            <h5 className="card-title opacity-75">Total Transaksi</h5>
                            {loading ? (
                                <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
                            ) : (
                                <h2 className="fw-bold">{stats?.transactionCount || 0}</h2>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-3 bg-danger text-white h-100">
                        <div className="card-body">
                            <h5 className="card-title opacity-75">Stok Menipis</h5>
                            {loading ? (
                                <div className="spinner-border spinner-border-sm text-light" role="status"></div>
                            ) : (
                                <h2 className="fw-bold">{stats?.lowStockCount || 0}</h2>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Chart Section */}
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white fw-bold py-3">
                            Tren Penjualan (7 Hari Terakhir)
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div className="d-flex justify-content-center align-items-center h-100">
                                    <div className="spinner-border text-primary" role="status"></div>
                                </div>
                            ) : stats?.chartData ? (
                                <BarChart
                                    dataset={stats.chartData}
                                    xAxis={[{ scaleType: 'band', dataKey: 'date' }]}
                                    series={[{ dataKey: 'sales', label: 'Penjualan (Rp)', color: '#0d6efd' }]}
                                    height={300}
                                    borderRadius={5}
                                />
                            ) : (
                                <div className="text-center text-muted mt-5">Tidak ada data grafik.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white fw-bold py-3 d-flex justify-content-between align-items-center">
                            <span>Transaksi Terakhir</span>
                            <Link href="/sales-history" className="text-decoration-none small">Lihat Semua</Link>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-4">ID</th>
                                            <th>Total</th>
                                            <th>Kasir</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={3} className="text-center py-3">Loading...</td></tr>
                                        ) : stats?.recentTransactions.length === 0 ? (
                                            <tr><td colSpan={3} className="text-center py-3 text-muted">Belum ada transaksi</td></tr>
                                        ) : (
                                            stats?.recentTransactions.map((tx: any) => (
                                                <tr key={tx.id}>
                                                    <td className="ps-4 small">{tx.invoiceId}</td>
                                                    <td className="fw-bold text-success">{formatRupiah(tx.total)}</td>
                                                    <td className="small text-muted">{tx.user?.name || '-'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
