/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import * as fs from "fs";
import * as pg from "pg";

import {
	DatabaseLogModel,
	PostgresColumn,
	PostgresRelationship,
	PostgresTable,
	TableModel,
	UserDataLogModel,
	UserLogModel,
	UserSessionModel,
} from "./models";

export default class Database {
	private static host: string = process.env.NEXT_PUBLIC_DATABASE_HOST ?? "localhost";
	private static port: number = Number(process.env.NEXT_PUBLIC_DATABASE_PORT) || 5432;
	private static clientPool: Record<string, pg.Client> = {};
	private static instance: Database | undefined;
	private pool: pg.Pool;

	private constructor() {
		this.pool = new pg.Pool({
			connectionString: process.env.DATABASE_URL,
			ssl: !process.env.DATABASE_URL?.includes("localhost"),
		});
	}

	public static getInstance(): Database {
		if (!Database.instance) {
			Database.instance = new Database();
		}
		return Database.instance;
	}

	public static async getClient(session: UserSessionModel): Promise<pg.Client> {
		const url = `postgres://${session.db.db_user}:${session.db.db_password}@${this.host}:${this.port}/${session.db.db_name}`;
		if (session.user.id in Database.clientPool) {
			return Database.clientPool[session.user.id];
		}
		const client = new pg.Client({
			connectionString: url,
			ssl: true,
		});
		await client.connect();
		Database.clientPool[session.user.id] = client;
		return client;
	}

	public async query<T extends pg.QueryResultRow>(
		queryText: string,
		values?: unknown[]
	): Promise<pg.QueryResult<T> & { error?: string }> {
		// const start = Date.now();
		try {
			// const duration = Date.now() - start;
			// console.log("executed query", { queryText, duration, rows: result.rowCount });
			return await this.pool.query<T>(queryText, values);
		} catch (error) {
			console.error("error running query", { queryText, values, error });
			return { rows: [], rowCount: 0, command: "", oid: 0, fields: [], error: (error as Error).message };
		}
	}

	public async queryOne<T extends pg.QueryResultRow>(queryText: string, values?: unknown[]): Promise<T> {
		const result = await this.query<T>(queryText, values);
		return result.rows[0];
	}

	public async executeSql(filePath: string): Promise<void> {
		const sql = fs.readFileSync(filePath, "utf8");
		await this.query(sql);
	}

	public async createTables(): Promise<void> {
		await this.executeSql("src/bin/tables.sql");
	}

	public async clear(): Promise<void> {
		const sql = `SELECT * FROM databases;`;
		const result = await this.query<{ db_name: string; db_user: string }>(sql);
		const databases = result.rows;
		for (const database of databases) {
			await this.query(`DROP DATABASE IF EXISTS ${database.db_name};`);
			await this.query(`DROP ROLE IF EXISTS ${database.db_user};`);
		}
		await this.dropTables();
	}

	public async dropTables(): Promise<void> {
		const sql = `
			DROP TABLE IF EXISTS auth_sessions CASCADE;
			DROP TABLE IF EXISTS verification_tokens CASCADE;
			DROP TABLE IF EXISTS accounts CASCADE;
			DROP TABLE IF EXISTS databases CASCADE;
			DROP TABLE IF EXISTS users CASCADE;
			DROP TABLE IF EXISTS user_logs CASCADE;
			DROP TABLE IF EXISTS database_logs CASCADE;
		`;
		await this.query(sql);
	}

	public async clearAllTables(): Promise<void> {
		const sql = `
			DELETE FROM auth_sessions;
			DELETE FROM verification_tokens;
			DELETE FROM accounts;
			DELETE FROM databases;
			DELETE FROM users;
			DELETE FROM user_logs;
			DELETE FROM database_logs;
		`;
		await this.query(sql);
	}
}

export async function userQuery<T extends pg.QueryResultRow>(
	session: UserSessionModel,
	date: Date,
	queryText: string,
	values?: unknown[]
): Promise<pg.QueryResult<T> & { error?: string }> {
	// const url = process.env.DATABASE_URL;
	try {
		const start = Date.now();
		const client = await Database.getClient(session);
		const result = await client.query<T>(queryText, values);
		const duration = Date.now() - start;
		// console.log("executed query", { queryText, duration, rows: result.rowCount });
		const pool = Database.getInstance();
		await pool.query(
			`
			INSERT INTO user_logs (user_id, command_type, command, duration, created_at)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (user_id, command, created_at)
			DO UPDATE SET count = user_logs.count + 1, duration = (user_logs.duration + $4) / 2
		`,
			[session.user.id, result.command, queryText, duration, new Date(date)]
		);
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (result?.command !== "SELECT") {
			const size = await pool.query<{ pg_database_size: number }>(
				`SELECT pg_database_size($1) AS pg_database_size;`,
				[session.db.db_name]
			);
			await pool.query(
				`
				INSERT INTO database_logs (database_id, database_size, created_at)
				VALUES ($1, $2, $3)
				ON CONFLICT (database_id, created_at)
				DO UPDATE SET database_size = $2;
			`,
				[session.db.db_name, size.rows[0].pg_database_size, new Date(date)]
			);
		}
		return result;
	} catch (error) {
		console.error("error running query", { queryText, values, error });
		return { rows: [], rowCount: 0, command: "", oid: 0, fields: [], error: (error as Error).message };
	}
}

