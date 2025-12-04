'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// function to create a new member
export async function createMember(data: { name: string; email?: string; phone: string }) {
    try {
        // check for dupes
        const existingMember = await prisma.member.findFirst({
            where: {
                OR: [
                    { phone: data.phone },
                    { email: data.email },
                ],
            },
        });

        if (existingMember) {
            return { success: false, error: 'Member with this phone or email already exists.' };
        }

        // make the new member in the db
        await prisma.member.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
            },
        });

        // refreshes the page
        revalidatePath('/members');
        return { success: true };
    } catch (error) {
        console.error('Failed to create member:', error);
        return { success: false, error: 'Failed to create member.' };
    }
}

// function to update/edit the member
export async function updateMember(id: string, data: { name: string; email?: string; phone: string }) {
    try {
        // check for dupes
        const existingMember = await prisma.member.findFirst({
            where: {
                AND: [
                    { id: { not: id } },
                    {
                        OR: [
                            { phone: data.phone },
                            { email: data.email },
                        ],
                    },
                ],
            },
        });

        if (existingMember) {
            return { success: false, error: 'Member with this phone or email already exists.' };
        }

        // update it in the db
        await prisma.member.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
            },
        });

        // refreshes the page
        revalidatePath('/members');
        return { success: true };
    } catch (error) {
        console.error('Failed to update member:', error);
        return { success: false, error: 'Failed to update member.' };
    }
}

// Server Action to delete a member
export async function deleteMember(id: string) {
    try {
        await prisma.member.delete({
            where: { id },
        });
        revalidatePath('/members');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete member:', error);
        return { success: false, error: 'Failed to delete member.' };
    }
}
