import type { Context } from 'hono';
import { authService } from '../../services/auth';

export async function getStats(c: Context) {
	const userId = c.get('userId') as string | undefined;
	if (!userId) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	try {
		const stats = await authService.getStats(userId);
		if (!stats) {
			return c.json({ error: 'User not found' }, 404);
		}
		return c.json(stats);
	} catch {
		return c.json({ error: 'Failed to load stats' }, 500);
	}
}
