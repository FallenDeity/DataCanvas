"use server";

import { getUserTables } from "@/lib/db";
import { TableModel } from "@/lib/models";

import getSession from "./getSession";

export default async function getTables(date: string): Promise<Record<string, TableModel>> {
	const session = await getSession();
	if (!session) {
		return {};
	}
	const db = await getUserTables(session, new Date(date));
	return db;
}
