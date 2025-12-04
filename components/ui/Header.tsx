'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

export default function Header({ userName }: { userName?: string }) {
    const pathname = usePathname();

    // get title based on the current page
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
            {/* display title */}
            <h2 className={styles.title}>{getTitle()}</h2>
            <div className={styles.userSection}>
                {/* display logged in users name */}
                <span className={styles.greeting}>
                    <i className="bi bi-person" style={{ marginRight: '8px' }}></i>
                    Hello, {userName || 'EMP1234'}
                </span>
                {/* logout button */}
                <button className={styles.logoutButton} title="Logout">
                    <i className="bi bi-box-arrow-right"></i>
                </button>
            </div>
        </header>
    );
}