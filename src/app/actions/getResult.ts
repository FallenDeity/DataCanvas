"use server";

import { QueryResult } from "pg";

import { userQuery } from "@/lib/db";

import getSession from "./getSession";

export default async function getResult(query: string, date: string): Promise<QueryResult> {
	const session = await getSession();
	if (!session) {
		return { rows: [], rowCount: 0, command: "", oid: 0, fields: [] };
	}
	const result = await userQuery<QueryResult>(session, new Date(date), query);
	const plainResult = JSON.parse(JSON.stringify(result)) as QueryResult;
	return plainResult;
}