export async function getTables(session: UserSessionModel, date: Date): Promise<PostgresTable[]> {
	let sql = `
        SELECT DISTINCT ON (table_schema, table_name)
            table_schema AS schema,
            table_name AS id,
            table_name AS name
        FROM information_schema.tables
        WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
        ORDER BY table_schema, table_name;
    `;
	const result = await userQuery<{ schema: string; id: string; name: string }>(session, date, sql);
	const postgres_tables: PostgresTable[] = [];
	for (const tableInfo of result.rows) {
		const { schema, id: table } = tableInfo;
		sql = `
            SELECT
                column_name AS id,
                column_name AS name,
                data_type AS format,
                udt_name AS type_name,
                column_default AS default_value,
                is_nullable::boolean AS is_nullable,
                (SELECT COUNT(*) FROM information_schema.table_constraints AS tc
                    JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                    AND ccu.table_schema = tc.table_schema
                    AND ccu.table_name = tc.table_name
                    WHERE tc.constraint_type = 'UNIQUE'
                    AND tc.table_schema = $1
                    AND tc.table_name = $2
                    AND ccu.column_name = c.column_name) > 0 AS is_unique,
                (SELECT COUNT(*) FROM information_schema.table_constraints AS tc
                    JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                    AND ccu.table_schema = tc.table_schema
                    AND ccu.table_name = tc.table_name
                    WHERE tc.constraint_type = 'PRIMARY KEY'
                    AND tc.table_schema = $1
                    AND tc.table_name = $2
                    AND ccu.column_name = c.column_name) > 0 AS is_primary_key,
                is_identity::boolean AS is_identity,
                is_updatable::boolean AS is_updatable
            FROM information_schema.columns AS c
            WHERE table_schema = $1
                AND table_name = $2
            ORDER BY ordinal_position;
        `;
		const c_result = await userQuery<PostgresColumn>(session, date, sql, [schema, table]);
		sql = `
            SELECT
                kcu.column_name AS name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
                AND tc.table_name = kcu.table_name
            WHERE tc.constraint_type = 'PRIMARY KEY'
                AND tc.table_schema = $1
                AND tc.table_name = $2;
        `;
		const n_result = await userQuery<{ name: string }>(session, date, sql, [schema, table]);
		const primary_keys = n_result.rows;
		sql = `
            SELECT
                tc.constraint_name AS id,
                tc.constraint_name,
                tc.table_name AS target_table_name,
                kcu.column_name AS target_column_name,
                ccu.table_schema AS target_table_schema,
                ccu.table_name AS source_table_name,
                ccu.column_name AS source_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            LEFT JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE constraint_type = 'FOREIGN KEY' AND tc.table_schema = $1 AND tc.table_name = $2;
        `;
		const r_result = await userQuery<PostgresRelationship>(session, date, sql, [schema, table]);
		const relationships = r_result.rows;
		postgres_tables.push({
			schema,
			id: table,
			name: table,
			primary_keys,
			relationships,
			columns: c_result.rows,
		});
	}
	return postgres_tables;
}

export async function getSchema(session: UserSessionModel, date: Date): Promise<Record<string, string[]>> {
	const sql = `
		SELECT
			schema_name AS schema,
			table_name AS table,
			column_name AS column
		FROM information_schema.columns
		WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
		ORDER BY table_name, column_name;
	`;
	const result = await userQuery<{ schema: string; table: string; column: string }>(session, date, sql);
	const rows = result.rows;
	const schema: Record<string, string[]> = {};
	for (const row of rows) {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!schema[row.table]) {
			schema[row.table] = [];
		}
		schema[row.table].push(row.column);
	}
	return schema;
}

