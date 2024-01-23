"use client";

import { DiamondIcon, Fingerprint, Hash, Key, Table2 } from "lucide-react";
import { useTheme } from "next-themes";
import React from "react";
import { Handle, NodeProps } from "reactflow";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TableNodeData } from "@/lib/models";
import { cn, stringToColor } from "@/lib/utils";

const TABLE_NODE_WIDTH = 320;
const TABLE_NODE_ROW_HEIGHT = 40;
const FORMAT_MAP: Record<string, string> = {
	name: "name",
	smallint: "int2",
	inet: "inet",
	boolean: "bool",
	numeric: "numeric",
	regproc: "regproc",
	"timestamp with time zone": "timestamptz",
	bigint: "int8",
	pg_dependencies: "pg_dependencies",
	xid: "xid",
	char: "char",
	"timestamp without time zone": "timestamp",
	"character varying": "varchar",
	pg_lsn: "pg_lsn",
	interval: "interval",
	pg_node_tree: "pg_node_tree",
	text: "text",
	anyarray: "anyarray",
	regtype: "regtype",
	"double precision": "float8",
	ARRAY: "array",
	pg_ndistinct: "pg_ndistinct",
	uuid: "uuid",
	pg_mcv_list: "pg_mcv_list",
	bytea: "bytea",
	integer: "int4",
	real: "float4",
	oid: "oid",
};

const TableNode = ({ data, targetPosition, sourcePosition }: NodeProps<TableNodeData>): React.JSX.Element => {
	const { resolvedTheme } = useTheme();
	const hiddenNodeConnector = "!h-px !w-px !min-w-0 !min-h-0 !cursor-grab !border-0 !opacity-0";
	const itemHeight = "h-[22px]";
	return (
		<>
			{data.isForeign ? (
				<header
					style={{ background: stringToColor(data.name, resolvedTheme === "dark" ? "dark" : "light") }}
					className="flex items-center gap-1 rounded-[4px] border-[0.5px] px-2 py-1 text-[0.55rem] text-accent-foreground">
					{`${data.schema}.${data.name}`}
					{targetPosition && (
						<Handle
							type="target"
							id={`${data.schema}.${data.name}`}
							position={targetPosition}
							className={cn(hiddenNodeConnector)}
						/>
					)}
				</header>
			) : (
				<div
					className="overflow-hidden rounded-[4px] border-[0.5px] shadow-sm"
					style={{ width: TABLE_NODE_WIDTH / 2 }}>
					<header
						style={{ background: stringToColor(data.name, resolvedTheme === "dark" ? "dark" : "light") }}
						className={cn(
							"flex items-center gap-1 px-2 text-[0.50rem] text-accent-foreground",
							itemHeight
						)}>
						<Table2 strokeWidth={1} size={12} className="text-light" />
						{`${data.schema}.${data.name}`}
					</header>

					{data.columns.map((column) => (
						<div
							className={cn(
								"relative flex flex-row justify-items-start text-[8px] leading-5",
								"bg-background",
								"border-t",
								"border-t-[0.5px]",
								"cursor-pointer transition hover:bg-accent",
								itemHeight
							)}
							key={column.id}>
							<div className="mx-2 flex basis-1/5 items-center justify-start gap-[0.24rem] align-middle">
								{column.isPrimary && (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<Key
													size={8}
													strokeWidth={2}
													className={cn("flex-shrink-0", "text-amber-500")}
												/>
											</TooltipTrigger>
											<TooltipContent className="p-1.5">
												<p className="text-xs">PRIMARY KEY</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								)}
								{column.isNullable && (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<DiamondIcon
													size={8}
													strokeWidth={1}
													className="flex-shrink-0 text-cyan-500"
												/>
											</TooltipTrigger>
											<TooltipContent className="p-1.5">
												<p className="text-xs">NULL</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								)}
								{!column.isNullable && (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<DiamondIcon
													size={8}
													strokeWidth={1}
													fill="currentColor"
													className="flex-shrink-0 text-cyan-500"
												/>
											</TooltipTrigger>
											<TooltipContent className="p-1.5">
												<p className="text-xs">NOT NULL</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								)}
								{column.isUnique && (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<Fingerprint
													size={8}
													strokeWidth={2}
													className="flex-shrink-0 text-emerald-400"
												/>
											</TooltipTrigger>
											<TooltipContent className="p-1.5">
												<p className="text-xs">UNIQUE</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								)}
								{column.isIdentity && (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<Hash
													size={8}
													strokeWidth={2}
													className="flex-shrink-0 text-rose-600"
												/>
											</TooltipTrigger>
											<TooltipContent className="p-1.5">
												<p className="text-xs">IDENTITY</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								)}
							</div>
							<div className="flex w-full justify-between">
								<span className="overflow-hidden text-ellipsis whitespace-nowrap">{column.name}</span>
								<span className="inline-flex justify-end px-2 font-mono text-[0.4rem] text-muted-foreground">
									{FORMAT_MAP[column.format] || column.type_name}
								</span>
							</div>
							{targetPosition && (
								<Handle
									type="target"
									id={column.id}
									position={targetPosition}
									className={cn(hiddenNodeConnector, "!left-0")}
								/>
							)}
							{sourcePosition && (
								<Handle
									type="source"
									id={column.id}
									position={sourcePosition}
									className={cn(hiddenNodeConnector, "!right-0")}
								/>
							)}
						</div>
					))}
				</div>
			)}
		</>
	);
};

export { FORMAT_MAP, TABLE_NODE_ROW_HEIGHT, TABLE_NODE_WIDTH, TableNode };
