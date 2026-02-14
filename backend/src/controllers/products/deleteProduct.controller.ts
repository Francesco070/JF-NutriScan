import type { Context } from 'hono';
import { Prisma } from '../../db/prisma';
import { deleteProductByBarcode } from '../../services/products';

function isValidBarcode(barcode: string) {
	return /^\d{8,14}$/.test(barcode);
}

export async function deleteProduct(c: Context) {
	const barcode = (c.req.param('barcode') ?? '').trim();

	if (!isValidBarcode(barcode)) {
		return c.json({ error: 'Invalid barcode' }, 400);
	}

	try {
		const result = await deleteProductByBarcode(barcode);
		if (!result) {
			return c.json({ error: 'Product not found' }, 404);
		}
		return c.json(result);
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			return c.json({ error: 'Failed to delete product' }, 400);
		}
		return c.json({ error: 'Failed to delete product' }, 500);
	}
}
