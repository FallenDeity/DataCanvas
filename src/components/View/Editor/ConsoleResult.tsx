import React from "react";
import { MdOutlineCheck, MdWarning } from "react-icons/md";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Result {
	command: string;
	rows: Record<string, string | null>[] | undefined;
	error?: string;
}

export default function ConsoleResult({
	result,
	duration,
}: {
	result: Result | undefined;
	duration: number;
}): React.JSX.Element {
	return (
		<>
			{result?.error && (
				<div className="flex h-full w-full flex-col px-4">
					<Alert className="bg-background" variant="destructive">
						<MdWarning className="h-4 w-4" />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{result.error}</AlertDescription>
					</Alert>
				</div>
			)}
			{result?.rows && result.rows.length === 0 && !result.error && result.command && (
				<div className="flex h-full w-full flex-col px-4">
					<Alert className="bg-white dark:bg-background" variant="success">
						<MdOutlineCheck className="h-4 w-4" />
						<AlertTitle>Success</AlertTitle>
						<AlertDescription>Ran Command: {result.command}</AlertDescription>
					</Alert>
				</div>
			)}
			{result?.rows && result.rows.length !== 0 && (
				<div className="flex h-full w-full flex-col">
					<Table>
						<TableCaption>
							{result.command} ({result.rows.length} rows returned in {duration}ms)
						</TableCaption>
						<TableHeader>
							<TableRow>
								{Object.keys(result.rows[0]).map((key) => (
									<TableHead className="text-center uppercase" key={key}>
										{key}
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{result.rows.map((row, i) => (
								<TableRow key={i}>
									{Object.values(row).map((value, j) => (
										<TableCell
											className="max-w-56 truncate text-center hover:max-w-none hover:!truncate"
											key={`${i}-${j}`}>
											{value ?? "NULL"}
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</>
	);
}
