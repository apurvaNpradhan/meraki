import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as TablerIcons from "@tabler/icons-react";
import { IconBox } from "@tabler/icons-react";
import { useLoaderData, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useRouteActive } from "@/hooks/use-active-route";
import { cn } from "@/lib/utils";
import { useModal } from "@/stores/modal.store";
import type { SidebarSpace } from "@/types/space";

interface SortableSpaceItemProps {
	data: SidebarSpace;
}
export default function SortableSidebarSpaceItem({
	data,
}: SortableSpaceItemProps) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({
			id: data.publicId,
		});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};
	const { open } = useModal();
	const Icon = data.icon
		? (TablerIcons[data.icon as keyof typeof TablerIcons] as React.ElementType)
		: IconBox;

	const _isActive = useRouteActive();
	const navigate = useNavigate();

	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";
	const { workspace } = useLoaderData({ from: "/(authenicated)/$slug" });

	return (
		<ContextMenu>
			<SidebarMenuItem
				ref={setNodeRef}
				style={style}
				{...attributes}
				{...listeners}
			>
				<ContextMenuTrigger className="group/item flex w-full items-center gap-[2px]">
					<div className="group/menu-item relative flex flex-1 flex-row items-center justify-between rounded-md p-0 p-1 text-left text-sm hover:bg-accent/40">
						<button
							type="button"
							data-slot="sidebar-menu-button"
							data-sidebar="menu-button"
							onClick={() => {
								navigate({
									to: "/$slug/spaces/$id",
									params: { slug: workspace.slug, id: data.publicId },
								});
							}}
							className={cn(
								"flex flex-1 items-center justify-start gap-2",
								isCollapsed && "justify-center",
							)}
						>
							{Icon ? (
								<Icon
									size={16}
									style={{ color: data.colorCode ?? undefined }}
								/>
							) : (
								<IconBox size={16} />
							)}
							{!isCollapsed && (
								<span className="line-clamp-1 font-medium">{data.name}</span>
							)}
						</button>
						{!isCollapsed && (
							<DropdownMenu>
								<DropdownMenuTrigger
									className="opacity-0 group-hover/item:opacity-100"
									onClick={(e) => e.stopPropagation()}
									render={<Button variant={"ghost"} size={"icon-sm"} />}
								>
									<TablerIcons.IconDots size={14} />
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem
										variant="destructive"
										onClick={(e) => {
											e.stopPropagation();
											open({
												type: "DELETE_SPACE",
												title: "Delete Space",
												data: {
													space: data,
												},
											});
										}}
									>
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</ContextMenuTrigger>
			</SidebarMenuItem>

			<ContextMenuContent className="w-52">
				<ContextMenuItem
					inset
					variant="destructive"
					onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
						open({
							type: "DELETE_SPACE",
							title: "Delete Space",
							data: {
								space: data,
							},
						});
					}}
				>
					Delete
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
