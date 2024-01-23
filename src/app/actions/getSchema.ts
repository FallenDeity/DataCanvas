"use server";

import { getTables } from "@/lib/db";
import { PostgresTable } from "@/lib/models";

import getSession from "./getSession";

export default async function getSchema(date: Date): Promise<PostgresTable[]> {
	const session = await getSession();
	if (!session) {
		return [];
	}
	const db = await getTables(session, date);
	return db;
}
