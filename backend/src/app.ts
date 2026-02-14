import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import {
	protectedAuthRoutes,
	publicAuthRoutes,
	protectedProductsRoutes,
	publicProductsRoutes,
} from './routes';

export function createApp() {
	const app = new Hono();

	app.use('*', logger());
	app.use(
		'*',
		cors({
			origin: '*',
		}),
	);

	app.get('/health', (c) => {
		return c.json({ status: 'ok', timestamp: new Date().toISOString() });
	});

	app.route('/api/auth', publicAuthRoutes);
	app.route('/api/auth', protectedAuthRoutes);
	app.route('/api/products', publicProductsRoutes);
	app.route('/api/products', protectedProductsRoutes);

	return app;
}
