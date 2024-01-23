"use client";

import Lottie from "lottie-react";
import React, { useEffect, useState } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useRecoilState } from "recoil";

import getTables from "@/app/actions/getTables";
import notFound from "@/assets/empty.json";
import { Skeleton } from "@/components/ui/skeleton";
import { TableModel } from "@/lib/models";

import { reloadAtom } from "./reloadAtom";
import TableCard from "./TableCard";

export default function TableView(): React.JSX.Element {
	const [reload, setReload] = useRecoilState(reloadAtom);
	const [tables, setTables] = useState<Record<string, TableModel>>({});
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		if (!reload && !isLoading) return;
		void (async (): Promise<void> => {
			const data = await getTables(new Date());
			setTables(data);
			setIsLoading(false);
			setReload(false);
		})();
	}, [reload]);

	if (isLoading) {
		return (
			<div className="flex h-full w-full overflow-y-scroll p-6 scrollbar-hide">
				<ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 1100: 3 }} className="flex h-full w-full">
					<Masonry gutter="1.5rem">
						{Array.from({ length: 15 }).map((_, i) => (
							<Skeleton className="flex w-full flex-col p-3" key={i}>
								<div className="flex w-full flex-row items-center">
									<Skeleton className="h-12 w-12 rounded-full bg-muted-foreground/30" />
									<Skeleton className="ml-4 h-8 w-36 bg-muted-foreground/30" />
								</div>
								<div className="mt-3 flex flex-col justify-center gap-2">
									{Array.from({ length: Math.floor(Math.max(Math.random() * 6, 2)) }).map((_, j) => (
										<Skeleton
											className="h-4 w-full rounded-md bg-muted-foreground/30"
											style={{ width: `${Math.floor(Math.min(Math.random() * 100 + 30, 100))}%` }}
											key={i + j}
										/>
									))}
								</div>
							</Skeleton>
						))}
					</Masonry>
				</ResponsiveMasonry>
			</div>
		);
	}

	return (
		<>
			{Object.keys(tables).length > 0 ? (
				<div className="flex h-full w-full overflow-y-scroll p-6 scrollbar-hide">
					<ResponsiveMasonry
						columnsCountBreakPoints={{ 350: 1, 750: 2, 1100: 3 }}
						className="flex h-full w-full">
						<Masonry gutter="1.5rem">
							{Object.keys(tables).map((key) => (
								<TableCard key={key} data={tables[key]} />
							))}
							{Array.from({ length: 3 }).map((_, i) => (
								<div className="flex h-64 w-64 border border-transparent" key={i} />
							))}
						</Masonry>
					</ResponsiveMasonry>
				</div>
			) : (
				<div className="flex h-full w-full flex-col items-center justify-center">
					<div className="flex flex-col items-center justify-center">
						<Lottie animationData={notFound} loop className="h-64 w-64 opacity-90 dark:opacity-70" />
						<p className="text-md text-center font-semibold">Create a table to get started</p>
					</div>
				</div>
			)}
		</>
	);
}
