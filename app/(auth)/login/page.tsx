'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import styles from './login.module.css';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Redirect to dashboard on success
            router.push('/dashboard');
            router.refresh(); // Refresh to update server components/middleware state
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <form onSubmit={handleSubmit} noValidate>
                <h2 className={styles.loginSubtitle}>Sign In</h2>
                <p className={styles.loginTeks}>Silakan masukkan ID dan Kata Sandi Karyawan Anda.</p>

                <Input
                    label="ID Karyawan"
                    id="employee-id"
                    name="username"
                    placeholder="Masukkan ID (e.g. admin)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <Input
                    label="Kata Sandi"
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Masukkan Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <Button
                    type="submit"
                    variant="filled"
                    fullWidth
                    isLoading={isLoading}
                    className={styles.loginButton}
                >
                    Masuk
                </Button>

                {error && <p className={styles.loginErrorMessage}>{error}</p>}
            </form>
        </div>
    );
}
