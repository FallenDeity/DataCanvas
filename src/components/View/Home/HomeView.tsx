import React from "react";

import HomeStats from "./HomeStats";
import HomeTable from "./HomeTable";

export default function HomeView(): React.JSX.Element {
	return (
		<div className="flex h-full w-full flex-col overflow-y-scroll p-2 pt-6 scrollbar-hide md:p-4 lg:p-6 xl:p-8">
			<HomeStats />
			<div className="my-10 mb-16 flex w-full flex-col">
				<HomeTable />
			</div>
		</div>
	);
}
