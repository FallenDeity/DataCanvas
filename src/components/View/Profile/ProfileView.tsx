"use client";

import "@/styles/toastify.css";
import "react-toastify/dist/ReactToastify.css";

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import React from "react";
import { HashLoader } from "react-spinners";
import { Slide, ToastContainer } from "react-toastify";

import { UserSessionModel } from "@/lib/models";

import AppearanceForm from "./AppearanceSettings";

export default function ProfileView(): React.JSX.Element {
	const { resolvedTheme, setTheme } = useTheme();
	const { data: session } = useSession() as { data: UserSessionModel | null };

	if (!session) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<HashLoader className="h-32 w-32" color={resolvedTheme === "dark" ? "#5f05e6" : "#89a2fa"} />
			</div>
		);
	}

	return (
		<div className="flex h-full w-full flex-col items-center overflow-y-scroll p-2 pb-16 pt-6 scrollbar-hide md:p-4 lg:p-6 xl:p-8">
			<ToastContainer
				transition={Slide}
				position="bottom-right"
				autoClose={5000}
				closeOnClick
				pauseOnFocusLoss
				theme={resolvedTheme === "dark" ? "dark" : "light"}
			/>
			<AppearanceForm currentTheme={resolvedTheme as "light" | "dark"} setTheme={setTheme} />
		</div>
	);
}
