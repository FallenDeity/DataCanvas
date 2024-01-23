"use client";

import { ChevronDownIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

import { buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NavItem } from "@/lib/models";
import { cn } from "@/lib/utils";

import { selectedAtom } from "./selectedAtom";
import { sideBarAtom } from "./sideBarAtom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./SubAccordion";

interface SideNavProps {
	items: NavItem[];
	setOpen?: (open: boolean) => void;
	className?: string;
}

export default function SideNav({ items, setOpen, className }: SideNavProps): React.JSX.Element {
	const isOpen = useRecoilState(sideBarAtom)[0];
	const [selected, setSelected] = useRecoilState(selectedAtom);
	const [openItem, setOpenItem] = useState("");
	const [lastOpenItem, setLastOpenItem] = useState("");

	useEffect(() => {
		if (isOpen) {
			setOpenItem(lastOpenItem);
		} else {
			setLastOpenItem(openItem);
			setOpenItem("");
		}
	}, [isOpen]);

	return (
		<nav className="space-y-2">
			{items.map((item) =>
				item.isChidren ? (
					<Accordion
						type="single"
						collapsible
						className="space-y-1"
						key={item.title}
						value={openItem}
						onValueChange={setOpenItem}>
						<AccordionItem value={item.title} className="border-none">
							<AccordionTrigger
								className={cn(
									buttonVariants({ variant: "ghost" }),
									"group relative flex h-12 justify-between px-4 py-2 text-base duration-200 hover:bg-muted hover:no-underline"
								)}>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger>
											<item.icon className={cn("h-5 w-5", item.color)} />
										</TooltipTrigger>
										<TooltipContent side="right" className="hidden px-2 py-1 md:block">
											{item.title}
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
								<div className={cn("absolute left-12 text-base duration-200", !isOpen && className)}>
									{item.title}
								</div>

								{isOpen && (
									<ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
								)}
							</AccordionTrigger>
							<AccordionContent className="ml-4 space-y-2 pb-1">
								{item.children?.map((child) => (
									<div
										key={child.title}
										onClick={(): void => {
											if (setOpen) setOpen(false);
											setSelected(child.title);
										}}
										className={cn(
											buttonVariants({ variant: "ghost" }),
											"group flex h-12 justify-start gap-x-3",
											selected === child.title && "bg-muted font-bold hover:bg-muted"
										)}>
										<child.icon className={cn("h-5 w-5", child.color)} />
										<div className={cn("text-base duration-200", !isOpen && className)}>
											{child.title}
										</div>
									</div>
								))}
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				) : (
					<div
						key={item.title}
						onClick={(): void => {
							if (setOpen) setOpen(false);
							setSelected(item.title);
						}}
						className={cn(
							buttonVariants({ variant: "ghost" }),
							"group relative flex h-12 justify-start",
							selected === item.title && "bg-muted font-bold hover:bg-muted"
						)}>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<item.icon className={cn("h-5 w-5", item.color)} />
								</TooltipTrigger>
								<TooltipContent side="right" className="hidden px-2 py-1 md:block">
									{item.title}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<span className={cn("absolute left-12 text-base duration-200", !isOpen && className)}>
							{item.title}
						</span>
					</div>
				)
			)}
		</nav>
	);
}