export async function getUserTables(session: UserSessionModel, date: Date): Promise<Record<string, TableModel>> {
	const tables = await getTables(session, date);
	const userTables: Record<string, TableModel> = {};
	const indexes: Record<string, { id: string; name: string; columns: string[] }[]> = {};
	for (const table of tables) {
		const sql = `
			SELECT
				i.indexrelid::regclass AS id,
				i.indexrelid::regclass AS name,
				ARRAY_AGG(a.attname::text) AS columns
			FROM pg_index i
			JOIN pg_class c ON c.oid = i.indrelid
			JOIN pg_attribute a ON a.attrelid = c.oid
				AND a.attnum = ANY(i.indkey)
			WHERE c.relname = $1
			GROUP BY i.indexrelid, c.relname, i.indisprimary, i.indisunique;
		`;
		const result = await userQuery<{ id: string; name: string; columns: string[] }>(session, date, sql, [table.id]);
		indexes[table.id] = result.rows;
	}
	for (const table of tables) {
		const c_sql = `SELECT COUNT(*) FROM ${table.schema}.${table.id};`;
		const c_result = await userQuery<{ count: number }>(session, date, c_sql);
		const row_count = c_result.rows[0].count;
		const s_sql = `SELECT pg_table_size($1) AS size;`;
		const s_result = await userQuery<{ size: number }>(session, date, s_sql, [`${table.schema}.${table.id}`]);
		const size = s_result.rows[0].size;
		const referencedBy: TableModel["referencedBy"] = {};
		for (const otherTable of tables) {
			for (const relationship of otherTable.relationships) {
				if (relationship.source_table_name === table.id) {
					referencedBy[relationship.id] = {
						id: relationship.id,
						constraint_name: relationship.constraint_name,
						target_table_name: relationship.target_table_name,
						target_column_name: relationship.target_column_name,
						target_table_schema: relationship.target_table_schema,
						source_table_name: relationship.source_table_name,
						source_column_name: relationship.source_column_name,
					};
				}
			}
		}
		userTables[`"${table.schema}"."${table.id}"`] = {
			schema: table.schema,
			name: table.name,
			rowCount: row_count,
			size: size,
			columns: table.columns,
			relationships: table.relationships,
			indexes: indexes[table.id],
			referencedBy: referencedBy,
		};
	}
	return userTables;
}

export async function getUserLogs(
	session: UserSessionModel,
	date: Date
): Promise<{ user_logs: { logs: UserLogModel[] }; database_logs: DatabaseLogModel[] }> {
	const sql = `
		SELECT
			created_at::date AS date,
			ARRAY_AGG(count) AS total,
			ARRAY_AGG(duration) AS durations
		FROM user_logs
		WHERE user_id = $1 AND created_at >= $2
		GROUP BY created_at::date
		ORDER BY created_at::date DESC;
	`;
	const now = new Date(date);
	now.setDate(now.getDate() - 1);
	const result = await Database.getInstance().query<UserLogModel>(sql, [session.user.id, now]);
	let user_logs = result.rows;
	user_logs =
		user_logs.length > 0
			? user_logs
			: [{ date: new Date(date), total: [0, 0, 0, 0, 0, 0, 0], durations: [0, 0, 0, 0, 0, 0, 0] }];
	if (user_logs[0].date.toDateString() !== new Date(date).toDateString()) {
		user_logs = [
			...user_logs,
			{
				date: new Date(date),
				total: [0, 0, 0, 0, 0, 0, 0],
				durations: [0, 0, 0, 0, 0, 0, 0],
			},
		];
	}
	const sql2 = `
		SELECT
			database_id,
			database_size,
			created_at
		FROM database_logs
		WHERE database_id = $1 AND created_at >= $2
		ORDER BY created_at DESC
		LIMIT 2;
	`;
	let result2 = await Database.getInstance().query<DatabaseLogModel>(sql2, [session.db.db_name, now]);
	let database_logs = result2.rows;
	if (
		(database_logs.length > 0 && database_logs[0].created_at.toDateString() !== new Date(date).toDateString()) ||
		database_logs.length === 0
	) {
		const size = await Database.getInstance().query<{ pg_database_size: number }>(
			`SELECT pg_database_size($1) AS pg_database_size;`,
			[session.db.db_name]
		);
		await Database.getInstance().query(
			`
				INSERT INTO database_logs (database_id, database_size, created_at)
				VALUES ($1, $2, $3)
				ON CONFLICT (database_id, created_at)
				DO UPDATE SET database_size = $2;
			`,
			[session.db.db_name, size.rows[0].pg_database_size, new Date(date)]
		);
		result2 = await Database.getInstance().query<DatabaseLogModel>(sql2, [session.db.db_name, now]);
		database_logs = result2.rows;
	}
	return { user_logs: { logs: user_logs }, database_logs: database_logs };
}

export async function getUserLogData(session: UserSessionModel, date: Date): Promise<UserDataLogModel[]> {
	const sql = `
		SELECT
			user_id,
			command_type,
			command,
			duration,
			count,
			created_at
		FROM user_logs
		WHERE user_id = $1 AND created_at::date = $2::date
		ORDER BY created_at;
	`;
	const result = await Database.getInstance().query<UserDataLogModel>(sql, [session.user.id, date]);
	return result.rows;
}

export async function startDate(session: UserSessionModel): Promise<Date> {
	const sql = `
		SELECT
			created_at
		FROM user_logs
		WHERE user_id = $1
		ORDER BY created_at ASC
		LIMIT 1;
	`;
	const result = await Database.getInstance().query<{ created_at: Date }>(sql, [session.user.id]);
	return result.rows.length > 0 ? result.rows[0].created_at : new Date();
}

export async function dropAll(session: UserSessionModel, date: Date): Promise<void> {
	const sql = `SELECT * FROM pg_catalog.pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema');`;
	const result = await userQuery<{ schemaname: string; tablename: string }>(session, date, sql);
	const tables = result.rows;
	let query = "";
	for (const table of tables) {
		query += `DROP TABLE IF EXISTS ${table.schemaname}.${table.tablename} CASCADE;`;
	}
	await userQuery(session, date, query);
}
