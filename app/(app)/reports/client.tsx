'use client';

import TableComponent from '@/components/ui/Table';
import { useEffect, useState } from 'react';

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
}

interface ProductSales {
    id: string;
    productName: string;
    quantitySold: number;
    unitPrice: number;
    totalPrice: number;
}

export default function ReportsClient({
    userId, userName
} : {
    userId?: string
    userName?: string
}) {
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [cashierSales, setCashierSales] = useState<Transaction[]>([]);
    const [productSales, setProductSales] = useState<ProductSales[]>([]);
    const [totalSales, setTotalSales] = useState(0);
    
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

                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                    console.log(data);

                    const cashierTransactions = data.filter((transaction: Transaction) => {
                        const saleDate = new Date(transaction.createdAt);
                        // console.log(saleDate, sevenDaysAgo);
                        // console.log(saleDate >= sevenDaysAgo);
                        return transaction.user?.id === userId && saleDate >= sevenDaysAgo
                    });
                    console.log(cashierTransactions);
                    setCashierSales(cashierTransactions);

                    const totalSales = cashierTransactions.reduce((acc, transaction) => acc + transaction.total, 0);
                    setTotalSales(totalSales);

                    const productSales: { [sku: string]: ProductSales } = {};
                    cashierTransactions.forEach(transaction => {
                        transaction.items.forEach((item: TransactionItem) => {
                            if (productSales[item.product.sku]) {
                                productSales[item.product.sku].quantitySold += item.quantity;
                            } else {
                                productSales[item.product.sku] = {
                                    id: item.product.id,
                                    productName: item.product.name,
                                    quantitySold: item.quantity,
                                    unitPrice: item.price,
                                    totalPrice: 0
                                };
                            }
                        });
                    })

                    const productSalesData = Object.values(productSales).map(item => ({
                        ...item,
                        totalPrice: item.quantitySold * item.unitPrice
                    }));
                    
                    setProductSales(productSalesData);
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
    }, [userId]);

    return <>
        <div className="performance-summary">
            <div className="summary-item">
                <span className="label">Nama Kasir: </span>
                <span id="cashier-name" className="value">{userName}</span>
            </div>
            <div className="summary-item">
                <span className="label">Total Penjualan (7 Hari Terakhir): </span>
                <span id="total-sales" className="value">{formatRupiah(totalSales)}</span>
            </div>
        </div>

        <h2>Rincian Penjualan Produk</h2>
        <TableComponent
            data={productSales.map(item => ({
                ...item,
                unitPrice: formatRupiah(item.unitPrice),
                totalPrice: formatRupiah(item.totalPrice)
            }))}
            columns={[
                { key: "productName", label: "Nama Produk" },
                { key: "quantitySold", label: "Jumlah Terjual" },
                { key: "unitPrice", label: "Harga Satuan" },
                { key: "totalPrice", label: "Total Harga" }
            ]}>
        </TableComponent>

        {/* <table>
            <thead>
                <tr>
                    <th>Nama Produk</th>
                    <th>Jumlah Terjual</th>
                    <th>Harga Satuan</th>
                    <th>Total Harga</th>
                </tr>
            </thead>
            <tbody>
                {
                    productSales.map((product, index) => (
                        <tr key={index}>
                            <td>{product.productName}</td>
                            <td>{product.quantitySold}</td>
                            <td>{formatRupiah(product.unitPrice)}</td>
                            <td>{formatRupiah(product.quantitySold * product.unitPrice)}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table> */}
    </>;
}