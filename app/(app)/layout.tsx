'use client';

import React from 'react';
import "bootstrap-icons/font/bootstrap-icons.css";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <div className="container">
            <main className="content" style={{ width: '100%' }}>
                {/* Header */}
                <header style={{
                    marginTop: '20px',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px 20px',
                    background: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                    <h2 style={{ margin: 0, fontSize: '20px' }}>Good Day! 👋</h2>
                    <button
                        className="button destructive"
                        style={{
                            padding: '8px 16px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Logout
                    </button>
                </header>
                {children}
            </main>
        </div>
    );
}
