import { KEYS } from './keys';
import { createId, migrate, readJson, writeJson } from './storage';
import type { LocalUser, PublicUser, Session } from './types';

async function hashPassword(password: string): Promise<string> {
	const data = new TextEncoder().encode(password);
	const digest = await crypto.subtle.digest('SHA-256', data);
	return Array.from(new Uint8Array(digest))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

function toPublicUser(user: LocalUser): PublicUser {
	const { passwordHash: _passwordHash, ...publicUser } = user;
	return publicUser;
}

function getUsers(): Record<string, LocalUser> {
	migrate();
	return readJson<Record<string, LocalUser>>(KEYS.users, {});
}

function saveUsers(users: Record<string, LocalUser>): void {
	writeJson(KEYS.users, users);
}

export function getSession(): Session | null {
	migrate();
	return readJson<Session | null>(KEYS.session, null);
}

export function getCurrentUser(): PublicUser | null {
	const session = getSession();
	if (!session) return null;
	const user = getUsers()[session.userId];
	return user ? toPublicUser(user) : null;
}

export type AuthResult = { ok: true; user: PublicUser } | { ok: false; error: string };

export async function signup(input: {
	email: string;
	password: string;
	displayName?: string;
}): Promise<AuthResult> {
	migrate();
	const email = input.email.trim().toLowerCase();
	const password = input.password;
	const displayName = input.displayName?.trim() || null;

	if (!email || !password) {
		return { ok: false, error: 'Email and password are required.' };
	}
	if (password.length < 6) {
		return { ok: false, error: 'Password must be at least 6 characters.' };
	}

	const users = getUsers();
	if (Object.values(users).some((u) => u.email === email)) {
		return { ok: false, error: 'An account with this email already exists.' };
	}

	const user: LocalUser = {
		id: createId(),
		email,
		passwordHash: await hashPassword(password),
		displayName,
		createdAt: new Date().toISOString()
	};

	users[user.id] = user;
	saveUsers(users);
	writeJson<Session>(KEYS.session, { userId: user.id, createdAt: new Date().toISOString() });

	return { ok: true, user: toPublicUser(user) };
}

export async function login(input: { email: string; password: string }): Promise<AuthResult> {
	migrate();
	const email = input.email.trim().toLowerCase();
	const password = input.password;

	if (!email || !password) {
		return { ok: false, error: 'Email and password are required.' };
	}

	const users = getUsers();
	const user = Object.values(users).find((u) => u.email === email);
	if (!user) {
		return { ok: false, error: 'Invalid email or password.' };
	}

	const hash = await hashPassword(password);
	if (hash !== user.passwordHash) {
		return { ok: false, error: 'Invalid email or password.' };
	}

	writeJson<Session>(KEYS.session, { userId: user.id, createdAt: new Date().toISOString() });
	return { ok: true, user: toPublicUser(user) };
}

export function logout(): void {
	migrate();
	writeJson<Session | null>(KEYS.session, null);
}
