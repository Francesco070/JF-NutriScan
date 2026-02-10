import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { getJwtSecret } from '../utils/jwt';

export class EmailAlreadyExistsError extends Error {
	public readonly code = 'EMAIL_EXISTS';
	constructor() {
		super('Email already registered');
	}
}

class AuthService {
	public async register(
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

	public async login(email: string, password: string) {
		const user = await prisma.account.findUnique({
			where: { email },
			select: {
				userId: true,
				password: true,
			},
		});

		if (!user) {
			return null;
		}

		const isValid = await bcrypt.compare(password, user.password);
		if (!isValid) {
			return null;
		}

		const userId = String(user.userId);
		const token = jwt.sign({ userId }, getJwtSecret(), {
			expiresIn: '1h',
		});

		return { token, userId };
	}
}

export const authService = new AuthService();
