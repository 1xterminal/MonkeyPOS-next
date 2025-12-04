'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/ui/Header';
import TableComponent, { Column, Action } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { deleteMember } from './actions';
import AddMemberDialog from '@/components/members/AddMemberDialog';
import EditMemberDialog from '@/components/members/EditMemberDialog';

interface Member {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    points: number;
}

function MembersPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // state
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [userName, setUserName] = useState<string | undefined>(undefined);

    // state dialog/popup
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

    // fetch username
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUser = sessionStorage.getItem('currentUser');
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    setUserName(parsed.name);
                } catch (e) {
                    console.error("Failed to parse user from session storage", e);
                }
            }
        }
    }, []);

    // fetch members data
    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/members');
            if (!response.ok) throw new Error('Failed to fetch members');
            const data = await response.json();
            setMembers(data);
        } catch (error) {
            console.error('Error fetching members:', error);
            alert('Gagal memuat data member.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    // filter members data
    const filteredMembers = members.filter(member => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        return (
            member.name.toLowerCase().includes(lowerTerm) ||
            member.phone.toLowerCase().includes(lowerTerm) ||
            (member.email && member.email.toLowerCase().includes(lowerTerm))
        );
    });

    // handle search 
    const handleSearch = () => {
        const params = new URLSearchParams(searchParams);
        if (searchTerm) {
            params.set('search', searchTerm);
        } else {
            params.delete('search');
        }
        router.push(`/members?${params.toString()}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // handle delete member
    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus member ${name}?`)) {
            setIsLoading(true);
            const result = await deleteMember(id);
            if (result.success) {
                await fetchMembers();
            } else {
                alert('Gagal menghapus member');
                setIsLoading(false);
            }
        }
    };

    // handle edit member
    const handleEdit = (member: Member) => {
        setMemberToEdit(member);
        setIsEditDialogOpen(true);
    };

    // table config
    const columns: Column[] = [
        { key: 'name', label: 'Nama Member' },
        { key: 'phone', label: 'Nomor Telepon' },
        { key: 'email', label: 'Email' },
    ];

    const actions: Action<Member>[] = [
        {
            label: 'Ubah',
            icon: <i className="bi bi-pencil-square"></i>,
            onClick: (row) => handleEdit(row),
        },
        {
            label: 'Hapus',
            icon: <i className="bi bi-trash"></i>,
            onClick: (row) => handleDelete(row.id, row.name),
        },
    ];

    return (
        <div className="p-3 h-100">
            <div className="bg-white p-4 rounded-4 shadow-sm h-100 d-flex flex-column overflow-hidden">
                <Header userName={userName} />

                <div className="d-flex flex-column flex-grow-1 gap-3" style={{ minHeight: 0 }}>
                    <div className="d-flex justify-content-between align-items-center flex-shrink-0 w-100">
                        <div className="d-flex gap-2" style={{ width: '60%' }}>
                            <div style={{ flex: 1 }}>
                                <Input
                                    placeholder="Cari Member"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-100"
                                />
                            </div>
                            <div style={{ width: 'auto' }}>
                                <Button onClick={handleSearch} className="d-flex justify-content-center">Search</Button>
                            </div>
                        </div>
                        <div style={{ width: 'auto' }}>
                            <Button variant="primary" onClick={() => setIsAddDialogOpen(true)} className="text-nowrap d-flex justify-content-center">
                                Tambahkan Member Baru
                            </Button>
                        </div>
                    </div>

                    <div className="flex-grow-1" style={{ minHeight: 0, overflow: 'hidden' }}>
                        <TableComponent
                            columns={columns}
                            data={filteredMembers}
                            actions={actions}
                            isLoading={isLoading}
                        />
                    </div>
                </div>

                <AddMemberDialog
                    isOpen={isAddDialogOpen}
                    onClose={() => setIsAddDialogOpen(false)}
                    onSuccess={() => {
                        fetchMembers();
                    }}
                />

                <EditMemberDialog
                    isOpen={isEditDialogOpen}
                    member={memberToEdit}
                    onClose={() => {
                        setIsEditDialogOpen(false);
                        setMemberToEdit(null);
                    }}
                    onSuccess={() => {
                        fetchMembers();
                    }}
                />
            </div>
        </div>
    );
}

export default function MembersPage() {
    return (
        <Suspense fallback={<div>Loading Members...</div>}>
            <MembersPageContent />
        </Suspense>
    );
}
