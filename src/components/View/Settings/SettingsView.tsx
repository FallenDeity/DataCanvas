"use client";

import "@/styles/toastify.css";
import "react-toastify/dist/ReactToastify.css";

import { Copy, EyeIcon, EyeOffIcon } from "lucide-react";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import React, { useState } from "react";
import { HashLoader } from "react-spinners";
import { Slide, toast, ToastContainer } from "react-toastify";

import getClearTables from "@/app/actions/getClearTables";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserSessionModel } from "@/lib/models";

export default function SettingsView(): React.JSX.Element {
	const { resolvedTheme } = useTheme();
	const [revealed, setRevealed] = useState(false);
	const { data: session } = useSession() as { data: UserSessionModel | null };
	const copyData = (data: string): void => {
		void navigator.clipboard.writeText(data);
		toast("Copied to clipboard!");
	};
	const dropTables = (): void => {
		async function fetchClearTables(): Promise<void> {
			const date = moment();
			try {
				await getClearTables(date.toLocaleString());
				toast("Database reset!");
			} catch (err) {
				toast.error("Something went wrong!");
			}
		}
		void fetchClearTables();
	};

	if (!session) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<HashLoader className="h-32 w-32" color={resolvedTheme === "dark" ? "#5f05e6" : "#89a2fa"} />
			</div>
		);
	}
	return (
		<div className="flex h-full w-full flex-col overflow-y-scroll p-2 pb-16 pt-6 scrollbar-hide sm:p-6 md:p-4 lg:p-6 xl:p-8">
			<ToastContainer
				transition={Slide}
				position="bottom-right"
				autoClose={5000}
				closeOnClick
				pauseOnFocusLoss
				theme={resolvedTheme === "dark" ? "dark" : "light"}
			/>
			<Card className="w-full">
				<CardHeader className="flex w-full flex-col gap-4">
					<CardTitle className="w-full">Database Settings</CardTitle>
					<CardDescription className="mb-2 text-foreground/80">
						These are the credentials you need to connect to your database. Please do not share these with
						anyone.
					</CardDescription>
					<Separator className="mb-4" />
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					<div className="flex flex-row items-center justify-between gap-1.5">
						<Label className="w-1/3 text-foreground/60">Database</Label>
						<div className="flex w-full flex-row items-center gap-2.5 rounded-md border bg-background pr-3">
							<Input
								className="w-full border-none disabled:cursor-default"
								value={session.db.db_name}
								readOnly
								disabled
								placeholder="Database name"
							/>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger>
										<Copy
											className="ml-2 h-4 w-4 flex-shrink-0 cursor-pointer"
											size={8}
											strokeWidth={2}
											onClick={(): void => copyData(session.db.db_name)}
										/>
									</TooltipTrigger>
									<TooltipContent className="p-1.5">Copy to clipboard</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
					</div>
					<div className="flex flex-row items-center justify-between gap-1.5">
						<Label className="w-1/3 text-foreground/60">Port</Label>
						<div className="flex w-full flex-row items-center gap-2.5 rounded-md border bg-background pr-3">
							<Input
								className="w-full border-none disabled:cursor-default"
								value={process.env.NEXT_PUBLIC_DB_PORT ?? "5432"}
								readOnly
								disabled
								placeholder="Database port"
							/>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger>
										<Copy
											className="ml-2 h-4 w-4 flex-shrink-0 cursor-pointer"
											size={8}
											strokeWidth={2}
											onClick={(): void => copyData("5432")}
										/>
									</TooltipTrigger>
									<TooltipContent className="p-1.5">Copy to clipboard</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
					</div>
					<div className="flex flex-row items-center justify-between gap-1.5">
						<Label className="w-1/3 text-foreground/60">Host</Label>
						<div className="flex w-full flex-row items-center gap-2.5 rounded-md border bg-background pr-3">
							<Input
								className="w-full border-none disabled:cursor-default"
								value={process.env.NEXT_PUBLIC_DATABASE_HOST ?? "localhost"}
								readOnly
								disabled
								placeholder="Database host"
							/>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger>
										<Copy
											className="ml-2 h-4 w-4 flex-shrink-0 cursor-pointer"
											size={8}
											strokeWidth={2}
											onClick={(): void =>
												copyData(process.env.NEXT_PUBLIC_DATABASE_HOST ?? "localhost")
											}
										/>
									</TooltipTrigger>
									<TooltipContent className="p-1.5">Copy to clipboard</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
					</div>
					<div className="flex flex-row items-center justify-between gap-1.5">
						<Label className="w-1/3 text-foreground/60">Username</Label>
						<div className="flex w-full flex-row items-center gap-2.5 rounded-md border bg-background pr-3">
							<Input
								className="w-full border-none disabled:cursor-default"
								value={session.db.db_user}
								readOnly
								disabled
								placeholder="Database username disabled:cursor-default"
							/>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger>
										<Copy
											className="ml-2 h-4 w-4 flex-shrink-0 cursor-pointer"
											size={8}
											strokeWidth={2}
											onClick={(): void => copyData(session.db.db_user)}
										/>
									</TooltipTrigger>
									<TooltipContent className="p-1.5">Copy to clipboard</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
					</div>
					<div className="flex flex-row items-center justify-between gap-1.5">
						<Label className="w-1/3 text-foreground/60">Password</Label>
						<div className="flex w-full flex-row items-center gap-2.5 rounded-md border bg-background pr-3">
							<Input
								className="w-full border-none disabled:cursor-default"
								value={revealed ? session.db.db_password : "•".repeat(session.db.db_password.length)}
								readOnly
								disabled
								placeholder="Database password"
							/>
							{revealed ? (
								<EyeOffIcon
									className="h-4 w-4 flex-shrink-0 cursor-pointer"
									size={8}
									strokeWidth={2}
									onClick={(): void => setRevealed(false)}
								/>
							) : (
								<EyeIcon
									className="h-4 w-4 flex-shrink-0 cursor-pointer"
									size={8}
									strokeWidth={2}
									onClick={(): void => setRevealed(true)}
								/>
							)}
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger>
										<Copy
											className="ml-2 h-4 w-4 flex-shrink-0 cursor-pointer"
											size={8}
											strokeWidth={2}
											onClick={(): void => copyData(session.db.db_password)}
										/>
									</TooltipTrigger>
									<TooltipContent className="p-1.5">Copy to clipboard</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex w-full flex-col gap-6">
					<Separator />
					<div className="flex w-full flex-row items-center justify-between gap-1.5">
						<Label className="w-1/3 text-foreground/60">URL</Label>
						<div className="flex w-full flex-row items-center gap-2.5 rounded-md border bg-background pr-3">
							<Input
								className="w-full border-none disabled:cursor-default"
								value={`postgres://${session.db.db_user}:${session.db.db_password}@${
									process.env.NEXT_PUBLIC_DATABASE_HOST ?? "localhost"
								}:${process.env.NEXT_PUBLIC_DATABASE_PORT ?? "5432"}/${session.db.db_name}`}
								readOnly
								disabled
								placeholder="Database URL"
							/>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger>
										<Copy
											className="ml-2 h-4 w-4 flex-shrink-0 cursor-pointer"
											size={8}
											strokeWidth={2}
											onClick={(): void =>
												copyData(
													`postgres://${session.db.db_user}:${session.db.db_password}@
													${process.env.NEXT_PUBLIC_DATABASE_HOST ?? "localhost"}:
													${process.env.NEXT_PUBLIC_DATABASE_PORT ?? "5432"}/${session.db.db_name}`
												)
											}
										/>
									</TooltipTrigger>
									<TooltipContent className="p-1.5">Copy to clipboard</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
					</div>
				</CardFooter>
			</Card>
			<Card className="mt-10 w-full">
				<CardHeader className="flex w-full flex-col gap-4 pb-0">
					<CardTitle className="flex w-full flex-row items-center justify-start gap-3 text-center">
						Reset Database
					</CardTitle>
					<CardDescription className="w-full text-foreground/80">
						Remove all existing data from your database. This action cannot be undone.
					</CardDescription>
					<Separator />
				</CardHeader>
				<CardContent className="flex w-full flex-row items-center justify-end py-4">
					<AlertDialog>
						<AlertDialogTrigger>
							<Button className="border-none disabled:cursor-default" variant="destructive">
								Reset Database
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
								<AlertDialogDescription>
									This action cannot be undone. This will permanently reset your database and remove
									your data from our servers.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={dropTables}>Continue</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</CardContent>
			</Card>
		</div>
	);
}
