import { Hono } from 'hono';
import {
    getProfile,
    getStats,
    login,
    register,
    updateProfileController,
} from '../controllers/auth';
import { authMiddleware } from '../middleware/auth';

export const publicAuthRoutes = new Hono();

publicAuthRoutes.post('/register', register);
publicAuthRoutes.post('/login', login);

export const protectedAuthRoutes = new Hono();

protectedAuthRoutes.use('*', authMiddleware);
protectedAuthRoutes.get('/me', getProfile);
protectedAuthRoutes.get('/stats', getStats);
protectedAuthRoutes.put('/update', updateProfileController);