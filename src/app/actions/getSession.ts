"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { UserSessionModel } from "@/lib/models";

export default async function getSession(): Promise<UserSessionModel | null> {
	return await getServerSession(authOptions);
}
