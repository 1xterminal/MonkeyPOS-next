'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/app/components/ui/Header';
import TableComponent, { Column, Action } from '@/app/components/ui/Table';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { deleteProduct } from './actions';

interface Product {
    id: string;
    sku: string;
    name: string;
    category: { name: string } | null;
    price: number;
    stock: number;
}

function ProductsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // state
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [userName, setUserName] = useState<string | undefined>(undefined);

    // fetch username
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUser = sessionStorage.getItem('currentUser');
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    setUserName(parsed.name);
                } catch (e) {
                    console.error("Failed to parse user from session storage", e);
                }
            }
        }
    }, []);

    // fetch products data
    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            alert('Gagal memuat data produk.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // filter products data
    const filteredProducts = products.filter(product => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        return (
            product.name.toLowerCase().includes(lowerTerm) ||
            product.sku.toLowerCase().includes(lowerTerm)
        );
    });

    // handle search 
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

    // handle delete product
    const handleDelete = async (sku: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            setIsLoading(true);
            const result = await deleteProduct(sku);
            if (result.success) {
                await fetchProducts();
            } else {
                alert('Failed to delete product');
                setIsLoading(false);
            }
        }
    };

    // transform data for display
    const tableData = filteredProducts.map((p) => ({
        ...p,
        categoryName: p.category?.name || '-',
        formattedPrice: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(p.price),
    }));

    // table config
    const columns: Column[] = [
        { key: 'name', label: 'Nama Produk' },
        { key: 'sku', label: 'SKU' },
        { key: 'categoryName', label: 'Kategori' },
        { key: 'formattedPrice', label: 'Harga' },
        { key: 'stock', label: 'Stok' },
    ];

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
            onClick: (row) => handleDelete(row.sku, row.name),
        },
    ];

    return (
        <div className="p-3 h-100">
            <div className="bg-white p-4 rounded-4 shadow-sm h-100 d-flex flex-column overflow-hidden">
                <Header title='Daftar Produk'/>

                <div className="d-flex flex-column flex-grow-1 gap-3" style={{ minHeight: 0 }}>
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
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductsContent />
        </Suspense>
    );
}
