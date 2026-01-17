import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectInsertInput } from "@meraki/api/types";
import { IconArrowRight, IconLoader2 } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import type { z } from "zod";
import { IconAndColorPicker } from "@/components/icon-and-colorpicker";
import { PrioritySelector } from "@/components/priority-selector";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { FieldError } from "@/components/ui/field";
import {
	ResponsiveModalFooter,
	ResponsiveModalHeader,
	ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { Separator } from "@/components/ui/separator";
import { useModal } from "@/stores/modal.store";
import { orpc } from "@/utils/orpc";
import { useCreateProject } from "../hooks/use-project";
import { StatusSelector } from "./status-selector";

const formSchema = ProjectInsertInput;
type FormValues = z.input<typeof formSchema>;

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

	const defaultStatus =
		statuses.find((s) => s.type === "backlog") ?? statuses[0];

	const { handleSubmit, control, getValues } = useForm<FormValues>({
		mode: "onChange",
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: data?.name ?? "",
			summary: data?.summary ?? "",
			description: data?.description ?? "",
			icon: data?.icon ?? "IconClipboardList",
			colorCode: data?.colorCode ?? "#3B82F6",
			priority: data?.priority ?? 0,
			projectStatusPublicId:
				data?.projectStatusPublicId ?? defaultStatus?.publicId,
			startDate: data?.startDate ?? undefined,
			targetDate: data?.targetDate ?? undefined,
			spacePublicId,
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
		<div className="flex flex-col gap-3">
			<ResponsiveModalHeader>
				<ResponsiveModalTitle className="sr-only">
					New Project
				</ResponsiveModalTitle>
			</ResponsiveModalHeader>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="relative flex flex-col gap-3 overflow-auto"
			>
				<div className="flex items-start">
					<div className="flex flex-1 flex-col gap-2">
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
											className="mt-1 outline-none"
										/>
									)}
								/>
							)}
						/>

						<Controller
							control={control}
							name="name"
							render={({ field, fieldState }) => (
								<div className="space-y-1">
									<TextareaAutosize
										{...field}
										id="name"
										placeholder="Project name"
										className="resize-none border-none bg-transparent p-0 font-semibold text-2xl outline-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
										autoFocus
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												handleSubmit(onSubmit)();
											}
										}}
									/>
									{fieldState.error && (
										<FieldError errors={[fieldState.error]} />
									)}
								</div>
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
									className="resize-none border-none bg-transparent p-0 text-base text-muted-foreground outline-none placeholder:text-muted-foreground/80 focus-visible:ring-0"
								/>
							)}
						/>
					</div>
				</div>

				<div className="flex flex-row flex-wrap items-center gap-3">
					<Controller
						control={control}
						name="projectStatusPublicId"
						render={({ field }) => (
							<StatusSelector
								statuses={statuses}
								selectedStatusId={field.value}
								onStatusChange={field.onChange}
								className="w-fit border-accent bg-accent/50"
								showLabel
							/>
						)}
					/>

					<Controller
						control={control}
						name="priority"
						render={({ field }) => (
							<PrioritySelector
								value={field.value}
								className="w-fit border-accent bg-accent/50"
								onPriorityChange={(p) => field.onChange(p)}
								showLabel
							/>
						)}
					/>
					<div className="flex flex-wrap items-center gap-1">
						<Controller
							control={control}
							name="startDate"
							render={({ field }) => (
								<DatePicker
									placeholder="Start"
									className="w-fit border-accent bg-accent/50"
									date={field.value ? new Date(field.value) : undefined}
									setDate={(date) => field.onChange(date)}
								/>
							)}
						/>
						<IconArrowRight size={13} className="text-muted-foreground" />
						<Controller
							control={control}
							name="targetDate"
							render={({ field }) => (
								<DatePicker
									before={getValues("startDate")}
									placeholder="End"
									date={field.value ? new Date(field.value) : undefined}
									className="w-fit border-accent bg-accent/50"
									setDate={(date) => field.onChange(date)}
								/>
							)}
						/>
					</div>
				</div>
				<Separator />
				<Controller
					control={control}
					name="description"
					render={({ field }) => (
						<TextareaAutosize
							id="description"
							placeholder="Write a project description, or collect ideas..."
							{...field}
							value={field.value ?? ""}
							className="mt-4 min-h-50 w-full resize-none bg-transparent px-0 text-base text-muted-foreground outline-none placeholder:text-muted-foreground/80"
						/>
					)}
				/>

				<ResponsiveModalFooter className="flex flex-row justify-end gap-2 border-t pt-4">
					<Button type="button" variant="ghost" onClick={close}>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={createProject.isPending}
						className="min-w-[100px]"
					>
						{createProject.isPending ? (
							<>
								<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
								Creating...
							</>
						) : (
							"Create Project"
						)}
					</Button>
				</ResponsiveModalFooter>
			</form>
		</div>
	);
}
