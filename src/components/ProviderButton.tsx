"use client";

import "react-toastify/dist/ReactToastify.css";
import "@/styles/toastify.css";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useTheme } from "next-themes";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BsGithub } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { IoIosMail } from "react-icons/io";
import { BeatLoader } from "react-spinners";
import { Slide, toast, ToastContainer } from "react-toastify";
import * as z from "zod";

import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";

const emailFormSchema = z.object({
	email: z.string().email("Please enter a valid email"),
});

export default function ProviderButton({
	id,
	name,
	callback,
}: {
	id: string;
	name: string;
	callback: string;
}): React.JSX.Element {
	const [disabled, setDisabled] = useState(false);
	const { systemTheme, theme } = useTheme();
	const currentTheme = theme === "system" ? systemTheme : theme;
	const isDark = currentTheme === "dark";
	const form = useForm<z.infer<typeof emailFormSchema>>({
		mode: "onChange",
		resolver: zodResolver(emailFormSchema),
		defaultValues: {
			email: "",
		},
	});
	const icons = useMemo<Record<string, React.ReactNode>>(
		() => ({
			GitHub: <BsGithub className="mx-4 h-5 w-5" />,
			Google: <FcGoogle className="mx-4 h-5 w-5" />,
			Email: <IoIosMail className="mx-4 h-5 w-5" />,
		}),
		[]
	);
	const onSubmit = async (values: z.infer<typeof emailFormSchema>): Promise<void> => {
		setDisabled(true);
		const result = (await signIn("email", { email: values.email, redirect: false })) as {
			error: string | undefined;
		};
		if (result.error) {
			setDisabled(false);
			return void toast.error("Verification email could not be sent! Please check your email address.");
		}
		toast.success("Check your email for the magic link!");
		setDisabled(false);
	};
	if (id === "Email") {
		return (
			<>
				<Form {...form}>
					{/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
					<form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-2">
						<FormField
							control={form.control}
							name="email"
							render={({ field }): React.JSX.Element => (
								<FormItem>
									<FormControl>
										<Input placeholder="Enter your mail" {...field} />
									</FormControl>
									<FormMessage className="text-xs text-red-500" />
								</FormItem>
							)}
						/>
						<Button
							disabled={disabled}
							type="submit"
							key={name}
							className="flex w-full items-center justify-center rounded-md p-3 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md disabled:cursor-not-allowed">
							{disabled ? <BeatLoader className="mr-2 text-primary-foreground" size={5} /> : icons[id]}{" "}
							Sign in with {id}
						</Button>
					</form>
				</Form>
				<ToastContainer
					transition={Slide}
					position="bottom-right"
					autoClose={5000}
					closeOnClick
					pauseOnFocusLoss
					theme={isDark ? "dark" : "light"}
				/>
			</>
		);
	}
	return (
		<Button
			disabled={disabled}
			key={name}
			className="flex w-full items-center justify-center rounded-md p-3 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md"
			onClick={(): void => void signIn(id, { callbackUrl: callback })}>
			{icons[name]} Sign in with {name}
		</Button>
	);
}
