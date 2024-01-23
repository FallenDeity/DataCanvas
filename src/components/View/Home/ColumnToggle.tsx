"use client";

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Table } from "@tanstack/react-table";
import { RxMixerHorizontal } from "react-icons/rx";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface DataTableViewOptionsProps<TData> {
	table: Table<TData>;
}

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>): React.JSX.Element {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="ml-auto flex h-10">
					<RxMixerHorizontal className="mr-2 h-4 w-4" />
					View
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[150px]">
				<DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{table
					.getAllColumns()
					.filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
					.map((column) => {
						return (
							<DropdownMenuCheckboxItem
								key={column.id}
								className="capitalize"
								checked={column.getIsVisible()}
								onCheckedChange={(value): void => column.toggleVisibility(!!value)}>
								{column.id}
							</DropdownMenuCheckboxItem>
						);
					})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
