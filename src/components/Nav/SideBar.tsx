"use client";

import { ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { useRecoilState } from "recoil";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NavItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { sideBarAtom } from "./sideBarAtom";
import SideNav from "./SideNav";

export default function Sidebar(): React.JSX.Element {
	const [isOpen, toggle] = useRecoilState(sideBarAtom);
	const [swith, setSwitch] = useState(false);

	const handleToggle = (): void => {
		setSwitch(true);
		toggle((prev) => !prev);
		setTimeout(() => setSwitch(false), 500);
	};
	return (
		<nav
			className={cn(
				`relative hidden h-screen pt-16 md:block`,
				swith && "duration-500",
				isOpen ? "w-64" : "w-[72px]"
			)}>
			<div className="space-y-4 py-4">
				<div className="px-2.5 py-2">
					<div className="mt-3 h-[calc(90vh-6rem)] space-y-1 overflow-x-hidden overflow-y-scroll pb-16 scrollbar-hide">
						<SideNav
							className="text-background opacity-0 transition-all duration-300 group-hover:z-50 group-hover:ml-4 group-hover:rounded group-hover:bg-foreground group-hover:p-2 group-hover:opacity-100"
							items={NavItems}
						/>
					</div>
				</div>
			</div>
			<div className="mt-30 absolute bottom-5 w-full space-y-2 px-3">
				<Separator />
				<Button onClick={handleToggle} className={cn("h-10 w-full bg-foreground", isOpen && "rotate-180")}>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</nav>
	);
}
