"use server";

import moment from "moment";

import { dropAll } from "@/lib/db";

import getSession from "./getSession";

export default async function getClearTables(date: string): Promise<void> {
	const session = await getSession();
	if (!session) {
		return;
	}
	const localeDate = moment(date, "ddd MMM DD YYYY HH:mm:ss").format("YYYY-MM-DD");
	await dropAll(session, new Date(localeDate));
}
