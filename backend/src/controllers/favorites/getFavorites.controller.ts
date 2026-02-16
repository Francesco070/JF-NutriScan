import type { Context } from 'hono';
import { getFavorites } from '../../services/favorites';

export async function getFavoritesController(c: Context) {
    const userId = c.get('userId') as string | undefined;
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
        const favorites = await getFavorites(userId);
        if (favorites === null) {
            return c.json({ error: 'Failed to load favorites' }, 500);
        }
        return c.json(favorites);
    } catch {
        return c.json({ error: 'Failed to load favorites' }, 500);
    }
}