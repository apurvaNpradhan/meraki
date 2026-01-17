import { zodResolver } from "@hookform/resolvers/zod";
import { InsertTaskInput } from "@meraki/api/types";
import { IconChevronRight, IconLoader2 } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useLoaderData } from "@tanstack/react-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import type { z } from "zod";
import { PrioritySelector } from "@/components/priority-selector";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
	ResponsiveModalFooter,
	ResponsiveModalHeader,
	ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { Switch } from "@/components/ui/switch";
import { useModal } from "@/stores/modal.store";
import { orpc, queryClient } from "@/utils/orpc";
import { TaskDatePicker } from "./task-date-picker";

type TaskFormValues = z.input<typeof InsertTaskInput>;

export function NewTaskModal() {
	const { close } = useModal();
	const [createMore, setCreateMore] = useState(false);
	const createTask = useMutation(
		orpc.task.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(orpc.task.all.queryOptions());
				if (!createMore) {
					toast.success("Task created successfully");
					close();
				}
				form.reset(defaultValues);
			},
			onError: (error: Error) => {
				toast.error(error.message || "Failed to create task");
			},
		}),
	);
	const defaultValues: TaskFormValues = {
		title: "",
		description: "",
		priority: 0,
	};
	const form = useForm<TaskFormValues>({
		resolver: zodResolver(InsertTaskInput),
		defaultValues: {
			title: "",
			description: "",
			priority: 0,
		},
	});

	const onSubmit = (values: TaskFormValues) => {
		createTask.mutate({
			input: values,
		});
	};
	const { workspace } = useLoaderData({ from: "/(authenicated)/$slug" });
	return (
		<div className="flex w-full flex-col space-y-4 p-1">
			<ResponsiveModalHeader>
				<ResponsiveModalTitle
					className={"flex flex-row items-center gap-1 text-sm"}
				>
					<Button variant={"outline"} disabled size={"sm"}>
						{workspace.slug}
					</Button>
					<IconChevronRight className="h-3 w-3" />
					New Task
				</ResponsiveModalTitle>
			</ResponsiveModalHeader>

			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col space-y-2"
			>
				<div className="space-y-4">
					<Controller
						control={form.control}
						name="title"
						render={({ field, fieldState }) => (
							<div className="space-y-1">
								<TextareaAutosize
									{...field}
									placeholder="Task title"
									className="w-full resize-none font-semibold text-2xl outline-none placeholder:text-muted-foreground"
									autoFocus
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											form.handleSubmit(onSubmit)();
										}
									}}
								/>
								{fieldState.error && <FieldError errors={[fieldState.error]} />}
							</div>
						)}
					/>
					<Controller
						control={form.control}
						name="description"
						render={({ field }) => (
							<TextareaAutosize
								placeholder="Add description..."
								{...field}
								value={field.value ?? ""}
								className="w-full resize-none text-base text-muted-foreground outline-none placeholder:text-muted-foreground/80"
							/>
						)}
					/>
				</div>

				<div className="mt-4 flex flex-row items-center gap-2 px-1">
					<Controller
						control={form.control}
						name="deadline"
						render={({ field }) => (
							<TaskDatePicker
								date={field.value ? new Date(field.value) : undefined}
								className="w-fit border border-accent bg-accent/50"
								onSelect={(date) => field.onChange(date)}
							/>
						)}
					/>
					<Controller
						control={form.control}
						name="priority"
						render={({ field }) => (
							<PrioritySelector
								showLabel={true}
								className="w-fit border-accent bg-accent/50"
								value={field.value ?? 0}
								onPriorityChange={field.onChange}
							/>
						)}
					/>
				</div>

				<ResponsiveModalFooter className="flex flex-row items-center justify-end gap-3 border-t pt-4">
					<div className="flex items-center space-x-2">
						<Switch
							id="create-more"
							checked={createMore}
							onCheckedChange={setCreateMore}
						/>
						<Label htmlFor="create-more"> Create more</Label>
					</div>

					<Button
						type="submit"
						disabled={createTask.isPending}
						className="min-w-[100px]"
					>
						{createTask.isPending ? (
							<>
								<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
								Adding...
							</>
						) : (
							"Create task"
						)}
					</Button>
				</ResponsiveModalFooter>
			</form>
		</div>
	);
}

export default NewTaskModal;
