import { IconFilter } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectItem } from "@/features/projects/components/project-item";
import { getStatusIcon } from "@/features/projects/components/status-selector";
import { useSpace } from "@/features/spaces/hooks/use-space";
import { useModal } from "@/stores/modal.store";
import type { ProjectBySpaceItem } from "@/types/project";
import { orpc } from "@/utils/orpc";

type GroupBy = "status" | "priority" | "none";

export function SpaceProjects({ id }: { id: string }) {
	const { data, isPending } = useSpace(id);
	const projectStatuses = useSuspenseQuery(
		orpc.projectStatus.all.queryOptions(),
	);
	const [groupBy, setGroupBy] = useState<GroupBy>("status");
	const { open } = useModal();

	const groupedItems = useMemo(() => {
		if (!data?.projects || !projectStatuses.data) return {};

		const groups: Record<string, ProjectBySpaceItem[]> = {};

		if (groupBy === "status") {
			for (const status of projectStatuses.data) {
				groups[status.publicId] = [];
			}
			groups.uncategorized = [];
			for (const project of data.projects) {
				const key = project.projectStatus?.publicId ?? "uncategorized";
				if (!groups[key]) groups[key] = [];
				groups[key].push(project);
			}
		} else if (groupBy === "priority") {
			for (let i = 0; i <= 4; i++) {
				groups[i.toString()] = [];
			}
			for (const project of data.projects) {
				const key = (project.priority ?? 0).toString();
				if (!groups[key]) groups[key] = [];
				groups[key].push(project);
			}
		} else {
			groups.all = [...data.projects];
		}

		// Remove empty groups as requested
		const filteredGroups: Record<string, ProjectBySpaceItem[]> = {};
		for (const key in groups) {
			if (groups[key].length > 0) {
				// Default sort by position
				filteredGroups[key] = groups[key].sort((a, b) =>
					a.position.localeCompare(b.position),
				);
			}
		}

		return filteredGroups;
	}, [data?.projects, projectStatuses.data, groupBy]);

	const sortedGroupKeys = useMemo(() => {
		return Object.keys(groupedItems).sort((a, b) => {
			if (groupBy === "status") {
				const statusA = projectStatuses.data.find((s) => s.publicId === a);
				const statusB = projectStatuses.data.find((s) => s.publicId === b);
				if (!statusA || !statusB) return 0;
				return statusA.position.localeCompare(statusB.position);
			}
			if (groupBy === "priority") {
				return Number.parseInt(b, 10) - Number.parseInt(a, 10);
			}
			return 0;
		});
	}, [groupedItems, groupBy, projectStatuses.data]);

	if (isPending) return <div>Loading...</div>;
	if (!data) return <div>Space not found</div>;

	const projects = data.projects;

	return (
		<div className="container flex flex-col gap-4">
			<div className="mt-10 flex flex-row gap-2">
				<span className="font-bold text-3xl text-foreground/90">Projects</span>
			</div>

			<div className="flex flex-col gap-3">
				<div className="flex flex-row items-center justify-end">
					<div className="flex flex-row items-end gap-2">
						<ViewSettingsSelector
							groupBy={groupBy}
							onGroupByChange={setGroupBy}
						/>
						<Button
							variant={"outline"}
							size={"sm"}
							onClick={() =>
								open({
									type: "CREATE_PROJECT",
									data: { spacePublicId: id },
									modalSize: "lg",
								})
							}
						>
							New Project
						</Button>
					</div>
				</div>

				{projects?.length === 0 ? (
					<div className="flex h-32 items-center justify-center rounded-lg border-2 border-muted-foreground/20 border-dashed">
						<span className="text-muted-foreground text-sm">
							No projects in this space
						</span>
					</div>
				) : (
					<div className="flex flex-col gap-6">
						{sortedGroupKeys.map((groupKey) => {
							const groupProjects = groupedItems[groupKey] ?? [];
							let label = groupKey;
							let icon = null;

							if (groupBy === "status") {
								const status = projectStatuses.data.find(
									(s) => s.publicId === groupKey,
								);
								label = status?.name ?? "Uncategorized";
								icon = status
									? getStatusIcon(status.type, status.colorCode)
									: null;
							} else if (groupBy === "priority") {
								const priorityIdx = Number.parseInt(groupKey, 10);
								const priorityLabels = [
									"No Priority",
									"Low",
									"Medium",
									"High",
									"Urgent",
								];
								label = priorityLabels[priorityIdx];
							} else {
								label = "All Projects";
							}

							return (
								<Collapsible key={groupKey} defaultOpen className="space-y-1">
									<CollapsibleTrigger className="flex items-center gap-2 px-1 pb-1">
										{icon}
										<h3 className="font-semibold text-foreground/70 text-sm">
											{label}
										</h3>
										<span className="text-muted-foreground text-xs">
											{groupProjects.length}
										</span>
									</CollapsibleTrigger>
									<CollapsibleContent className="flex flex-col gap-1">
										{groupProjects.map((project) => (
											<ProjectItem
												key={project.publicId}
												project={project}
												spacePublicId={id}
												statuses={projectStatuses.data}
											/>
										))}
									</CollapsibleContent>
								</Collapsible>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}

function ViewSettingsSelector({
	groupBy,
	onGroupByChange,
}: {
	groupBy: GroupBy;
	onGroupByChange: (v: GroupBy) => void;
}) {
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
							<DropdownMenuRadioItem value="none">None</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="status">
								Status
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="priority">
								Priority
							</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
