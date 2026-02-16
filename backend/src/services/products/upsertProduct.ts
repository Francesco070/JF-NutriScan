import { prisma, Prisma } from '../../db/prisma';
import { openFoodFactsClient } from '../../clients/openFoodFacts';

/**
 * Ensures a product exists in the local DB.
 * If not found locally, fetches from Open Food Facts and inserts it.
 * Returns the productId or null if the product can't be found anywhere.
 */
export async function upsertProduct(barcode: string): Promise<bigint | null> {
    // Check if already in DB
    const existing = await prisma.product.findUnique({
        where: { barcode },
        select: { productId: true, nutriscoreGrade: true },
    });

    // Already in DB and has complete data — return early
    if (existing && existing.nutriscoreGrade !== null) {
        return existing.productId;
    }

    // Exists but grade is missing — fall through to fetch & update

    // Not in DB – fetch from Open Food Facts
    const data = await openFoodFactsClient.getProduct(barcode);

    if (!data || data.status !== 1 || !data.product) {
        return null;
    }

    const p = data.product;

    try {
        const productData = {
            barcode,
            name: p.product_name ?? p.product_name_en ?? null,
            brand: p.brands ?? null,
            imageUrl: p.image_front_url ?? null,
            imageIngredientsUrl: p.image_ingredients_url ?? null,
            imageNutritionUrl: p.image_nutrition_url ?? null,
            ingredients: p.ingredients_text ?? null,
            allergens: p.allergens ?? null,
            nutriscoreGrade: p.nutriscore_grade ?? null,
            nutriscoreScore: typeof p.nutriscore_score === 'number' ? p.nutriscore_score : (p.nutriscore_score ? Number(p.nutriscore_score) : null),
            servingSize: p.serving_size ?? null,
            servingQuantity: p.serving_quantity ?? null,
            servingUnitBasis: p.nutrition_data_per ?? null,
            energyKj100g: p.nutriments?.energy_100g ?? null,
            energyKcal100g: p.nutriments?.['energy-kcal_100g'] ?? null,
            energyKcalServing: p.nutriments?.['energy-kcal_serving'] ?? null,
            proteins100g: p.nutriments?.proteins_100g ?? null,
            carbs100g: p.nutriments?.carbohydrates_100g ?? null,
            fat100g: p.nutriments?.fat_100g ?? null,
            saturatedFat100g: p.nutriments?.['saturated-fat_100g'] ?? null,
            sugars100g: p.nutriments?.sugars_100g ?? null,
            fiber100g: p.nutriments?.fiber_100g ?? null,
            salt100g: p.nutriments?.salt_100g ?? null,
            sodium100g: p.nutriments?.sodium_100g ?? null,
        };

        if (existing) {
            // Product exists but has null grade — update it
            const updated = await prisma.product.update({
                where: { barcode },
                data: productData,
                select: { productId: true },
            });
            return updated.productId;
        }

        const created = await prisma.product.create({
            data: productData,
            select: { productId: true },
        });
        return created.productId;
    } catch (error) {
        // Race condition: another request inserted it first
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            const race = await prisma.product.findUnique({
                where: { barcode },
                select: { productId: true },
            });
            return race?.productId ?? null;
        }
        throw error;
    }
}