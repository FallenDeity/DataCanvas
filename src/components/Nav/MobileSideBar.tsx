"use client";

import { MenuIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavItems } from "@/lib/constants";

import SideNav from "./SideNav";

export default function MobileSidebar(): React.JSX.Element {
	const [open, setOpen] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return <></>;
	}

	return (
		<>
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetTrigger asChild>
					<div className="flex cursor-pointer items-center justify-center gap-2">
						<MenuIcon />
					</div>
				</SheetTrigger>
				<SheetContent side={"right"} className="w-72">
					<div className="mt-16 h-[90vh] overflow-x-hidden overflow-y-scroll px-1 py-6 scrollbar-hide">
						<SideNav items={NavItems} setOpen={setOpen} />
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
}
