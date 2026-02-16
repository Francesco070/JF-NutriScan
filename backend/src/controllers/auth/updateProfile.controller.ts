import type { Context } from 'hono';
import { z } from 'zod';
import { authService, EmailAlreadyExistsError } from '../../services/auth';

const updateProfileSchema = z.object({
    firstname: z.string().min(1).optional(),
    lastname: z.string().min(1).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
});

export async function updateProfileController(c: Context) {
    const userId = c.get('userId') as string | undefined;
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json().catch(() => null);
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
        return c.json({ error: 'Invalid payload' }, 400);
    }

    try {
        const result = await authService.updateProfile(userId, parsed.data);

        if (!result) {
            return c.json({ error: 'User not found' }, 404);
        }

        return c.json({ message: 'Profile updated successfully' });
    } catch (error) {
        if (error instanceof EmailAlreadyExistsError) {
            return c.json({ error: 'Email already in use' }, 409);
        }
        return c.json({ error: 'Update failed' }, 500);
    }
}