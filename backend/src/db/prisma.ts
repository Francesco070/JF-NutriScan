import { PrismaClient, Prisma } from '@prisma/client';

// Erstelle PrismaClient-Instanz
const prisma = new PrismaClient({
	log: ['query', 'info', 'warn', 'error'],
});

// Named exports (wichtig!)
export { prisma, Prisma };

// Optional: Graceful Shutdown
process.on('beforeExit', async () => {
	await prisma.$disconnect();
});