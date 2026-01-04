import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import SettingLayout from "@/components/layout/setting-layout";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@/components/ui/item";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute(
	"/(authenticated)/settings/project-statuses",
)({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			orpc.projectStatus.all.queryOptions(),
		);
	},
});

function RouteComponent() {
	return (
		<SettingLayout>
			<div className="mx-auto mt-15 flex max-w-4xl flex-col gap-7">
				<span className="font-bold text-3xl">Project Statuses</span>
				<ProjectStatusesView />
			</div>
		</SettingLayout>
	);
}

function ProjectStatusesView() {
	const { data } = useSuspenseQuery(orpc.projectStatus.all.queryOptions());
	return (
		<div>
			{data.map((d) => (
				<Item key={d.publicId}>
					<ItemContent>
						<ItemTitle>{d.name}</ItemTitle>
						<ItemDescription>{d.description}</ItemDescription>
					</ItemContent>
				</Item>
			))}
		</div>
	);
}
