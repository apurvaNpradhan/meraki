import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "@/components/layout/app-layout";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/(authenticated)/home")({
	component: RouteComponent,
	loader: async ({ context }) => {
		return context.queryClient.ensureQueryData(orpc.space.all.queryOptions());
	},
});

function RouteComponent() {
	const { data } = useSuspenseQuery(orpc.space.all.queryOptions());
	return (
		<AppLayout header={<Header />}>
			<div className="mt-5 flex flex-col gap-4 px-4">
				<div className="text-center font-semibold text-3xl">
					{getGreeting()}
				</div>
				{data?.map((space) => (
					<div key={space.publicId}>{space.name}</div>
				))}
			</div>
		</AppLayout>
	);
}

function Header() {
	return (
		<div className="flex w-full flex-row items-center justify-between border-b px-2 py-1">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<span className="font-semibold text-sm">Home</span>
			</div>
		</div>
	);
}

function getGreeting() {
	const date = new Date();
	const hour = date.getHours();
	if (hour < 12) {
		return "Good Morning";
	}
	if (hour < 18) {
		return "Good Afternoon";
	}
	return "Good Evening";
}
