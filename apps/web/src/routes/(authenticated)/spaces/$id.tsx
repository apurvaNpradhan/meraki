import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import MainLayout from "@/components/layout/app-layout";
import { NotFound } from "@/components/not-found";
import { Button } from "@/components/ui/button";
import { useCreateProject } from "@/features/projects/hooks/use-project";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/(authenticated)/spaces/$id")({
	loader: async ({ context, params }) => {
		return context.queryClient.ensureQueryData(
			orpc.space.byId.queryOptions({
				input: {
					spacePublicId: params.id,
				},
			}),
		);
	},
	component: RouteComponent,
});

function RouteComponent() {
	const create = useCreateProject();
	const { id } = Route.useParams();
	const { data } = useSuspenseQuery(
		orpc.space.byId.queryOptions({
			input: {
				spacePublicId: id,
			},
		}),
	);
	const { data: projectStatuses } = useQuery(
		orpc.projectStatus.all.queryOptions({}),
	);
	// const [groupBy, setGroupBy] = useState<"status">("status");
	const [groupBy] = useState<"status">("status");

	const groupedProjects = useMemo(() => {
		const projects = data?.projects;
		if (!projects) return {};
		const groups: Record<string, typeof projects> = {};
		for (const project of projects) {
			const key =
				groupBy === "status" ? project.status.publicId : "uncategorized";
			if (!groups[key]) {
				groups[key] = [];
			}
			groups[key].push(project);
		}
		return groups;
	}, [data, groupBy]);

	const columns = useMemo(() => {
		if (groupBy === "status" && projectStatuses) {
			return projectStatuses.map((status) => ({
				id: status.publicId,
				title: status.name,
				color: status.colorCode,
			}));
		}
		return [];
	}, [groupBy, projectStatuses]);
	if (!data) return null;
	return (
		<MainLayout>
			<div className="flex flex-col gap-4 p-4">
				<div className="flex items-center justify-between">
					<h1 className="font-bold text-2xl">{data.name}</h1>
					<Button
						onClick={() => {
							if (!projectStatuses?.length) return;
							create.mutate({
								name: "New Project",
								statusPublicId: projectStatuses[1].publicId,
								spacePublicId: id,
								description: "asdasd",
								priority: 0,
							});
						}}
						disabled={create.isPending || !projectStatuses?.length}
					>
						{create.isPending ? "Creating..." : "Create Default Project"}
					</Button>
				</div>

				<div className="flex gap-4 overflow-x-auto pb-4">
					{columns.map((column) => {
						const projects = groupedProjects[column.id] || [];

						return (
							<div
								key={column.id}
								className="flex w-80 shrink-0 flex-col gap-3"
							>
								<div className="flex items-center gap-2">
									<div
										className="h-2 w-2 rounded-full"
										style={{ backgroundColor: column.color }}
									/>
									<span className="font-semibold text-foreground/80 text-sm">
										{column.title}
									</span>
									<span className="text-muted-foreground text-xs">
										{projects.length}
									</span>
								</div>

								<div className="flex flex-col gap-2">
									{projects.map((project) => (
										<div
											key={project.publicId}
											className="flex flex-col gap-1 rounded-lg border bg-card p-3 shadow-sm transition-colors hover:bg-accent/5"
										>
											<span className="font-medium text-sm">
												{project.name}
											</span>
											{project.description && (
												<span className="line-clamp-2 text-muted-foreground text-xs">
													{project.description}
												</span>
											)}
										</div>
									))}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</MainLayout>
	);
}
