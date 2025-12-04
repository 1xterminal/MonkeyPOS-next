'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
    const pathname = usePathname();

    const getTitle = () => {
        if (pathname === '/dashboard') return 'Dashboard';
        if (pathname === '/pos') return 'Terminal POS';
        if (pathname.startsWith('/products')) return 'Daftar Produk';
        if (pathname === '/members') return 'Daftar Member';
        if (pathname === '/reports') return 'Laporan';
        return 'MonkeyPOS';
    };

    return (
        <header className={styles.header}>
            <h2 className={styles.title}>{getTitle()}</h2>
            <div className={styles.userSection}>
                <span className={styles.greeting}>
                    <i className="bi bi-person" style={{ marginRight: '8px' }}></i>
                    Hello, EMP1234
                </span>
                <button className={styles.logoutButton} title="Logout">
                    <i className="bi bi-box-arrow-right"></i>
                </button>
            </div>
        </header>
    );
}