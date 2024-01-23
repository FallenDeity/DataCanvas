import { AvatarFallback } from "@radix-ui/react-avatar";
import { DiamondIcon, Fingerprint, Hash, Key, RowsIcon, ScaleIcon } from "lucide-react";
import { FaLink } from "react-icons/fa6";
import { IoMdInformation } from "react-icons/io";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TableModel } from "@/lib/models";
import { cn } from "@/lib/utils";

import { FORMAT_MAP } from "../Schema/TableSchema";
import TableSheet from "../TableEditor/TableSheet";

const cleanName = (name: string): string => name.replace(/_/g, " ").replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());

export default function TableCard({ data }: { data: TableModel }): React.JSX.Element {
	return (
		<Card className="h-fit w-full max-w-2xl">
			<CardHeader className="flex flex-row justify-between">
				<div className="flex w-full flex-col gap-1.5">
					<div className="flex items-center gap-3">
						<Avatar className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-50 dark:bg-slate-800">
							<AvatarImage src="" alt="Table avatar" />
							<AvatarFallback className="rounded-md uppercase">
								{cleanName(data.name).slice(0, 2)}
							</AvatarFallback>
						</Avatar>
						<CardTitle className="flex h-full w-full flex-col truncate tracking-normal">
							{cleanName(data.name)}
							<span className="mt-1 flex h-full text-xs font-normal leading-none tracking-wide text-muted-foreground">
								{cleanName(data.schema)}
							</span>
						</CardTitle>
						<TableSheet table={data} />
					</div>
					<CardDescription className="mt-4 flex w-full flex-col items-center justify-center gap-2">
						<Accordion className="w-full rounded-md border bg-background px-3" type="single" collapsible>
							<AccordionItem className="border-none" value="item-1">
								<AccordionTrigger className="py-3 text-foreground/60">Column Data</AccordionTrigger>
								<AccordionContent className="flex flex-col gap-2.5">
									{data.columns.map((column, i) => (
										<div className="flex flex-row items-center justify-between gap-2.5" key={i}>
											<div className="flex flex-row items-center gap-1.5">
												{column.is_primary_key && (
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
												{column.is_unique && (
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
												{column.is_identity && (
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
												{column.is_nullable && (
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
												{!column.is_nullable && (
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
												<div className="flex flex-row items-center gap-1.5">
													<span className="text-sm text-muted-foreground">{column.name}</span>
												</div>
											</div>
											<div className="flex flex-row items-center gap-1.5">
												<span className="text-xs text-muted-foreground/80">
													{FORMAT_MAP[column.format]}
												</span>
											</div>
										</div>
									))}
								</AccordionContent>
							</AccordionItem>
						</Accordion>
						<Accordion className="w-full rounded-md border bg-background px-3" type="single" collapsible>
							<AccordionItem className="border-none" value="item-2">
								<AccordionTrigger className="py-3 text-foreground/60">Indexes</AccordionTrigger>
								<AccordionContent className="flex flex-col gap-2.5">
									{data.indexes.map((index, i) => (
										<div className="flex flex-row items-center justify-between gap-2.5" key={i}>
											<div className="flex flex-row items-center gap-1">
												<IoMdInformation
													size={8}
													strokeWidth={2}
													className="h-4 w-4 flex-shrink-0 text-blue-500"
												/>
												<span className="text-sm text-muted-foreground">{index.name}</span>
											</div>
											<div className="flex flex-row items-center gap-1.5">
												<span className="text-xs text-muted-foreground/80">
													{index.columns.join(", ")}
												</span>
											</div>
										</div>
									))}
								</AccordionContent>
							</AccordionItem>
						</Accordion>
						<Accordion className="w-full rounded-md border bg-background px-3" type="single" collapsible>
							<AccordionItem className="border-none" value="item-3">
								<AccordionTrigger className="py-3 text-foreground/60">Relationships</AccordionTrigger>
								<AccordionContent className="flex flex-col gap-2.5">
									{data.relationships.map((relationship, i) => (
										<div className="flex flex-row items-center justify-between gap-2.5" key={i}>
											<div className="flex flex-row items-center gap-1">
												<FaLink
													size={8}
													strokeWidth={2}
													className="h-4 w-4 flex-shrink-0 text-pink-500"
												/>
												<span className="text-sm text-muted-foreground">
													{relationship.source_table_name}
												</span>
											</div>
											<div className="flex flex-row items-center gap-1.5">
												<span className="text-xs text-muted-foreground/80">
													{relationship.source_column_name}
												</span>
											</div>
										</div>
									))}
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</CardDescription>
				</div>
			</CardHeader>
			<div className="mb-4 flex flex-row items-center justify-between px-4">
				<Separator className="w-full" />
			</div>
			<CardContent className="flex flex-row items-center justify-evenly">
				<div className="flex flex-col items-center justify-center gap-1.5">
					<div className="flex flex-row items-center justify-center gap-1.5">
						<ScaleIcon className="h-5 w-5 text-muted-foreground" />
						<span className="text-sm text-muted-foreground">Size</span>
					</div>
					<span className="text-sm">{Math.round(data.size / 1000)} KB</span>
				</div>
				<Separator orientation="vertical" className="h-10" />
				<div className="flex flex-col items-center justify-center gap-1.5">
					<div className="flex flex-row items-center justify-center gap-1.5">
						<RowsIcon className="h-5 w-5 text-muted-foreground" />
						<span className="text-sm text-muted-foreground">Rows</span>
					</div>
					<span className="text-sm">{data.rowCount}</span>
				</div>
			</CardContent>
		</Card>
	);
}
