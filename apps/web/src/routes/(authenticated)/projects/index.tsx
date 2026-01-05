import { useIntersection } from "@mantine/hooks";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { IconAndColorPicker } from "@/components/icon-and-color-picer";
import MainLayout from "@/components/layout/app-layout";
import Loader from "@/components/loader";
import { PrioritySelector } from "@/components/priority-selector";
import { StatusSelector } from "@/components/status-selector";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
	useProjects,
	useUpdateProject,
} from "@/features/projects/hooks/use-project";
import type { ProjectBySpaceItem, ProjectStatus } from "@/types/project";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/(authenticated)/projects/")({
	component: ProjectsPage,
});

function ProjectsPage() {
	const { data, isPending, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useProjects();
	const viewportRef = useRef<HTMLDivElement>(null);
	const { ref, entry } = useIntersection({
		root: viewportRef.current,
		threshold: 1,
	});

	useEffect(() => {
		if (entry?.isIntersecting && hasNextPage) {
			fetchNextPage();
		}
	}, [entry, fetchNextPage, hasNextPage]);

	const projects = data?.pages.flatMap((page) => page.items) ?? [];
	const projectStatuses = useSuspenseQuery(
		orpc.projectStatus.all.queryOptions(),
	);
	return (
		<MainLayout header={<Header />}>
			<div className="mx-auto mt-5 flex max-w-4xl flex-col gap-4 px-4 pb-10">
				{" "}
				<h1 className="font-semibold text-2xl">All Projects</h1>{" "}
				{isPending && <Loader />}
				<div className="flex flex-col gap-2">
					{" "}
					{projects.map((project) => (
						<ProjectRow
							key={project.publicId}
							project={project}
							statuses={projectStatuses.data}
						/>
					))}{" "}
					{isFetchingNextPage && (
						<div className="py-4 text-center text-muted-foreground text-sm">
							Loading more...
						</div>
					)}
					<div ref={ref} className="h-4 w-full" />
				</div>
			</div>
		</MainLayout>
	);
}

function Header() {
	return (
		<div className="flex w-full flex-row items-center justify-between border-b px-2 py-1">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<span className="font-semibold text-sm">Projects</span>
			</div>
		</div>
	);
}

function ProjectRow({
	project,
	statuses,
}: {
	project: ProjectBySpaceItem & {
		space: {
			publicId: string;
			name: string;
			icon: string;
			colorCode: string;
		};
	};
	statuses: ProjectStatus[];
}) {
	const updateProject = useUpdateProject({
		spacePublicId: project.space?.publicId,
	});

	return (
		<Link
			to="/projects/$id"
			params={{ id: project.publicId }}
			className="group flex items-center rounded px-1 py-2 text-sm transition-colors hover:bg-accent/50"
		>
			<div className="flex flex-1 flex-row items-center gap-3">
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
				<div className="flex flex-col gap-0.5">
					<span className="truncate font-semibold">{project.name}</span>
					{project.space && (
						<div className="flex items-center gap-1.5">
							<Badge
								variant="outline"
								className="h-5 px-1.5 py-0 font-normal text-[10px] text-muted-foreground"
							>
								{project.space.name}
							</Badge>
						</div>
					)}
				</div>
			</div>

			<div className="flex items-center gap-2">
				{/* biome-ignore lint/a11y: Stop propagation */}
				<div
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
				>
					<StatusSelector project={project} statuses={statuses} />
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
			</div>
		</Link>
	);
}
