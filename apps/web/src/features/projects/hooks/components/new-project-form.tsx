import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectInsertInput } from "@meraki/api/types/model";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import type { z } from "zod";
import { IconAndColorPicker } from "@/components/icon-and-color-picer";
import { PrioritySelector } from "@/components/priority-selector";
import { StatusSelector } from "@/components/status-selector";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useModal } from "@/stores/modal";
import type { ProjectBySpaceItem } from "@/types/project";
import { orpc } from "@/utils/orpc";
import { useCreateProject } from "../use-project";

const formSchema = ProjectInsertInput;
type FormValues = z.infer<typeof formSchema>;

export function NewProjectForm({
	data,
	spacePublicId,
}: {
	data?: Partial<ProjectInsertInput>;
	spacePublicId: string;
}) {
	const { close } = useModal();
	const createProject = useCreateProject({
		spacePublicId,
	});
	const { data: statuses } = useSuspenseQuery(
		orpc.projectStatus.all.queryOptions(),
	);
	const [isTemplate, setIsTemplate] = useState(false);

	const defaultStatus =
		statuses.find((s) => s.type === "backlog") ?? statuses[0];

	const { handleSubmit, control } = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			summary: "",
			description: "",
			icon: "IconClipboardList",
			colorCode: "#3B82F6",
			priority: data?.priority ?? 0,
			projectStatusPublicId:
				data?.projectStatusPublicId ?? defaultStatus?.publicId,
			spacePublicId,
			startDate: undefined,
			targetDate: undefined,
			...data,
		},
	});

	const onSubmit = (values: FormValues) => {
		createProject.mutate(values, {
			onSuccess: () => {
				close();
			},
		});
	};

	useEffect(() => {
		const titleElement = document.getElementById("name");
		if (titleElement) titleElement.focus();
	}, []);

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col p-4">
			<div className="flex items-start gap-4">
				<Controller
					control={control}
					name="icon"
					render={({ field: iconField }) => (
						<Controller
							control={control}
							name="colorCode"
							render={({ field: colorField }) => (
								<IconAndColorPicker
									icon={iconField.value}
									onIconChange={iconField.onChange}
									color={colorField.value}
									onColorChange={colorField.onChange}
									variant="soft"
									className="mt-1 outline"
								/>
							)}
						/>
					)}
				/>
				<div className="flex flex-1 flex-col gap-2">
					<Controller
						control={control}
						name="name"
						render={({ field }) => (
							<Input
								{...field}
								id="name"
								placeholder="Project name"
								className="border-none px-0 py-0 font-semibold shadow-none placeholder:opacity-40 focus-visible:ring-0 md:text-xl dark:bg-transparent"
								autoFocus
							/>
						)}
					/>
					<Controller
						control={control}
						name="summary"
						render={({ field }) => (
							<TextareaAutosize
								placeholder="Add a short summary..."
								{...field}
								value={field.value ?? ""}
								className="resize-none border-none bg-transparent p-0 text-muted-foreground text-sm outline-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
							/>
						)}
					/>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-2 pt-10">
				<Controller
					control={control}
					name="projectStatusPublicId"
					render={({ field }) => (
						<StatusSelector
							statuses={statuses}
							selectedStatusId={field.value}
							onStatusChange={field.onChange}
							className="h-8"
						/>
					)}
				/>

				<Controller
					control={control}
					name="priority"
					render={({ field }) => (
						<PrioritySelector
							project={
								{ priority: field.value } as unknown as ProjectBySpaceItem
							}
							onPriorityChange={(p) => field.onChange(p)}
						/>
					)}
				/>
				<div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1">
					<span className="text-muted-foreground text-xs">Dates</span>
					<div className="h-4 w-px bg-border" />
					<Controller
						control={control}
						name="startDate"
						render={({ field }) => (
							<DatePicker
								placeholder="Start"
								date={field.value}
								setDate={field.onChange}
							/>
						)}
					/>
					<span className="text-muted-foreground">-</span>
					<Controller
						control={control}
						name="targetDate"
						render={({ field }) => (
							<DatePicker
								placeholder="End"
								date={field.value}
								setDate={field.onChange}
							/>
						)}
					/>
				</div>
			</div>
			{isTemplate && <div className="flex flex-col py-2">Templates TODO</div>}
			<div className="flex justify-end gap-2">
				<div className="flex flex-row items-center gap-1">
					Use template
					<Switch checked={isTemplate} onCheckedChange={setIsTemplate} />
				</div>
				<Button type="submit" disabled={createProject.isPending}>
					{createProject.isPending ? "Creating..." : "Create Project"}
				</Button>
			</div>
		</form>
	);
}

function DatePicker({
	date,
	setDate,
	placeholder = "Pick a date",
}: {
	date?: Date | null;
	setDate: (date?: Date) => void;
	placeholder?: string;
}) {
	return (
		<Popover>
			<PopoverTrigger>
				<Button
					variant={"ghost"}
					className={cn(
						"h-auto p-0 font-normal hover:bg-transparent",
						!date && "text-muted-foreground",
					)}
				>
					{date ? (
						format(date, "MMM d")
					) : (
						<span className="text-xs">{placeholder}</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={date ?? undefined}
					onSelect={setDate}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
