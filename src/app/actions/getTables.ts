"use server";

import { getUserTables } from "@/lib/db";
import { TableModel } from "@/lib/models";

import getSession from "./getSession";

export default async function getTables(date: Date): Promise<Record<string, TableModel>> {
	const session = await getSession();
	if (!session) {
		return {};
	}
	const db = await getUserTables(session, date);
	return db;
}
