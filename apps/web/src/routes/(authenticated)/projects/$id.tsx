import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/app-layout";
import { useProject } from "@/features/projects/hooks/use-project";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/(authenticated)/projects/$id")({
	component: RouteComponent,
	beforeLoad: async ({ context, params }) => {
		return context.queryClient.ensureQueryData(
			orpc.project.byId.queryOptions({
				input: {
					projectPublicId: params.id,
				},
			}),
		);
	},
});

function RouteComponent() {
	const { id } = Route.useParams();
	const { data } = useProject(id);
	return (
		<MainLayout>
			<div className="flex flex-col gap-4">
				<div className="flex items-center gap-2">
					<span className="font-bold text-2xl">{data?.name}</span>
				</div>
			</div>
		</MainLayout>
	);
}
