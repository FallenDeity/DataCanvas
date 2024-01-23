"use server";

import { getSchema } from "@/lib/db";

import getSession from "./getSession";

export default async function getAutocompletes(): Promise<Record<string, string[]>> {
	const session = await getSession();
	if (!session) {
		return {};
	}
	const db = await getSchema(session);
	return db;
}
