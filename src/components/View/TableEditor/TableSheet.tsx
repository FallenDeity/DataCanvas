"use client";

import "react-toastify/dist/ReactToastify.css";
import "@/styles/toastify.css";

import { PlusIcon } from "lucide-react";
import moment from "moment";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { LuDot } from "react-icons/lu";
import { Slide, toast, ToastContainer } from "react-toastify";
import { useRecoilState } from "recoil";

import getResult from "@/app/actions/getResult";
import getSchema from "@/app/actions/getSchema";
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
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { PostgresTable, TableModel } from "@/lib/models";

import { reloadAtom } from "../Tables/reloadAtom";
import ColumnEditor from "./ColumnEditor";

interface Result {
	command: string;
	rows: Record<string, string | null>[] | undefined;
	error?: string;
}

export default function TableSheet({ table = undefined }: { table?: PostgresTable | TableModel }): React.JSX.Element {
	const { resolvedTheme } = useTheme();
	const setReload = useRecoilState(reloadAtom)[1];
	const [queries, setQueries] = useState<string[]>([]);
	const [name, setName] = useState(table ? table.name : "");
	const [tables, setTables] = useState<PostgresTable[]>([]);
	const [columns, setColumns] = useState<Record<string, string>>({});
	const [errors, setErrors] = useState<Set<string>>(new Set());

	useEffect(() => {
		async function fetchSchema(): Promise<void> {
			const date = moment();
			const tables = await getSchema(date.toLocaleString());
			setTables(tables);
		}
		void fetchSchema();
	}, [queries]);

	useEffect(() => {
		setErrors(new Set());
		if (!name.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
			setErrors((prev) => new Set([...prev, "Table name is not a valid identifier"]));
		} else {
			setErrors((prev) => new Set([...prev].filter((error) => error !== "Table name is not a valid identifier")));
		}
		if (name === "") {
			setErrors((prev) => new Set([...prev, "Table name cannot be empty"]));
		} else {
			setErrors((prev) => new Set([...prev].filter((error) => error !== "Table name cannot be empty")));
		}
		Object.keys(columns).forEach((idx, n) => {
			const column = columns[idx].trim().replace(/\s+/g, " ");
			if (column === "") {
				setErrors((prev) => new Set([...prev, `Column ${n + 1} cannot be empty`]));
			} else {
				setErrors((prev) => new Set([...prev].filter((error) => error !== `Column ${n + 1} cannot be empty`)));
			}
		});
	}, [name, columns]);

	const executeQuery = (): void => {
		if (errors.size > 0) {
			toast.error("Cannot create table due to errors");
			return;
		}
		let query = "";
		if (table) {
			query = Object.values(columns).join("\n");
		} else {
			query = `CREATE TABLE IF NOT EXISTS ${name} (${Object.values(columns).join(", ")});`;
		}
		if (table && table.name !== name) {
			query += `\nALTER TABLE ${table.schema}.${table.name} RENAME TO ${name};`;
		}
		if (query === "") return;

		async function executeQuery(query: string): Promise<void> {
			setQueries((prev) => [...prev, query]);
			const date = moment();
			const res = await getResult(query, date.toLocaleString());
			const _res = (Array.isArray(res) ? res : [res]) as Result[];
			const _error = _res.find((r) => r.error);
			for (const r of _res) {
				if (r.error) {
					toast.error(r.error);
				}
			}
			if (!_error) {
				setReload(true);
				toast.success(`Table ${table ? "updated" : "created"} successfully`);
				setColumns({});
				setName(table ? table.name : "");
			}
		}
		void executeQuery(query);
	};

	const dropTable = (): void => {
		if (!table) return;

		async function executeDrop(table: PostgresTable | TableModel): Promise<void> {
			const date = moment();
			const query = `DROP TABLE ${table.schema}.${table.name} CASCADE;`;
			setQueries((prev) => [...prev, query]);
			const res = await getResult(query, date.toLocaleString());
			const _res = (Array.isArray(res) ? res : [res]) as Result[];
			const _error = _res.find((r) => r.error);
			for (const r of _res) {
				if (r.error) {
					toast.error(r.error);
				}
			}
			if (!_error) {
				setReload(true);
				toast.success("Table dropped successfully");
			}
		}
		void executeDrop(table);
	};

	return (
		<>
			<ToastContainer
				position="bottom-right"
				autoClose={5000}
				transition={Slide}
				closeOnClick
				pauseOnFocusLoss
				theme={resolvedTheme === "dark" ? "dark" : "light"}
			/>
			<Sheet>
				<SheetTrigger>
					{table ? (
						<Button variant="ghost" className="h-8 w-8 p-1">
							<FaEdit className="h-4 w-4" />
						</Button>
					) : (
						<Button
							variant="outline"
							className="h-10 w-10 rounded-full bg-secondary p-1 hover:bg-secondary/70">
							<PlusIcon className="h-4 w-4" />
						</Button>
					)}
				</SheetTrigger>
				<SheetContent className="flex h-full w-full flex-col justify-between overflow-y-scroll px-3 scrollbar-hide sm:w-[640px] sm:px-6">
					<SheetHeader>
						<SheetTitle className="text-center text-xl">{table ? "Edit" : "Create"} Table</SheetTitle>
						<SheetDescription className="py-10">
							<div className="flex w-full flex-col items-start justify-center gap-2">
								<Label className="text-md ml-1">Name</Label>
								<Input
									value={name}
									className="w-full"
									placeholder="Enter table name"
									type="text"
									onInput={(e): void => setName(e.currentTarget.value.trim().replace("\t", ""))}
								/>
							</div>
							{table && (
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button variant="destructive" className="mt-5 w-full">
											Drop Table
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
											<AlertDialogDescription>
												This will drop the table. This action cannot be undone.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancel</AlertDialogCancel>
											<SheetClose>
												<AlertDialogAction onClick={dropTable}>Continue</AlertDialogAction>
											</SheetClose>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							)}
							<Separator className="my-5" />
							<div className="flex w-full flex-col items-center justify-center">
								<h1 className="text-xl font-semibold text-foreground">Columns</h1>
								<div className="mb-2 mt-5 flex w-full flex-row items-center justify-between">
									<div className="flex w-full flex-col items-center justify-center gap-2">
										<Label className="text-md ml-1">Name</Label>
									</div>
									<div className="flex w-full flex-col items-center justify-center gap-2">
										<Label className="text-md ml-1">Type</Label>
									</div>
									<div className="flex w-full flex-col items-center justify-center gap-2">
										<Label className="text-md ml-1">Default</Label>
									</div>
									<div className="flex w-full flex-col items-center justify-center gap-2">
										<Label className="text-md ml-1">Constraints</Label>
									</div>
								</div>
								<div className="flex h-full w-full flex-col overflow-y-scroll scrollbar-hide">
									{table?.columns
										// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
										.filter((c) => !(columns[c.id] ?? "").includes("DROP COLUMN"))
										.map((column, idx) => (
											<ColumnEditor
												key={idx}
												idx={column.id}
												tables={tables}
												columnTable={table}
												setQuery={setColumns}
												column={column}
											/>
										))}
									{Object.keys(columns)
										.filter(
											(key) =>
												!table?.columns.find((c) => c.id === key) &&
												!columns[key].includes("DROP COLUMN")
										)
										.map((idx) => (
											<ColumnEditor
												key={idx}
												idx={String(idx)}
												tables={tables}
												columnTable={table}
												setQuery={setColumns}
											/>
										))}
								</div>
								<Button
									variant={"outline"}
									onClick={(): void => {
										const uid = Date.now();
										setColumns((prev) => ({ ...prev, [uid]: "" }));
									}}
									className="mt-5 flex w-full flex-row items-center justify-center gap-2">
									<PlusIcon className="h-5 w-5" />
									<span>Add Column</span>
								</Button>
							</div>
						</SheetDescription>
					</SheetHeader>
					<SheetFooter className="gap-2">
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="outline">Discard</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
									<AlertDialogDescription>
										This will discard all of your changes. This action cannot be undone.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<SheetClose>
										<AlertDialogAction
											onClick={(): void => {
												setColumns({});
												setName(table ? table.name : "");
											}}>
											Continue
										</AlertDialogAction>
									</SheetClose>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
						<SheetClose>
							<Button className="relative" onClick={executeQuery}>
								{errors.size > 0 && (
									<HoverCard>
										<HoverCardTrigger>
											<div className="absolute -right-2 -top-2 flex h-5 w-5 flex-row items-center justify-center rounded-full bg-red-500 text-xs text-white">
												{errors.size}
											</div>
										</HoverCardTrigger>
										<HoverCardContent side="bottom" className="flex flex-col p-2">
											<h1 className="text-md text-center font-semibold text-foreground">
												Errors
											</h1>
											<Separator className="my-2" />
											{Array.from(errors).map((error) => (
												<span className="flex flex-row items-center text-xs text-foreground/80">
													<LuDot className="mr-1 h-6 w-6" />
													{error}
												</span>
											))}
										</HoverCardContent>
									</HoverCard>
								)}
								{table ? "Update" : "Create"}
							</Button>
						</SheetClose>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</>
	);
}
