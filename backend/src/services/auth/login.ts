import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../db/prisma';
import { getJwtSecret } from '../../utils/jwt';

export async function login(email: string, password: string) {
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
