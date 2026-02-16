import { prisma, Prisma } from '../../db/prisma';
import { upsertProduct } from '../products';

export async function addFavorite(userId: string, barcode: string): Promise<boolean> {
    let parsedUserId: bigint;
    try {
        parsedUserId = BigInt(userId);
    } catch {
        return false;
    }

    // Ensure product exists in DB (auto-fetch from OFF if needed)
    const productId = await upsertProduct(barcode);
    if (!productId) {
        return false;
    }

    try {
        await prisma.favorite.create({
            data: {
                userId: parsedUserId,
                productId,
            },
        });
        return true;
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            // Already favorited – treat as success
            return true;
        }
        throw error;
    }
}