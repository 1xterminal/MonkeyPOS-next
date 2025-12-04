'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createMember } from '@/(app)/members/actions';

interface AddMemberDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// Component for the "Add Member" popup dialog
export default function AddMemberDialog({ isOpen, onClose, onSuccess }: AddMemberDialogProps) {
    // State for form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Don't render anything if the dialog is closed
    if (!isOpen) return null;

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Call server action to create member
        const result = await createMember({ name, email, phone });

        setIsLoading(false);

        if (result.success) {
            // Reset form and close dialog on success
            setName('');
            setEmail('');
            setPhone('');
            onSuccess();
            onClose();
        } else {
            // Show error message on failure
            setError(result.error || 'Failed to add member');
        }
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="bg-white p-4 rounded-4 shadow-lg" style={{ width: '400px', maxWidth: '90%' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="h4 m-0">Tambah Member Baru</h2>
                    <button onClick={onClose} className="btn-close" aria-label="Close"></button>
                </div>

                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                    <Input
                        label="Nama Member"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Nama Member"
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                    />
                    <Input
                        label="No. Telepon"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="No. Telepon"
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
