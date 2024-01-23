/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
import { AuthOptions, Session } from "next-auth";
// eslint-disable-next-line import/no-named-as-default
import EmailProvider from "next-auth/providers/email";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import Database from "./db";
import postgresAdapter from "./dbAdapter";
import { DatabaseModel, UserModel } from "./models";

export const authOptions: AuthOptions = {
	adapter: postgresAdapter(),
	providers: [
		GithubProvider({
			clientId: process.env.GITHUB_ID as string,
			clientSecret: process.env.GITHUB_SECRET as string,
			allowDangerousEmailAccountLinking: true,
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_ID as string,
			clientSecret: process.env.GOOGLE_SECRET as string,
			allowDangerousEmailAccountLinking: true,
		}),
		EmailProvider({
			server: {
				host: process.env.EMAIL_SERVER_HOST as string,
				port: parseInt(process.env.EMAIL_SERVER_PORT as string),
				auth: {
					type: "OAuth2",
					user: process.env.EMAIL_SERVER_USER as string,
					pass: process.env.EMAIL_SERVER_PASSWORD as string,
					clientId: process.env.EMAIL_SERVER_CLIENT_ID as string,
					clientSecret: process.env.EMAIL_SERVER_CLIENT_SECRET as string,
					refreshToken: process.env.EMAIL_SERVER_REFRESH_TOKEN as string,
				},
				tls: {
					rejectUnauthorized: false,
				},
			},
			from: process.env.EMAIL_FROM as string,
		}),
	],
	callbacks: {
		session: async ({ session }: { session: Session }) => {
			const db = Database.getInstance();
			const user_details = await db.queryOne<UserModel>(`SELECT * FROM users WHERE email = $1`, [
				session.user?.email,
			]);
			const db_details = await db.queryOne<DatabaseModel>(`SELECT * FROM databases WHERE user_id = $1`, [
				user_details.id,
			]);
			const u_session = {
				...session,
				user: { ...session.user, ...user_details },
				db: db_details,
				expires: session.expires,
			};
			return Promise.resolve(u_session);
		},
	},
	pages: {
		signIn: "/login",
	},
	session: {
		strategy: "jwt",
	},
	debug: process.env.NODE_ENV === "development",
	secret: process.env.NEXTAUTH_SECRET as string,
};
