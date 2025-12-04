import React, { Suspense } from 'react';
import prisma from '@/lib/prisma';
import ProductsClient from './ProductsClient';
import Header from '@/components/ui/Header';

async function ProductList({ searchTerm }: { searchTerm?: string }) {
    const products = await prisma.product.findMany({
        where: searchTerm
            ? {
                OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } },
                    { sku: { contains: searchTerm, mode: 'insensitive' } },
                ],
            }
            : undefined,
        include: {
            category: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return <ProductsClient initialProducts={products} />;
}

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>;
}) {
    const { search } = await searchParams;
    const searchTerm = search;

    return (
        <div className="p-6">
            <div className="card-monkey p-8 min-h-[calc(100vh-48px)]">
                <Header />
                <Suspense fallback={<div>Loading...</div>}>
                    <ProductList searchTerm={searchTerm} />
                </Suspense>
            </div>
        </div>
    );
}
