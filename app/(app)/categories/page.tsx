'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/ui/Header';
import TableComponent from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from '../suppliers/Suppliers.module.css';

interface Category {
    id: string;
    name: string;
    _count?: {
        products: number;
    };
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingCategory
                ? `/api/categories/${editingCategory.id}`
                : '/api/categories';

            const method = editingCategory ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                fetchCategories();
                closeModal();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to save category');
            }
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            const response = await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchCategories();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name });
        } else {
            setEditingCategory(null);
            setFormData({ name: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '' });
    };

    return (
        <div className="p-3 h-100">
            <Header />
            <div className="bg-white p-4 rounded-4 shadow-sm h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <Button onClick={() => openModal()}>Tambahkan Kategori Baru</Button>
                </div>

                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <TableComponent
                        data={categories.map(c => ({
                            ...c,
                            productCount: c._count?.products || 0
                        }))}
                        columns={[
                            { key: 'name', label: 'Nama Kategori' },
                            { key: 'productCount', label: 'Jumlah Produk' },
                        ]}
                        actions={[
                            {
                                label: 'Ubah',
                                className: 'btn btn-sm btn-outline-primary',
                                onClick: (category) => openModal(category as Category)
                            },
                            {
                                label: 'Hapus',
                                className: 'btn btn-sm btn-outline-danger',
                                onClick: (category) => handleDelete(category.id)
                            }
                        ]}
                    />
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h3>{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Nama Kategori</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ name: e.target.value })}
                                        required
                                        placeholder="Contoh: Drinks, Food, dll."
                                    />
                                </div>
                                <div className="d-flex gap-2 justify-content-end">
                                    <Button type="button" variant="default" onClick={closeModal}>Cancel</Button>
                                    <Button type="submit">Save</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
