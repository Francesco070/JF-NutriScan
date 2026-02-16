import { Hono } from 'hono';
import {
	createProductController,
	deleteProduct,
	getProduct,
} from '../controllers/products';
import {
	addFavoriteController,
	removeFavoriteController,
	getFavoritesController,
	checkFavoriteController,
} from '../controllers/favorites';
import {
	addToHistoryController,
	getHistoryController,
} from '../controllers/history';
import { authMiddleware } from '../middleware/auth';

export const publicProductsRoutes = new Hono();

publicProductsRoutes.get('/:barcode', getProduct);

export const protectedProductsRoutes = new Hono();

protectedProductsRoutes.use('*', authMiddleware);

// Favorites (specific routes BEFORE dynamic /:barcode)
protectedProductsRoutes.get('/favorites', getFavoritesController);
protectedProductsRoutes.get('/favorites/:barcode/check', checkFavoriteController);
protectedProductsRoutes.post('/favorites/:barcode', addFavoriteController);
protectedProductsRoutes.delete('/favorites/:barcode', removeFavoriteController);

// History (specific routes BEFORE dynamic /:barcode)
protectedProductsRoutes.get('/history', getHistoryController);
protectedProductsRoutes.post('/history/:barcode', addToHistoryController);

// Product CRUD (dynamic routes LAST)
protectedProductsRoutes.post('/', createProductController);
protectedProductsRoutes.delete('/:barcode', deleteProduct);