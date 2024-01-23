import { atom } from "recoil";

interface StyleAtom {
	editorTheme: string;
	font: string;
}

export const styleAtom = atom<StyleAtom>({
	key: "styleAtom",
	default: {
		editorTheme: "",
		font: "",
	},
});
