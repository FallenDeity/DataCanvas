"use client";

import { Inter } from "next/font/google";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

import { Fonts } from "@/lib/constants";

import { styleAtom } from "./styleAtom";

const defaultfont = Inter({ subsets: ["latin"] });

export default function Body({ children }: { children: React.ReactNode }): React.JSX.Element {
	const { resolvedTheme } = useTheme();
	const [style, setStyle] = useRecoilState(styleAtom);
	const [font, setFont] = useState(defaultfont);

	useEffect(() => {
		const localFont = localStorage.getItem("style.font");
		const _font = localFont ? Fonts.find((f) => f.label === localFont)?.font : defaultfont;
		setFont(_font ?? defaultfont);
	}, [style.font]);

	useEffect(() => {
		const localEditorTheme = localStorage.getItem(`style.editorTheme.${resolvedTheme ?? ""}`);
		setStyle({ ...style, editorTheme: localEditorTheme ?? resolvedTheme ?? "" });
	}, [resolvedTheme]);

	return <main className={`${font.className} overflow-hidden`}>{children}</main>;
}
