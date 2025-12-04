'use client';

import React from 'react';
import "bootstrap-icons/font/bootstrap-icons.css";
import Sidebar from '../components/Sidebar';

import "./style.scss";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <main className="app">
            <Sidebar />
            <div className="content">
                {children}
            </div>
        </main>
    );
}
