import "@/styles/globals.css";

import React from "react";

import Body from "@/components/Body";
import NextAuthProvider from "@/components/NextAuthProvider";

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
