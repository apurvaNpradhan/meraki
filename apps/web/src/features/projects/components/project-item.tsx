import { IconCheck, IconDotsVertical, IconTrash } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useLoaderData, useNavigate } from "@tanstack/react-router";
import { IconAndColorPicker } from "@/components/icon-and-colorpicker";
import { PrioritySelector, priorities } from "@/components/priority-selector";
import { Button } from "@/components/ui/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { useModal } from "@/stores/modal.store";
import type { ProjectBySpaceItem } from "@/types/project";
import { orpc } from "@/utils/orpc";
import { useUpdateProject } from "../hooks/use-project";
import { getStatusIcon, StatusSelector } from "./status-selector";

interface ProjectItemProps {
	project: ProjectBySpaceItem;
	spacePublicId: string;
	className?: string;
}

export function ProjectItem({
	project,
	spacePublicId,
	className,
}: ProjectItemProps) {
	const updateProject = useUpdateProject({ spacePublicId });
	const { open } = useModal();
	const navigate = useNavigate();
	const { workspace } = useLoaderData({ from: "/(authenicated)/$slug" });
	const projectStatuses = useSuspenseQuery(
		orpc.projectStatus.all.queryOptions(),
	);
	const priority =
		priorities.find((p) => p.value === project.priority) ?? priorities[0];

	return (
		<ContextMenu>
			<ContextMenuTrigger
				render={
					<Item
						className={cn(
							"group/project-item rounded-none p-2 transition-all hover:bg-accent/40",
							className,
						)}
						variant="default"
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								navigate({
									to: "/$slug/projects/$id",
									params: { slug: workspace.slug, id: project.publicId },
								});
							}
						}}
					>
						<ItemMedia>
							<IconAndColorPicker
								icon={project.icon}
								color={project.colorCode}
								iconSize={18}
								onIconChange={(icon) =>
									updateProject.mutate({
										projectPublicId: project.publicId,
										icon,
									})
								}
								onColorChange={(colorCode) =>
									updateProject.mutate({
										projectPublicId: project.publicId,
										colorCode,
									})
								}
							/>
						</ItemMedia>

						<ItemContent
							className="cursor-pointer"
							role="button"
							onClick={() =>
								navigate({
									to: "/$slug/projects/$id",
									params: { slug: workspace.slug, id: project.publicId },
								})
							}
						>
							<ItemTitle>{project.name}</ItemTitle>
						</ItemContent>

						<ItemActions>
							<div className="flex items-center gap-1">
								<StatusSelector
									project={project}
									spacePublicId={spacePublicId}
									className="w-fit"
									projectPublicId={project.publicId}
									showLabel={false}
								/>

								<PrioritySelector
									value={project.priority}
									className="w-fit"
									onPriorityChange={(priority) =>
										updateProject.mutate({
											projectPublicId: project.publicId,
											priority,
										})
									}
									showLabel={false}
								/>

								<DropdownMenu>
									<DropdownMenuTrigger
										render={
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 hover:bg-accent"
											>
												<IconDotsVertical className="h-4 w-4" />
											</Button>
										}
									/>
									<DropdownMenuContent align="end" className="w-48">
										<DropdownMenuSeparator />

										<DropdownMenuItem
											className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
											onClick={() =>
												open({
													type: "DELETE_PROJECT",
													data: {
														project: {
															...project,
															spacePublicId,
														},
													},
												})
											}
										>
											<IconTrash className="mr-2 h-4 w-4" />
											Delete Project
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</ItemActions>
					</Item>
				}
			/>
			<ContextMenuContent className="w-64">
				<ContextMenuItem
					onClick={() =>
						navigate({
							to: "/$slug/projects/$id",
							params: { slug: workspace.slug, id: project.publicId },
						})
					}
				>
					<IconDotsVertical className="mr-2 h-4 w-4" />
					View Project
				</ContextMenuItem>

				<ContextMenuSeparator />

				<ContextMenuSub>
					<ContextMenuSubTrigger>
						<priority.icon
							className="mr-2 h-4 w-4"
							style={{ color: priority.color }}
						/>
						Priority
					</ContextMenuSubTrigger>
					<ContextMenuSubContent>
						{priorities.map((p) => (
							<ContextMenuItem
								key={p.id}
								onClick={() =>
									updateProject.mutate({
										projectPublicId: project.publicId,
										priority: p.value,
									})
								}
							>
								<p.icon className="mr-2 h-4 w-4" style={{ color: p.color }} />
								{p.name}
								{project.priority === p.value && (
									<IconCheck className="ml-auto h-4 w-4" />
								)}
							</ContextMenuItem>
						))}
					</ContextMenuSubContent>
				</ContextMenuSub>

				<ContextMenuSub>
					<ContextMenuSubTrigger>
						{project.projectStatus &&
							getStatusIcon(
								project.projectStatus.type,
								project.projectStatus.colorCode,
							)}
						Status
					</ContextMenuSubTrigger>
					<ContextMenuSubContent>
						{projectStatuses.data?.map((s) => (
							<ContextMenuItem
								key={s.publicId}
								onClick={() =>
									updateProject.mutate({
										projectPublicId: project.publicId,
										projectStatusPublicId: s.publicId,
									})
								}
							>
								{getStatusIcon(s.type, s.colorCode)}
								{s.name}
								{project.projectStatus?.publicId === s.publicId && (
									<IconCheck className="ml-auto h-4 w-4" />
								)}
							</ContextMenuItem>
						))}
					</ContextMenuSubContent>
				</ContextMenuSub>

				<ContextMenuSeparator />
				<ContextMenuItem
					className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
					onClick={() =>
						open({
							type: "DELETE_PROJECT",
							data: {
								project: {
									...project,
									spacePublicId,
								},
							},
						})
					}
				>
					<IconTrash className="mr-2 h-4 w-4" />
					Delete Project
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}

export function ProjectItemSkeleton() {
	return (
		<Item className="rounded-none border-none p-2">
			<ItemMedia>
				<div className="h-5 w-5 animate-pulse rounded bg-muted" />
			</ItemMedia>
			<ItemContent>
				<div className="h-4 w-48 animate-pulse rounded bg-muted" />
			</ItemContent>
			<ItemActions>
				<div className="h-8 w-24 animate-pulse rounded bg-muted" />
			</ItemActions>
		</Item>
	);
}
