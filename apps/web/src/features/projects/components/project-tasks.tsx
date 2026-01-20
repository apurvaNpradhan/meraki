import { IconFilter, IconPlus, IconSearch } from "@tabler/icons-react";
import { useLoaderData } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	useProjectOverview,
	useProjectStatuses,
	useProjectTasks,
} from "@/features/projects/hooks/use-project";
import {
	type GroupBy,
	type SortBy,
	TaskList,
	ViewSettingsSelector,
} from "@/features/tasks/components/task-list";
import { useModal } from "@/stores/modal.store";

export function ProjectTasks({ id }: { id: string }) {
	const { data: project } = useProjectOverview(id);
	const { data: tasks } = useProjectTasks(id);
	const { data: statuses } = useProjectStatuses(id);
	const { open } = useModal();
	const { workspace } = useLoaderData({ from: "/(authenicated)/$slug" });
	const [groupBy, setGroupBy] = useState<GroupBy>("status");
	const [sortBy, setSortBy] = useState<SortBy>("default");
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	if (!project) return <div>Project not found</div>;

	const filteredTasks = searchQuery
		? tasks?.filter((t) =>
				t.title.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		: tasks;

	return (
		<div className="flex w-full flex-col">
			<div className="flex flex-row items-center justify-end border-b p-2">
				<div className="flex flex-row items-center gap-2">
					{isSearchOpen ? (
						<div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1">
							<IconSearch size={16} className="text-muted-foreground" />
							<input
								type="text"
								placeholder="Search tasks..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-40 bg-transparent text-sm outline-none md:w-64"
							/>
							<Button
								variant="ghost"
								size="icon-xs"
								onClick={() => {
									setIsSearchOpen(false);
									setSearchQuery("");
								}}
							>
								<IconPlus className="rotate-45" size={16} />
							</Button>
						</div>
					) : (
						<>
							<Button variant="outline" size="icon-sm">
								<IconFilter size={18} />
							</Button>
							<ViewSettingsSelector
								groupBy={groupBy}
								onGroupByChange={setGroupBy}
								sortBy={sortBy}
								onSortByChange={setSortBy}
								showStatusGrouping={true}
							/>
							<Button
								variant="outline"
								size="icon-sm"
								onClick={() => setIsSearchOpen(true)}
							>
								<IconSearch size={18} />
							</Button>
						</>
					)}
					<Button
						size="sm"
						variant="outline"
						onClick={() =>
							open({
								type: "CREATE_TASK",
								modalSize: "lg",
								data: {
									projectPublicId: project.publicId,
									statuses: statuses,
								},
							})
						}
					>
						<IconPlus />
						Add Task
					</Button>
				</div>
			</div>

			<TaskList
				groupBy={groupBy}
				sortBy={sortBy}
				workspaceId={workspace.id}
				tasks={filteredTasks}
				projectPublicId={project.publicId}
				statuses={statuses}
			/>
		</div>
	);
}
