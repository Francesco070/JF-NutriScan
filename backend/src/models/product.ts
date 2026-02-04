export type OpenFoodFactsResponse = {
	status?: number;
	product?: {
		product_name?: string;
		brands?: string;
		image_front_url?: string;
		nutriments?: {
			'energy-kcal_100g'?: number;
			proteins_100g?: number;
			carbohydrates_100g?: number;
			fat_100g?: number;
		};
	};
};

export type ProductDto = {
	barcode: string;
	name: string | null;
	brand: string | null;
	imageUrl: string | null;
	nutriments: {
		energyKcal100g: number | null;
		proteins100g: number | null;
		carbs100g: number | null;
		fat100g: number | null;
	};
};
