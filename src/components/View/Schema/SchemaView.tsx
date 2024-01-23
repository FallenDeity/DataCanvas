"use client";

import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { HashLoader } from "react-spinners";

import getSchema from "@/app/actions/getSchema";
import { PostgresTable } from "@/lib/models";

import SchemeGraph from "./SchemeGraph";

export default function SchemaView(): React.JSX.Element {
	const date = new Date();
	const { resolvedTheme } = useTheme();
	const [tables, setTables] = useState<PostgresTable[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		void (async (): Promise<void> => {
			const data = await getSchema(date);
			setTables(data);
			setIsLoading(false);
		})();
	}, []);

	if (isLoading) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<HashLoader className="h-32 w-32" color={resolvedTheme === "dark" ? "#5f05e6" : "#89a2fa"} />
			</div>
		);
	}

	return <SchemeGraph tables={tables} />;
}
