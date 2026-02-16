import type { Context } from 'hono';
import { removeFavorite } from '../../services/favorites';

function isValidBarcode(barcode: string) {
    return /^\d{8,14}$/.test(barcode);
}

export async function removeFavoriteController(c: Context) {
    const userId = c.get('userId') as string | undefined;
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const barcode = (c.req.param('barcode') ?? '').trim();
    if (!isValidBarcode(barcode)) {
        return c.json({ error: 'Invalid barcode' }, 400);
    }

    try {
        const success = await removeFavorite(userId, barcode);
        if (!success) {
            return c.json({ error: 'Favorite not found' }, 404);
        }
        return c.json({ message: 'Removed from favorites' });
    } catch {
        return c.json({ error: 'Failed to remove favorite' }, 500);
    }
}