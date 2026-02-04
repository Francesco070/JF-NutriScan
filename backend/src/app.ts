import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { productsRoutes } from './routes/products';

export function createApp() {
	const app = new Hono();

	app.use('*', logger());
	app.use(
		'*',
		cors({
			origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [
				'http://localhost:5173',
			],
			credentials: true,
		}),
	);

	app.get('/health', (c) => {
		return c.json({ status: 'ok', timestamp: new Date().toISOString() });
	});

	app.route('/api/products', productsRoutes);

	return app;
}
