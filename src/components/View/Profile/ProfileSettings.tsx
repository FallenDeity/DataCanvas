"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserSessionModel } from "@/lib/models";

const profileFormSchema = z.object({
	username: z
		.string()
		.min(2, {
			message: "Username must be at least 2 characters.",
		})
		.max(30, {
			message: "Username must not be longer than 30 characters.",
		}),
	email: z
		.string({
			required_error: "Please select an email to display.",
		})
		.email(),
	image: z.string().url(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm({ session }: { session: UserSessionModel }): React.JSX.Element {
	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: {
			username: session.user.name,
			email: session.user.email,
			image: session.user.image,
		},
		mode: "onChange",
	});

	function onSubmit(data: ProfileFormValues): void {
		console.log(data);
	}

	return (
		<Form {...form}>
			{/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="image"
					render={({ field }): React.JSX.Element => (
						<FormItem>
							<FormLabel>Profile picture</FormLabel>
							<FormControl>
								<Input placeholder="https://..." {...field} />
							</FormControl>
							<FormDescription>
								You can use any image URL from the web. It will be resized to 128x128 pixels.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="username"
					render={({ field }): React.JSX.Element => (
						<FormItem>
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input placeholder="shadcn" {...field} />
							</FormControl>
							<FormDescription>
								This is your public display name. It can be your real name or a pseudonym. You can only
								change this once every 30 days.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }): React.JSX.Element => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input placeholder="john@gmail.com" {...field} />
							</FormControl>
							<FormDescription>
								You can manage verified email addresses in your{" "}
								<Link href="/examples/forms">email settings</Link>.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit">Update profile</Button>
			</form>
		</Form>
	);
}
