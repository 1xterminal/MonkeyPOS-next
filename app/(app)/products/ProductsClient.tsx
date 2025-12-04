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
                router.push(`/products/edit?sku=${row.sku}`);
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
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                <div className="flex gap-2 w-full md:w-auto flex-1 max-w-2xl">
                    <Input
                        placeholder="Cari Produk (Nama atau SKU)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full"
                    />
                    <Button onClick={handleSearch}>Search</Button>
                </div>
                <Button variant="primary" onClick={() => router.push('/products/add')} className="whitespace-nowrap">
                    Tambahkan Produk Baru
                </Button>
            </div>

            <TableComponent
                columns={columns}
                data={tableData}
                actions={actions}
                isLoading={isLoading}
            />
        </div>
    );
}
