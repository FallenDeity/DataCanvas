"use server";

import { getSchema } from "@/lib/db";

import getSession from "./getSession";

export default async function getAutocompletes(date: string): Promise<Record<string, string[]>> {
	const session = await getSession();
	if (!session) {
		return {};
	}
	const db = await getSchema(session, new Date(date));
	return db;
}
