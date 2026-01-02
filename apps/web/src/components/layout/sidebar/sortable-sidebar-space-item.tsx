import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SelectSpace } from "@meraki/db/schema/space";
import * as TablerIcons from "@tabler/icons-react";
import { IconBox, IconGripVertical } from "@tabler/icons-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
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
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useModal } from "@/stores/modal";

interface SortableSpaceItemProps {
	data: SelectSpace;
	handleDelete: (publicId: string) => void;
}

export default function SortableSidebarSpaceItem({
	data,
	handleDelete,
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

	const [_isAlertOpen, _setIsAlertOpen] = useState(false);
	const navigate = useNavigate();
	const params = useParams({ strict: false });
	// @ts-expect-error
	const isActive = params.slug === data.slug;

	return (
		<ContextMenu>
			<SidebarMenuItem ref={setNodeRef} style={style}>
				<ContextMenuTrigger className="group/item flex w-full items-center gap-[2px]">
					<div
						{...attributes}
						{...listeners}
						className="flex shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground/50 opacity-0 transition-opacity hover:bg-accent hover:text-accent-foreground active:cursor-grabbing group-hover/item:opacity-100"
					>
						<IconGripVertical size={16} />
					</div>
					<SidebarMenuButton
						size="sm"
						onClick={() => {
							navigate({
								to: "/spaces/$slug",
								params: { slug: data.slug },
							});
						}}
						className={cn(
							"flex flex-1 flex-row items-center justify-between gap-2 rounded-md px-2 py-1.5 transition-colors duration-100",
							isActive
								? "bg-accent font-medium text-accent-foreground"
								: "hover:bg-accent/50 group/item-hover:text-accent-foreground",
						)}
					>
						<div className="flex items-center gap-2">
							{Icon ? (
								<Icon size={18} style={{ color: data.colorCode }} />
							) : (
								<IconBox size={18} />
							)}
							<span className="line-clamp-1 flex-1 font-medium">
								{data.name}
							</span>
						</div>
					</SidebarMenuButton>

					<DropdownMenu>
						<DropdownMenuTrigger
							className="absolute right-2 flex items-center justify-center rounded-md p-1 text-muted-foreground/50 opacity-0 transition-opacity hover:bg-accent hover:text-accent-foreground active:cursor-grabbing group-hover/item:opacity-100"
							onClick={(e) => e.stopPropagation()}
						>
							<TablerIcons.IconDots size={14} />
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();

									open({
										type: "UPDATE_SPACE",
										title: "Edit Space",
										data: {
											values: data,
											publicId: data.publicId,
										},
									});
								}}
							>
								Edit
							</DropdownMenuItem>
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
				</ContextMenuTrigger>
			</SidebarMenuItem>

			<ContextMenuContent className="w-52">
				<ContextMenuItem
					inset
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						open({
							type: "UPDATE_SPACE",
							title: "Edit Space",
							data: {
								values: data,
								publicId: data.publicId,
							},
						});
					}}
				>
					Edit
				</ContextMenuItem>
				<ContextMenuItem
					inset
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
				</ContextMenuItem>
			</ContextMenuContent>

			{/* <DeleteSpaceDialog
				data={data}
				handleDelete={handleDelete}
				isAlertOpen={isAlertOpen}
				setIsAlertOpen={setIsAlertOpen}
			/> */}
		</ContextMenu>
	);
}
