import React from 'react';
import "bootstrap-icons/font/bootstrap-icons.css";

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
                {/* Header will go here */}
                <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Good Morning!</h2>
                    <button className="button destructive">Logout</button>
                </header>
                {children}
            </main>
        </div>
    );
}
