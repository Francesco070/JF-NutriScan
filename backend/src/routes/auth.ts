import { Hono } from 'hono';
import { getProfile, login, register } from '../controllers/auth';
import { authMiddleware } from '../middleware/auth';

export const authRoutes = new Hono();

// Public endpoints
authRoutes.post('/register', register);
authRoutes.post('/login', login);

// Protected endpoint (JWT required)
authRoutes.get('/me', authMiddleware, getProfile);
