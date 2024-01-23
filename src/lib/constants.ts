import * as themes from "@uiw/codemirror-themes-all";
import { Extension } from "@uiw/react-codemirror";
import { Icon } from "lucide-react";
import { Metadata } from "next";
import { Inter, Merriweather_Sans, Montserrat, Open_Sans, Raleway, Roboto_Mono, Source_Sans_3 } from "next/font/google";
import { BsFillTerminalFill } from "react-icons/bs";
import { CiCalendar, CiText } from "react-icons/ci";
import { GoNumber } from "react-icons/go";
import { HiOutlineHome } from "react-icons/hi2";
import { IoSettingsOutline } from "react-icons/io5";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdOutlineToggleOn } from "react-icons/md";
import { PiGraph, PiIdentificationBadge } from "react-icons/pi";
import { TbTablePlus, TbUserScan } from "react-icons/tb";
import { VscJson } from "react-icons/vsc";

import { NavItem } from "./models";

export const NavItems: NavItem[] = [
	{
		title: "Home",
		icon: HiOutlineHome,
		href: "/",
		color: "text-red-500",
	},
	{
		title: "Tables",
		icon: LuLayoutDashboard,
		href: "/tables",
		color: "text-violet-600",
	},
	{
		title: "SQL Editor",
		icon: BsFillTerminalFill,
		href: "/users",
		color: "text-green-500",
	},
	{
		title: "Schema Visualizer",
		icon: PiGraph,
		href: "/schema",
		color: "text-blue-500",
	},
	{
		title: "Settings",
		icon: IoSettingsOutline,
		href: "/settings",
		color: "text-amber-500",
	},
	{
		title: "Profile",
		icon: TbUserScan,
		href: "/profile",
		color: "text-pink-600",
	},
	{
		title: "Create Table",
		icon: TbTablePlus,
		href: "/create-table",
		color: "text-teal-500",
	},
];

export const Themes: { value: Extension; label: string; scheme: "light" | "dark" }[] = [
	{
		value: themes.abcdef,
		label: "abcdef",
		scheme: "dark",
	},
	{
		value: themes.abyss,
		label: "abyss",
		scheme: "dark",
	},
	{
		value: themes.androidstudio,
		label: "android studio",
		scheme: "dark",
	},
	{
		value: themes.andromeda,
		label: "andromeda",
		scheme: "dark",
	},
	{
		value: themes.atomone,
		label: "atom one",
		scheme: "dark",
	},
	{
		value: themes.aura,
		label: "aura",
		scheme: "dark",
	},
	{
		value: themes.basicDark,
		label: "basic dark",
		scheme: "dark",
	},
	{
		value: themes.basicLight,
		label: "basic light",
		scheme: "light",
	},
	{
		value: themes.bbedit,
		label: "bbedit",
		scheme: "light",
	},
	{
		value: themes.bespin,
		label: "bespin",
		scheme: "dark",
	},
	{
		value: themes.copilot,
		label: "copilot",
		scheme: "dark",
	},
	{
		value: themes.darcula,
		label: "darcula",
		scheme: "dark",
	},
	{
		value: themes.dracula,
		label: "dracula",
		scheme: "dark",
	},
	{
		value: themes.duotoneDark,
		label: "duotone dark",
		scheme: "dark",
	},
	{
		value: themes.duotoneLight,
		label: "duotone light",
		scheme: "light",
	},
	{
		value: themes.eclipse,
		label: "eclipse",
		scheme: "light",
	},
	{
		value: themes.githubDark,
		label: "github dark",
		scheme: "dark",
	},
	{
		value: themes.githubLight,
		label: "github light",
		scheme: "light",
	},
	{
		value: themes.gruvboxDark,
		label: "gruvbox dark",
		scheme: "dark",
	},
	{
		value: themes.gruvboxLight,
		label: "gruvbox light",
		scheme: "light",
	},
	{
		value: themes.kimbie,
		label: "kimbie",
		scheme: "dark",
	},
	{
		value: themes.material,
		label: "material",
		scheme: "dark",
	},
	{
		value: themes.materialDark,
		label: "material dark",
		scheme: "dark",
	},
	{
		value: themes.materialLight,
		label: "material light",
		scheme: "light",
	},
	{
		value: themes.monokai,
		label: "monokai",
		scheme: "dark",
	},
	{
		value: themes.monokaiDimmed,
		label: "monokai dimmed",
		scheme: "dark",
	},
	{
		value: themes.noctisLilac,
		label: "noctis lilac",
		scheme: "light",
	},
	{
		value: themes.nord,
		label: "nord",
		scheme: "dark",
	},
	{
		value: themes.okaidia,
		label: "okaidia",
		scheme: "dark",
	},
	{
		value: themes.quietlight,
		label: "quietlight",
		scheme: "light",
	},
	{
		value: themes.red,
		label: "red",
		scheme: "dark",
	},
	{
		value: themes.solarizedDark,
		label: "solarized dark",
		scheme: "dark",
	},
	{
		value: themes.solarizedLight,
		label: "solarized light",
		scheme: "light",
	},
	{
		value: themes.sublime,
		label: "sublime",
		scheme: "dark",
	},
	{
		value: themes.tokyoNight,
		label: "tokyo night",
		scheme: "dark",
	},
	{
		value: themes.tokyoNightDay,
		label: "tokyo night day",
		scheme: "light",
	},
	{
		value: themes.tokyoNightStorm,
		label: "tokyo night storm",
		scheme: "dark",
	},
	{
		value: themes.tomorrowNightBlue,
		label: "tomorrow night blue",
		scheme: "dark",
	},
	{
		value: themes.vscodeDark,
		label: "vscode dark",
		scheme: "dark",
	},
	{
		value: themes.whiteDark,
		label: "white dark",
		scheme: "dark",
	},
	{
		value: themes.whiteLight,
		label: "white light",
		scheme: "light",
	},
	{
		value: themes.xcodeDark,
		label: "xcode dark",
		scheme: "dark",
	},
	{
		value: themes.xcodeLight,
		label: "xcode light",
		scheme: "light",
	},
];

