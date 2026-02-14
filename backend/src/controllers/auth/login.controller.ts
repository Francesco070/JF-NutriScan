import type { Context } from 'hono';
import { z } from 'zod';
import { authService } from '../../services/auth';

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

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
