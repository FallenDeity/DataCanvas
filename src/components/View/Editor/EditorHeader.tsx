"use client";

import { Extension } from "@uiw/react-codemirror";
import { Check, ChevronsUpDown } from "lucide-react";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Themes } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ThemeT = Extension | string | undefined;

export default function EditorHeader({
	currentTheme,
	theme,
	setTheme,
}: {
	currentTheme: string | undefined;
	theme: ThemeT;
	setTheme: (theme: ThemeT) => void;
}): React.JSX.Element {
	const [selectedTheme, setSelectedTheme] = useState<string | undefined>(currentTheme);
	const [open, setOpen] = useState(false);
	const [bg, setBg] = useState("bg-zinc-700");
	const border = currentTheme === "light" ? "border-zinc-300" : "border-zinc-600";
	const text = currentTheme === "light" ? "text-zinc-900" : "text-zinc-100";

	useEffect(() => {
		setTimeout(() => {
			const cmEditor = document.getElementsByClassName("cm-editor")[0];
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!cmEditor) return;
			const classNames = cmEditor.className.split(" ");
			const lastClassName = classNames[classNames.length - 2];
			setBg(lastClassName);
		}, 10);
	}, [selectedTheme]);

	useEffect(() => {
		setSelectedTheme(currentTheme);
	}, [currentTheme]);

	return (
		<div
			className={`flex h-10 w-full flex-row items-center justify-between border-b border-r px-4 ${bg} ${border}`}>
			<div className="flex flex-row items-center">
				<div className="hidden flex-row items-center xs:flex">
					<div className="mr-1 h-2 w-2 rounded-full bg-red-500" />
					<div className="mr-1 h-2 w-2 rounded-full bg-yellow-500" />
					<div className="mr-1 h-2 w-2 rounded-full bg-green-500" />
				</div>
				<div className={`text-sm xs:ml-2 ${text}`}>SQL EDITOR</div>
			</div>
			<div className="flex flex-row items-center gap-2">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="none"
							role="combobox"
							aria-expanded={open}
							className={`h-7 w-[150px] justify-between border xs:w-[200px] ${text} ${bg} ${border}`}>
							{Themes.find((t) => t.value === theme)
								? Themes.find((t) => t.value === theme)?.label
								: "Select Theme"}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[150px] p-0 xs:w-[200px]">
						<Command>
							<CommandInput className="py-1" placeholder="Search themes..." />
							<CommandEmpty>No themes found.</CommandEmpty>
							<CommandGroup className="h-72 overflow-y-scroll scrollbar-thin scrollbar-track-secondary scrollbar-thumb-muted-foreground">
								{Themes.filter((t) => t.scheme === currentTheme).map((t) => (
									<CommandItem
										key={t.label}
										value={t.label}
										className="cursor-pointer"
										onSelect={(currentValue): void => {
											const value = Themes.find((t) => t.label === currentValue)?.value;
											setTheme(value);
											setOpen(false);
											setSelectedTheme(currentValue);
											localStorage.setItem(
												`style.editorTheme.${currentTheme ?? ""}`,
												currentValue
											);
										}}>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												theme === t.value ? "opacity-100" : "opacity-0"
											)}
										/>
										{t.label}
									</CommandItem>
								))}
							</CommandGroup>
						</Command>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}
