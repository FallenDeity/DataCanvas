"use server";

import { dropAll } from "@/lib/db";

import getSession from "./getSession";

export default async function getClearTables(date: string): Promise<void> {
	const session = await getSession();
	if (!session) {
		return;
	}
	await dropAll(session, new Date(date));
}
