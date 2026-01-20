import {
	IconChevronDown,
	IconChevronUp,
	IconFilter,
	IconLayoutKanban,
	IconPlus,
	IconSearch,
} from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionHeader,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectItem } from "@/features/projects/components/project-item";
import { getStatusIcon } from "@/features/projects/components/status-selector";
import { useProjectsBySpaceId } from "@/features/projects/hooks/use-project";
import { useModal } from "@/stores/modal.store";
import type { ProjectBySpaceItem } from "@/types/project";
import { orpc } from "@/utils/orpc";

type GroupBy = "status" | "priority" | "none";

export function SpaceProjects({ id }: { id: string }) {
	const { data } = useProjectsBySpaceId(id);
	const projectStatuses = useSuspenseQuery(
		orpc.projectStatus.all.queryOptions(),
	);
	const [groupBy, setGroupBy] = useState<GroupBy>("status");
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const { open } = useModal();

	const groupedItems = useMemo(() => {
		if (!data || !projectStatuses.data) return {};

		const groups: Record<string, ProjectBySpaceItem[]> = {};

		const filteredData = searchQuery
			? data.filter((p) =>
					p.name.toLowerCase().includes(searchQuery.toLowerCase()),
				)
			: data;

		if (groupBy === "status") {
			for (const status of projectStatuses.data) {
				groups[status.publicId] = [];
			}
			groups.uncategorized = [];
			for (const project of filteredData) {
				const key = project.projectStatus?.publicId ?? "uncategorized";
				if (!groups[key]) groups[key] = [];
				groups[key].push(project);
			}
		} else if (groupBy === "priority") {
			for (let i = 0; i <= 4; i++) {
				groups[i.toString()] = [];
			}
			for (const project of filteredData) {
				const key = (project.priority ?? 0).toString();
				if (!groups[key]) groups[key] = [];
				groups[key].push(project);
			}
		} else {
			groups.all = [...filteredData];
		}

		const filteredGroups: Record<string, ProjectBySpaceItem[]> = {};
		for (const key in groups) {
			if (groups[key].length > 0) {
				filteredGroups[key] = groups[key].sort((a, b) =>
					a.position.localeCompare(b.position),
				);
			}
		}

		return filteredGroups;
	}, [data, projectStatuses.data, groupBy, searchQuery]);

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

	if (!data) return null;

	const projects = data;

	return (
		<div className="flex w-full flex-col">
			<div className="flex flex-row items-center justify-end border-b p-2">
				<div className="flex flex-row items-center gap-2">
					{isSearchOpen ? (
						<div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1">
							<IconSearch size={16} className="text-muted-foreground" />
							<input
								type="text"
								placeholder="Search projects..."
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
							<DropdownMenu>
								<DropdownMenuTrigger
									render={
										<Button variant="outline" size="icon-sm">
											<IconLayoutKanban size={18} />
										</Button>
									}
								/>
								<DropdownMenuContent align="end" className="w-48">
									<DropdownMenuRadioGroup
										value={groupBy}
										onValueChange={(v) => setGroupBy(v as GroupBy)}
									>
										<DropdownMenuRadioItem value="status">
											Group by Status
										</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="priority">
											Group by Priority
										</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="none">
											No Grouping
										</DropdownMenuRadioItem>
									</DropdownMenuRadioGroup>
								</DropdownMenuContent>
							</DropdownMenu>
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
								type: "CREATE_PROJECT",
								data: {
									spacePublicId: id,
								},
								modalSize: "lg",
							})
						}
					>
						<IconPlus />
						New Project
					</Button>
				</div>
			</div>
			<div className="flex flex-col">
				<div className="flex flex-row items-center justify-end" />

				{projects?.length === 0 ? (
					<div className="flex h-32 items-center justify-center rounded-lg border-2 border-muted-foreground/20 border-dashed">
						<span className="text-muted-foreground text-sm">
							No projects in this space
						</span>
					</div>
				) : (
					<Accordion
						className="flex flex-col"
						multiple
						defaultValue={sortedGroupKeys}
					>
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

							const status =
								groupBy === "status"
									? projectStatuses.data.find((s) => s.publicId === groupKey)
									: null;

							return (
								<AccordionItem
									className="w-full border-none"
									value={groupKey}
									key={groupKey}
								>
									<AccordionHeader
										className="flex w-full flex-row items-center justify-between rounded-none border-none bg-background p-0 transition-colors hover:bg-muted data-[state=open]:bg-muted"
										style={{
											borderLeft: status?.colorCode
												? `6px solid ${status.colorCode}`
												: undefined,
											backgroundColor: status?.colorCode
												? `color-mix(in srgb, ${status.colorCode} 6%, var(--background))`
												: undefined,
										}}
									>
										<AccordionTrigger className="flex h-full flex-1 items-center gap-2 rounded-none border-y-border px-1 py-2 hover:no-underline">
											<div className="flex items-center gap-2">
												<div className="flex h-5 w-5 items-center justify-center rounded-md hover:text-primary">
													<IconChevronDown
														data-slot="accordion-trigger-icon"
														className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
													/>
													<IconChevronUp
														data-slot="accordion-trigger-icon"
														className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
													/>
												</div>

												{icon}
												<h3 className="flex flex-row items-center gap-2 font-semibold text-foreground/70 text-xs">
													{label}
													<span className="font-normal text-muted-foreground text-xs">
														{groupProjects.length}
													</span>
												</h3>
											</div>
										</AccordionTrigger>
										<div className="px-2">
											<Button
												variant="ghost"
												size="icon-xs"
												onClick={(e) => {
													e.stopPropagation();
													open({
														type: "CREATE_PROJECT",
														data: {
															spacePublicId: id,
															data: {
																...(groupBy === "status" && {
																	projectStatusPublicId: groupKey,
																}),
																...(groupBy === "priority" && {
																	priority: Number.parseInt(groupKey, 10),
																}),
															},
														},
														modalSize: "lg",
													});
												}}
											>
												<IconPlus />
											</Button>
										</div>
									</AccordionHeader>
									<AccordionContent className="flex flex-col p-0">
										{groupProjects.map((project) => (
											<ProjectItem
												key={project.publicId}
												project={project}
												spacePublicId={id}
											/>
										))}
									</AccordionContent>
								</AccordionItem>
							);
						})}
					</Accordion>
				)}
			</div>
		</div>
	);
}
