import { prisma } from '../../db/prisma';

export async function getProfile(userId: string) {
	let parsedUserId: bigint;
	try {
		parsedUserId = BigInt(userId);
	} catch {
		return null;
	}

	const user = await prisma.account.findUnique({
		where: { userId: parsedUserId },
		select: {
			firstname: true,
			lastname: true,
			email: true,
		},
	});

	if (!user) {
		return null;
	}

	return {
		firstname: user.firstname,
		lastname: user.lastname,
		email: user.email,
	};
}
