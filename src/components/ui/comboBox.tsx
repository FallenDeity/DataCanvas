"use client";

import { Icon } from "lucide-react";
import React, { useState } from "react";
import { FaSort } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Item {
	label: string;
	value?: string;
	desc?: string;
	icon: Icon;
}

export default function Combobox({
	items,
	type,
	value,
	setValue,
}: {
	items: Item[];
	type: string;
	value: string;
	setValue: (value: string) => void;
}): React.JSX.Element {
	const [open, setOpen] = useState(false);
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" role="combobox" aria-expanded={open} className="h-8 w-full justify-between">
					{value ? items.find((item) => (item.value ?? item.label) === value)?.label : `Select ${type}`}
					<FaSort className="ml-2 h-3 w-3 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0">
				<Command>
					<CommandInput placeholder={`Search ${type}`} />
					<CommandEmpty>No {type} found</CommandEmpty>
					<CommandGroup className="h-36 overflow-y-scroll scrollbar-hide">
						{items.map((item) => (
							<CommandItem
								className={`${value === (item.value ?? item.label) ? "bg-secondary" : ""}`}
								key={item.value ?? item.label}
								value={item.value ?? item.label}
								onSelect={(currentValue): void => {
									setValue(currentValue === value ? "" : currentValue);
									setOpen(false);
								}}>
								{item.label}
								<item.icon
									className={cn(
										"ml-auto h-4 w-4",
										value === (item.value ?? item.label) ? "opacity-100" : "opacity-80"
									)}
								/>
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
