import { serve } from '@hono/node-server';
import 'dotenv/config';
import { createApp } from './app';

const port = Number(process.env.PORT ?? 3000);

async function start() {
	const app = createApp();

	serve({
		fetch: app.fetch,
		port,
		hostname: '0.0.0.0',
	});
}

start().catch((error) => {
	console.error('Failed to start server:', error);
	process.exit(1);
});
