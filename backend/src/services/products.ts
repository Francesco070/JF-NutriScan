import { openFoodFactsClient } from '../clients/openFoodFacts';
import type { ProductDto } from '../models/product';

class ProductsService {
	public async getByBarcode(
		barcode: string,
	): Promise<{ source: 'off'; product: ProductDto } | null> {
		const fromOff = await this.getFromOpenFoodFacts(barcode);
		if (!fromOff) {
			return null;
		}

		return { source: 'off', product: fromOff };
	}

	private async getFromOpenFoodFacts(
		barcode: string,
	): Promise<ProductDto | null> {
		const data = await openFoodFactsClient.getProduct(barcode);

		if (!data || data.status !== 1 || !data.product) {
			return null;
		}

		const p = data.product;

		return {
			barcode,
			name: p.product_name ?? null,
			brand: p.brands ?? null,
			imageUrl: p.image_front_url ?? null,
			nutriments: {
				energyKcal100g: p.nutriments?.['energy-kcal_100g'] ?? null,
				proteins100g: p.nutriments?.proteins_100g ?? null,
				carbs100g: p.nutriments?.carbohydrates_100g ?? null,
				fat100g: p.nutriments?.fat_100g ?? null,
			},
		};
	}
}

export const productsService = new ProductsService();
