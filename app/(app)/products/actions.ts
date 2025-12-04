'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// function to handle creating a product
export async function createProduct(formData: FormData) {
    try {
        const name = formData.get('product-name') as string;
        const sku = formData.get('product-sku') as string;
        const categoryName = formData.get('product-category') as string;
        const price = parseInt(formData.get('product-price') as string);
        const stock = parseInt(formData.get('product-stock') as string);
        const image = formData.get('product-image') as string | null;
        const supplierId = formData.get('product-supplier') as string | null;

        // input validation
        if (!name || !sku || !price) {
            return { success: false, error: 'Nama Produk, SKU, dan Harga tidak boleh kosong!' };
        }

        // check if sku already exists
        const existingProduct = await prisma.product.findUnique({
            where: { sku },
        });

        if (existingProduct) {
            return { success: false, error: 'SKU sudah ada. Harap gunakan SKU yang unik.' };
        }

        // find category by name
        const category = await prisma.category.findFirst({
            where: { name: categoryName },
        });

        if (!category) {
            return { success: false, error: 'Kategori tidak ditemukan.' };
        }

        // create new product in the db
        await prisma.product.create({
            data: {
                name,
                sku,
                price,
                stock,
                image,
                categoryId: category.id,
                supplierId: supplierId || null,
            },
        });

        // refreshes the page
        revalidatePath('/products');
        return { success: true };
    } catch (error) {
        console.error('Failed to create product:', error);
        return { success: false, error: 'Gagal menambahkan produk.' };
    }
}

// function to handle deleting a product
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

export async function getProduct(sku: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { sku },
            include: { category: true, supplier: true }
        });

        if (!product) {
            return { success: false, error: 'Product not found' };
        }

        return {
            success: true,
            data: {
                ...product,
                category: product.category?.name || ''
            }
        };
    } catch (error) {
        console.error('Failed to fetch product:', error);
        return { success: false, error: 'Failed to fetch product' };
    }
}

export async function updateProduct(formData: FormData) {
    try {
        const originalSku = formData.get('original-sku') as string;
        const name = formData.get('product-name') as string;
        const sku = formData.get('product-sku') as string;
        const categoryName = formData.get('product-category') as string;
        const price = parseInt(formData.get('product-price') as string);
        const stock = parseInt(formData.get('product-stock') as string);
        const image = formData.get('product-image') as string | null;
        const supplierId = formData.get('product-supplier') as string | null;

        if (!originalSku) {
            return { success: false, error: 'Original SKU missing' };
        }

        // Find category
        const category = await prisma.category.findFirst({
            where: { name: categoryName },
        });

        if (!category) {
            return { success: false, error: 'Category not found' };
        }

        // Update
        await prisma.product.update({
            where: { sku: originalSku },
            data: {
                name,
                sku,
                price,
                stock,
                image: image || undefined, // Only update if image is provided
                categoryId: category.id,
                supplierId: supplierId || null,
            },
        });

        revalidatePath('/products');
        return { success: true };
    } catch (error) {
        console.error('Failed to update product:', error);
        return { success: false, error: 'Failed to update product' };
    }
}
