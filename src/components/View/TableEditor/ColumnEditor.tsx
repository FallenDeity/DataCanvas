"use client";

import { LinkIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { IoOptionsOutline, IoSettingsOutline } from "react-icons/io5";
import { LuDot } from "react-icons/lu";
import { RxCross2 } from "react-icons/rx";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Combobox from "@/components/ui/comboBox";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PostgresConstraints, PostgresDefaultValues, PostgresTypes } from "@/lib/constants";
import { PostgresColumn, PostgresTable, TableModel } from "@/lib/models";

export default function ColumnEditor({
	idx,
	tables = [],
	setQuery,
	column = undefined,
	columnTable = undefined,
}: {
	idx: string;
	tables?: PostgresTable[];
	setQuery: React.Dispatch<React.SetStateAction<Record<string, string>>>;
	columnTable?: PostgresTable | TableModel;
	column?: PostgresColumn;
}): React.JSX.Element {
	const [name, setName] = useState(column ? column.name : "");
	const [type, setType] = useState(column ? column.type_name : "");
	const [defaultVal, setDefaultVal] = useState(column ? column.default_value ?? "" : "");
	const parsedConstraints = useMemo<string[]>(() => {
		const _constraints = [];
		if (!column) return [];
		if (!column.is_nullable) _constraints.push("NOT NULL");
		if (column.is_identity) _constraints.push("IDENTITY");
		if (column.is_primary_key) _constraints.push("PRIMARY KEY");
		if (!column.is_primary_key && column.is_unique) _constraints.push("UNIQUE");
		return _constraints;
	}, [column]);
	const parsedRelation = useMemo<{ table?: PostgresTable; column?: string }>(() => {
		if (!columnTable || !column) return {};
		for (const relation of columnTable.relationships) {
			if (relation.target_column_name === column.name) {
				const _table = tables.find((t) => t.id === relation.source_table_name);
				return { table: _table, column: relation.source_column_name };
			}
		}
		return {};
	}, [columnTable]);
	const [constraints, setConstraints] = useState<string[]>(parsedConstraints);
	const [table, setTable] = useState<PostgresTable | undefined>();
	const [errors, setErrors] = useState<Set<string>>(new Set());
	const [foreignColumn, setForeignColumn] = useState<string | undefined>();

	useEffect(() => {
		setTable(undefined);
	}, [type]);

	useEffect(() => {
		setErrors(new Set());
		if (name === "") {
			setErrors((prev) => new Set([...prev, "Column name cannot be empty"]));
		} else {
			setErrors((prev) => new Set([...prev].filter((error) => error !== "Column name cannot be empty")));
		}
		if (!name.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
			setErrors((prev) => new Set([...prev, "Column name is not a valid identifier"]));
		} else {
			setErrors(
				(prev) => new Set([...prev].filter((error) => error !== "Column name is not a valid identifier"))
			);
		}
		if (type === "") {
			setErrors((prev) => new Set([...prev, "Column type cannot be empty"]));
		} else {
			setErrors((prev) => new Set([...prev].filter((error) => error !== "Column type cannot be empty")));
		}
	}, [name, type, constraints, defaultVal, foreignColumn]);

	useEffect(() => {
		if (errors.size !== 0) return;
		if (columnTable && column) {
			let query = "";
			if (
				parsedRelation.table &&
				parsedRelation.column &&
				table &&
				foreignColumn &&
				(parsedRelation.table.name !== table.name || parsedRelation.column !== foreignColumn)
			) {
				query += `ALTER TABLE ${columnTable.name} DROP CONSTRAINT ${columnTable.name}_${column.name}_fkey;`;
				query += `ALTER TABLE ${columnTable.name} ADD CONSTRAINT ${columnTable.name}_${column.name}_fkey REFERENCES ${table.name}(${foreignColumn});`;
			}
			if (column.name !== name) {
				query += `ALTER TABLE ${columnTable.name} RENAME COLUMN ${column.name} TO ${name};`;
			}
			const _is_array = constraints.includes("ARRAY");
			if (column.type_name !== type) {
				query += `ALTER TABLE ${columnTable.name} ALTER COLUMN ${name} TYPE ${type}${_is_array ? "[]" : ""};`;
			}
			if ((column.default_value ?? "") !== defaultVal) {
				query += `ALTER TABLE ${columnTable.name} ALTER COLUMN ${name} SET DEFAULT '${defaultVal}';`;
			}
			if (parsedConstraints.includes("NOT NULL") && !constraints.includes("NOT NULL")) {
				query += `ALTER TABLE ${columnTable.name} ALTER COLUMN ${name} DROP NOT NULL;`;
			} else if (!parsedConstraints.includes("NOT NULL") && constraints.includes("NOT NULL")) {
				query += `ALTER TABLE ${columnTable.name} ALTER COLUMN ${name} SET NOT NULL;`;
			}
			if (parsedConstraints.includes("IDENTITY") && !constraints.includes("IDENTITY")) {
				query += `ALTER TABLE ${columnTable.name} ALTER COLUMN ${name} DROP IDENTITY;`;
			} else if (!parsedConstraints.includes("IDENTITY") && constraints.includes("IDENTITY")) {
				query += `ALTER TABLE ${columnTable.name} ALTER COLUMN ${name} ADD GENERATED BY DEFAULT AS IDENTITY;`;
			}
			if (parsedConstraints.includes("PRIMARY KEY") && !constraints.includes("PRIMARY KEY")) {
				query += `ALTER TABLE ${columnTable.name} DROP CONSTRAINT ${columnTable.name}_pkey;`;
			} else if (!parsedConstraints.includes("PRIMARY KEY") && constraints.includes("PRIMARY KEY")) {
				query += `ALTER TABLE ${columnTable.name} ADD PRIMARY KEY (${name});`;
			}
			if (parsedConstraints.includes("UNIQUE") && !constraints.includes("UNIQUE")) {
				query += `ALTER TABLE ${columnTable.name} DROP CONSTRAINT ${columnTable.name}_${column.name}_key;`;
			} else if (!parsedConstraints.includes("UNIQUE") && constraints.includes("UNIQUE")) {
				query += `ALTER TABLE ${columnTable.name} ADD CONSTRAINT ${columnTable.name}_${column.name}_key UNIQUE (${name});`;
			}
			if (query !== "") setQuery((prev) => ({ ...prev, [idx]: query }));
			return;
		}
		const _filtered = constraints.includes("PRIMARY KEY")
			? constraints.filter(
					(constraint) =>
						Object.values(PostgresConstraints).find((c) => c.value === constraint)?.primary_allowed
			  )
			: constraints;
		const _is_array = constraints.includes("ARRAY");
		const _constraints = (_filtered.length > 0 ? _filtered.join(" ") : "")
			.replace("IDENTITY", "GENERATED BY DEFAULT AS IDENTITY")
			.replace("ARRAY", "");
		const _defaultVal = defaultVal.length > 0 ? `DEFAULT '${defaultVal}'` : "";
		const _foreign = foreignColumn && table ? `REFERENCES ${table.name}(${foreignColumn})` : "";
		const _query = `${name} ${type}${_is_array ? "[]" : ""} ${_constraints} ${_defaultVal} ${_foreign}`;
		if (columnTable && name && type) {
			setQuery((prev) => ({ ...prev, [idx]: `ALTER TABLE ${columnTable.name} ADD COLUMN ${_query};` }));
		} else if (!columnTable) setQuery((prev) => ({ ...prev, [idx]: _query }));
	}, [errors]);

	return (
		<div className="flex w-full flex-row items-center justify-between rounded-md px-2 py-2 hover:bg-secondary/40">
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
				<div className="flex flex-row items-center justify-center gap-2">
					<Input
						value={name}
						className="h-8 w-full"
						placeholder="Column Name"
						onInput={(e): void => setName(e.currentTarget.value.trim().replace("\t", ""))}
					/>
				</div>
				<Combobox value={type} setValue={setType} items={PostgresTypes} type="Type" />
				<div className="relative flex flex-row items-center justify-center gap-2">
					<Input
						value={defaultVal}
						className="h-8 w-full"
						placeholder="Default"
						onInput={(e): void => setDefaultVal(e.currentTarget.value.trim().replace("\t", ""))}
					/>
					<HoverCard>
						<HoverCardTrigger>
							<IoOptionsOutline
								className={`absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 transform cursor-pointer ${
									type.length > 0 ? "opacity-100" : "opacity-0"
								}`}
							/>
						</HoverCardTrigger>
						<HoverCardContent side="bottom" className="p-2">
							<h1 className="text-md font-semibold text-foreground">Default Values</h1>
							<Separator className="my-2" />
							{(type.length > 0
								? PostgresDefaultValues[type]
								: [{ value: "NULL", description: "Set the default value to NULL" }]
							).map((item) => (
								<div
									className="flex cursor-pointer flex-row items-center justify-between rounded-md p-1 hover:bg-foreground/10"
									onClick={(): void => setDefaultVal(item.value)}>
									<span className="text-foreground/80">{item.value}</span>
									<span className="w-3/4 text-right text-xs text-foreground/50">
										{item.description}
									</span>
								</div>
							))}
						</HoverCardContent>
					</HoverCard>
				</div>
				<div className="flex w-full flex-row items-center justify-between gap-2">
					<Popover>
						<PopoverTrigger asChild>
							<Button className="h-8 w-full p-1">
								<LinkIcon className="h-4 w-4" />
							</Button>
						</PopoverTrigger>
						<PopoverContent side="bottom" className="p-2 pb-4">
							<h1 className="text-md text-center font-semibold text-foreground">Foreign Keys</h1>
							<Separator className="mb-4 mt-2" />
							{type.length > 0 ? (
								<Select onValueChange={(value): void => setTable(tables.find((t) => t.name === value))}>
									<SelectTrigger className="w-full">
										{parsedRelation.table ? (
											<SelectValue placeholder={parsedRelation.table.name} />
										) : (
											<SelectValue placeholder="Select a Table" />
										)}
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{tables.map((table) => (
												<SelectItem value={table.name}>{table.name}</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							) : (
								<span className="text-center text-xs text-foreground/50">Select a type first</span>
							)}
							{!table && parsedRelation.table && (
								<Select onValueChange={(value): void => setForeignColumn(value)}>
									<SelectTrigger className="mt-4 w-full">
										{parsedRelation.column ? (
											<SelectValue placeholder={parsedRelation.column} />
										) : (
											<SelectValue placeholder="Select a Column" />
										)}
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{parsedRelation.table.columns
												.filter((column) => column.type_name === type)
												.map((column) => (
													<SelectItem value={column.name}>{column.name}</SelectItem>
												))}
										</SelectGroup>
									</SelectContent>
								</Select>
							)}

							{table && (
								<Select onValueChange={(value): void => setForeignColumn(value)}>
									<SelectTrigger className="mt-4 w-full">
										<SelectValue placeholder="Select a Column" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{table.columns
												.filter((column) => column.type_name === type)
												.map((column) => (
													<SelectItem value={column.name}>{column.name}</SelectItem>
												))}
										</SelectGroup>
									</SelectContent>
								</Select>
							)}
						</PopoverContent>
					</Popover>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant={"outline"}
								className="flex h-8 w-full flex-row items-center justify-center gap-2 p-1">
								<IoSettingsOutline className="h-4 w-4" />
							</Button>
						</PopoverTrigger>
						<PopoverContent side="bottom" className="p-2">
							<h1 className="text-md text-center font-semibold text-foreground">Constraints</h1>
							<Separator className="my-2" />
							{Object.values(PostgresConstraints)
								.filter((item) => (constraints.includes("ARRAY") ? item.array_allowed : true))
								.filter((item) => (constraints.includes("PRIMARY KEY") ? item.primary_allowed : true))
								.map((item) => (
									<div className="flex cursor-pointer flex-row items-center justify-between rounded-md p-1 hover:bg-foreground/10">
										<Checkbox
											checked={constraints.includes(item.value)}
											onCheckedChange={(e): void =>
												e
													? setConstraints([...constraints, item.value])
													: setConstraints(constraints.filter((c) => c !== item.value))
											}
										/>
										<div className="flex w-full flex-col justify-center text-right">
											<span className="text-sm text-foreground/80">{item.value}</span>
											<span className="text-xs text-foreground/50">{item.description}</span>
										</div>
									</div>
								))}
						</PopoverContent>
					</Popover>
				</div>
			</div>
			<div className="flex flex-row items-center justify-center gap-2">
				<HoverCard>
					<HoverCardTrigger>
						<Button
							variant="none"
							className="relative h-8 w-8 p-1"
							onClick={(): void =>
								setQuery((prev) => {
									if (columnTable && column) {
										return {
											...prev,
											[idx]: `ALTER TABLE ${columnTable.name} DROP COLUMN ${column.name};`,
										};
									}
									const newQuery = { ...prev };
									// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
									delete newQuery[idx];
									return newQuery;
								})
							}>
							<RxCross2 className="h-4 w-4" />
							{errors.size > 0 && (
								<div className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />
							)}
						</Button>
					</HoverCardTrigger>
					<HoverCardContent side="bottom" className="flex flex-col p-2">
						<h1 className="text-md text-center font-semibold text-foreground">Errors</h1>
						<Separator className="my-2" />
						{errors.size !== 0 ? (
							Array.from(new Set(errors)).map((error) => (
								<span className="flex flex-row items-center text-xs text-foreground/80">
									<LuDot className="mr-1 h-6 w-6" />
									{error}
								</span>
							))
						) : (
							<span className="text-center text-xs text-foreground/50">No errors</span>
						)}
					</HoverCardContent>
				</HoverCard>
			</div>
		</div>
	);
}
