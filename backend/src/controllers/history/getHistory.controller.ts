import type { Context } from 'hono';
import { getHistory } from '../../services/history';

export async function getHistoryController(c: Context) {
    const userId = c.get('userId') as string | undefined;
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
        const history = await getHistory(userId);
        if (history === null) {
            return c.json({ error: 'Failed to load history' }, 500);
        }
        return c.json(history);
    } catch {
        return c.json({ error: 'Failed to load history' }, 500);
    }
}