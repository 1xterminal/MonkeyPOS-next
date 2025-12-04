'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { updateMember } from '@/(app)/members/actions';

interface Member {
    id: string;
    name: string;
    email: string | null;
    phone: string;
}

interface EditMemberDialogProps {
    isOpen: boolean;
    member: Member | null;
    onClose: () => void;
    onSuccess: () => void;
}

// Component for the "Edit Member" popup dialog
export default function EditMemberDialog({ isOpen, member, onClose, onSuccess }: EditMemberDialogProps) {
    // State for form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Pre-fill the form when the member to edit changes
    useEffect(() => {
        if (member) {
            setName(member.name);
            setEmail(member.email || '');
            setPhone(member.phone);
        }
    }, [member]);

    // Don't render if closed or no member selected
    if (!isOpen || !member) return null;

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Call server action to update member
        const result = await updateMember(member.id, { name, email, phone });

        setIsLoading(false);

        if (result.success) {
            // Close dialog on success
            onSuccess();
            onClose();
        } else {
            // Show error message on failure
            setError(result.error || 'Failed to update member');
        }
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="bg-white p-4 rounded-4 shadow-lg" style={{ width: '400px', maxWidth: '90%' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="h4 m-0">Edit Member</h2>
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
                            {isLoading ? 'Simpan Perubahan' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
