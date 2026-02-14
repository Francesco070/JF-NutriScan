import { prisma, Prisma } from '../../db/prisma';
import type { ProductDto } from '../../models/product';

export async function createProduct(product: ProductDto) {
	try {
		const created = await prisma.product.create({
			data: {
				barcode: product.barcode,
				name: product.name ?? null,
				brand: product.brand ?? null,
				imageUrl: product.imageUrl ?? null,
				imageIngredientsUrl: product.imageIngredientsUrl ?? null,
				imageNutritionUrl: product.imageNutritionUrl ?? null,
				ingredients: product.ingredients ?? null,
				allergens: product.allergens ?? null,
				nutriscoreGrade: product.nutriscore?.grade ?? null,
				nutriscoreScore: product.nutriscore?.score ?? null,
				servingSize: product.serving?.size ?? null,
				servingQuantity: product.serving?.quantity ?? null,
				servingUnitBasis: product.serving?.unitBasis ?? null,
				energyKj100g: product.nutriments.energyKj100g ?? null,
				energyKcal100g: product.nutriments.energyKcal100g ?? null,
				energyKcalServing: product.nutriments.energyKcalServing ?? null,
				proteins100g: product.nutriments.proteins100g ?? null,
				carbs100g: product.nutriments.carbs100g ?? null,
				fat100g: product.nutriments.fat100g ?? null,
				saturatedFat100g: product.nutriments.saturatedFat100g ?? null,
				sugars100g: product.nutriments.sugars100g ?? null,
				fiber100g: product.nutriments.fiber100g ?? null,
				salt100g: product.nutriments.salt100g ?? null,
				sodium100g: product.nutriments.sodium100g ?? null,
			},
			select: {
				productId: true,
				barcode: true,
			},
		});

		return {
			productId: String(created.productId),
			barcode: created.barcode,
		};
	} catch (error) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === 'P2002'
		) {
			return null;
		}
		throw error;
	}
}
