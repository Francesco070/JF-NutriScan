import type { OpenFoodFactsResponse } from '../models/product';

const baseUrl =
	process.env.OPEN_FOOD_FACTS_URL ?? 'https://world.openfoodfacts.net';
const userAgent =
	process.env.OPEN_FOOD_FACTS_USER_AGENT ?? 'JF-NutriScan/1.0 (development)';

class OpenFoodFactsClient {
	public async getProduct(
		barcode: string,
	): Promise<OpenFoodFactsResponse | null> {
		const url = `${baseUrl}/api/v2/product/${encodeURIComponent(barcode)}.json`;

		const res = await fetch(url, {
			headers: {
				'User-Agent': userAgent,
			},
		});

		if (!res.ok) {
			return null;
		}

		return (await res.json()) as OpenFoodFactsResponse;
	}
}

export const openFoodFactsClient = new OpenFoodFactsClient();
