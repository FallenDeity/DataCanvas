"use server";

import moment from "moment";
import { QueryResult } from "pg";

import { userQuery } from "@/lib/db";

import getSession from "./getSession";

export default async function getResult(query: string, date: string): Promise<QueryResult> {
	const session = await getSession();
	if (!session) {
		return { rows: [], rowCount: 0, command: "", oid: 0, fields: [] };
	}
	const localeDate = moment(date, "ddd MMM DD YYYY HH:mm:ss").format("YYYY-MM-DD");
	const result = await userQuery<QueryResult>(session, new Date(localeDate), query);
	const plainResult = JSON.parse(JSON.stringify(result)) as QueryResult;
	return plainResult;
}
