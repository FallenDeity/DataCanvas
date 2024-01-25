import { Table } from "@tanstack/react-table";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon as DoubleArrowLeftIcon,
	ChevronsRightIcon as DoubleArrowRightIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
	table: Table<TData>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>): React.JSX.Element {
	return (
		<div className="flex w-full flex-row items-center justify-center p-2 sm:justify-between sm:px-4">
			<div className="hidden text-sm text-muted-foreground sm:flex">
				{table.getFilteredSelectedRowModel().rows.length} of {table.getState().pagination.pageSize} rows
				selected.
			</div>
			<div className="flex items-center space-x-6 lg:space-x-8">
				<div className="flex items-center sm:space-x-2">
					<p className="hidden text-sm font-medium sm:block">Rows per page</p>
					<Select
						value={`${table.getState().pagination.pageSize}`}
						onValueChange={(value): void => {
							table.setPageSize(Number(value));
						}}>
						<SelectTrigger aria-label={"pageSize"} className="h-8 w-[70px]">
							<SelectValue placeholder={table.getState().pagination.pageSize} />
						</SelectTrigger>
						<SelectContent side="top">
							{[5, 10, 20, 30, 40, 50].map((pageSize) => (
								<SelectItem key={pageSize} value={`${pageSize}`}>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex items-center justify-center text-sm font-medium sm:w-[100px]">
					Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={(): void => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}>
						<span className="sr-only">Go to first page</span>
						<DoubleArrowLeftIcon className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="h-8 w-8 p-0"
						onClick={(): void => table.previousPage()}
						disabled={!table.getCanPreviousPage()}>
						<span className="sr-only">Go to previous page</span>
						<ChevronLeftIcon className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="h-8 w-8 p-0"
						onClick={(): void => table.nextPage()}
						disabled={!table.getCanNextPage()}>
						<span className="sr-only">Go to next page</span>
						<ChevronRightIcon className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={(): void => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}>
						<span className="sr-only">Go to last page</span>
						<DoubleArrowRightIcon className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
