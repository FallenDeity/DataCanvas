import Image from "next/image";
import Link from "next/link";
import React from "react";

import ThemeToggleButton from "../ThemeToggle";
import MobileSidebar from "./MobileSideBar";
import UserNav from "./UserNav";

export default function NavBar(): React.JSX.Element {
	return (
		<div className="supports-backdrop-blur:bg-background/60 fixed left-0 right-0 top-0 z-20 bg-background/95 backdrop-blur">
			<nav className="flex h-[72px] items-center justify-between px-3">
				<Link href={"/"} className="flex items-center justify-between gap-2 md:gap-4">
					<Image src={"/logo.png"} alt="Logo" width={48} height={48} />
					<h1 className="font-semibold md:mx-2 md:text-lg">Data Canvas.</h1>
				</Link>
				<div className="flex items-center gap-4">
					<div className="hidden md:block">
						<ThemeToggleButton />
					</div>
					<UserNav />
					<div className="block md:hidden">
						<MobileSidebar />
					</div>
				</div>
			</nav>
		</div>
	);
}
