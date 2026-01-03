import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SelectSpace } from "@meraki/db/schema/space";
import * as TablerIcons from "@tabler/icons-react";
import { IconBox, IconGripVertical } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import type z from "zod";
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
import { SidebarMenuItem } from "@/components/ui/sidebar";
import { useRouteActive } from "@/hooks/use-active-route";
import { useModal } from "@/stores/modal";

interface SortableSpaceItemProps {
	data: Space;
}
const SpaceSelectSchema = SelectSpace.pick({
	publicId: true,
	name: true,
	position: true,
	icon: true,
	colorCode: true,
});

type Space = z.infer<typeof SpaceSelectSchema>;
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

	return (
		<ContextMenu>
			<SidebarMenuItem ref={setNodeRef} style={style}>
				<ContextMenuTrigger className="group/item flex w-full items-center gap-[2px] p-1">
					<div
						{...attributes}
						{...listeners}
						className="flex shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground/50 opacity-0 transition-opacity hover:bg-accent hover:text-accent-foreground active:cursor-grabbing group-hover/item:opacity-100"
					>
						<IconGripVertical size={16} />
					</div>
					<SidebarMenuItem
						onClick={() => {
							navigate({
								to: "/spaces/$id",
								params: { id: data.publicId },
							});
						}}
						className="flex flex-1 flex-row items-center justify-between gap-2"
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
						<DropdownMenu>
							<DropdownMenuTrigger
								className="flex items-center justify-center rounded-md p-1 text-muted-foreground/50 opacity-0 transition-opacity hover:bg-accent hover:text-accent-foreground active:cursor-grabbing group-hover/item:opacity-100"
								onClick={(e) => e.stopPropagation()}
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
					</SidebarMenuItem>
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
