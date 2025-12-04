import React from 'react';
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from '@/components/ui/Header';
import Sidebar from '../components/Sidebar';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="pos-app">
            <Sidebar />
            <div className="content">
                {children}
            </div>
        </main>
    );
}
