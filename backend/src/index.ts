import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import 'dotenv/config';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
}));

// Health check
app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes (will be added later)
// app.route('/api/auth', authRoutes);
// app.route('/api/products', productRoutes);
// etc.

const port = Number(process.env.PORT) || 3000;

console.log(`🚀 Server running on http://localhost:${port}`);

serve({
    fetch: app.fetch,
    port,
});