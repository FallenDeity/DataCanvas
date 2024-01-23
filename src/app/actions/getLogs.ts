"use server";

import moment from "moment";

import { getUserLogs } from "@/lib/db";
import { DatabaseLogModel, UserLogModel } from "@/lib/models";

import getSession from "./getSession";

export default async function getLogs(date: string): Promise<{
	user_logs: { logs: UserLogModel[] };
	database_logs: DatabaseLogModel[];
}> {
	const session = await getSession();
	if (!session) {
		return { user_logs: { logs: [] }, database_logs: [] };
	}
	const localeDate = moment(date, "ddd MMM DD YYYY HH:mm:ss").format("YYYY-MM-DD");
	const db = await getUserLogs(session, new Date(localeDate));
	return db;
}
