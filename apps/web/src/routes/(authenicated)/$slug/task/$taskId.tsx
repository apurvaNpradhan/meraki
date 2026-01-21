import type { UpdateTaskType } from "@meraki/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useDebouncedCallback } from "use-debounce";
import ContentEditor from "@/components/editor/editors/content-editor";
import MainLayout from "@/components/layout/app-layout";
import { PrioritySelector } from "@/components/priority-selector";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "@/features/projects/hooks/use-project";
import { TaskStatusSelector } from "@/features/tasks/components/task-status-selector";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/(authenicated)/$slug/task/$taskId")({
	loader: async ({ context, params }) => {
		const { queryClient, orpc } = context;
		await queryClient.ensureQueryData(
			orpc.task.byId.queryOptions({ input: { taskId: params.taskId } }),
		);
	},
	component: TaskDetailPage,
});

function TaskDetailPage() {
	const { taskId } = Route.useParams();
	const { workspace } = useLoaderData({ from: "/(authenicated)/$slug" });
	const { data: task, isLoading } = useQuery(
		orpc.task.byId.queryOptions({ input: { taskId } }),
	);
	const {
		data: { statuses },
	} = useProject(task?.project?.publicId ?? "");

	const updateTask = useUpdateTask({
		projectPublicId: task?.project?.publicId,
	});

	const [title, setTitle] = useState("");

	useEffect(() => {
		if (task) {
			setTitle(task.title);
		}
	}, [task]);

	const debouncedUpdateTitle = useDebouncedCallback((value: string) => {
		if (!task) return;
		updateTask.mutate({
			taskId: task.publicId,
			workspaceId: workspace.id,
			input: { taskPublicId: task.publicId, title: value },
		});
	}, 600);

	if (isLoading || !task) {
		return <TaskDetailSkeleton />;
	}

	const handleUpdate = (updates: Partial<UpdateTaskType>) => {
		updateTask.mutate({
			taskId: task.publicId,
			workspaceId: workspace.id,
			input: { ...updates, taskPublicId: task.publicId } as UpdateTaskType,
		});
	};

	const rightSidebar = (
		<Sidebar side="right" collapsible="none" className="border-l bg-accent/10">
			<SidebarHeader className="h-14 border-b px-4 py-3 font-semibold text-sm">
				Properties
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent className="flex flex-col gap-6 p-2">
						<div className="flex flex-col gap-2">
							<span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
								Status
							</span>
							<TaskStatusSelector
								statuses={statuses ?? []}
								selectedStatusId={task.status?.publicId}
								onStatusChange={(statusId) =>
									handleUpdate({ statusPublicId: statusId })
								}
								className="h-auto w-full justify-start px-2 py-1.5 font-normal hover:bg-accent/50"
							/>
						</div>

						<div className="flex flex-col gap-2">
							<span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
								Priority
							</span>
							<PrioritySelector
								value={task.priority}
								onPriorityChange={(p) => handleUpdate({ priority: p })}
								className="h-auto w-full justify-start px-2 py-1.5 font-normal hover:bg-accent/50"
							/>
						</div>

						{/* Future: Labels */}
						<div className="flex flex-col gap-2">
							<span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
								Labels
							</span>
							<div className="px-2 text-muted-foreground text-sm italic">
								No labels
							</div>
						</div>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);

	return (
		<MainLayout rightSidebar={rightSidebar}>
			<div className="px-2">
				<div className="flex items-start gap-4">
					<Checkbox
						checked={!!task.completedAt}
						onCheckedChange={(checked) =>
							handleUpdate({ completedAt: checked ? new Date() : null })
						}
						className={cn(
							"mt-2 h-6 w-6 rounded-full border-2 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
						)}
					/>
					<div className="flex-1 space-y-6">
						<TextareaAutosize
							value={title}
							onChange={(e) => {
								setTitle(e.target.value);
								debouncedUpdateTitle(e.target.value);
							}}
							className="w-full resize-none bg-transparent px-0 font-semibold text-3xl text-foreground outline-none placeholder:text-muted-foreground"
							placeholder="Task title"
						/>
						<div className="prose prose-stone dark:prose-invert max-w-none">
							<ContentEditor
								key={task.publicId}
								initialContent={task.description ?? undefined}
								onUpdate={(content) => handleUpdate({ description: content })}
								placeholder="Add a description..."
								className="min-h-[200px]"
							/>
						</div>
					</div>
				</div>
			</div>
		</MainLayout>
	);
}

function TaskDetailSkeleton() {
	return (
		<MainLayout
			rightSidebar={
				<Sidebar
					side="right"
					collapsible="none"
					className="border-l bg-accent/10"
				>
					<SidebarHeader className="h-14 border-b px-4 py-3">
						<Skeleton className="h-4 w-20" />
					</SidebarHeader>
					<SidebarContent className="space-y-6 p-4">
						<div className="space-y-2">
							<Skeleton className="h-3 w-12" />
							<Skeleton className="h-8 w-full" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-3 w-12" />
							<Skeleton className="h-8 w-full" />
						</div>
					</SidebarContent>
				</Sidebar>
			}
		>
			<div className="mx-auto max-w-3xl space-y-6 px-8 py-12">
				<div className="flex gap-4">
					<Skeleton className="mt-2 h-6 w-6 rounded-full" />
					<div className="flex-1 space-y-4">
						<Skeleton className="h-10 w-3/4" />
						<Skeleton className="h-[200px] w-full" />
					</div>
				</div>
			</div>
		</MainLayout>
	);
}
