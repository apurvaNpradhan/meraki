import type { SelectTaskType, UpdateTaskType } from "@meraki/api/types";
import {
	IconDotsVertical,
	IconFilter,
	IconPencil,
	IconSortAscending,
	IconTrash,
} from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format, isPast, isThisWeek, isToday, isTomorrow } from "date-fns";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PrioritySelector, priorities } from "@/components/priority-selector";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { TaskDatePicker } from "@/features/tasks/components/task-date-picker";
import { cn } from "@/lib/utils";
import { useModal } from "@/stores/modal.store";
import { orpc, queryClient } from "@/utils/orpc";

export type GroupBy = "none" | "priority" | "deadline";
export type SortBy = "default" | "name" | "createdAt" | "priority";

export const priorityLabels: Record<number, string> = {
	0: "No Priority",
	1: "Low Priority",
	2: "Medium Priority",
	3: "High Priority",
	4: "Urgent Priority",
};

export function ViewSettingsSelector({
	groupBy,
	onGroupByChange,
	sortBy,
	onSortByChange,
}: {
	groupBy: GroupBy;
	onGroupByChange: (v: GroupBy) => void;
	sortBy: SortBy;
	onSortByChange: (v: SortBy) => void;
}) {
	const groupingOptions = [
		{ id: "none", label: "No Grouping" },
		{ id: "priority", label: "Priority" },
		{ id: "deadline", label: "Deadline" },
	];

	const sortingOptions = [
		{ id: "default", label: "Default" },
		{ id: "name", label: "Name" },
		{ id: "createdAt", label: "Created At" },
		{ id: "priority", label: "Priority" },
	];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant="ghost"
						size="sm"
						className="gap-2 text-muted-foreground hover:text-foreground"
					>
						<IconFilter className="h-4 w-4" />
						<span>View</span>
					</Button>
				}
			/>
			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<IconFilter className="mr-2 h-4 w-4" />
						Group by
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuRadioGroup
							value={groupBy}
							onValueChange={(v) => onGroupByChange(v as GroupBy)}
						>
							{groupingOptions.map((item) => (
								<DropdownMenuRadioItem key={item.id} value={item.id}>
									{item.label}
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>
					</DropdownMenuSubContent>
				</DropdownMenuSub>

				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<IconSortAscending className="mr-2 h-4 w-4" />
						Sort by
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuRadioGroup
							value={sortBy}
							onValueChange={(v) => onSortByChange(v as SortBy)}
						>
							{sortingOptions.map((item) => (
								<DropdownMenuRadioItem key={item.id} value={item.id}>
									{item.label}
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function TaskList({
	groupBy,
	sortBy,
	workspaceId,
}: {
	groupBy: GroupBy;
	sortBy: SortBy;
	workspaceId: string;
}) {
	const { data: tasks, isPending } = useQuery(orpc.task.all.queryOptions({}));
	const [completingTaskIds, setCompletingTaskIds] = useState<Set<string>>(
		new Set(),
	);

	const updateTask = useMutation(
		orpc.task.update.mutationOptions({
			onMutate: async (variables) => {
				const { input } = variables;
				await queryClient.cancelQueries(orpc.task.all.queryOptions({}));
				const previousTasks = queryClient.getQueryData<SelectTaskType[]>(
					orpc.task.all.queryKey({}),
				);

				queryClient.setQueryData<SelectTaskType[]>(
					orpc.task.all.queryKey({}),
					(old) => {
						if (!old) return old;
						return old.map((t) =>
							t.publicId === input.taskPublicId ? { ...t, ...input } : t,
						);
					},
				);

				return { previousTasks };
			},
			onError: (_err, _variables, context) => {
				if (context?.previousTasks) {
					queryClient.setQueryData(
						orpc.task.all.queryKey({}),
						context.previousTasks,
					);
				}
				toast.error("Failed to update task");
			},
			onSettled: () => {
				queryClient.invalidateQueries(orpc.task.all.queryOptions({}));
			},
		}),
	);

	const handleUpdate = (task: SelectTaskType, input: UpdateTaskType) => {
		if (input.status === "done" && task.status !== "done") {
			setCompletingTaskIds((prev) => new Set(prev).add(task.publicId));

			updateTask.mutate({
				taskId: task.publicId,
				workspaceId,
				input: {
					...input,
					isArchived: true,
				},
			});

			toast.success("Task moved to archived", {
				action: {
					label: "Undo",
					onClick: () => {
						updateTask.mutate({
							taskId: task.publicId,
							workspaceId,
							input: {
								taskPublicId: task.publicId,
								status: task.status,
								isArchived: false,
								completedAt: null,
							},
						});
					},
				},
			});

			setTimeout(() => {
				setCompletingTaskIds((prev) => {
					const next = new Set(prev);
					next.delete(task.publicId);
					return next;
				});
			}, 800);
		} else {
			updateTask.mutate({
				taskId: task.publicId,
				workspaceId,
				input,
			});
		}
	};

	const softDeleteTask = useMutation(
		orpc.task.softDelete.mutationOptions({
			onMutate: async (variables) => {
				const { taskId } = variables;
				await queryClient.cancelQueries(orpc.task.all.queryOptions({}));
				const previousTasks = queryClient.getQueryData<SelectTaskType[]>(
					orpc.task.all.queryKey({}),
				);

				queryClient.setQueryData<SelectTaskType[]>(
					orpc.task.all.queryKey({}),
					(old) => {
						if (!old) return old;
						return old.filter((t) => t.publicId !== taskId);
					},
				);

				return { previousTasks };
			},
			onError: (_err, _variables, context) => {
				if (context?.previousTasks) {
					queryClient.setQueryData(
						orpc.task.all.queryKey({}),
						context.previousTasks,
					);
				}
				toast.error("Failed to delete task");
			},
			onSuccess: () => {
				toast.success("Task deleted successfully");
			},
			onSettled: () => {
				queryClient.invalidateQueries(orpc.task.all.queryOptions({}));
			},
		}),
	);

	const groupedTasks = useMemo(() => {
		if (!tasks) return [];

		const filteredTasks = tasks
			.filter(
				(task) => !task.isArchived || completingTaskIds.has(task.publicId),
			)
			.sort((a, b) => {
				if (sortBy === "default") return 0;
				if (sortBy === "name") return a.title.localeCompare(b.title);
				if (sortBy === "createdAt")
					return (
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					);
				if (sortBy === "priority") return (b.priority ?? 0) - (a.priority ?? 0);
				return 0;
			});

		if (groupBy === "none") {
			return [
				{
					label: "All Tasks",
					tasks: filteredTasks,
					order: 1,
				},
			];
		}

		const groups: Record<
			string,
			{ label: string; tasks: SelectTaskType[]; order: number }
		> = {};

		filteredTasks.forEach((task) => {
			let key = "other";
			let label = "Other";
			let order = 999;

			if (groupBy === "priority") {
				const p = task.priority ?? 0;
				key = p.toString();
				label = priorityLabels[p] || "No Priority";
				order = 5 - p;
			} else if (groupBy === "deadline") {
				if (!task.deadline) {
					key = "none";
					label = "No Deadline";
					order = 100;
				} else {
					const d = new Date(task.deadline);
					if (isPast(d) && !isToday(d)) {
						key = "overdue";
						label = "Overdue";
						order = 1;
					} else if (isToday(d)) {
						key = "today";
						label = "Today";
						order = 2;
					} else if (isTomorrow(d)) {
						key = "tomorrow";
						label = "Tomorrow";
						order = 3;
					} else {
						key = "future";
						label = "Upcoming";
						order = 4;
					}
				}
			} else {
				key = "all";
				label = "All Tasks";
				order = 1;
			}

			if (!groups[key]) {
				groups[key] = { label, tasks: [], order };
			}

			groups[key].tasks.push(task);
		});

		return Object.values(groups).sort((a, b) => a.order - b.order);
	}, [tasks, groupBy, sortBy, completingTaskIds]);

	if (isPending) {
		return (
			<div className="flex flex-col gap-4">
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="h-10 w-full animate-pulse rounded-md bg-muted/50"
					/>
				))}
			</div>
		);
	}

	return (
		<>
			{groupedTasks.map((group) => (
				<div key={group.label} className="space-y-3">
					{groupBy !== "none" && (
						<h3 className="border-b px-1 pb-2 font-semibold text-foreground/70 text-sm">
							{group.label}
						</h3>
					)}
					<div className="flex flex-col gap-px">
						{group.tasks.map((task) => (
							<TaskListItem
								key={task.publicId}
								task={task}
								onUpdate={(input) => handleUpdate(task, input)}
								onDelete={() =>
									softDeleteTask.mutate({ taskId: task.publicId })
								}
							/>
						))}
					</div>
				</div>
			))}
			{!tasks?.length && (
				<div className="flex flex-col items-center justify-center py-20 text-center">
					<p className="text-muted-foreground">No tasks found in your inbox.</p>
				</div>
			)}
		</>
	);
}

export function TaskListItem({
	task,
	onUpdate,
	onDelete,
}: {
	task: SelectTaskType;
	onUpdate: (input: UpdateTaskType) => void;
	onDelete: () => void;
}) {
	const { open } = useModal();
	const isDone = task.status === "done";

	const formatTaskDate = (date: Date | string | null) => {
		if (!date) return null;
		const d = new Date(date);
		if (isToday(d)) return "Today";
		if (isTomorrow(d)) return "Tomorrow";
		if (isThisWeek(d)) return format(d, "eeee");
		return format(d, "MMM d, yyyy");
	};

	return (
		<Item
			tabIndex={0}
			className="group cursor-pointer flex-nowrap gap-0 p-1 transition-colors duration-200 ease-out hover:bg-accent/30"
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					open({
						type: "TASK_DETAIL",
						data: { taskId: task.publicId },
					});
				}
			}}
		>
			<ItemMedia>
				<Checkbox
					style={{
						borderColor: priorities[task.priority].color,
						...(task.completedAt && {
							backgroundColor: priorities[task.priority].color,
						}),
					}}
					checked={isDone}
					className={cn(
						"rounded-full",
						"-translate-x-2 md:hidden",
						"transition-all duration-200 ease-out",
						"group-hover:block group-hover:translate-x-0",
						"focus-visible:block focus-visible:translate-x-0",
						isDone && "translate-x-0 md:block",
					)}
					onCheckedChange={(checked) => {
						onUpdate({
							taskPublicId: task.publicId,
							status: checked ? "done" : "todo",
							completedAt: checked ? new Date() : null,
						});
					}}
				/>
			</ItemMedia>
			<ItemContent
				className={cn(
					"min-w-0 transition-[margin] duration-200 ease-out",
					"group-hover:ml-2",
					isDone && "ml-2",
				)}
				onClick={() =>
					open({
						type: "TASK_DETAIL",
						modalSize: "lg",
						data: { taskId: task.publicId },
					})
				}
			>
				<ItemTitle
					className={cn(
						"block truncate text-[15px] leading-tight transition-colors",
						isDone && "text-muted-foreground line-through",
					)}
				>
					{task.title}
				</ItemTitle>
				{task.deadline && (
					<ItemDescription
						className={cn(
							"text-xs",
							isPast(new Date(task.deadline)) &&
								!isToday(new Date(task.deadline))
								? "text-destructive"
								: "text-muted-foreground",
						)}
					>
						{formatTaskDate(task.deadline)}
					</ItemDescription>
				)}
			</ItemContent>
			<ItemActions className="transition-all duration-200 ease-out group-hover:opacity-100 md:opacity-0">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button variant="ghost" size="icon-sm">
								<IconDotsVertical />
							</Button>
						}
					/>
					<DropdownMenuContent className="w-48">
						<DropdownMenuItem onClick={(e) => e.stopPropagation()}>
							<IconPencil className="mr-2" /> Edit
						</DropdownMenuItem>
						<DropdownMenuGroup>
							<DropdownMenuLabel>Properties</DropdownMenuLabel>

							<DropdownMenuItem
								onSelect={(e) => e.preventDefault()}
								onClick={(e) => {
									e.stopPropagation();
									e.preventDefault();
								}}
								className="p-0!"
							>
								<PrioritySelector
									showLabel={true}
									value={task.priority}
									className="flex w-full items-center justify-start"
									onPriorityChange={(priority) =>
										onUpdate({ taskPublicId: task.publicId, priority })
									}
								/>
							</DropdownMenuItem>
							<DropdownMenuItem
								onSelect={(e) => e.preventDefault()}
								onClick={(e) => {
									e.stopPropagation();
									e.preventDefault();
								}}
								className="p-0!"
							>
								<TaskDatePicker
									date={task.deadline ? new Date(task.deadline) : null}
									onSelect={(date) =>
										onUpdate({
											taskPublicId: task.publicId,
											deadline: date ?? null,
										})
									}
									className="flex w-full items-center justify-start"
								/>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							onClick={(e) => {
								e.stopPropagation();
								onDelete();
							}}
						>
							<IconTrash className="mr-2" /> Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</ItemActions>
		</Item>
	);
}
