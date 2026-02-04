import type { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../utils/jwt';

// JWT auth middleware for protected routes.
export async function authMiddleware(c: Context, next: Next) {
	const authHeader = c.req.header('Authorization');
	if (!authHeader?.startsWith('Bearer ')) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	const token = authHeader.slice('Bearer '.length).trim();
	if (!token) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	try {
		const payload = jwt.verify(token, getJwtSecret()) as {
			userId?: string;
		};
		if (!payload.userId) {
			return c.json({ error: 'Unauthorized' }, 401);
		}

		c.set('userId', payload.userId);
		await next();
	} catch {
		return c.json({ error: 'Unauthorized' }, 401);
	}
}
