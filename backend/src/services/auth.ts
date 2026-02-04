import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { sql } from '../db/connection';
import { getJwtSecret } from '../utils/jwt';

export class EmailAlreadyExistsError extends Error {
	public readonly code = 'EMAIL_EXISTS';
	constructor() {
		super('Email already registered');
	}
}

class AuthService {
	public async register(email: string, password: string) {
		const passwordHash = await bcrypt.hash(password, 10);
		const userId = randomUUID();

		try {
			await sql`
				INSERT INTO users (id, email, password_hash)
				VALUES (${userId}, ${email}, ${passwordHash})
			`;
		} catch (error) {
			const err = error as { code?: string };
			if (err.code === '23505') {
				throw new EmailAlreadyExistsError();
			}
			throw error;
		}

		return { userId };
	}

	public async login(email: string, password: string) {
		const rows = await sql<
			{ id: string; password_hash: string }[]
		>`SELECT id, password_hash FROM users WHERE email = ${email} LIMIT 1`;

		const user = rows[0];
		if (!user) {
			return null;
		}

		const isValid = await bcrypt.compare(password, user.password_hash);
		if (!isValid) {
			return null;
		}

		const token = jwt.sign({ userId: user.id }, getJwtSecret(), {
			expiresIn: '1h',
		});

		return { token, userId: user.id };
	}
}

export const authService = new AuthService();
