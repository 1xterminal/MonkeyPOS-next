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
    });
    const [originalSku, setOriginalSku] = useState('');
    const [productImageBase64, setProductImageBase64] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState<string>('Guest');

    useEffect(() => {
        // Ambil user info dari JWT token
        const getUserInfo = async () => {
            try {
                console.log('Fetching user info from /api/auth/me...');
                const response = await fetch('/api/auth/me');
                console.log('Response status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('User data received:', data);
                    setUserName(data.name || 'Guest');
                } else {
                    const errorData = await response.json();
                    console.error('Failed to get user info:', errorData);
                }
            } catch (error) {
                console.error('Failed to get user info:', error);
            }
        };
        getUserInfo();

        // Load product data
        const loadProduct = async () => {
            if (!sku) {
                alert('SKU produk tidak ditemukan.');
                router.push('/products');
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

        loadProduct();
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

    return (
        <>
            <div className={styles.productEditContent}>
                <div className={styles.headerActions}>
                    <div className={styles.rightBox}>
                        <div className={styles.userProfile}>
                            <span className="material-symbols-outlined">person</span>
                            <span>Hello, {userName}</span>
                        </div>
                        <button
                            className={styles.logoutBtn}
                            onClick={() => {
                                sessionStorage.removeItem('currentUser');
                                router.push('/login');
                            }}
                        >
                            <span className="material-symbols-outlined">logout</span>
                        </button>
                    </div>
                </div>
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
                            <option value="Drinks">Drinks</option>
                            <option value="Food">Food</option>
                            <option value="Snacks">Snacks</option>
                            <option value="Medicine">Medicine</option>
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
        </>
    );
}

export default function ProductEditPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductEditContent />
        </Suspense>
    );
}
