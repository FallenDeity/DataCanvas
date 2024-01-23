"use server";

import moment from "moment";

import { getTables } from "@/lib/db";
import { PostgresTable } from "@/lib/models";

import getSession from "./getSession";

export default async function getSchema(date: string): Promise<PostgresTable[]> {
	const session = await getSession();
	if (!session) {
		return [];
	}
	const localeDate = moment(date, "ddd MMM DD YYYY HH:mm:ss").format("YYYY-MM-DD");
	const db = await getTables(session, new Date(localeDate));
	return db;
}
