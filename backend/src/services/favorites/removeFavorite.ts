import { prisma, Prisma } from '../../db/prisma';

export async function removeFavorite(userId: string, barcode: string): Promise<boolean> {
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

    if (!product) {
        return false;
    }

    try {
        await prisma.favorite.delete({
            where: {
                userId_productId: {
                    userId: parsedUserId,
                    productId: product.productId,
                },
            },
        });
        return true;
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
        ) {
            return false;
        }
        throw error;
    }
}