import React from "react";

import NavBar from "@/components/Nav/NavBar";
import Sidebar from "@/components/Nav/SideBar";
import MainView from "@/components/View/MainView";

export default function Home(): React.JSX.Element {
	return (
		<>
			<NavBar />
			<div className="flex h-screen border-collapse overflow-hidden">
				<Sidebar />
				<main className="flex-1 overflow-hidden bg-secondary/10 pb-1 pt-[72px]">
					<div className="flex h-full w-full border-t md:border-l">
						<MainView />
					</div>
				</main>
			</div>
		</>
	);
}
