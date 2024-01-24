"use client";

import Lottie from "lottie-react";
import moment from "moment";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { HashLoader } from "react-spinners";
import { useRecoilState } from "recoil";

import getSchema from "@/app/actions/getSchema";
import notFound from "@/assets/empty.json";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PostgresTable } from "@/lib/models";

import { reloadAtom } from "../Tables/reloadAtom";
import TableData from "./TableData";
import TableSheet from "./TableSheet";

export default function TableEditorView(): React.JSX.Element {
	const { resolvedTheme } = useTheme();
	const [reload, setReload] = useRecoilState(reloadAtom);
	const [loading, setLoading] = useState<boolean>(true);
	const [tables, setTables] = useState<PostgresTable[]>([]);
	const [table, setTable] = useState<PostgresTable | undefined>();

	useEffect(() => {
		async function fetchSchema(): Promise<void> {
			const date = moment();
			const res = await getSchema(date.toLocaleString());
			setTables(res);
			setTable(res[0]);
			setLoading(false);
			setReload(false);
		}
		if (reload || loading) {
			void fetchSchema();
		}
	}, [reload]);

	if (loading) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<HashLoader className="h-32 w-32" color={resolvedTheme === "dark" ? "#5f05e6" : "#89a2fa"} />
			</div>
		);
	}

	return tables.length > 0 ? (
		<div className="relative flex h-full w-full flex-col overflow-y-scroll p-2 pt-6 scrollbar-hide md:p-4 lg:p-6 xl:p-8">
			<div className="flex w-full items-center justify-center p-4">
				<Select onValueChange={(value): void => setTable(tables.find((t) => t.id === value))}>
					<SelectTrigger className="w-3/4 md:w-1/2">
						{table ? (
							<SelectValue placeholder={table.name} />
						) : (
							<SelectValue placeholder={"Select a table"} />
						)}
					</SelectTrigger>
					<SelectContent>
						{tables.map((table) => (
							<SelectItem key={table.id} value={table.id}>
								{table.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="my-10 flex w-full flex-col">{table && <TableData table={table} />}</div>
			<div className="absolute bottom-16 right-8 sm:bottom-5">
				<TableSheet />
			</div>
		</div>
	) : (
		<div className="relative flex h-full w-full flex-col items-center justify-center">
			<div className="flex flex-col items-center justify-center">
				<Lottie animationData={notFound} loop className="h-64 w-64 opacity-90 dark:opacity-70" />
				<p className="text-md text-center font-semibold">Create a table to get started</p>
				<div className="absolute bottom-16 right-8 sm:bottom-5">
					<TableSheet />
				</div>
			</div>
		</div>
	);
}
