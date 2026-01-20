import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { SpaceOverview } from "@/features/spaces/components/space-overview";

export const Route = createFileRoute(
	"/(authenicated)/$slug/spaces/$id/overview",
)({
	loader: async ({ context, params }) => {
		const { queryClient, orpc } = context;
		const spaces = queryClient.ensureQueryData(
			orpc.space.getOverview.queryOptions({
				input: { spacePublicId: params.id },
			}),
		);
		return { spaces };
	},

	component: () => {
		const { id } = Route.useParams();
		return <SpaceOverview id={id} />;
	},
	pendingComponent: () => (
		<div className="container flex flex-col gap-4">
			<div className="mt-10 flex flex-row items-center gap-4">
				<Skeleton className="h-12 w-12 rounded-lg" />
				<Skeleton className="h-10 w-64" />
			</div>
			<div className="mt-5 flex flex-col gap-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-[90%]" />
				<Skeleton className="h-4 w-[85%]" />
			</div>
		</div>
	),
});
