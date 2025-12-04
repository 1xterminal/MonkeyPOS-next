'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ProductAdd.module.css';
import { createProduct } from '../actions';
import Header from '@/components/Header';

interface Product {
    name: string;
    sku: string;
    category: string;
    price: number;
    stock: number;
    image: string | null;
}

export default function ProductAddPage() {
    const router = useRouter();
    const [productImageBase64, setProductImageBase64] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userName, setUserName] = useState<string>('Guest');
    const [suppliers, setSuppliers] = useState<Array<{ id: string, name: string }>>([]);
    const [categories, setCategories] = useState<Array<{ id: string, name: string }>>([]);

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
        getSuppliers();

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
        getCategories();
    }, []);

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
            const formData = new FormData(e.currentTarget);

            if (productImageBase64) {
                formData.set('product-image', productImageBase64);
            }

            const result = await createProduct(formData);

            if (result.success) {
                alert('Produk berhasil ditambahkan!');
                router.push('/products');
            } else {
                alert(result.error || 'Gagal menambahkan produk.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Terjadi kesalahan saat menambahkan produk.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/products');
    };

    return (
        <>
            <div className={styles.productAddContent}>
                {/* <div className={styles.headerActions}>
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
                </div> */}
                {/* <h1>Tambahkan Produk Baru</h1> */}
                <Header title="Tambahkan Produk Baru" />
                <form id="product-add-form" className={styles.productAddForm} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="product-name">Nama Produk</label>
                        <input type="text" id="product-name" name="product-name" required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="product-sku">SKU</label>
                        <input type="text" id="product-sku" name="product-sku" required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="product-category">Kategori</label>
                        <select id="product-category" name="product-category" required>
                            <option value="">Pilih Kategori</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.name}>{category.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="product-supplier">Supplier (Opsional)</label>
                        <select id="product-supplier" name="product-supplier">
                            <option value="">-- Pilih Supplier --</option>
                            {suppliers.map((supplier) => (
                                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="product-price">Harga</label>
                        <input type="number" id="product-price" name="product-price" required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="product-stock">Stok</label>
                        <input type="number" id="product-stock" name="product-stock" required />
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
