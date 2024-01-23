"use client";

import { PostgreSQL, sql } from "@codemirror/lang-sql";
import CodeMirror, { EditorView, Extension, ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";
import { HashLoader } from "react-spinners";
import { useRecoilState } from "recoil";

import getAutocompletes from "@/app/actions/getAutocompletes";
import { styleAtom } from "@/components/styleAtom";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Themes } from "@/lib/constants";

import EditorConsole from "./EditorConsole";
import EditorHeader from "./EditorHeader";

export default function SchemaView(): React.JSX.Element {
	const date = new Date();
	const editorRef = useRef<ReactCodeMirrorRef>(null);
	const style = useRecoilState(styleAtom)[0];
	const { resolvedTheme } = useTheme();
	const [scrollStyle, setScrollStyle] = useState<Extension>();
	const [text, setText] = useState<string>("");
	const [reload, setReload] = useState<boolean>(false);
	const [autocompletes, setAutocompletes] = useState<Record<string, { label: string; detail: string }[]>>({});
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const _theme_ = Themes.find((v) => v.label === style.editorTheme);
	const [theme, setTheme] = useState<Extension | string | undefined>(_theme_?.value ?? resolvedTheme);

	useEffect(() => {
		const _theme = resolvedTheme === "dark" ? "dark" : "light";
		const colors: Record<string, Record<string, string>> = {
			dark: {
				track: "#333",
				thumb: "#555",
				thumbHover: "#555",
			},
			light: {
				track: "#eee",
				thumb: "#ccc",
				thumbHover: "#ccc",
			},
		};
		const _style = EditorView.theme({
			"& .cm-scroller::-webkit-scrollbar": {
				width: "0.5rem",
				height: "0.5rem",
			},
			"& .cm-scroller::-webkit-scrollbar-track": {
				background: colors[_theme].track,
			},
			"& .cm-scroller::-webkit-scrollbar-thumb": {
				background: colors[_theme].thumb,
			},
			"& .cm-scroller::-webkit-scrollbar-thumb:hover": {
				background: colors[_theme].thumbHover,
			},
		});
		setScrollStyle(_style);
	}, [resolvedTheme]);

	useEffect(() => {
		const _theme = Themes.find((v) => v.label === style.editorTheme);
		setTheme(_theme?.value ?? resolvedTheme);
	}, [style.editorTheme]);

	useEffect(() => {
		void getAutocompletes(date).then((res: Record<string, string[]>) => {
			const completes: Record<string, { label: string; detail: string }[]> = {};
			Object.keys(res).forEach((key) => {
				completes[key] = res[key].map((v) => ({ label: v, detail: key }));
			});
			setAutocompletes(completes);
			setIsLoading(false);
			setReload(false);
		});
	}, [reload]);

	if (isLoading) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<HashLoader className="h-32 w-32" color={resolvedTheme === "dark" ? "#5f05e6" : "#89a2fa"} />
			</div>
		);
	}

	return (
		<ResizablePanelGroup direction="vertical">
			<EditorHeader currentTheme={resolvedTheme} theme={theme} setTheme={setTheme} />
			<ResizablePanel>
				<CodeMirror
					ref={editorRef}
					style={{ height: "100%" }}
					height="100%"
					value="-- Write your SQL query here"
					theme={theme as "light" | "dark" | Extension}
					basicSetup={{
						tabSize: 4,
					}}
					onChange={(v): void => setText(v)}
					extensions={[
						sql({ dialect: PostgreSQL, schema: autocompletes, upperCaseKeywords: true }),
						// @ts-expect-error hook original value is undefined
						scrollStyle,
					]}
				/>
			</ResizablePanel>
			<ResizableHandle />
			<EditorConsole setReload={setReload} content={text} />
		</ResizablePanelGroup>
	);
}
