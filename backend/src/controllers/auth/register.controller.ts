import type { Context } from 'hono';
import { z } from 'zod';
import { authService, EmailAlreadyExistsError } from '../../services/auth';

const registerSchema = z.object({
	firstname: z.string().min(1),
	lastname: z.string().min(1),
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
