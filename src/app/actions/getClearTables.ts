"use server";

import { dropAll } from "@/lib/db";

import getSession from "./getSession";

export default async function getClearTables(date: Date): Promise<void> {
	const session = await getSession();
	if (!session) {
		return;
	}
	await dropAll(session, date);
}
