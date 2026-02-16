import { prisma } from '../../db/prisma';
import { upsertProduct } from '../products';

export async function addToHistory(userId: string, barcode: string): Promise<boolean> {
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

    await prisma.scannedProduct.create({
        data: {
            userId: parsedUserId,
            productId,
        },
    });

    return true;
}