export const PostgresTypes: { label: string; description: string; icon: Icon }[] = [
	{
		label: "int2",
		description: "signed two-byte integer",
		icon: GoNumber,
	},
	{
		label: "int4",
		description: "signed four-byte integer",
		icon: GoNumber,
	},
	{
		label: "int8",
		description: "signed eight-byte integer",
		icon: GoNumber,
	},
	{
		label: "float4",
		description: "single-precision floating point number",
		icon: GoNumber,
	},
	{
		label: "float8",
		description: "double-precision floating point number",
		icon: GoNumber,
	},
	{
		label: "numeric",
		description: "exact numeric of selectable precision",
		icon: GoNumber,
	},
	{
		label: "json",
		description: "textual JSON data",
		icon: VscJson,
	},
	{
		label: "jsonb",
		description: "binary JSON data, decomposed",
		icon: VscJson,
	},
	{
		label: "text",
		description: "variable-length character string",
		icon: CiText,
	},
	{
		label: "varchar",
		description: "variable-length character string",
		icon: CiText,
	},
	{
		label: "uuid",
		description: "UUID datatype",
		icon: PiIdentificationBadge,
	},
	{
		label: "date",
		description: "calendar date (year, month, day)",
		icon: CiCalendar,
	},
	{
		label: "time",
		description: "time of day (no time zone)",
		icon: CiCalendar,
	},
	{
		label: "timetz",
		description: "time of day, including time zone",
		icon: CiCalendar,
	},
	{
		label: "timestamp",
		description: "date and time (no time zone)",
		icon: CiCalendar,
	},
	{
		label: "timestamptz",
		description: "date and time, including time zone",
		icon: CiCalendar,
	},
	{
		label: "bool",
		description: "logical boolean (true/false)",
		icon: MdOutlineToggleOn,
	},
	{
		label: "serial2",
		description: "autoincrementing two-byte integer",
		icon: GoNumber,
	},
	{
		label: "serial4",
		description: "autoincrementing four-byte integer",
		icon: GoNumber,
	},
	{
		label: "serial8",
		description: "autoincrementing eight-byte integer",
		icon: GoNumber,
	},
];

