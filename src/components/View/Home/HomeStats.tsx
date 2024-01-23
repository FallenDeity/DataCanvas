/* eslint-disable @typescript-eslint/no-unnecessary-condition */
"use client";

import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { CgArrowsExchangeAltV } from "react-icons/cg";
import { FiDatabase } from "react-icons/fi";
import { RiTimerLine } from "react-icons/ri";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import getLogs from "@/app/actions/getLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DatabaseLogModel, UserLogModel } from "@/lib/models";

interface HomeStatsProps {
	size: {
		current: string;
		difference: string;
	};
	api_requests: {
		total: number;
		difference: string;
	};
	latency: {
		total: number;
		difference: string;
	};
}

export default function HomeStats(): React.JSX.Element {
	const { resolvedTheme } = useTheme();
	const stroke = resolvedTheme === "dark" ? "#7e0cf0" : "#6579fc";
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState<HomeStatsProps | null>(null);
	const [logs, setLogs] = useState<{
		user_logs: { logs: UserLogModel[] };
		database_logs: DatabaseLogModel[];
	} | null>(null);

	const percFinder = (latest: number, previous: number): string => {
		const perc_diff = (latest - previous) / (previous || 1);
		const perc = previous === 0 ? perc_diff : perc_diff * 100;
		return (perc > 0 ? `+${perc.toFixed(2)}%` : `${perc.toFixed(2)}%`) + " from yesterday";
	};

	useEffect(() => {
		void getLogs(new Date()).then((data) => {
			setLogs(data);
			setLoading(false);
		});
	}, []);

	useEffect(() => {
		if (!logs) return;
		const latest_db_log = logs.database_logs[logs.database_logs.length - 1];
		const previous_db_log = logs.database_logs[logs.database_logs.length - 2] || { database_size: 0 };
		const diff_str = percFinder(
			latest_db_log.database_size / 1024 / 1024,
			previous_db_log.database_size / 1024 / 1024
		);
		const u_logs = logs.user_logs.logs;
		const latest_req = u_logs.length > 0 ? u_logs[0].total.reduce((acc, curr) => acc + curr, 0) : 0;
		const previous_req = u_logs.length > 1 ? u_logs[1].total.reduce((acc, curr) => acc + curr, 0) : 0;
		const req_diff_str = percFinder(latest_req, previous_req);
		const latest_lat =
			u_logs.length > 0
				? u_logs[0].durations.reduce((acc, curr) => acc + curr, 0) / u_logs[0].durations.length
				: 0;
		const previous_lat =
			u_logs.length > 1
				? u_logs[1].durations.reduce((acc, curr) => acc + curr, 0) / u_logs[1].durations.length
				: 0;
		const lat_diff_str = percFinder(latest_lat, previous_lat);
		setStats({
			size: {
				current: (latest_db_log.database_size / 1024 / 1024).toFixed(2),
				difference: diff_str,
			},
			api_requests: {
				total: latest_req,
				difference: req_diff_str,
			},
			latency: {
				total: latest_lat,
				difference: lat_diff_str,
			},
		});
	}, [logs]);

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{loading || !logs || !stats ? (
				<>
					{Array.from({ length: 3 }).map((_, i) => (
						<Skeleton className="flex h-36 w-full flex-col gap-2 p-4" key={i}>
							<div className="flex h-8 w-full flex-row items-center justify-between">
								<Skeleton className="h-4 w-1/2 bg-muted-foreground/40" />
								<Skeleton className="h-8 w-8 rounded bg-muted-foreground/40" />
							</div>
							<div className="mt-4 flex h-full w-full flex-col items-start justify-center gap-2">
								<Skeleton className="h-6 w-full bg-muted-foreground/40" />
								<Skeleton className="h-4 w-2/3 bg-muted-foreground/40" />
							</div>
						</Skeleton>
					))}
				</>
			) : (
				<>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-2">
							<CardTitle className="text-lg font-medium">Database Size</CardTitle>
							<FiDatabase className="h-5 w-5 text-muted-foreground" />
						</CardHeader>
						<CardContent className="p-4 pt-3">
							<div className="flex w-full flex-row items-center justify-between">
								<div className="flex flex-col items-start justify-center">
									<div className="text-2xl font-bold">{stats.size.current} MB</div>
									<p className="mt-1 text-xs text-muted-foreground">{stats.size.difference}</p>
								</div>
								<ResponsiveContainer width="50%" height={80}>
									<AreaChart
										data={(logs.database_logs.length === 1 ? [{ name: 0, size: 0 }] : []).concat(
											logs.database_logs.map((log, i) => ({
												name: i,
												size: log.database_size,
											}))
										)}>
										<defs>
											<linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor={stroke} stopOpacity={0.8} />
												<stop offset="100%" stopColor={stroke} stopOpacity={0} />
											</linearGradient>
										</defs>
										<Area
											type="monotone"
											dataKey="size"
											stroke={stroke}
											fillOpacity={1}
											fill="url(#colorUv)"
										/>
									</AreaChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-2">
							<CardTitle className="text-lg font-medium">API Requests</CardTitle>
							<CgArrowsExchangeAltV className="h-5 w-5 text-muted-foreground" />
						</CardHeader>
						<CardContent className="p-4 pt-3">
							<div className="flex w-full flex-row items-center justify-between">
								<div className="flex flex-col items-start justify-center">
									<div className="text-2xl font-bold">
										{new Intl.NumberFormat().format(stats.api_requests.total)}
									</div>
									<p className="mt-1 text-xs text-muted-foreground">
										{stats.api_requests.difference}
									</p>
								</div>
								<ResponsiveContainer width="50%" height={80}>
									<AreaChart
										data={(logs.user_logs.logs.length > 0
											? logs.user_logs.logs[0].total
											: [0, 0]
										).map((log, i) => ({
											name: i,
											total: log,
										}))}>
										<defs>
											<linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor={stroke} stopOpacity={0.8} />
												<stop offset="100%" stopColor={stroke} stopOpacity={0} />
											</linearGradient>
										</defs>
										<Area
											type="monotone"
											dataKey="total"
											stroke={stroke}
											fillOpacity={1}
											fill="url(#colorUv)"
										/>
									</AreaChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-2">
							<CardTitle className="text-lg font-medium">Latency</CardTitle>
							<RiTimerLine className="h-5 w-5 text-muted-foreground" />
						</CardHeader>
						<CardContent className="p-4 pt-3">
							<div className="flex w-full flex-row items-center justify-between">
								<div className="flex flex-col items-start justify-center">
									<div className="text-2xl font-bold">{stats.latency.total.toFixed(2)} ms</div>
									<p className="mt-1 text-xs text-muted-foreground">{stats.latency.difference}</p>
								</div>
								<ResponsiveContainer width="50%" height={80}>
									<AreaChart
										data={(logs.user_logs.logs.length > 0
											? logs.user_logs.logs[0].durations
											: [0, 0]
										).map((log, i) => ({
											name: i,
											total: log,
										}))}>
										<defs>
											<linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor={stroke} stopOpacity={0.8} />
												<stop offset="100%" stopColor={stroke} stopOpacity={0} />
											</linearGradient>
										</defs>
										<Area
											type="monotone"
											dataKey="total"
											stroke={stroke}
											fillOpacity={1}
											fill="url(#colorUv)"
										/>
									</AreaChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}
