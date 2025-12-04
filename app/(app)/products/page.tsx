import React, { Suspense } from 'react';
import prisma from '@/lib/prisma';
import ProductsClient from './ProductsClient';
// import Header from '@/components/ui/Header';
import Header from '@/app/components/Header';

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

async function getUserName() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return undefined;

    try {
        const secret = new TextEncoder().encode(
            process.env.JWT_SECRET || 'default-secret-key-change-me'
        );
        const { payload } = await jwtVerify(token, secret);
        return payload.name as string;
    } catch (error) {
        console.error('Failed to verify token:', error);
        return undefined;
    }
}

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
    const userName = await getUserName();

    return (
        <>
            {/* <div className="bg-white p-4 rounded-4 shadow-sm h-100 d-flex flex-column overflow-hidden"> */}
                {/* <Header userName={userName} /> */}
                <Header title="Daftar Produk"/>
                <div className="flex-grow-1" style={{ minHeight: 0 }}>
                    <Suspense fallback={<div>Loading...</div>}>
                        <ProductList searchTerm={searchTerm} />
                    </Suspense>
                </div>
            {/* </div> */}
        </>
    );
}
