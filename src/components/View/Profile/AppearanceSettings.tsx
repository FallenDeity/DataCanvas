"use client";

import { PostgreSQL, sql } from "@codemirror/lang-sql";
import { zodResolver } from "@hookform/resolvers/zod";
import CodeMirror from "@uiw/react-codemirror";
import { ChevronDownIcon } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";
import * as z from "zod";

import { styleAtom } from "@/components/styleAtom";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Fonts, Themes } from "@/lib/constants";

const sampleCode = `
-- This is a sample query

CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	email VARCHAR(255) NOT NULL,
	password VARCHAR(255) NOT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (email, password) VALUES ('admin@localhost', 'password');

SELECT * FROM users;
`.trim();

const themeNames = Themes.map((theme) => theme.label) as readonly string[];
type Extension = (typeof themeNames)[number];
const TVALUES: [Extension, ...Extension[]] = themeNames as [Extension, ...Extension[]];
const fontNames = Fonts.map((font) => font.label) as readonly string[];
type Font = (typeof fontNames)[number];
const FVALUES: [Font, ...Font[]] = fontNames as [Font, ...Font[]];
const appearanceFormSchema = z.object({
	theme: z.enum(["light", "dark"], {
		required_error: "Please select a theme.",
	}),
	font: z.enum(FVALUES, {
		invalid_type_error: "Select a font",
		required_error: "Please select a font.",
	}),
	editor: z.enum(TVALUES, {
		invalid_type_error: "Select a theme",
		required_error: "Please select a theme.",
	}),
});

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

