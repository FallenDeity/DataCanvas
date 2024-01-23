"use client";

import { LogOut } from "lucide-react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserSessionModel } from "@/lib/models";

import ThemeToggleButton from "../ThemeToggle";
import { Separator } from "../ui/separator";

const themes = {
	// dark
	dark: {
		border: "border-indigo-950",
		bg: "bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-950 via-indigo-950 to-transparent bg-gradient-to-b",
	},
	// light
	light: {
		border: "border-indigo-300",
		bg: "bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-300 via-blue-100 to-transparent bg-gradient-to-b",
	},
};

export default function UserNav(): React.JSX.Element {
	const { resolvedTheme } = useTheme();
	const { data: session } = useSession() as { data: UserSessionModel | null };
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
	const { border, bg } = themes[(resolvedTheme === "dark" ? "dark" : "light") as "light" | "dark"];
	const relativeTime = (date: Date): string => {
		const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
		const units: Intl.RelativeTimeFormatUnit[] = ["year", "month", "day", "hour", "minute", "second"];
		const durations = [31536000, 2592000, 86400, 3600, 60, 1];
		const elapsed = Math.floor((Date.now() - date.getTime()) / 1000);
		for (let i = 0; i < units.length; i++) {
			const duration = durations[i];
			if (Math.abs(elapsed) > duration || i === units.length - 1) {
				return rtf.format(Math.round(elapsed / duration), units[i]).replace("in ", "");
			}
		}
		return "";
	};
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Avatar className="h-14 w-14 cursor-pointer border p-1">
					<AvatarImage src={session?.user.image} alt="User avatar" className="rounded-full" />
					<AvatarFallback className="uppercase">{session?.user.name.slice(0, 2) ?? "US"}</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{session && (
					<Card className={`w-72 rounded-md border-[3px] xs:w-80 ${border}`}>
						<CardHeader className="relative flex h-36 flex-row items-end rounded-md pb-0">
							<div className={`absolute left-0 top-0 h-28 w-full ${bg}`} />
							<div className="absolute top-10 z-10 flex flex-col items-start">
								<CardTitle>{session.user.name}</CardTitle>
								<CardDescription className="mt-2 w-40 truncate">
									<div className="flex w-full flex-col">
										<div className="text-xs text-muted-foreground">
											Joined {relativeTime(new Date(session.user.created_at))} ago
										</div>
										<span className="mt-8 text-xs text-muted-foreground">{session.user.email}</span>
									</div>
								</CardDescription>
							</div>
							<Image
								src={session.user.image}
								alt="Profile Picture"
								width={100}
								height={100}
								className="absolute right-5 top-4 h-24 w-24 rounded-full border-2 bg-card p-1"
							/>
						</CardHeader>
						<CardContent className="flex flex-col pb-4">
							<Separator className="my-4" />
							<div className="md:hidden">
								<ThemeToggleButton />
							</div>
							<Button className="my-2 w-full" onClick={(): void => void signOut()}>
								<span className="flex items-center justify-center gap-2">
									<LogOut size={16} />
									Log out
								</span>
							</Button>
						</CardContent>
					</Card>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
