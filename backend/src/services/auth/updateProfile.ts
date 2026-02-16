import bcrypt from 'bcrypt';
import { prisma, Prisma } from '../../db/prisma';
import { EmailAlreadyExistsError } from './errors';

interface UpdateProfileData {
    firstname?: string;
    lastname?: string;
    email?: string;
    password?: string;
}

export async function updateProfile(userId: string, data: UpdateProfileData) {
    let parsedUserId: bigint;
    try {
        parsedUserId = BigInt(userId);
    } catch {
        return null;
    }

    const updateData: Record<string, unknown> = {};

    if (data.firstname !== undefined) updateData.firstname = data.firstname;
    if (data.lastname !== undefined) updateData.lastname = data.lastname;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.password !== undefined && data.password.length > 0) {
        updateData.password = await bcrypt.hash(data.password, 10);
    }

    if (Object.keys(updateData).length === 0) {
        return { updated: false };
    }

    try {
        await prisma.account.update({
            where: { userId: parsedUserId },
            data: updateData,
        });
        return { updated: true };
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            throw new EmailAlreadyExistsError();
        }
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
        ) {
            return null;
        }
        throw error;
    }
}