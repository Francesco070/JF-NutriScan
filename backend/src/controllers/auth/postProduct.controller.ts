import type { Context } from 'hono';
import { z } from 'zod';
import { Prisma } from '../../db/prisma';
import { postProductService } from '../../services/auth';

const nullableNumber = z.number().nullable();
const nullableString = z.string().nullable();

const postProductSchema = z.object({
	barcode: z.string().min(1),
	name: nullableString.optional(),
	brand: nullableString.optional(),
	imageUrl: nullableString.optional(),
	imageIngredientsUrl: nullableString.optional(),
	imageNutritionUrl: nullableString.optional(),
	categories: nullableString.optional(),
	ingredients: nullableString.optional(),
	allergens: nullableString.optional(),
	nutriscore: z
		.object({
			grade: nullableString.optional(),
			score: nullableNumber.optional(),
		})
		.optional()
		.nullable(),
	serving: z
		.object({
			size: nullableString.optional(),
			quantity: nullableNumber.optional(),
			unitBasis: nullableString.optional(),
		})
		.optional()
		.nullable(),
	nutriments: z.object({
		energyKj100g: nullableNumber.optional(),
		energyKcal100g: nullableNumber.optional(),
		energyKcalServing: nullableNumber.optional(),
		proteins100g: nullableNumber.optional(),
		carbs100g: nullableNumber.optional(),
		fat100g: nullableNumber.optional(),
		saturatedFat100g: nullableNumber.optional(),
		sugars100g: nullableNumber.optional(),
		fiber100g: nullableNumber.optional(),
		salt100g: nullableNumber.optional(),
		sodium100g: nullableNumber.optional(),
	}),
});

export async function postProductController(c: Context) {
	const body = await c.req.json().catch(() => null);
	const parsed = postProductSchema.safeParse(body);

	if (!parsed.success) {
		return c.json({ error: 'Invalid payload' }, 400);
	}

	const product = {
		barcode: parsed.data.barcode,
		name: parsed.data.name ?? null,
		brand: parsed.data.brand ?? null,
		imageUrl: parsed.data.imageUrl ?? null,
		imageIngredientsUrl: parsed.data.imageIngredientsUrl ?? null,
		imageNutritionUrl: parsed.data.imageNutritionUrl ?? null,
		categories: parsed.data.categories ?? null,
		ingredients: parsed.data.ingredients ?? null,
		allergens: parsed.data.allergens ?? null,
		nutriscore: parsed.data.nutriscore
			? {
					grade: parsed.data.nutriscore.grade ?? null,
					score: parsed.data.nutriscore.score ?? null,
				}
			: null,
		serving: parsed.data.serving
			? {
					size: parsed.data.serving.size ?? null,
					quantity: parsed.data.serving.quantity ?? null,
					unitBasis: parsed.data.serving.unitBasis ?? null,
				}
			: null,
		nutriments: {
			energyKj100g: parsed.data.nutriments.energyKj100g ?? null,
			energyKcal100g: parsed.data.nutriments.energyKcal100g ?? null,
			energyKcalServing: parsed.data.nutriments.energyKcalServing ?? null,
			proteins100g: parsed.data.nutriments.proteins100g ?? null,
			carbs100g: parsed.data.nutriments.carbs100g ?? null,
			fat100g: parsed.data.nutriments.fat100g ?? null,
			saturatedFat100g: parsed.data.nutriments.saturatedFat100g ?? null,
			sugars100g: parsed.data.nutriments.sugars100g ?? null,
			fiber100g: parsed.data.nutriments.fiber100g ?? null,
			salt100g: parsed.data.nutriments.salt100g ?? null,
			sodium100g: parsed.data.nutriments.sodium100g ?? null,
		},
	};

	try {
		const result = await postProductService(product);
		if (!result) {
			return c.json({ error: 'Product already exists' }, 409);
		}
		return c.json(result, 201);
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			return c.json({ error: 'Failed to create product' }, 400);
		}
		return c.json({ error: 'Failed to create product' }, 500);
	}
}