export const PostgresDefaultValues: Record<string, { value: string; description: string }[]> = {
	text: [
		{ value: "''", description: "Set the default value to an empty string" },
		{ value: "NULL", description: "Set the default value to NULL" },
	],
	varchar: [
		{ value: "''", description: "Set the default value to an empty string" },
		{ value: "NULL", description: "Set the default value to NULL" },
	],
	int2: [
		{ value: "0", description: "Set the default value to 0" },
		{ value: "NULL", description: "Set the default value to NULL" },
	],
	int4: [
		{ value: "0", description: "Set the default value to 0" },
		{ value: "NULL", description: "Set the default value to NULL" },
	],
	int8: [
		{ value: "0", description: "Set the default value to 0" },
		{ value: "NULL", description: "Set the default value to NULL" },
	],
	float4: [
		{ value: "0", description: "Set the default value to 0" },
		{ value: "NULL", description: "Set the default value to NULL" },
	],
	float8: [
		{ value: "0", description: "Set the default value to 0" },
		{ value: "NULL", description: "Set the default value to NULL" },
	],
	numeric: [
		{ value: "0", description: "Set the default value to 0" },
		{ value: "NULL", description: "Set the default value to NULL" },
	],
	json: [
		{ value: "'{}'", description: "Set the default value to an empty object" },
		{ value: "NULL", description: "Set the default value to NULL" },
	],
	jsonb: [
		{ value: "'{}'", description: "Set the default value to an empty object" },
		{ value: "NULL", description: "Set the default value to NULL" },
	],
	uuid: [
		{ value: "'00000000-0000-0000-0000-000000000000'", description: "Set the default value to an empty UUID" },
		{ value: "NULL", description: "Set the default value to NULL" },
	],
	date: [
		{ value: "'1970-01-01'", description: "Set the default value to the Unix epoch" },
		{ value: "NULL", description: "Set the default value to NULL" },
		{ value: "CURRENT_DATE", description: "Set the default value to the current date" },
	],
	time: [
		{ value: "'00:00:00'", description: "Set the default value to midnight" },
		{ value: "NULL", description: "Set the default value to NULL" },
		{ value: "CURRENT_TIME", description: "Set the default value to the current time" },
	],
	timetz: [
		{ value: "'00:00:00+00'", description: "Set the default value to midnight" },
		{ value: "NULL", description: "Set the default value to NULL" },
		{ value: "CURRENT_TIME", description: "Set the default value to the current time" },
	],
	timestamp: [
		{ value: "'1970-01-01 00:00:00'", description: "Set the default value to the Unix epoch" },
		{ value: "NULL", description: "Set the default value to NULL" },
		{ value: "CURRENT_TIMESTAMP", description: "Set the default value to the current timestamp" },
	],
	timestamptz: [
		{ value: "'1970-01-01 00:00:00+00'", description: "Set the default value to the Unix epoch" },
		{ value: "NULL", description: "Set the default value to NULL" },
		{ value: "CURRENT_TIMESTAMP", description: "Set the default value to the current timestamp" },
	],
	bool: [
		{ value: "false", description: "Set the default value to false" },
		{ value: "NULL", description: "Set the default value to NULL" },
	],
	serial2: [
		{ value: "0", description: "Set the default value to 0" },
		{ value: "NULL", description: "Set the default value to NULL" },
	],
	serial4: [
		{ value: "0", description: "Set the default value to 0" },
		{ value: "NULL", description: "Set the default value to NULL" },
	],
	serial8: [
		{ value: "0", description: "Set the default value to 0" },
		{ value: "NULL", description: "Set the default value to NULL" },
	],
};

export const PostgresConstraints: Record<
	string,
	{ value: string; description: string; primary_allowed: boolean; array_allowed: boolean }
> = {
	primary_key: {
		value: "PRIMARY KEY",
		description: "Set the column as the primary key",
		primary_allowed: true,
		array_allowed: false,
	},
	unique: {
		value: "UNIQUE",
		description: "Set the column as unique",
		primary_allowed: true,
		array_allowed: false,
	},
	not_null: {
		value: "NOT NULL",
		description: "Set the column as not null",
		primary_allowed: true,
		array_allowed: true,
	},
	array: {
		value: "ARRAY",
		description: "Set the column as array",
		primary_allowed: false,
		array_allowed: true,
	},
	identity: {
		value: "IDENTITY",
		description: "Set the column as identity",
		primary_allowed: true,
		array_allowed: false,
	},
};

const _Inter = Inter({ subsets: ["latin"] });
const _Montserrat = Montserrat({ subsets: ["latin"] });
const _Roboto_Mono = Roboto_Mono({ subsets: ["latin"] });
const _Raleway = Raleway({ subsets: ["latin"] });
const _Merriweather_Sans = Merriweather_Sans({ subsets: ["latin"] });
const _Open_Sans = Open_Sans({ subsets: ["latin"] });
const _Source_Sans = Source_Sans_3({ subsets: ["latin"] });

export const Fonts = [
	{
		font: _Inter,
		label: "Inter",
	},
	{
		font: _Montserrat,
		label: "Montserrat",
	},
	{
		font: _Roboto_Mono,
		label: "Roboto Mono",
	},
	{
		font: _Raleway,
		label: "Raleway",
	},
	{
		font: _Merriweather_Sans,
		label: "Merriweather Sans",
	},
	{
		font: _Open_Sans,
		label: "Open Sans",
	},
	{
		font: _Source_Sans,
		label: "Source Sans",
	},
];

export const meta: Metadata = {
	title: "Data Canvas",
	metadataBase: new URL(String(process.env.NEXT_PUBLIC_BASE_URL)),
	description:
		"Discovering the Endless Potential of Your Data. Explore a world of online tools, API access, and easy database development and management. Your canvas, your data, limitless possibilities.",
	keywords: [
		"Data Canvas",
		"PostgreSQL",
		"Online Tools",
		"API",
		"SQL Tools",
		"Schema Creation",
		"Table Design",
		"Database Management",
		"Backend Integration",
		"Data Innovation",
		"Connectivity",
		"Visualization",
	],
	authors: [{ name: "FallenDeity" }],
	robots: {
		follow: true,
		index: true,
		nocache: true,
	},
	openGraph: {
		url: new URL(String(process.env.NEXT_PUBLIC_BASE_URL)),
		title: "Data Canvas",
		description:
			"Discovering the Endless Potential of Your Data. Explore a world of online tools, API access, and easy database development and management. Your canvas, your data, limitless possibilities.",
		type: "website",
	},
	twitter: {
		images: "/logo.png",
		card: "summary",
	},
	themeColor: "#9d57ff",
};
