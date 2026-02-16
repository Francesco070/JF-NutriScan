import { prisma } from '../../db/prisma';

export async function getFavorites(userId: string) {
    let parsedUserId: bigint;
    try {
        parsedUserId = BigInt(userId);
    } catch {
        return null;
    }

    const favorites = await prisma.favorite.findMany({
        where: { userId: parsedUserId },
        include: {
            product: true,
        },
        orderBy: {
            productId: 'desc',
        },
    });

    return favorites.map((fav: { product: { barcode: any; name: any; brand: any; imageUrl: any; imageIngredientsUrl: any; imageNutritionUrl: any; ingredients: any; allergens: any; nutriscoreGrade: any; nutriscoreScore: any; servingSize: any; servingQuantity: any; servingUnitBasis: any; energyKj100g: any; energyKcal100g: any; energyKcalServing: any; proteins100g: any; carbs100g: any; fat100g: any; saturatedFat100g: any; sugars100g: any; fiber100g: any; salt100g: any; sodium100g: any; }; }) => ({
        barcode: fav.product.barcode,
        name: fav.product.name,
        brand: fav.product.brand,
        imageUrl: fav.product.imageUrl,
        imageIngredientsUrl: fav.product.imageIngredientsUrl,
        imageNutritionUrl: fav.product.imageNutritionUrl,
        ingredients: fav.product.ingredients,
        allergens: fav.product.allergens,
        categories: null,
        nutriscore: {
            grade: fav.product.nutriscoreGrade,
            score: fav.product.nutriscoreScore,
        },
        serving: {
            size: fav.product.servingSize,
            quantity: fav.product.servingQuantity,
            unitBasis: fav.product.servingUnitBasis,
        },
        nutriments: {
            energyKj100g: fav.product.energyKj100g,
            energyKcal100g: fav.product.energyKcal100g,
            energyKcalServing: fav.product.energyKcalServing,
            proteins100g: fav.product.proteins100g,
            carbs100g: fav.product.carbs100g,
            fat100g: fav.product.fat100g,
            saturatedFat100g: fav.product.saturatedFat100g,
            sugars100g: fav.product.sugars100g,
            fiber100g: fav.product.fiber100g,
            salt100g: fav.product.salt100g,
            sodium100g: fav.product.sodium100g,
        },
    }));
}