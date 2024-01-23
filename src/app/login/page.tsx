import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
// import { getProviders } from "next-auth/react";
import React from "react";

import ParticleAnimation from "@/components/BgEffect";
import ProviderButton from "@/components/ProviderButton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authOptions } from "@/lib/auth";

export default async function Login(): Promise<React.JSX.Element> {
	// const providers = await getProviders();
	const session = await getServerSession(authOptions);
	if (session) {
		redirect("/");
	}
	return (
		<div className="h-screen overflow-hidden bg-[conic-gradient(at_bottom_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-600 to-indigo-200 dark:bg-gradient-to-br dark:from-secondary dark:via-background dark:to-background">
			<ParticleAnimation />
			<div className="flex h-full flex-col items-center justify-center">
				<Card className="z-10 mx-4 shadow-md">
					<CardHeader className="relative flex flex-col items-center space-y-6 p-10">
						<div className="absolute top-0 -mt-16 rounded-full border-2 bg-card p-2">
							<Image src="/logo.png" alt="NextAuth.js" width={96} height={96} />
						</div>
						<CardTitle>DataCanvas.</CardTitle>
						<CardDescription>Sign in to your account to continue</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col items-center space-y-4">
						<ProviderButton key={"Google"} id={"google"} name={"Google"} callback={"/"} />
						<ProviderButton key={"GitHub"} id={"github"} name={"GitHub"} callback={"/"} />
						<div className="flex w-1/2 items-center justify-center space-x-2 px-2">
							<Separator />
							<p className="text-sm text-muted-foreground">or</p>
							<Separator />
						</div>
						<ProviderButton key={"Email"} id={"Email"} name={""} callback={""} />
					</CardContent>
					<CardFooter>
						<p className="text-wrap text-xs text-muted-foreground">
							By signing in, you agree to our{" "}
							<a className="text-primary" href="/terms">
								Terms of Service
							</a>{" "}
							and{" "}
							<a className="text-primary" href="/privacy">
								Privacy Policy
							</a>
							.
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
