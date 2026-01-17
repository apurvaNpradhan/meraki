import { parseDate } from "chrono-node";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "./input";

export function DatePicker({
	date,
	setDate,
	className,
	placeholder = "Pick a date",
	before,
	after,
}: {
	date?: Date;
	setDate: (date?: Date) => void;
	className?: string;
	placeholder?: string;
	before?: Date | string | null;
	after?: Date | string | null;
}) {
	const [value, setValue] = React.useState<string>("");
	const [month, setMonth] = React.useState<Date | undefined>(date);

	const beforeDate = before ? new Date(before) : undefined;
	const afterDate = after ? new Date(after) : undefined;

	const disabledMatchers = [];
	if (beforeDate) disabledMatchers.push({ before: beforeDate });
	if (afterDate) disabledMatchers.push({ after: afterDate });

	React.useEffect(() => {
		if (date) {
			setMonth(date);
		}
	}, [date]);

	return (
		<Popover>
			<PopoverTrigger
				render={
					<Button
						variant={"ghost"}
						className={cn(
							"w-full justify-start text-left font-normal",
							!date && "text-muted-foreground",
							className,
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{date ? format(date, "PPP") : <span>{placeholder}</span>}
					</Button>
				}
			/>

			<PopoverContent className="w-auto" align="start">
				<Input
					id="date"
					value={value}
					placeholder="Tomorrow or next week"
					className="bg-background"
					onChange={(e) => {
						const newValue = e.target.value;
						setValue(newValue);
						const parsed = parseDate(newValue);
						if (parsed) {
							setDate(parsed);
							setMonth(parsed);
						}
					}}
					onKeyDown={(e) => {
						if (e.key === "ArrowDown") {
							e.preventDefault();
						}
					}}
				/>
				<Calendar
					mode="single"
					selected={date}
					onSelect={(newDate) => {
						setDate(newDate);
						if (newDate) {
							setValue(format(newDate, "PPP"));
						}
					}}
					month={month}
					onMonthChange={setMonth}
					autoFocus
					disabled={disabledMatchers}
				/>
			</PopoverContent>
		</Popover>
	);
}
