"use server";

import { startDate } from "@/lib/db";

import getSession from "./getSession";

export default async function getStartDate(): Promise<Date> {
	const session = await getSession();
	if (!session) {
		return new Date();
	}
	const db = await startDate(session);
	return db;
}
