'use client';

import { useState, FormEvent, ChangeEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './ProductEdit.module.css';
import { getProduct, updateProduct } from '../actions';

function ProductEditContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sku = searchParams.get('sku');

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        price: '',
        stock: '',
        supplier: '',
    });
    const [suppliers, setSuppliers] = useState<Array<{ id: string, name: string }>>([]);
    const [categories, setCategories] = useState<Array<{ id: string, name: string }>>([]);
    const [originalSku, setOriginalSku] = useState('');
    const [productImageBase64, setProductImageBase64] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load product data
        const loadProduct = async () => {
            if (!sku) {
                // alert('SKU produk tidak ditemukan.');
                // router.push('/products');
                setIsLoading(false);
                return;
            }

            try {
                const result = await getProduct(sku);

                if (result.success && result.data) {
                    setFormData({
                        name: result.data.name,
                        sku: result.data.sku,
                        category: result.data.category,
                        price: result.data.price.toString(),
                        stock: result.data.stock.toString(),
                        supplier: (result.data as any).supplier?.id || '',
                    });
                    setOriginalSku(result.data.sku);
                    if (result.data.image) {
                        setProductImageBase64(result.data.image);
                    }
                } else {
                    alert(result.error || 'Produk tidak ditemukan.');
                    router.push('/products');
                }
            } catch (error) {
                console.error('Error loading product:', error);
                alert('Terjadi kesalahan saat memuat data produk.');
                router.push('/products');
            } finally {
                setIsLoading(false);
            }
        };

        // Fetch suppliers
        const getSuppliers = async () => {
            try {
                const response = await fetch('/api/suppliers');
                if (response.ok) {
                    const data = await response.json();
                    setSuppliers(data);
                }
            } catch (error) {
                console.error('Failed to fetch suppliers:', error);
            }
        };

        // Fetch categories
        const getCategories = async () => {
            try {
                const response = await fetch('/api/categories');
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };

        loadProduct();
        getSuppliers();
        getCategories();
    }, [sku, router]);

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProductImageBase64(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData(e.currentTarget);

            // Tambahkan original SKU untuk validasi
            formDataToSend.set('original-sku', originalSku);

            if (productImageBase64) {
                formDataToSend.set('product-image', productImageBase64);
            }

            const result = await updateProduct(formDataToSend);

            if (result.success) {
                alert('Produk berhasil diupdate!');
                router.push('/products');
            } else {
                alert(result.error || 'Gagal mengupdate produk.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Terjadi kesalahan saat mengupdate produk.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/products');
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!sku) {
        return <div>Error: SKU tidak ditemukan di URL.</div>;
    }

    return (
        <div className={styles.productEditContent}>
            <h1>Ubah Produk</h1>
            <form id="product-edit-form" className={styles.productEditForm} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="product-name">Nama Produk</label>
                    <input
                        type="text"
                        id="product-name"
                        name="product-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="product-sku">SKU</label>
                    <input
                        type="text"
                        id="product-sku"
                        name="product-sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="product-category">Kategori</label>
                    <select
                        id="product-category"
                        name="product-category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                    >
                        <option value="">Pilih Kategori</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.name}>{category.name}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="product-supplier">Supplier (Opsional)</label>
                    <select
                        id="product-supplier"
                        name="product-supplier"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    >
                        <option value="">-- Pilih Supplier --</option>
                        {suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="product-price">Harga</label>
                    <input
                        type="number"
                        id="product-price"
                        name="product-price"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="product-stock">Stok</label>
                    <input
                        type="number"
                        id="product-stock"
                        name="product-stock"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="product-image">Gambar Produk</label>
                    <input
                        type="file"
                        id="product-image"
                        name="product-image"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {productImageBase64 && (
                        <div className={styles.imagePreview}>
                            <img src={productImageBase64} alt="Preview" />
                        </div>
                    )}
                </div>
                <div className={styles.formActions}>
                    <button type="button" className={styles.btnCancel} onClick={handleCancel} disabled={isSubmitting}>
                        Batal
                    </button>
                    <button type="submit" className={`${styles.filled} ${styles.btnSubmit}`} disabled={isSubmitting}>
                        {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function ProductEditPage() {
    return (
        <Suspense fallback={<div>Loading Page...</div>}>
            <ProductEditContent />
        </Suspense>
    );
}


