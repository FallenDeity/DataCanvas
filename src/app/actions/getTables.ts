"use server";

import moment from "moment";

import { getUserTables } from "@/lib/db";
import { TableModel } from "@/lib/models";

import getSession from "./getSession";

export default async function getTables(date: string): Promise<Record<string, TableModel>> {
	const session = await getSession();
	if (!session) {
		return {};
	}
	const localeDate = moment(date, "ddd MMM DD YYYY HH:mm:ss").format("YYYY-MM-DD");
	const db = await getUserTables(session, new Date(localeDate));
	return db;
}
