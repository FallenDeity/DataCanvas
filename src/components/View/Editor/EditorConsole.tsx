"use client";

import "react-toastify/dist/ReactToastify.css";
import "@/styles/toastify.css";

import { useTheme } from "next-themes";
import React, { useState } from "react";
import { BiSolidTerminal } from "react-icons/bi";
import { FaClockRotateLeft } from "react-icons/fa6";
import { MdErrorOutline, MdOutlineCheck, MdOutlineFileDownload } from "react-icons/md";
import { VscRunAll } from "react-icons/vsc";
import { Slide, toast, ToastContainer } from "react-toastify";

import getResult from "@/app/actions/getResult";
import { Button } from "@/components/ui/button";
import { ResizablePanel } from "@/components/ui/resizable";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import ConsoleResult from "./ConsoleResult";

interface Result {
	command: string;
	rows: Record<string, string | null>[] | undefined;
	error?: string;
}

export default function EditorConsole({
	content,
	setReload,
}: {
	content: string;
	setReload: (reload: boolean) => void;
}): React.JSX.Element {
	const { resolvedTheme } = useTheme();
	const [results, setResult] = useState<Result[]>();
	const [processing, setProcessing] = useState<boolean>(false);
	const [duration, setDuration] = useState<number>(0);
	const [error, setError] = useState<string>("");
	const downloadCSV = (): void => {
		if (results) {
			for (const [idx, result] of results.entries()) {
				if (result.rows) {
					const csv = result.rows.map((row) => Object.values(row).join(",")).join("\n");
					const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
					const link = document.createElement("a");
					const url = URL.createObjectURL(blob);
					link.setAttribute("href", url);
					link.setAttribute("download", `${result.command}-${idx}.csv`);
					link.style.visibility = "hidden";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				}
			}
		}
	};
	return (
		<ResizablePanel className="min-h-10">
			<ToastContainer
				position="bottom-right"
				autoClose={5000}
				transition={Slide}
				closeOnClick
				pauseOnFocusLoss
				theme={resolvedTheme === "dark" ? "dark" : "light"}
			/>
			<div className="flex h-10 w-full flex-row items-center justify-between border-b border-r px-4">
				<div className="flex flex-row items-center">
					<BiSolidTerminal className="h-4 w-4 shrink-0 opacity-50" />
					<div className="ml-2 text-xs text-muted-foreground">CONSOLE</div>
				</div>
				<div className="flex flex-row items-center gap-2">
					<Button
						disabled={processing}
						variant="none"
						className="flex h-8 w-8 items-center justify-center p-1 hover:bg-accent"
						// eslint-disable-next-line @typescript-eslint/no-misused-promises
						onClick={(): void => {
							setProcessing(true);
							const start = Date.now();
							void getResult(content, new Date()).then((res) => {
								setDuration(Date.now() - start);
								const _res = (Array.isArray(res) ? res : [res]) as Result[];
								setResult(_res);
								setReload(true);
								setProcessing(false);
								const _error = _res.find((r) => r.error);
								setError(_error?.error ?? "");
								for (const r of _res) {
									if (r.error) {
										toast.error(r.error);
									}
								}
							});
						}}>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<VscRunAll className="h-4 w-4 text-teal-500 transition-colors duration-300 ease-in-out hover:text-teal-400" />
								</TooltipTrigger>
								<TooltipContent side="bottom" className="hidden px-2 py-1 md:block">
									Run
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</Button>
					<Button
						disabled
						variant="none"
						className="flex h-8 flex-row items-center justify-between border-2 px-2">
						<div className="flex flex-row items-center gap-1">
							<FaClockRotateLeft className="h-4 w-4 text-yellow-500" />
							<div className="ml-1 hidden text-xs text-muted-foreground xs:block">Duration:</div>
						</div>
						<div className="ml-1 text-xs text-muted-foreground">{duration}ms</div>
					</Button>
					{error ? (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<MdErrorOutline className="h-4 w-4 text-red-500" />
								</TooltipTrigger>
								<TooltipContent side="bottom" className="hidden w-72 px-2 py-1 md:block">
									{error}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					) : (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<MdOutlineCheck className="h-4 w-4 text-green-500" />
								</TooltipTrigger>
								<TooltipContent side="bottom" className="hidden px-2 py-1 md:block">
									No errors found.
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
					{results && results.length > 0 && (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<MdOutlineFileDownload
										className="h-4 w-4 text-blue-500 transition-colors duration-300 ease-in-out hover:text-blue-400"
										// eslint-disable-next-line @typescript-eslint/no-misused-promises
										onClick={(): void => {
											downloadCSV();
										}}
									/>
								</TooltipTrigger>
								<TooltipContent side="bottom" className="hidden px-2 py-1 md:block">
									Download CSV
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
				</div>
			</div>
			<div className="mt-5 flex h-full w-full flex-col gap-6 overflow-y-scroll scrollbar-hide">
				{results?.map((result) => (
					<ConsoleResult result={result} duration={duration} />
				))}
				<div className="mb-24 flex h-full w-full flex-col" />
			</div>
		</ResizablePanel>
	);
}
