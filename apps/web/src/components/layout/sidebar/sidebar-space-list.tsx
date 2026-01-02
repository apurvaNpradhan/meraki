import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { SelectSpace } from "@meraki/db/schema/space";
import { generateKeyBetween } from "fractional-indexing";
import { useEffect, useState } from "react";
import {
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import {
	useDeleteSpace,
	useSpaces,
	useUpdateSpace,
} from "../../../hooks/use-spaces";
import SortableSidebarSpaceItem from "./sortable-sidebar-space-item";

export function SidebarSpaceList() {
	const { data: spaces, isPending } = useSpaces();
	const updateSpace = useUpdateSpace();
	const [items, setItems] = useState<SelectSpace[]>([]);

	useEffect(() => {
		if (!spaces) return;
		setItems(spaces);
	}, [spaces]);

	const [_spaceToDelete, _setSpaceToDelete] = useState<SelectSpace | null>(
		null,
	);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	);

	const deleteSpace = useDeleteSpace();

	const handleDragEnd = ({ active, over }: DragEndEvent) => {
		if (!over || active.id === over.id) return;

		const oldIndex = items.findIndex((i) => i.publicId === active.id);
		const newIndex = items.findIndex((i) => i.publicId === over.id);

		const reordered = arrayMove(items, oldIndex, newIndex);
		setItems(reordered);

		const prev = reordered[newIndex - 1]?.position;
		const next = reordered[newIndex + 1]?.position;

		updateSpace.mutate({
			publicId: String(active.id),
			data: {
				position: generateKeyBetween(prev, next),
			},
		});
	};

	return (
		<SidebarGroupContent>
			<SidebarMenu className="flex flex-col gap-1">
				{isPending &&
					Array.from({ length: 3 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton
						<SidebarMenuSkeleton key={i} />
					))}
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<SortableContext
						items={items.map((i) => i.publicId)}
						strategy={verticalListSortingStrategy}
					>
						{items.map((space) => (
							<SortableSidebarSpaceItem
								key={space.publicId}
								data={space}
								handleDelete={(publicId) => deleteSpace.mutate({ publicId })}
							/>
						))}
					</SortableContext>
				</DndContext>
			</SidebarMenu>
		</SidebarGroupContent>
	);
}
