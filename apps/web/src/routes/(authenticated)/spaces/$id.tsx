import {
	closestCorners,
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconPlus } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { generateKeyBetween } from "fractional-indexing";
import { useEffect, useMemo, useState } from "react";
import { IconAndColorPicker } from "@/components/icon-and-color-picer";
import MainLayout from "@/components/layout/app-layout";
import { NotFound } from "@/components/not-found";
import { PrioritySelector } from "@/components/priority-selector";
import { getStatusIcon, StatusSelector } from "@/components/status-selector";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useUpdateProject } from "@/features/projects/hooks/use-project";
import { useSpace, useUpdateSpace } from "@/features/spaces/hooks/use-space";
import { useModal } from "@/stores/modal";
import type { ProjectBySpaceItem } from "@/types/project";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/(authenticated)/spaces/$id")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		return context.queryClient.ensureQueryData(
			orpc.space.byId.queryOptions({
				input: {
					spacePublicId: params.id,
				},
			}),
		);
	},
});

function RouteComponent() {
	const { id } = Route.useParams();
	const { data } = useSpace(id);
	const updateSpace = useUpdateSpace();
	const updateProject = useUpdateProject({ spacePublicId: id });
	const projectStatuses = useSuspenseQuery(
		orpc.projectStatus.all.queryOptions(),
	);

	const [items, setItems] = useState<Record<string, ProjectBySpaceItem[]>>({});
	const [_activeId, setActiveId] = useState<string | null>(null);

	useEffect(() => {
		if (data?.projects && projectStatuses.data) {
			const groups: Record<string, ProjectBySpaceItem[]> = {};

			for (const status of projectStatuses.data) {
				groups[status.publicId] = [];
			}
			groups.uncategorized = [];

			for (const project of data.projects) {
				const key = project.projectStatus?.publicId ?? "uncategorized";
				if (!groups[key]) {
					groups[key] = [];
				}
				groups[key].push(project);
			}
			setItems(groups);
		}
	}, [data?.projects, projectStatuses.data]);

	const columns = useMemo(() => {
		return projectStatuses.data.map((status) => ({
			id: status.publicId,
			title: status.name,
			color: status.colorCode,
			type: status.type,
		}));
	}, [projectStatuses.data]);

	const modal = useModal();

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const findContainer = (id: string) => {
		if (id in items) {
			return id;
		}

		return Object.keys(items).find((key) =>
			items[key].find((project) => project.publicId === id),
		);
	};

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(String(event.active.id));
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		const overId = over?.id;

		if (!overId || active.id === overId) {
			return;
		}

		const activeContainer = findContainer(String(active.id));
		const overContainer = findContainer(String(overId));

		if (
			!activeContainer ||
			!overContainer ||
			activeContainer === overContainer
		) {
			return;
		}

		setItems((prev) => {
			const activeItems = prev[activeContainer];
			const overItems = prev[overContainer];

			const activeIndex = activeItems.findIndex(
				(i) => i.publicId === active.id,
			);
			const overIndex = overItems.findIndex((i) => i.publicId === overId);

			let newIndex: number;
			if (overId in prev) {
				newIndex = overItems.length + 1;
			} else {
				const isBelowLastItem =
					over &&
					overIndex === overItems.length - 1 &&
					(event.delta.y ?? 0) > 0;

				const modifier = isBelowLastItem ? 1 : 0;

				newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
			}

			return {
				...prev,
				[activeContainer]: [
					...prev[activeContainer].filter(
						(item) => item.publicId !== active.id,
					),
				],
				[overContainer]: [
					...prev[overContainer].slice(0, newIndex),
					activeItems[activeIndex],
					...prev[overContainer].slice(newIndex, overItems.length),
				],
			};
		});
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		const activeContainer = findContainer(String(active.id));
		const overContainer = over ? findContainer(String(over.id)) : null;

		if (
			!activeContainer ||
			!overContainer ||
			!over ||
			(activeContainer === overContainer && active.id === over.id)
		) {
			setActiveId(null);
			return;
		}

		const activeIndex = items[activeContainer].findIndex(
			(i) => i.publicId === active.id,
		);
		const overIndex = items[overContainer].findIndex(
			(i) => i.publicId === over.id,
		);

		// Calculate the final items state
		const newItems = { ...items };

		if (activeContainer === overContainer) {
			newItems[activeContainer] = arrayMove(
				items[activeContainer],
				activeIndex,
				overIndex,
			);
		} else {
			// Moved to different container
			newItems[activeContainer] = items[activeContainer].filter(
				(i) => i.publicId !== active.id,
			);
			newItems[overContainer] = [
				...items[overContainer].slice(0, overIndex),
				items[activeContainer][activeIndex],
				...items[overContainer].slice(overIndex, items[overContainer].length),
			];
		}

		setItems(newItems);
		setActiveId(null);

		const destList = newItems[overContainer];
		const finalIndex = destList.findIndex((i) => i.publicId === active.id);
		const movedItem = destList[finalIndex];

		const prevItem = destList[finalIndex - 1];
		const nextItem = destList[finalIndex + 1];

		const position = generateKeyBetween(
			prevItem?.position ?? null,
			nextItem?.position ?? null,
		);

		const statusId = overContainer === "uncategorized" ? null : overContainer;

		updateProject.mutate({
			projectPublicId: movedItem.publicId,
			position,
			...(statusId !== movedItem.projectStatus.publicId && {
				projectStatusPublicId: statusId ?? undefined,
			}),
		});
	};

	if (!data) {
		return <NotFound />;
	}

	return (
		<MainLayout header={<Header name={data.name} />}>
			<div className="mx-auto mt-5 flex max-w-4xl flex-col gap-4 px-4">
				<div className="flex flex-row items-center gap-3">
					<IconAndColorPicker
						icon={data.icon}
						color={data.colorCode}
						variant="soft"
						onIconChange={(icon) =>
							updateSpace.mutate({ spacePublicId: id, icon })
						}
						onColorChange={(color) =>
							updateSpace.mutate({ spacePublicId: id, colorCode: color })
						}
						iconSize={40}
					/>

					<span className="font-semibold text-4xl">{data.name}</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="mt-10 font-semibold text-xl">Projects</span>
					<Button
						onClick={(_e) => {
							modal.open({
								type: "CREATE_PROJECT",
								data: {
									spacePublicId: id,
								},
							});
						}}
					>
						Add Project
					</Button>
				</div>
				<DndContext
					sensors={sensors}
					collisionDetection={closestCorners}
					onDragStart={handleDragStart}
					onDragOver={handleDragOver}
					onDragEnd={handleDragEnd}
				>
					{columns.map((c) => {
						const projects = items[c.id] ?? [];
						if (projects.length === 0) {
							return null;
						}

						// Render column even if empty to allow dropping,
						// but if empty and we want to allow dropping, the SortableContext
						// needs a container ref.
						return (
							<div key={c.id} className="space-y-1">
								<div
									className="flex items-center justify-between gap-2 text-pretty rounded-md px-2 py-1 font-medium text-xs"
									style={{
										backgroundColor: `${c.color}10`,
									}}
								>
									<div className="flex gap-2">
										{getStatusIcon(c.type, c.color)}
										<span className="">{c.title}</span>
									</div>
									<Button
										onClick={() => {
											modal.open({
												type: "CREATE_PROJECT",
												data: {
													spacePublicId: id,
													data: {
														projectStatusPublicId: c.id,
													},
												},
											});
										}}
										variant={"ghost"}
										size={"icon-sm"}
									>
										<IconPlus />
									</Button>
								</div>
								<SortableContext
									id={c.id}
									items={projects.map((p) => p.publicId)}
									strategy={verticalListSortingStrategy}
								>
									<SortableListContainer
										id={c.id}
										projects={projects}
										spacePublicId={id}
										statuses={projectStatuses.data}
									/>
								</SortableContext>
							</div>
						);
					})}
				</DndContext>
			</div>
		</MainLayout>
	);
}

