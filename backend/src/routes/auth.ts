import { Hono } from 'hono';
import { login, register } from '../controllers/auth';
import { authMiddleware } from '../middleware/auth';

export const authRoutes = new Hono();

// Public endpoints
authRoutes.post('/register', register);
authRoutes.post('/login', login);

// Protected endpoint (JWT required)
authRoutes.get('/me', authMiddleware, (c) => {
	return c.json({
		userId: c.get('userId'),
	});
});
