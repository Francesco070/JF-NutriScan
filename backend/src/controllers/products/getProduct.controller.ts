import type { Context } from 'hono';
import { getProductByBarcode } from '../../services/products';

function isValidBarcode(barcode: string) {
	return /^\d{8,14}$/.test(barcode);
}

export async function getProduct(c: Context) {
	const barcode = (c.req.param('barcode') ?? '').trim();

	if (!isValidBarcode(barcode)) {
		return c.json({ error: 'Invalid barcode' }, 400);
	}

	const result = await getProductByBarcode(barcode);

	if (!result) {
		return c.json({ error: 'Product not found' }, 404);
	}

	return c.json(result);
}
