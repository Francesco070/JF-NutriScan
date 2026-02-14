export class EmailAlreadyExistsError extends Error {
	public readonly code = 'EMAIL_EXISTS';
	constructor() {
		super('Email already registered');
	}
}
