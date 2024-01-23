"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DatePicker({
	start,
	date,
	setDate,
}: {
	start: Date;
	date?: Date;
	setDate: (date: Date) => void;
}): React.JSX.Element {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className={cn("w-[280px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? format(date, "PPP") : <span>Pick a date</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0">
				<Calendar
					mode="single"
					selected={date}
					onSelect={(date): void => {
						setDate(date ?? new Date());
					}}
					initialFocus
					fromDate={start}
					toDate={new Date()}
				/>
			</PopoverContent>
		</Popover>
	);
}
