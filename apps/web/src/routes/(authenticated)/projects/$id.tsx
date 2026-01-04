import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/app-layout";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/(authenticated)/projects/$id")({
	loader: async ({ context, params }) => {
		return context.queryClient.ensureQueryData(
			orpc.project.byId.queryOptions({
				input: {
					publicId: params.id,
				},
			}),
		);
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();
	const { data: project } = useSuspenseQuery(
		orpc.project.byId.queryOptions({
			input: {
				publicId: id,
			},
		}),
	);

	return (
		<MainLayout>
			<div className="flex h-full flex-col gap-6 p-6">
				<div>
					<h1 className="font-bold text-2xl text-foreground tracking-tight">
						{project.name}
					</h1>
					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						<span>{project.space.name}</span>
						<span>•</span>
						<span
							className="flex items-center gap-1.5"
							style={{ color: project.status.colorCode }}
						>
							<div
								className="h-2 w-2 rounded-full"
								style={{ backgroundColor: project.status.colorCode }}
							/>
							{project.status.name}
						</span>
					</div>
					{project.description && (
						<p className="mt-4 text-muted-foreground">{project.description}</p>
					)}
				</div>
				{/* Future details: tasks, chat, etc. */}
			</div>
		</MainLayout>
	);
}
