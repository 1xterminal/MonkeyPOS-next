import React from 'react';
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from '@/components/ui/Header';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="container">
            <main className="content">
                {children}
            </main>
        </div>
    );
}
