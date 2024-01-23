"use server";

import { getUserLogData } from "@/lib/db";
import { UserDataLogModel } from "@/lib/models";

import getSession from "./getSession";

export default async function getLogsData(date: Date | undefined = undefined): Promise<UserDataLogModel[]> {
	const session = await getSession();
	if (!session) {
		return [];
	}
	const db = await getUserLogData(session, date ?? new Date());
	return db;
}