function SortableListContainer({
	id,
	projects,
	spacePublicId,
	statuses,
}: {
	id: string;
	projects: ProjectBySpaceItem[];
	spacePublicId: string;
	statuses: any[];
}) {
	const { setNodeRef } = useSortable({ id: id, data: { type: "Container" } });

	return (
		<div ref={setNodeRef} className="flex min-h-[2rem] flex-col gap-0.5">
			{projects.map((p) => (
				<SortableProjectRow
					key={p.publicId}
					project={p}
					spacePublicId={spacePublicId}
					statuses={statuses}
				/>
			))}
		</div>
	);
}

function Header({ name }: { name: string }) {
	return (
		<div className="flex w-full flex-row items-center justify-between border-b px-2 py-1">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<span className="font-semibold text-sm">{name}</span>
			</div>
		</div>
	);
}

function SortableProjectRow({
	project,
	spacePublicId,
	statuses,
}: {
	project: ProjectBySpaceItem;
	spacePublicId: string;
	statuses: any[];
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: project.publicId, data: { type: "Project", project } });

	const style = {
		transform: CSS.Translate.toString(transform),
		transition,
		opacity: isDragging ? 0.3 : 1,
		position: "relative" as const,
		zIndex: isDragging ? 10 : "auto",
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="outline-none"
		>
			<ProjectRow
				project={project}
				spacePublicId={spacePublicId}
				statuses={statuses}
			/>
		</div>
	);
}

function ProjectRow({
	spacePublicId,
	project,
	statuses,
}: {
	spacePublicId: string;
	project: ProjectBySpaceItem;
	statuses: any[];
}) {
	const updateProject = useUpdateProject({ spacePublicId });

	return (
		<Link
			to="/projects/$id"
			params={{ id: project.publicId }}
			className="group ml-2 flex items-center rounded px-2 py-1 text-sm transition-colors hover:bg-accent/50"
		>
			<div className="flex flex-1 flex-row items-center gap-2">
				{/* biome-ignore lint/a11y: Stop propagation */}
				<div
					onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
					}}
				>
					<IconAndColorPicker
						icon={project.icon}
						color={project.colorCode}
						variant="soft"
						onIconChange={(icon) =>
							updateProject.mutate({ projectPublicId: project.publicId, icon })
						}
						onColorChange={(color) =>
							updateProject.mutate({
								projectPublicId: project.publicId,
								colorCode: color,
							})
						}
						iconSize={20}
					/>
				</div>
				<span className="truncate font-semibold">{project.name}</span>
			</div>
			{/* biome-ignore lint/a11y: Stop propagation */}
			<div
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
				}}
			>
				<StatusSelector
					project={project}
					spacePublicId={spacePublicId}
					statuses={statuses}
				/>
			</div>
			{/* biome-ignore lint/a11y: Stop propagation */}
			<div
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
				}}
			>
				<PrioritySelector
					project={project}
					onPriorityChange={(priority) =>
						updateProject.mutate({
							priority,
							projectPublicId: project.publicId,
						})
					}
				/>
			</div>
		</Link>
	);
}
