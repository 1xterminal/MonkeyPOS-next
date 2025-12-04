'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import TableComponent, { Column, Action } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { deleteEmployee } from './actions';
import AddEmployeeDialog from '@/components/employees/AddEmployeeDialog';
import EditEmployeeDialog from '@/components/employees/EditEmployeeDialog';

interface Employee {
    id: string;
    name: string;
    username: string;
    role: 'ADMIN' | 'CASHIER';
    createdAt: string;
}

function EmployeesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // state
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

    // state dialog/popup
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

    // fetch employees data
    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/employees');
            if (!response.ok) throw new Error('Failed to fetch employees');
            const data = await response.json();
            setEmployees(data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            alert('Gagal memuat data karyawan.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // filter employees data
    const filteredEmployees = employees.filter(employee => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        return (
            employee.name.toLowerCase().includes(lowerTerm) ||
            employee.username.toLowerCase().includes(lowerTerm)
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
        router.push(`/employees?${params.toString()}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // handle delete employee
    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus karyawan ${name}?`)) {
            setIsLoading(true);
            const result = await deleteEmployee(id);
            if (result.success) {
                await fetchEmployees();
            } else {
                alert('Gagal menghapus karyawan');
                setIsLoading(false);
            }
        }
    };

    // handle edit employee
    const handleEdit = (employee: Employee) => {
        setEmployeeToEdit(employee);
        setIsEditDialogOpen(true);
    };

    // table config
    const columns: Column[] = [
        { key: 'name', label: 'Nama Karyawan' },
        { key: 'username', label: 'Username' },
    ];

    const actions: Action<Employee>[] = [
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
                <Header title="Manajemen Karyawan" />

                <div className="d-flex flex-column flex-grow-1 gap-3" style={{ minHeight: 0 }}>
                    <div className="d-flex justify-content-between align-items-center flex-shrink-0 w-100">
                        <div className="d-flex gap-2" style={{ width: '60%' }}>
                            <div style={{ flex: 1 }}>
                                <Input
                                    placeholder="Cari Karyawan"
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
                                Tambahkan Karyawan Baru
                            </Button>
                        </div>
                    </div>

                    <div className="flex-grow-1" style={{ minHeight: 0, overflow: 'hidden' }}>
                        <TableComponent
                            columns={columns}
                            data={filteredEmployees}
                            actions={actions}
                            isLoading={isLoading}
                        />
                    </div>
                </div>

                <AddEmployeeDialog
                    isOpen={isAddDialogOpen}
                    onClose={() => setIsAddDialogOpen(false)}
                    onSuccess={() => {
                        fetchEmployees();
                    }}
                />

                <EditEmployeeDialog
                    isOpen={isEditDialogOpen}
                    employee={employeeToEdit}
                    onClose={() => {
                        setIsEditDialogOpen(false);
                        setEmployeeToEdit(null);
                    }}
                    onSuccess={() => {
                        fetchEmployees();
                    }}
                />
            </div>
        </div>
    );
}

export default function EmployeesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EmployeesContent />
        </Suspense>
    );
}
