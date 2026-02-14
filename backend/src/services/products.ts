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
			name: p.product_name ?? p.product_name_en ?? null,
			brand: p.brands ?? null,
			imageUrl: p.image_front_url ?? null,
			imageIngredientsUrl: p.image_ingredients_url ?? null,
			imageNutritionUrl: p.image_nutrition_url ?? null,
			categories: p.categories ?? null,
			ingredients: p.ingredients_text ?? null,
			allergens: p.allergens ?? null,
			nutriscore: {
				grade: p.nutriscore_grade ?? null,
				score: p.nutriscore_score ?? null,
			},
			serving: {
				size: p.serving_size ?? null,
				quantity: p.serving_quantity ?? null,
				unitBasis: p.nutrition_data_per ?? null,
			},
			nutriments: {
				energyKj100g: p.nutriments?.energy_100g ?? null,
				energyKcal100g: p.nutriments?.['energy-kcal_100g'] ?? null,
				energyKcalServing:
					p.nutriments?.['energy-kcal_serving'] ?? null,
				proteins100g: p.nutriments?.proteins_100g ?? null,
				carbs100g: p.nutriments?.carbohydrates_100g ?? null,
				fat100g: p.nutriments?.fat_100g ?? null,
				saturatedFat100g: p.nutriments?.['saturated-fat_100g'] ?? null,
				sugars100g: p.nutriments?.sugars_100g ?? null,
				fiber100g: p.nutriments?.fiber_100g ?? null,
				salt100g: p.nutriments?.salt_100g ?? null,
				sodium100g: p.nutriments?.sodium_100g ?? null,
			},
		};
	}
}

export const productsService = new ProductsService();
