"use client";

import { useTheme } from "next-themes";
import React from "react";
import { RiMoonClearFill, RiSunFill } from "react-icons/ri";

import { Button } from "./ui/button";

export default function ThemeToggleButton(): React.JSX.Element {
	const { systemTheme, theme, setTheme } = useTheme();
	const currentTheme = theme === "system" ? systemTheme : theme;
	const isDark = currentTheme === "dark";
	return (
		<Button
			aria-label="Toggle Dark Mode"
			type="button"
			className="flex h-10 w-full items-center rounded p-0 md:w-10 md:justify-center"
			onClick={(): void => {
				setTheme(isDark ? "light" : "dark");
			}}>
			{isDark ? <RiSunFill size={20} /> : <RiMoonClearFill size={20} />}
			<span className="ml-2 md:hidden">Toggle Theme</span>
		</Button>
	);
}
