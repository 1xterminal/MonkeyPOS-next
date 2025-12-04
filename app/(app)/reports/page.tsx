import Header from '@/components/ui/Header';

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import ReportsClient from './client';
import { Suspense } from 'react';

import "./style.scss";

interface UserData {
    id: string;
    name: string;
}

async function getUserData(): Promise<UserData | undefined> {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return undefined;

    try {
        const secret = new TextEncoder().encode(
            process.env.JWT_SECRET || 'default-secret-key-change-me'
        );
        const { payload } = await jwtVerify(token, secret);
        return {
            id: payload.sub as string,
            name: payload.name as string
        };
    } catch (error) {
        console.error('Failed to verify token:', error);
        return undefined;
    }
}

export default async function ReportsPage() {
    const userData = await getUserData();

    return <>
        <Header title="Laporan Kinerja Kasir" />
        <Suspense fallback={<div>Loading...</div>}>
            <ReportsClient userId={userData?.id} userName={userData?.name} />
        </Suspense>
    </>
}