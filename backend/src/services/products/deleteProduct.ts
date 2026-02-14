import { prisma, Prisma } from '../../db/prisma';

export async function deleteProductByBarcode(barcode: string) {
	try {
		const deleted = await prisma.product.delete({
			where: { barcode },
			select: {
				productId: true,
				barcode: true,
			},
		});

		return {
			productId: String(deleted.productId),
			barcode: deleted.barcode,
		};
	} catch (error) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === 'P2025'
		) {
			return null;
		}
		throw error;
	}
}
