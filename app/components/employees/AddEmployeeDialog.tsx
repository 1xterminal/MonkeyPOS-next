'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createEmployee } from '@/(app)/employees/actions';

interface AddEmployeeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddEmployeeDialog({ isOpen, onClose, onSuccess }: AddEmployeeDialogProps) {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'ADMIN' | 'CASHIER'>('CASHIER');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await createEmployee({ name, username, password, role });

        setIsLoading(false);

        if (result.success) {
            setName('');
            setUsername('');
            setPassword('');
            setRole('CASHIER');
            onSuccess();
            onClose();
        } else {
            setError(result.error || 'Failed to add employee');
        }
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="bg-white p-4 rounded-4 shadow-lg" style={{ width: '400px', maxWidth: '90%' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="h4 m-0">Tambah Karyawan Baru</h2>
                    <button onClick={onClose} className="btn-close" aria-label="Close"></button>
                </div>

                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                    <Input
                        label="Nama Karyawan"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Nama Lengkap"
                    />
                    <Input
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="Username Login"
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Password"
                    />

                    {error && <div className="text-danger small">{error}</div>}

                    <div className="d-flex justify-content-end gap-2 mt-2">
                        <Button type="button" onClick={onClose} className="flat">Batal</Button>
                        <Button type="submit" variant="primary" disabled={isLoading}>
                            {isLoading ? 'Menambahkan...' : 'Tambah'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
