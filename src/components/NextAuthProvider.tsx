"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import React from "react";
import { RecoilRoot } from "recoil";

export default function NextAuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
	return (
		<SessionProvider>
			<RecoilRoot>
				<ThemeProvider attribute={"class"}>{children}</ThemeProvider>
			</RecoilRoot>
		</SessionProvider>
	);
}
