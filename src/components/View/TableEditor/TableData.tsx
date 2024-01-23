"use client";

import {
	Column,
	ColumnDef,
	ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	Row,
	SortingState,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";
import { DownloadIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { IoFilter } from "react-icons/io5";

import getResult from "@/app/actions/getResult";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PostgresTable } from "@/lib/models";

import { DataTableColumnHeader } from "../Home/ColumnHeader";
import { DataTableViewOptions } from "../Home/ColumnToggle";
import { DataTablePagination } from "../Home/TablePagination";

export default function TableData({ table }: { table: PostgresTable }): React.JSX.Element {
	const [data, setData] = useState<Record<string, unknown>[]>([]);
	const [filter, setFilter] = useState<string>(table.columns[0].name);
	const [loading, setLoading] = useState<boolean>(true);
	const [columns, setColumns] = useState<ColumnDef<Record<string, unknown>>[]>([]);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const _table = useReactTable<Record<string, unknown>>({
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
	const cleanName = (name: string): string => {
		return name.replace(/_/g, " ").replace(/(?:^|\s)\S/g, function (a) {
			return a.toUpperCase();
		});
	};
	const downloadTable = (): void => {
		const _columns = table.columns.map((col) => col.name).join(",");
		const csv = [`${_columns}`].concat(
			data.map((row) => {
				let _row = "";
				for (const value of Object.values(row)) {
					const _filtered = String(value).replace(/\n/g, " ").replace(/\t/g, " ").replace(/\s+/g, " ");
					_row += `"${_filtered}",`;
				}
				return _row;
			})
		);
		const blob = new Blob([csv.join("\r\n")], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.setAttribute("hidden", "");
		a.setAttribute("href", url);
		a.setAttribute("download", `${table.name}.csv`);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	useEffect(() => {
		void getResult(`SELECT * FROM ${table.name}`, new Date()).then((res) => {
			setData(res.rows);
			setLoading(false);
		});
	}, [table]);

	useEffect(() => {
		const cols = table.columns.map((col) => ({
			header: ({ column }: { column: Column<Record<string, unknown>> }): React.JSX.Element => {
				return <DataTableColumnHeader column={column} title={cleanName(col.name)} />;
			},
			accessorKey: col.name,
			cell: ({ row }: { row: Row<Record<string, unknown>> }): React.JSX.Element => {
				// @ts-expect-error {} is not assignable to react element
				return <span className="line-clamp-1">{row.original[col.name] || "NULL"}</span>;
			},
		}));
		setColumns(cols);
	}, [table]);

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
			<div className="flex h-full w-full items-center justify-between gap-2 py-4">
				<div className="flex items-center gap-2">
					<Input
						placeholder={`Filter ${filter}'s`}
						// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
						value={(_table.getColumn(filter)?.getFilterValue() as string) ?? ""}
						onChange={(event): void => _table.getColumn(filter)?.setFilterValue(event.target.value)}
						className="max-w-sm"
					/>
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" className="h-10 w-10 p-1">
								<IoFilter className="h-4 w-4" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-48 p-2">
							<Command>
								<CommandInput className="py-1" placeholder="Search filters..." />
								<CommandEmpty>No filters found.</CommandEmpty>
								<CommandGroup className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-track-secondary scrollbar-thumb-muted-foreground">
									{table.columns.map((col) => (
										<CommandItem
											key={col.name}
											value={col.name}
											className="cursor-pointer"
											onSelect={(value): void => setFilter(value)}>
											{cleanName(col.name)}
										</CommandItem>
									))}
								</CommandGroup>
							</Command>
						</PopoverContent>
					</Popover>
				</div>
				<div className="flex items-center gap-2">
					<DataTableViewOptions table={_table} />
					<Button variant="outline" onClick={downloadTable} className="h-10 w-10 p-1">
						<DownloadIcon className="h-4 w-4" />
					</Button>
				</div>
			</div>
			<div className="w-full rounded-md border">
				<DataTablePagination table={_table} />
				<Table>
					<TableHeader>
						{_table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead className="min-w-56" key={header.id}>
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
						{_table.getRowModel().rows?.length ? (
							_table.getRowModel().rows.map((row) => (
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
