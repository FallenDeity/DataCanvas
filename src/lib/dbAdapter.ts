import * as crypto from "crypto";
import { Account } from "next-auth";
import { Adapter, AdapterAccount, AdapterSession, AdapterUser, VerificationToken } from "next-auth/adapters";
import { ProviderType } from "next-auth/providers";

import Database from "./db";
import { AccountModel, SessionModel, UserModel, VerificationTokenModel } from "./models";

export default function postgresAdapter(): Adapter {
	const db = Database.getInstance();
	const createUser = async (user: Omit<AdapterUser, "id">): Promise<AdapterUser> => {
		const name = user.name ?? user.email;
		const image = user.image ?? `https://api.multiavatar.com/${name}`;
		const result = await db.queryOne<UserModel>(
			`INSERT INTO users (name, email, image) VALUES ($1, $2, $3) RETURNING *`,
			[name, user.email, image]
		);
		const db_user = "_" + crypto.createHash("md5").update(result.id).digest("hex");
		const db_name = "_" + crypto.createHash("md5").update(result.email).digest("hex");
		const db_password = "_" + crypto.randomBytes(16).toString("hex");
		await db.query(
			`CREATE USER ${db_user} WITH PASSWORD '${db_password}' NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT LOGIN;`
		);
		await db.query(`GRANT ${db_user} TO ${process.env.DATABASE_USER ?? "postgres"};`);
		await db.query(`CREATE DATABASE ${db_name} OWNER ${db_user};`);
		await db.query(`GRANT ALL PRIVILEGES ON DATABASE ${db_name} TO ${db_user};`);
		await db.query(
			`INSERT INTO databases (user_id, db_name, db_user, db_password) VALUES ($1, $2, $3, $4) RETURNING *`,
			[result.id, db_name, db_user, db_password]
		);
		const size = await db.query<{ pg_database_size: number }>(`SELECT pg_database_size($1) AS pg_database_size;`, [
			db_name,
		]);
		await db.query(
			`
				INSERT INTO database_logs (database_id, database_size)
				VALUES ($1, $2)
				ON CONFLICT (database_id, created_at)
				DO UPDATE SET database_size = $2;
			`,
			[db_name, size.rows[0].pg_database_size]
		);
		return {
			...result,
			id: result.id.toString(),
			emailVerified: result.email_verified,
			email: result.email,
		};
	};

	const getUser = async (id: string): Promise<AdapterUser | null> => {
		try {
			const { rows } = await db.query<UserModel>(`SELECT * FROM users WHERE id = $1`, [id]);
			return rows[0]
				? {
						...rows[0],
						id: rows[0].id.toString(),
						emailVerified: rows[0].email_verified,
						email: rows[0].email,
				  }
				: null;
		} catch (e) {
			console.log(e);
			return null;
		}
	};

	const getUserByEmail = async (email: string): Promise<AdapterUser | null> => {
		const { rows } = await db.query<UserModel>(`SELECT * FROM users WHERE email = $1`, [email]);
		return rows[0]
			? {
					...rows[0],
					id: rows[0].id.toString(),
					emailVerified: rows[0].email_verified,
					email: rows[0].email,
			  }
			: null;
	};

	const getUserByAccount = async ({
		provider,
		providerAccountId,
	}: {
		provider: string;
		providerAccountId: string;
	}): Promise<AdapterUser | null> => {
		const { rows } = await db.query<UserModel>(
			`SELECT u.* FROM users u join accounts a on u.id = a.user_id WHERE a.provider_id = $1 AND a.provider_account_id = $2`,
			[provider, providerAccountId]
		);
		return rows[0]
			? {
					...rows[0],
					id: rows[0].id.toString(),
					emailVerified: rows[0].email_verified,
					email: rows[0].email,
			  }
			: null;
	};

	const updateUser = async (user: Partial<AdapterUser> & Pick<AdapterUser, "id">): Promise<AdapterUser> => {
		const { rows } = await db.query<UserModel>(`SELECT * FROM users WHERE id = $1`, [user.id]);
		const oldUser = rows[0];
		const newUser = {
			...oldUser,
			...user,
		};
		const { rows: updatedRows } = await db.query<UserModel>(
			`UPDATE users SET name = $1, email = $2, email_verified = $3, image = $4 WHERE id = $5 RETURNING *`,
			[newUser.name, newUser.email, newUser.email_verified, newUser.image, newUser.id]
		);
		return {
			...updatedRows[0],
			id: updatedRows[0].id.toString(),
			emailVerified: updatedRows[0].email_verified,
			email: updatedRows[0].email,
		};
	};

	const deleteUser = async (userId: string): Promise<void> => {
		await db.query(`DELETE FROM users WHERE id = $1`, [userId]);
		await db.query(`DELETE FROM accounts WHERE user_id = $1`, [userId]);
		await db.query(`DELETE FROM auth_sessions WHERE user_id = $1`, [userId]);
		return;
	};

	const createSession = async ({
		sessionToken,
		userId,
		expires,
	}: {
		sessionToken: string;
		userId: string | undefined;
		expires: Date;
	}): Promise<AdapterSession> => {
		if (userId === undefined) throw new Error("userId is undefined");
		const { rows } = await db.query<SessionModel>(
			`INSERT INTO auth_sessions (user_id, expires, session_token) VALUES ($1, $2, $3) RETURNING user_id, expires, session_token`,
			[userId, expires, sessionToken]
		);
		return {
			...rows[0],
			expires: rows[0].expires,
			userId: rows[0].user_id.toString(),
			sessionToken: rows[0].session_token,
		};
	};

	const getSessionAndUser = async (
		sessionToken: string | undefined
	): Promise<{ session: AdapterSession; user: AdapterUser } | null> => {
		if (sessionToken === undefined) return null;
		const { rows } = await db.query<SessionModel>(`SELECT * FROM auth_sessions WHERE session_token = $1`, [
			sessionToken,
		]);
		if (rows.length === 0) return null;
		const { rows: userRows } = await db.query<UserModel>(`SELECT * FROM users WHERE id = $1`, [rows[0].user_id]);
		if (userRows.length === 0) return null;
		return rows[0]
			? {
					session: {
						...rows[0],
						expires: rows[0].expires,
						userId: rows[0].user_id.toString(),
						sessionToken: rows[0].session_token,
					},
					user: {
						...userRows[0],
						id: userRows[0].id.toString(),
						emailVerified: userRows[0].email_verified,
						email: userRows[0].email,
						name: userRows[0].name,
						image: userRows[0].image,
					},
			  }
			: null;
	};

	const updateSession = async (
		session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
	): Promise<AdapterSession | null | undefined> => {
		const currentSession = await db.query<SessionModel>(`SELECT * FROM auth_sessions WHERE session_token = $1`, [
			session.sessionToken,
		]);
		if (currentSession.rowCount === 0) return null;
		const newSession = {
			...currentSession.rows[0],
			...session,
		};
		const { rows } = await db.query<SessionModel>(
			`UPDATE auth_sessions SET expires = $1 WHERE session_token = $2 RETURNING user_id, expires, session_token`,
			[newSession.expires, newSession.sessionToken]
		);
		return {
			...rows[0],
			expires: rows[0].expires,
			userId: rows[0].user_id.toString(),
			sessionToken: rows[0].session_token,
		};
	};

	const deleteSession = async (sessionToken: string): Promise<void> => {
		await db.query(`DELETE FROM auth_sessions WHERE session_token = $1`, [sessionToken]);
		return;
	};

	const linkAccount = async (account: AdapterAccount): Promise<AdapterAccount | null | undefined> => {
		const { rows } = await db.query<AccountModel>(
			`INSERT INTO accounts (user_id, provider_id, provider_type, provider_account_id, refresh_token, access_token, expires_at, token_type, scope, id_token) VALUES ($1, $2, $3, $4, $5, $6, to_timestamp($7), $8, $9, $10) RETURNING *`,
			[
				account.userId,
				account.provider,
				account.type,
				account.providerAccountId,
				account.refresh_token,
				account.access_token,
				account.expires_at,
				account.token_type,
				account.scope,
				account.id_token,
			]
		);
		return {
			...rows[0],
			userId: rows[0].user_id.toString(),
			providerAccountId: rows[0].provider_account_id,
			provider: rows[0].provider_id,
			type: rows[0].provider_type as ProviderType,
			refresh_token: rows[0].refresh_token,
			access_token: rows[0].access_token,
			expires_at: rows[0].expires_at !== null ? rows[0].expires_at.getTime() : undefined,
			token_type: rows[0].token_type,
			scope: rows[0].scope,
			id_token: rows[0].id_token,
		};
	};

	const unlinkAccount = async ({
		providerAccountId,
		provider,
	}: {
		providerAccountId: Account["providerAccountId"];
		provider: Account["provider"];
	}): Promise<void> => {
		await db.query(`DELETE FROM accounts WHERE provider_account_id = $1 AND provider_id = $2`, [
			providerAccountId,
			provider,
		]);
		return;
	};

	const createVerificationToken = async ({
		identifier,
		expires,
		token,
	}: VerificationToken): Promise<VerificationToken | null | undefined> => {
		try {
			const { rows } = await db.query<VerificationTokenModel>(
				`INSERT INTO verification_tokens (identifier, token, expires) VALUES ($1, $2, $3) RETURNING identifier, token, expires`,
				[identifier, token, expires]
			);
			return {
				identifier: rows[0].identifier,
				token: rows[0].token,
				expires: rows[0].expires,
			};
		} catch (e) {
			return null;
		}
	};

	const useVerificationToken = async ({
		identifier,
		token,
	}: {
		identifier: string;
		token: string;
	}): Promise<VerificationToken | null> => {
		const result = await db.query<VerificationTokenModel>(
			`DELETE FROM verification_tokens WHERE identifier = $1 AND token = $2 RETURNING identifier, token, expires`,
			[identifier, token]
		);
		return result.rows[0] ? { ...result.rows[0], expires: result.rows[0].expires } : null;
	};

	return {
		createUser,
		getUser,
		updateUser,
		getUserByEmail,
		getUserByAccount,
		deleteUser,
		getSessionAndUser,
		createSession,
		updateSession,
		deleteSession,
		createVerificationToken,
		useVerificationToken,
		linkAccount,
		unlinkAccount,
	};
}
