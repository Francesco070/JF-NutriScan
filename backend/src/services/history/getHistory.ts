import { prisma } from '../../db/prisma';

export async function getHistory(userId: string) {
    let parsedUserId: bigint;
    try {
        parsedUserId = BigInt(userId);
    } catch {
        return null;
    }

    const scans = await prisma.scannedProduct.findMany({
        where: { userId: parsedUserId },
        include: {
            product: true,
        },
        orderBy: {
            scanDate: 'desc',
        },
        take: 50,
    });

    // Deduplicate by barcode, keeping the most recent scan
    const seen = new Set<string>();
    const unique = scans.filter((scan: { product: { barcode: string; }; }) => {
        if (seen.has(scan.product.barcode)) return false;
        seen.add(scan.product.barcode);
        return true;
    });

    return unique.map((scan: { product: { barcode: any; name: any; brand: any; imageUrl: any; imageIngredientsUrl: any; imageNutritionUrl: any; ingredients: any; allergens: any; nutriscoreGrade: any; nutriscoreScore: any; servingSize: any; servingQuantity: any; servingUnitBasis: any; energyKj100g: any; energyKcal100g: any; energyKcalServing: any; proteins100g: any; carbs100g: any; fat100g: any; saturatedFat100g: any; sugars100g: any; fiber100g: any; salt100g: any; sodium100g: any; }; scanDate: { toISOString: () => any; }; }) => ({
        barcode: scan.product.barcode,
        name: scan.product.name,
        brand: scan.product.brand,
        imageUrl: scan.product.imageUrl,
        imageIngredientsUrl: scan.product.imageIngredientsUrl,
        imageNutritionUrl: scan.product.imageNutritionUrl,
        ingredients: scan.product.ingredients,
        allergens: scan.product.allergens,
        categories: null,
        scanDate: scan.scanDate.toISOString(),
        nutriscore: {
            grade: scan.product.nutriscoreGrade,
            score: scan.product.nutriscoreScore,
        },
        serving: {
            size: scan.product.servingSize,
            quantity: scan.product.servingQuantity,
            unitBasis: scan.product.servingUnitBasis,
        },
        nutriments: {
            energyKj100g: scan.product.energyKj100g,
            energyKcal100g: scan.product.energyKcal100g,
            energyKcalServing: scan.product.energyKcalServing,
            proteins100g: scan.product.proteins100g,
            carbs100g: scan.product.carbs100g,
            fat100g: scan.product.fat100g,
            saturatedFat100g: scan.product.saturatedFat100g,
            sugars100g: scan.product.sugars100g,
            fiber100g: scan.product.fiber100g,
            salt100g: scan.product.salt100g,
            sodium100g: scan.product.sodium100g,
        },
    }));
}