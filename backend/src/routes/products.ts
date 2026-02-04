import { Hono } from 'hono';
import { getProductByBarcode } from '../controllers/products';

export const productsRoutes = new Hono();

productsRoutes.get('/:barcode', getProductByBarcode);
