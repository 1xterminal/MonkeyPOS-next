'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
    const pathname = usePathname();

    // get title based on the current page
    const getTitle = () => {
        if (pathname === '/dashboard') return 'Dashboard';
        if (pathname === '/pos') return 'Terminal POS';
        if (pathname.startsWith('/products')) return 'Daftar Produk';
        if (pathname.startsWith('/suppliers')) return 'Daftar Supplier';
        if (pathname === '/members') return 'Daftar Member';
        if (pathname === '/reports') return 'Laporan';
        return 'MonkeyPOS';
    };

    return (
        <header className={styles.header}>
            <h2 className={styles.title}>{getTitle()}</h2>
        </header>
    );
}