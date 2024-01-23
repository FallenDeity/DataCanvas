"use server";

import moment from "moment";

import { getSchema } from "@/lib/db";

import getSession from "./getSession";

export default async function getAutocompletes(date: string): Promise<Record<string, string[]>> {
	const session = await getSession();
	if (!session) {
		return {};
	}
	const localeDate = moment(date, "ddd MMM DD YYYY HH:mm:ss").format("YYYY-MM-DD");
	const db = await getSchema(session, new Date(localeDate));
	return db;
}
