import postgres from 'postgres';

const databaseUrl =
	process.env.DATABASE_URL ??
	'postgres://jf:JF-NutriScan123@localhost:5432/nutrisacan';

export const sql = postgres(databaseUrl, {
	max: 10,
});
