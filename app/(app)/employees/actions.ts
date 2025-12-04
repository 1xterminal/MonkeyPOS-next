'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// function to create a new employee
export async function createEmployee(data: { name: string; username: string; password?: string; role: 'ADMIN' | 'CASHIER' }) {
    try {
        // check for dupes
        const existingUser = await prisma.user.findUnique({
            where: { username: data.username },
        });

        if (existingUser) {
            return { success: false, error: 'Username already exists.' };
        }

        // Hash password (default to '123456' if not provided, though UI should enforce it)
        const passwordToHash = data.password || '123456';
        const hashedPassword = await bcrypt.hash(passwordToHash, 10);

        // make the new user in the db
        await prisma.user.create({
            data: {
                name: data.name,
                username: data.username,
                password: hashedPassword,
                role: data.role,
            },
        });

        // refreshes the page
        revalidatePath('/employees');
        return { success: true };
    } catch (error) {
        console.error('Failed to create employee:', error);
        return { success: false, error: 'Failed to create employee.' };
    }
}

// function to update/edit the employee
export async function updateEmployee(id: string, data: { name: string; username: string; password?: string; role: 'ADMIN' | 'CASHIER' }) {
    try {
        // check for dupes
        const existingUser = await prisma.user.findFirst({
            where: {
                AND: [
                    { id: { not: id } },
                    { username: data.username },
                ],
            },
        });

        if (existingUser) {
            return { success: false, error: 'Username already exists.' };
        }

        const updateData: any = {
            name: data.name,
            username: data.username,
            role: data.role,
        };

        // Only update password if provided and not empty
        if (data.password && data.password.trim() !== '') {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        // update it in the db
        await prisma.user.update({
            where: { id },
            data: updateData,
        });

        // refreshes the page
        revalidatePath('/employees');
        return { success: true };
    } catch (error) {
        console.error('Failed to update employee:', error);
        return { success: false, error: 'Failed to update employee.' };
    }
}

// Server Action to delete an employee
export async function deleteEmployee(id: string) {
    try {
        // Check if employee has transactions
        const user = await prisma.user.findUnique({
            where: { id },
            include: { _count: { select: { transactions: true } } }
        });

        if (!user) {
            return { success: false, error: 'Employee not found' };
        }

        if (user._count.transactions > 0) {
            return {
                success: false,
                error: `Cannot delete employee with ${user._count.transactions} transaction(s). Employees with transaction history cannot be deleted.`
            };
        }

        await prisma.user.delete({
            where: { id },
        });
        revalidatePath('/employees');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete employee:', error);
        return { success: false, error: 'Failed to delete employee.' };
    }
}
