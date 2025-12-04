import React from 'react';
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from '@/components/ui/Header';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="w-100 h-100 d-flex flex-column">


            <main className="content h-100 d-flex flex-column">

                {children}
            </main>
        </div>
    );
}
