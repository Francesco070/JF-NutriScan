import { serve } from '@hono/node-server';
import 'dotenv/config';
import { createApp } from './app';

const port = Number(process.env.PORT ?? 3000);
const app = createApp();

console.log(`Server running on http://localhost:${port}`);

serve({
	fetch: app.fetch,
	port,
	hostname: '0.0.0.0',
});
