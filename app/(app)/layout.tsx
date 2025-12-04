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
            {/* Sidebar will go here */}
            <aside style={{ width: '250px', background: '#fff', padding: '20px', borderRadius: '12px', marginTop: '20px', marginBottom: '20px' }}>
                <nav>
                    <ul style={{ listStyle: 'none' }}>
                        <li style={{ marginBottom: '10px' }}><strong>MonkeyPOS</strong></li>
                        <li>Dashboard</li>
                        <li>POS Terminal</li>
                        <li>Products</li>
                    </ul>
                </nav>
            </aside>

            <main className="content">

                {children}
            </main>
        </div>
    );
}
