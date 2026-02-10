import { sql } from './connection';

// Ensure required tables exist.
export async function ensureUsersTable() {
	await sql`
		CREATE TABLE IF NOT EXISTS account (
			user_id BIGSERIAL PRIMARY KEY,
			firstname VARCHAR(100) NOT NULL,
			lastname VARCHAR(100) NOT NULL,
			email VARCHAR(255) UNIQUE NOT NULL,
			password TEXT NOT NULL,
			profileImg BYTEA
		)
	`;
}
