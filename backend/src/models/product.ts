export type OpenFoodFactsResponse = {
	status?: number;
	product?: {
		product_name?: string;
		product_name_en?: string;
		brands?: string;
		image_front_url?: string;
		image_ingredients_url?: string;
		image_nutrition_url?: string;
		categories?: string;
		ingredients_text?: string;
		allergens?: string;
		nutriscore_grade?: string;
		nutriscore_score?: number;
		serving_size?: string;
		serving_quantity?: number;
		nutrition_data_per?: string;
		nutriments?: {
			energy_100g?: number;
			'energy-kcal_100g'?: number;
			'energy-kcal_serving'?: number;
			proteins_100g?: number;
			carbohydrates_100g?: number;
			fat_100g?: number;
			'saturated-fat_100g'?: number;
			sugars_100g?: number;
			fiber_100g?: number;
			salt_100g?: number;
			sodium_100g?: number;
		};
	};
};

export type ProductDto = {
	barcode: string;
	name: string | null;
	brand: string | null;
	imageUrl: string | null;
	imageIngredientsUrl?: string | null;
	imageNutritionUrl?: string | null;
	categories?: string | null;
	ingredients?: string | null;
	allergens?: string | null;
	nutriscore?: {
		grade: string | null;
		score: number | null;
	} | null;
	serving?: {
		size: string | null;
		quantity: number | null;
		unitBasis: string | null;
	} | null;
	nutriments: {
		energyKj100g: number | null;
		energyKcal100g: number | null;
		energyKcalServing: number | null;
		proteins100g: number | null;
		carbs100g: number | null;
		fat100g: number | null;
		saturatedFat100g: number | null;
		sugars100g: number | null;
		fiber100g: number | null;
		salt100g: number | null;
		sodium100g: number | null;
	};
};
