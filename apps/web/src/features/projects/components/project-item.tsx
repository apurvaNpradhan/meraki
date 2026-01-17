import { IconDotsVertical, IconTrash } from "@tabler/icons-react";
import { useLoaderData, useNavigate } from "@tanstack/react-router";
import { IconAndColorPicker } from "@/components/icon-and-colorpicker";
import { PrioritySelector } from "@/components/priority-selector";
import { Button } from "@/components/ui/button";
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
import type { ProjectBySpaceItem, ProjectStatus } from "@/types/project";
import { useDeleteProject, useUpdateProject } from "../hooks/use-project";
import { StatusSelector } from "./status-selector";

interface ProjectItemProps {
	project: ProjectBySpaceItem;
	spacePublicId: string;
	statuses: ProjectStatus[];
	className?: string;
}

export function ProjectItem({
	project,
	spacePublicId,
	statuses,
	className,
}: ProjectItemProps) {
	const updateProject = useUpdateProject({ spacePublicId });
	const deleteProject = useDeleteProject();
	const navigate = useNavigate();
	const { workspace } = useLoaderData({ from: "/(authenicated)/$slug" });

	return (
		<Item
			className={cn(
				"group/project-item p-1 transition-all hover:bg-accent/40",
				className,
			)}
			variant="default"
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
				tabIndex={0}
				onClick={() =>
					navigate({
						to: "/$slug/projects/$id",
						params: { slug: workspace.slug, id: project.publicId },
						search: {
							view: "overview",
						},
					})
				}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						navigate({
							to: "/$slug/projects/$id",
							params: { slug: workspace.slug, id: project.publicId },
							search: {
								view: "overview",
							},
						});
					}
				}}
			>
				<ItemTitle>{project.name}</ItemTitle>
			</ItemContent>

			<ItemActions>
				<div className="flex items-center">
					<StatusSelector
						project={project}
						statuses={statuses}
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
								onSelect={() =>
									deleteProject.mutate({ projectPublicId: project.publicId })
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
	);
}
