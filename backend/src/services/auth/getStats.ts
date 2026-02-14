import { prisma } from '../../db/prisma';

export async function getStats(userId: string) {
	let parsedUserId: bigint;
	try {
		parsedUserId = BigInt(userId);
	} catch {
		return null;
	}

	const exists = await prisma.account.findUnique({
		where: { userId: parsedUserId },
		select: { userId: true },
	});
	if (!exists) {
		return null;
	}

	const [totalScans, totalFavorites] = await Promise.all([
		prisma.scannedProduct.count({
			where: { userId: parsedUserId },
		}),
		prisma.favorite.count({
			where: { userId: parsedUserId },
		}),
	]);

	const now = new Date();
	const todayUtc = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
	);
	const startUtc = new Date(todayUtc);
	startUtc.setUTCDate(startUtc.getUTCDate() - 6);
	const endExclusiveUtc = new Date(todayUtc);
	endExclusiveUtc.setUTCDate(endExclusiveUtc.getUTCDate() + 1);

	const trendScans = await prisma.scannedProduct.findMany({
		where: {
			userId: parsedUserId,
			scanDate: {
				gte: startUtc,
				lt: endExclusiveUtc,
			},
			product: {
				nutriscoreScore: { not: null },
			},
		},
		select: {
			scanDate: true,
			product: {
				select: {
					nutriscoreScore: true,
				},
			},
		},
	});

	const trendBuckets = new Map<string, { sum: number; count: number }>();
	for (const scan of trendScans) {
		const score = scan.product.nutriscoreScore;
		if (score === null) {
			continue;
		}
		const dateKey = scan.scanDate.toISOString().slice(0, 10);
		const existing = trendBuckets.get(dateKey);
		if (existing) {
			existing.sum += score;
			existing.count += 1;
		} else {
			trendBuckets.set(dateKey, { sum: score, count: 1 });
		}
	}

	const healthScoreTrend = [] as {
		date: string;
		score: number | null;
	}[];
	for (let i = 0; i < 7; i += 1) {
		const day = new Date(startUtc);
		day.setUTCDate(startUtc.getUTCDate() + i);
		const dateKey = day.toISOString().slice(0, 10);
		const bucket = trendBuckets.get(dateKey);
		healthScoreTrend.push({
			date: dateKey,
			score: bucket ? bucket.sum / bucket.count : null,
		});
	}

	const distributionScans = await prisma.scannedProduct.findMany({
		where: {
			userId: parsedUserId,
			product: { nutriscoreGrade: { not: null } },
		},
		select: {
			product: {
				select: {
					nutriscoreGrade: true,
				},
			},
		},
	});

	const gradeCounts = new Map<string, number>();
	for (const scan of distributionScans) {
		const grade = scan.product.nutriscoreGrade;
		if (!grade) {
			continue;
		}
		gradeCounts.set(grade, (gradeCounts.get(grade) ?? 0) + 1);
	}

	const gradeOrder = ['A', 'B', 'C', 'D', 'E'];
	const totalGraded = Array.from(gradeCounts.values()).reduce(
		(sum, value) => sum + value,
		0,
	);

	const nutriScoreDistribution = gradeOrder.map((grade) => {
		const count = gradeCounts.get(grade) ?? 0;
		const percent = totalGraded
			? Number(((count / totalGraded) * 100).toFixed(1))
			: 0;
		return { grade, count, percent };
	});

	return {
		totalScans,
		totalFavorites,
		healthScoreTrend,
		nutriScoreDistribution,
	};
}
