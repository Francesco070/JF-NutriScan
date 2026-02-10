import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sql } from '../db/connection';
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
			const rows = await sql<
				{ user_id: number }[]
			>`INSERT INTO account (firstname, lastname, email, password)
			  VALUES (${firstname}, ${lastname}, ${email}, ${passwordHash})
			  RETURNING user_id`;
			const userId = rows[0]?.user_id;
			return { userId: userId ? String(userId) : null };
		} catch (error) {
			const err = error as { code?: string };
			if (err.code === '23505') {
				throw new EmailAlreadyExistsError();
			}
			throw error;
		}
	}

	public async login(email: string, password: string) {
		const rows = await sql<
			{ user_id: number; password: string }[]
		>`SELECT user_id, password FROM account WHERE email = ${email} LIMIT 1`;

		const user = rows[0];
		if (!user) {
			return null;
		}

		const isValid = await bcrypt.compare(password, user.password);
		if (!isValid) {
			return null;
		}

		const userId = String(user.user_id);
		const token = jwt.sign({ userId }, getJwtSecret(), {
			expiresIn: '1h',
		});

		return { token, userId };
	}
}

export const authService = new AuthService();
