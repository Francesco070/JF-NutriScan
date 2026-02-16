import { prisma } from '../../db/prisma';

export async function checkFavorite(userId: string, barcode: string): Promise<boolean> {
    let parsedUserId: bigint;
    try {
        parsedUserId = BigInt(userId);
    } catch {
        return false;
    }

    const product = await prisma.product.findUnique({
        where: { barcode },
        select: { productId: true },
    });

    // Product not in DB yet = definitely not a favorite
    if (!product) {
        return false;
    }

    const favorite = await prisma.favorite.findUnique({
        where: {
            userId_productId: {
                userId: parsedUserId,
                productId: product.productId,
            },
        },
    });

    return favorite !== null;
}