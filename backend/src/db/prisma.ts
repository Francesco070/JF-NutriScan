// @ts-ignore
import { PrismaClient } from '@prisma/client'

// Erstelle PrismaClient-Instanz
const prisma = new PrismaClient({
	log: ['query', 'info', 'warn', 'error'],
})

// Export
export default prisma

// Optional: Graceful Shutdown
process.on('beforeExit', async () => {
	await prisma.$disconnect()
})