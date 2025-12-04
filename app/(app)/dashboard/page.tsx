import React from 'react';
import Header from '@/components/ui/Header';

export default function DashboardPage() {
    return (
        <>
            <Header title="Dashboard"/>
            {/* <h1 className="text-2xl font-bold mb-4">Dashboard</h1> */}
            <div className="card">
                <h2 className="text-xl font-semibold mb-2">Welcome to MonkeyPOS</h2>
                <p>You have successfully logged in!</p>
            </div>
        </>
    );
}
