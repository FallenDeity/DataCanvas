"use server";

import moment from "moment";

import { getUserLogData } from "@/lib/db";
import { UserDataLogModel } from "@/lib/models";

import getSession from "./getSession";

export default async function getLogsData(date: string): Promise<UserDataLogModel[]> {
	const session = await getSession();
	if (!session) {
		return [];
	}
	const localeDate = moment(date, "ddd MMM DD YYYY HH:mm:ss").format("YYYY-MM-DD");
	const db = await getUserLogData(session, new Date(localeDate));
	return db;
}