export default function AppearanceForm({
	currentTheme,
	setTheme,
}: {
	currentTheme: "light" | "dark";
	setTheme: (theme: "light" | "dark") => void;
}): React.JSX.Element {
	const [style, setStyle] = useRecoilState(styleAtom);
	const [open, setOpen] = useState(false);
	const [fontOpen, setFontOpen] = useState(false);
	const form = useForm<AppearanceFormValues>({
		resolver: zodResolver(appearanceFormSchema),
		defaultValues: {
			theme: currentTheme,
			editor: style.editorTheme,
			font: style.font,
		},
	});

	const toastMessage = ({ data }: { data: AppearanceFormValues }): React.JSX.Element => {
		return (
			<>
				<span className="font-semibold">Font:</span> {data.font}
				<br />
				<span className="font-semibold">Theme:</span> {data.theme}
			</>
		);
	};

	function onSubmit(data: AppearanceFormValues): void {
		toast.success(toastMessage({ data }));
	}
	return (
		<Form {...form}>
			{/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
			<form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
				<FormField
					control={form.control}
					name="font"
					render={({ field }): React.JSX.Element => (
						<FormItem className="w-full px-4">
							<FormLabel className="text-xl sm:text-2xl">Font</FormLabel>
							<FormDescription>Set the font you want to use in the dashboard.</FormDescription>
							<div className="relative w-max pt-6">
								<FormControl>
									<Popover open={fontOpen} onOpenChange={setFontOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="none"
												role="combobox"
												aria-expanded={fontOpen}
												className={`h-7 w-[150px] xs:w-[200px] ${buttonVariants({
													variant: "outline",
												})} justify-between`}>
												{style.font.length > 0
													? style.font.charAt(0).toUpperCase() + style.font.slice(1)
													: "Select Font"}
												<ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-[150px] p-0 xs:w-[200px]">
											<Command>
												<CommandEmpty>No fonts found.</CommandEmpty>
												<CommandGroup>
													{Fonts.map((font) => (
														<CommandItem
															key={font.label}
															value={font.label}
															className="cursor-pointer"
															onSelect={(currentValue): void => {
																const value =
																	Fonts.find(
																		(font) =>
																			font.label.toLowerCase() === currentValue
																	)?.label ?? "Inter";
																setStyle((style) => ({ ...style, font: value }));
																localStorage.setItem("style.font", value);
																field.onChange(value);
																setFontOpen(false);
															}}>
															{font.label}
														</CommandItem>
													))}
												</CommandGroup>
											</Command>
										</PopoverContent>
									</Popover>
								</FormControl>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Separator className="my-4" />
				<FormField
					control={form.control}
					name="theme"
					render={({ field }): React.JSX.Element => (
						<FormItem className="space-y-1 px-4">
							<FormLabel className="text-xl sm:text-2xl">Theme</FormLabel>
							<FormDescription>Select the theme for the dashboard.</FormDescription>
							<FormMessage />
							<RadioGroup
								value={currentTheme}
								onValueChange={(value): void => {
									setTheme(value as "light" | "dark");
									field.onChange(value);
								}}
								defaultValue={field.value}
								className="grid max-w-md grid-cols-2 gap-8 pt-10">
								<FormItem>
									<FormLabel className="[&:has([data-state=checked])>div]:border-primary">
										<FormControl>
											<RadioGroupItem value="light" className="sr-only" />
										</FormControl>
										<div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
											<div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
												<div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
													<div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
													<div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
												</div>
												<div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
													<div className="h-4 w-4 rounded-full bg-[#ecedef]" />
													<div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
												</div>
												<div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
													<div className="h-4 w-4 rounded-full bg-[#ecedef]" />
													<div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
												</div>
											</div>
										</div>
										<span className="block w-full p-2 text-center font-normal">Light</span>
									</FormLabel>
								</FormItem>
								<FormItem>
									<FormLabel className="[&:has([data-state=checked])>div]:border-primary">
										<FormControl>
											<RadioGroupItem value="dark" className="sr-only" />
										</FormControl>
										<div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
											<div className="space-y-2 rounded-sm bg-slate-950 p-2">
												<div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
													<div className="h-2 w-[80px] rounded-lg bg-slate-400" />
													<div className="h-2 w-[100px] rounded-lg bg-slate-400" />
												</div>
												<div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
													<div className="h-4 w-4 rounded-full bg-slate-400" />
													<div className="h-2 w-[100px] rounded-lg bg-slate-400" />
												</div>
												<div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
													<div className="h-4 w-4 rounded-full bg-slate-400" />
													<div className="h-2 w-[100px] rounded-lg bg-slate-400" />
												</div>
											</div>
										</div>
										<span className="block w-full p-2 text-center font-normal">Dark</span>
									</FormLabel>
								</FormItem>
							</RadioGroup>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="editor"
					render={({ field }): React.JSX.Element => (
						<FormItem>
							<FormDescription>
								<Card>
									<CardHeader>
										<div className="flex w-full items-center justify-between">
											<CardTitle className="text-xl sm:text-2xl">Editor Theme</CardTitle>
											<FormControl>
												<Popover open={open} onOpenChange={setOpen}>
													<PopoverTrigger asChild>
														<Button
															variant="none"
															role="combobox"
															aria-expanded={open}
															className={`h-7 w-[150px] xs:w-[200px] ${buttonVariants({
																variant: "outline",
															})} justify-between`}>
															Select Theme
															<ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
														</Button>
													</PopoverTrigger>
													<PopoverContent className="w-[150px] p-0 xs:w-[200px]">
														<Command>
															<CommandInput
																className="py-1"
																placeholder="Search themes..."
															/>
															<CommandEmpty>No themes found.</CommandEmpty>
															<CommandGroup className="h-72 overflow-y-scroll scrollbar-thin scrollbar-track-secondary scrollbar-thumb-muted-foreground">
																{Themes.filter((t) => t.scheme === currentTheme).map(
																	(t) => (
																		<CommandItem
																			key={t.label}
																			value={t.label}
																			className="cursor-pointer"
																			onSelect={(currentValue): void => {
																				const value = Themes.find(
																					(t) => t.label === currentValue
																				)?.label;
																				localStorage.setItem(
																					`style.editorTheme.${currentTheme}`,
																					value ?? ""
																				);
																				setStyle((style) => ({
																					...style,
																					editorTheme: value ?? "",
																				}));
																				field.onChange(value);
																				setOpen(false);
																			}}>
																			{t.label}
																		</CommandItem>
																	)
																)}
															</CommandGroup>
														</Command>
													</PopoverContent>
												</Popover>
											</FormControl>
										</div>
										<CardDescription>
											Previewing{" "}
											<span className="font-semibold">{style.editorTheme || currentTheme}</span>{" "}
											theme.
										</CardDescription>
									</CardHeader>
									<CardContent className="w-full">
										<CodeMirror
											value={sampleCode}
											theme={
												Themes.find((theme) => theme.label === style.editorTheme)?.value ??
												currentTheme
											}
											readOnly
											className="h-64 w-full overflow-hidden"
											basicSetup={{
												tabSize: 4,
											}}
											extensions={[
												sql({
													dialect: PostgreSQL,
													upperCaseKeywords: true,
												}),
											]}
										/>
									</CardContent>
								</Card>
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
}
