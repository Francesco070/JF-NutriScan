import type { Context } from 'hono';
import { authService } from '../../services/auth';

export async function getProfile(c: Context) {
	const userId = c.get('userId') as string | undefined;
	if (!userId) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	const profile = await authService.getProfile(userId);
	if (!profile) {
		return c.json({ error: 'User not found' }, 404);
	}

	return c.json(profile);
}
