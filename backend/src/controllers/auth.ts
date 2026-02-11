import type { Context } from 'hono';
import { z } from 'zod';
import { authService, EmailAlreadyExistsError } from '../services/auth';

const registerSchema = z.object({
	firstname: z.string().min(1),
	lastname: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(6),
});

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

export async function register(c: Context) {
	const body = await c.req.json().catch(() => null);
	const parsed = registerSchema.safeParse(body);

	if (!parsed.success) {
		return c.json({ error: 'Invalid payload' }, 400);
	}

	try {
		const result = await authService.register(
			parsed.data.firstname,
			parsed.data.lastname,
			parsed.data.email,
			parsed.data.password,
		);
		return c.json({ userId: result.userId }, 201);
	} catch (error) {
		if (error instanceof EmailAlreadyExistsError) {
			return c.json({ error: 'Email already registered' }, 409);
		}
		return c.json({ error: 'Registration failed' }, 500);
	}
}

export async function login(c: Context) {
	const body = await c.req.json().catch(() => null);
	const parsed = loginSchema.safeParse(body);

	if (!parsed.success) {
		return c.json({ error: 'Invalid payload' }, 400);
	}

	const result = await authService.login(
		parsed.data.email,
		parsed.data.password,
	);

	if (!result) {
		return c.json({ error: 'Invalid email or password' }, 401);
	}

	return c.json({ token: result.token, userId: result.userId });
}

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
