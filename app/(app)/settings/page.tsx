'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/app/components/ui/Header';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';

export default function SettingsPage() {
    const [user, setUser] = useState<{ name: string; role: string; username: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (isLoading) {
        return <div className="p-4">Loading...</div>;
    }

    return (
        <div className="p-3 h-100">
            <div className="bg-white p-4 rounded-4 shadow-sm h-100 d-flex flex-column">
                <Header title="Settings" />

                <div className="mt-4" style={{ maxWidth: '600px' }}>
                    <h5 className="mb-4">Profile Information</h5>

                    <div className="mb-3">
                        <label className="form-label text-muted">Name</label>
                        <Input value={user?.name || ''} disabled className="bg-light" />
                    </div>

                    <div className="mb-3">
                        <label className="form-label text-muted">Username</label>
                        <Input value={user?.username || ''} disabled className="bg-light" />
                    </div>

                    <div className="mb-3">
                        <label className="form-label text-muted">Role</label>
                        <Input value={user?.role || ''} disabled className="bg-light" />
                    </div>

                    <hr className="my-5" />

                    <h5 className="mb-4">Application Settings</h5>
                    <p className="text-muted">More settings coming soon...</p>

                    <div className="d-flex gap-2">
                        <Button variant="default" disabled>Change Password</Button>
                        <Button variant="default" disabled>Notification Preferences</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
