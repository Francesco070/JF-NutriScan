import { Hono } from 'hono';
import {
	createProductController,
	deleteProduct,
	getProduct,
} from '../controllers/products';
import { authMiddleware } from '../middleware/auth';

export const publicProductsRoutes = new Hono();

publicProductsRoutes.get('/:barcode', getProduct);

export const protectedProductsRoutes = new Hono();

protectedProductsRoutes.use('*', authMiddleware);
protectedProductsRoutes.post('/', createProductController);
protectedProductsRoutes.delete('/:barcode', deleteProduct);
