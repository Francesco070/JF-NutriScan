import type { Context } from 'hono';
import { checkFavorite } from '../../services/favorites';

function isValidBarcode(barcode: string) {
    return /^\d{8,14}$/.test(barcode);
}

export async function checkFavoriteController(c: Context) {
    const userId = c.get('userId') as string | undefined;
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const barcode = (c.req.param('barcode') ?? '').trim();
    if (!isValidBarcode(barcode)) {
        return c.json({ error: 'Invalid barcode' }, 400);
    }

    try {
        const isFavorite = await checkFavorite(userId, barcode);
        return c.json({ isFavorite });
    } catch {
        return c.json({ error: 'Failed to check favorite' }, 500);
    }
}