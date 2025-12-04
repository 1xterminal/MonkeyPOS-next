'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/ui/Header';
import TableComponent from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './Suppliers.module.css';

interface Supplier {
    id: string;
    name: string;
    contact: string | null;
    email: string | null;
    address: string | null;
    _count?: {
        products: number;
    };
}

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        email: '',
        address: '',
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const response = await fetch('/api/suppliers');
            if (response.ok) {
                const data = await response.json();
                setSuppliers(data);
            }
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingSupplier
                ? `/api/suppliers/${editingSupplier.id}`
                : '/api/suppliers';

            const method = editingSupplier ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                fetchSuppliers();
                closeModal();
            } else {
                alert('Failed to save supplier');
            }
        } catch (error) {
            console.error('Error saving supplier:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this supplier?')) return;

        try {
            const response = await fetch(`/api/suppliers/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchSuppliers();
            } else {
                alert('Failed to delete supplier');
            }
        } catch (error) {
            console.error('Error deleting supplier:', error);
        }
    };

    const openModal = (supplier?: Supplier) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name,
                contact: supplier.contact || '',
                email: supplier.email || '',
                address: supplier.address || '',
            });
        } else {
            setEditingSupplier(null);
            setFormData({ name: '', contact: '', email: '', address: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSupplier(null);
        setFormData({ name: '', contact: '', email: '', address: '' });
    };

    return (
        <div className="p-3 h-100">
            <Header />
            <div className="bg-white p-4 rounded-4 shadow-sm h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <Button onClick={() => openModal()}>Tambahkan Supplier Baru</Button>
                </div>

                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <TableComponent
                        data={suppliers.map(s => ({
                            ...s,
                            productCount: s._count?.products || 0
                        }))}
                        columns={[
                            { key: 'name', label: 'Name' },
                            { key: 'contact', label: 'Contact' },
                            { key: 'email', label: 'Email' },
                            { key: 'address', label: 'Address' },
                            { key: 'productCount', label: 'Products' },
                        ]}
                        actions={[
                            {
                                label: 'Ubah',
                                className: 'btn btn-sm btn-outline-primary',
                                onClick: (supplier) => openModal(supplier as Supplier)
                            },
                            {
                                label: 'Hapus',
                                className: 'btn btn-sm btn-outline-danger',
                                onClick: (supplier) => handleDelete(supplier.id)
                            }
                        ]}
                    />
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h3>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Name</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Contact</label>
                                    <Input
                                        value={formData.contact}
                                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Address</label>
                                    <Input
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
