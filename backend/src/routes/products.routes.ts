import { Hono } from 'hono';
import { getProductByBarcode } from '../controllers/products';

export const publicProductsRoutes = new Hono();

publicProductsRoutes.get('/:barcode', getProductByBarcode);
