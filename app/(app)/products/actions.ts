'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function createProduct(formData: FormData) {
    try {
        const name = formData.get('product-name') as string;
        const sku = formData.get('product-sku') as string;
        const categoryName = formData.get('product-category') as string;
        const price = parseInt(formData.get('product-price') as string);
        const stock = parseInt(formData.get('product-stock') as string);
        const image = formData.get('product-image') as string | null;

        // Validasi input
        if (!name || !sku || !price) {
            return { success: false, error: 'Nama Produk, SKU, dan Harga tidak boleh kosong!' };
        }

        // Cek apakah SKU sudah ada
        const existingProduct = await prisma.product.findUnique({
            where: { sku },
        });

        if (existingProduct) {
            return { success: false, error: 'SKU sudah ada. Harap gunakan SKU yang unik.' };
        }

        // Cari category berdasarkan nama
        const category = await prisma.category.findFirst({
            where: { name: categoryName },
        });

        if (!category) {
            return { success: false, error: 'Kategori tidak ditemukan.' };
        }

        // Buat produk baru
        await prisma.product.create({
            data: {
                name,
                sku,
                price,
                stock,
                image,
                categoryId: category.id,
            },
        });

        revalidatePath('/products');
        return { success: true };
    } catch (error) {
        console.error('Failed to create product:', error);
        return { success: false, error: 'Gagal menambahkan produk.' };
    }
}

export async function deleteProduct(sku: string) {
    try {
        await prisma.product.delete({
            where: { sku },
        });
        revalidatePath('/products');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete product:', error);
        return { success: false, error: 'Failed to delete product' };
    }
}
