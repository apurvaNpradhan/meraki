import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { IconAndColorPicker } from "@/components/icon-and-colorpicker";
import MainLayout from "@/components/layout/app-layout";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSpace, useUpdateSpace } from "@/features/spaces/hooks/use-space";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/(authenicated)/$slug/spaces/$id")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		return context.queryClient.ensureQueryData(
			orpc.space.byId.queryOptions({
				input: {
					spaceId: params.id,
				},
			}),
		);
	},
});

function RouteComponent() {
	const { id } = Route.useParams();
	const { data } = useSpace(id);
	const updateSpace = useUpdateSpace();
	if (!data) return null;
	return (
		<MainLayout header={<Header name={data.name} />}>
			<div className="mx-auto mt-5 flex max-w-4xl flex-col gap-4 px-4">
				<div className="flex flex-row items-center gap-3">
					<IconAndColorPicker
						icon={data.icon}
						color={data.colorCode}
						variant="soft"
						onIconChange={(icon) =>
							updateSpace.mutate({
								spacePublicId: id,
								input: {
									icon,
								},
							})
						}
						onColorChange={(color) =>
							updateSpace.mutate({
								spacePublicId: id,
								input: {
									colorCode: color,
								},
							})
						}
						iconSize={40}
					/>

					<span className="font-semibold text-4xl">{data.name}</span>
				</div>
			</div>
		</MainLayout>
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
