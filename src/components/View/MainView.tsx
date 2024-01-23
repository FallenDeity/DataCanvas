"use client";

import React from "react";
import { useRecoilState } from "recoil";

import { selectedAtom } from "../Nav/selectedAtom";
import EditorView from "./Editor/EditorView";
import HomeView from "./Home/HomeView";
import ProfileView from "./Profile/ProfileView";
import SchemaView from "./Schema/SchemaView";
import SettingsView from "./Settings/SettingsView";
import TableEditorView from "./TableEditor/TableEditorView";
import TableView from "./Tables/TableView";

export default function MainView(): React.JSX.Element {
	const selected = useRecoilState(selectedAtom)[0];
	if (selected === "Schema Visualizer") {
		return <SchemaView />;
	} else if (selected === "SQL Editor") {
		return <EditorView />;
	} else if (selected === "Tables") {
		return <TableView />;
	} else if (selected === "Settings") {
		return <SettingsView />;
	} else if (selected === "Home") {
		return <HomeView />;
	} else if (selected === "Create Table") {
		return <TableEditorView />;
	} else if (selected === "Profile") {
		return <ProfileView />;
	}
	return <div>Not implemented yet {selected}</div>;
}
