import { getProfile } from './getProfile';
import { getStats } from './getStats';
import { login } from './login';
import { register } from './register';

export { EmailAlreadyExistsError } from './errors';

class AuthService {
	public async register(
		firstname: string,
		lastname: string,
		email: string,
		password: string,
	) {
		return register(firstname, lastname, email, password);
	}

	public async login(email: string, password: string) {
		return login(email, password);
	}

	public async getProfile(userId: string) {
		return getProfile(userId);
	}

	public async getStats(userId: string) {
		return getStats(userId);
	}
}

export const authService = new AuthService();
