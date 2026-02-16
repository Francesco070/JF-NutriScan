import type { Context } from 'hono';
import { addFavorite } from '../../services/favorites';

function isValidBarcode(barcode: string) {
    return /^\d{8,14}$/.test(barcode);
}

export async function addFavoriteController(c: Context) {
    const userId = c.get('userId') as string | undefined;
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const barcode = (c.req.param('barcode') ?? '').trim();
    if (!isValidBarcode(barcode)) {
        return c.json({ error: 'Invalid barcode' }, 400);
    }

    try {
        const success = await addFavorite(userId, barcode);
        if (!success) {
            return c.json({ error: 'Product not found' }, 404);
        }
        return c.json({ message: 'Added to favorites' });
    } catch {
        return c.json({ error: 'Failed to add favorite' }, 500);
    }
}