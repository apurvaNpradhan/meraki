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
import { SelectSpace } from "@meraki/db/schema/space";
import { generateKeyBetween } from "fractional-indexing";
import { useEffect, useState } from "react";
import type z from "zod";
import {
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { useSpaces, useUpdateSpace } from "../hooks/use-space";
import SortableSidebarSpaceItem from "./sortable-sidebar-space-item";

const SpaceSelectSchema = SelectSpace.pick({
	publicId: true,
	name: true,
	position: true,
	icon: true,
	colorCode: true,
});

type Space = z.infer<typeof SpaceSelectSchema>;
function SidebarSpaceList() {
	const { data: spaces, isPending } = useSpaces();
	const updateSpace = useUpdateSpace();
	const [items, setItems] = useState<Space[]>([]);

	useEffect(() => {
		if (!spaces) return;
		setItems(spaces);
	}, [spaces]);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	);

	const handleDragEnd = ({ active, over }: DragEndEvent) => {
		if (!over || active.id === over.id) return;

		const oldIndex = items.findIndex((i: Space) => i.publicId === active.id);
		const newIndex = items.findIndex((i: Space) => i.publicId === over.id);

		const reordered = arrayMove(items, oldIndex, newIndex);
		setItems(reordered);

		const prev = reordered[newIndex - 1]?.position;
		const next = reordered[newIndex + 1]?.position;

		updateSpace.mutate({
			spacePublicId: String(active.id),
			position: generateKeyBetween(prev, next),
		});
	};

	return (
		<SidebarGroupContent>
			<SidebarMenu className="gap-1">
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
							<SortableSidebarSpaceItem key={space.publicId} data={space} />
						))}
					</SortableContext>
				</DndContext>
			</SidebarMenu>
		</SidebarGroupContent>
	);
}

export default SidebarSpaceList;
