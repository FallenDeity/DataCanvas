import "@/styles/globals.css";

import { Metadata } from "next";
import React from "react";

import Body from "@/components/Body";
import NextAuthProvider from "@/components/NextAuthProvider";
import { meta } from "@/lib/constants";

export const metadata: Metadata = meta;

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
	return (
		<html lang="en">
			<body className={`overflow-hidden`}>
				<NextAuthProvider>
					<Body>{children}</Body>
				</NextAuthProvider>
			</body>
		</html>
	);
}
