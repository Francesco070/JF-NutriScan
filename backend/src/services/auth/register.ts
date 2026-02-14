import bcrypt from 'bcrypt';
import { prisma, Prisma } from '../../db/prisma';
import { EmailAlreadyExistsError } from './errors';

export async function register(
	firstname: string,
	lastname: string,
	email: string,
	password: string,
) {
	const passwordHash = await bcrypt.hash(password, 10);

	try {
		const user = await prisma.account.create({
			data: {
				firstname,
				lastname,
				email,
				password: passwordHash,
			},
			select: {
				userId: true,
			},
		});

		return { userId: String(user.userId) };
	} catch (error) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === 'P2002'
		) {
			throw new EmailAlreadyExistsError();
		}
		throw error;
	}
}
