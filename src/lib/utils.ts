import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}

export function stringToColor(str: string, theme: string): string {
	const baseHue =
		str
			.split("")
			.map((char) => char.charCodeAt(0))
			.reduce((sum, charCode) => sum + charCode, 0) % 360;
	const saturation = theme === "dark" ? 50 : 70;
	const lightness = theme === "dark" ? 30 : 70;
	return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
}
