'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TableComponent, { Column, Action } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { deleteProduct } from './actions';

interface Product {
    id: string;
    sku: string;
    name: string;
    category: { name: string } | null;
    price: number;
    stock: number;
}

interface ProductsClientProps {
    initialProducts: Product[];
}

export default function ProductsClient({ initialProducts }: ProductsClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams);
        if (searchTerm) {
            params.set('search', searchTerm);
        } else {
            params.delete('search');
        }
        router.push(`/products?${params.toString()}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleDelete = async (sku: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            setIsLoading(true);
            const result = await deleteProduct(sku);
            setIsLoading(false);
            if (!result.success) {
                alert('Failed to delete product');
            }
        }
    };

    const columns: Column[] = [
        { key: 'name', label: 'Nama Produk' },
        { key: 'sku', label: 'SKU' },
        { key: 'categoryName', label: 'Kategori' },
        { key: 'formattedPrice', label: 'Harga' },
        { key: 'stock', label: 'Stok' },
    ];

    // Transform data for display
    const tableData = initialProducts.map((p) => ({
        ...p,
        categoryName: p.category?.name || '-',
        formattedPrice: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(p.price),
    }));

    const actions: Action<typeof tableData[0]>[] = [
        {
            label: 'Ubah',
            icon: <i className="bi bi-pencil-square"></i>,
            onClick: (row) => {
                router.push(`/products/${row.id}/edit`);
            },
        },
        {
            label: 'Hapus',
            icon: <i className="bi bi-trash"></i>,
            onClick: (row) => {
                handleDelete(row.sku, row.name);
            },
        },
    ];

    return (
        <div className="d-flex flex-column h-100 gap-3" style={{ minHeight: 0 }}>
            <div className="d-flex justify-content-between align-items-center flex-shrink-0 w-100">
                <div className="d-flex gap-2" style={{ width: '60%' }}>
                    <div style={{ flex: 1 }}>
                        <Input
                            placeholder="Cari Produk (Nama atau SKU)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-100"
                        />
                    </div>
                    <div style={{ width: 'auto' }}>
                        <Button onClick={handleSearch} className="d-flex justify-content-center">Search</Button>
                    </div>
                </div>
                <div style={{ width: 'auto' }}>
                    <Button variant="primary" onClick={() => router.push('/products/add')} className="text-nowrap d-flex justify-content-center">
                        Tambahkan Produk Baru
                    </Button>
                </div>
            </div>

            <div className="flex-grow-1" style={{ minHeight: 0, overflow: 'hidden' }}>
                <TableComponent
                    columns={columns}
                    data={tableData}
                    actions={actions}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
