"use client";

import "react-toastify/dist/ReactToastify.css";
import "@/styles/toastify.css";

import {
	ColumnDef,
	ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";
import { CopyIcon } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { Slide, toast, ToastContainer } from "react-toastify";

import getLogsData from "@/app/actions/getLogData";
import getStartDate from "@/app/actions/getStartDate";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/DatePicker";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserDataLogModel } from "@/lib/models";

import { DataTableColumnHeader } from "./ColumnHeader";
import { DataTableViewOptions } from "./ColumnToggle";
import { DataTablePagination } from "./TablePagination";

type HomeTableProps = Omit<UserDataLogModel, "user_id">;

const columns: ColumnDef<HomeTableProps>[] = [
	{
		accessorKey: "command_type",
		header: ({ column }): React.JSX.Element => {
			return <DataTableColumnHeader column={column} title="Type" />;
		},
	},
	{
		accessorKey: "command",
		header: ({ column }): React.JSX.Element => {
			return <DataTableColumnHeader column={column} title="Command" />;
		},
		cell: ({ row }): React.JSX.Element => {
			const command = row.original.command;
			return <span className="line-clamp-1 text-left">{command.trim()}</span>;
		},
	},
	{
		accessorKey: "duration",
		header: ({ column }): React.JSX.Element => {
			return <DataTableColumnHeader column={column} title="Duration" />;
		},
		cell: ({ row }): React.JSX.Element => {
			const duration = row.original.duration;
			return <span className="text-nowrap text-right">{duration.toFixed(2)} ms</span>;
		},
	},
	{
		accessorKey: "count",
		header: ({ column }): React.JSX.Element => {
			return <DataTableColumnHeader column={column} title="Count" />;
		},
	},
	{
		accessorKey: "created_at",
		header: ({ column }): React.JSX.Element => {
			return <DataTableColumnHeader column={column} title="Date" />;
		},
		cell: ({ row }): React.JSX.Element => {
			const date = new Date(row.original.created_at);
			return <span>{date.toLocaleDateString()}</span>;
		},
	},
	{
		id: "actions",
		cell: ({ row }): React.JSX.Element => {
			const _row = row.original;

			return (
				<Button
					variant="ghost"
					size={"sm"}
					onClick={(): void => {
						void navigator.clipboard.writeText(_row.command);
						toast.success("Copied to clipboard!");
					}}
					className="h-8 w-8 p-0"
					title="Copy command"
					aria-label="Copy command">
					<CopyIcon className="h-4 w-4" />
				</Button>
			);
		},
	},
];

export default function HomeTable(): React.JSX.Element {
	const { resolvedTheme } = useTheme();
	const [date, setDate] = useState<Date | undefined>(new Date());
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<UserDataLogModel[]>([]);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [startDate, setStartDate] = useState<Date>(new Date());
	const table = useReactTable<HomeTableProps>({
		columns,
		data,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
		},
	});

	useEffect(() => {
		void getLogsData(date).then((data) => {
			setData(data);
			setLoading(false);
		});
	}, [date]);

	useEffect(() => {
		void getStartDate().then((data) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
			const date = new Date(data);
			setStartDate(date);
		});
	}, []);

	if (loading) {
		return (
			<>
				<div className="flex w-full items-center justify-between py-4">
					<Skeleton className="h-10 w-1/2 sm:w-1/4" />
					<Skeleton className="h-10 w-20 sm:w-1/6" />
				</div>
				<div className="w-full rounded-md border">
					<Skeleton className="flex w-full flex-col gap-2 p-4">
						<Skeleton className="mb-3 h-12 w-full bg-muted-foreground/30" />
						{Array.from({ length: 10 }).map((_, i) => (
							<Skeleton className="h-10 w-full bg-muted-foreground/30" key={i} />
						))}
					</Skeleton>
				</div>
			</>
		);
	}

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
			<div className="flex items-center gap-1 py-4 sm:gap-4">
				<Input
					placeholder="Filter commands..."
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					value={(table.getColumn("command")?.getFilterValue() as string) ?? ""}
					onChange={(event): void => table.getColumn("command")?.setFilterValue(event.target.value)}
					className="max-w-sm"
				/>
				<DatePicker date={date} setDate={setDate} start={startDate} />
				<DataTableViewOptions table={table} />
			</div>
			<div className="w-full rounded-md border">
				<DataTablePagination table={table} />
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell className="text-center" key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</>
	);
}
