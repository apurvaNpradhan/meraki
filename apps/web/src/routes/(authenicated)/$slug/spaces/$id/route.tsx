import type { RouterOutputs } from "@meraki/api/routers/index";
import { IconDots } from "@tabler/icons-react";
import {
	createFileRoute,
	Outlet,
	useLocation,
	useNavigate,
} from "@tanstack/react-router";
import { RenderIcon } from "@/components/icon-and-colorpicker";
import MainLayout, { AuotHidingSidebar } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSpace } from "@/features/spaces/hooks/use-space";

export const Route = createFileRoute("/(authenicated)/$slug/spaces/$id")({
	loader: async ({ context, params }) => {
		const { queryClient, orpc } = context;
		const spaces = queryClient.ensureQueryData(
			orpc.space.getOverview.queryOptions({
				input: { spacePublicId: params.id },
			}),
		);
		return { spaces };
	},

	component: RouteComponent,

	pendingComponent: SpacePending,
});

function SpacePending() {
	return (
		<MainLayout
			header={
				<div className="flex h-12 w-full items-center border-b px-4">
					<Skeleton className="h-6 w-32" />
				</div>
			}
		>
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
		</MainLayout>
	);
}

function RouteComponent() {
	const { id, slug } = Route.useParams();
	const { data: space } = useSpace(id);
	const location = useLocation();

	if (!space)
		return (
			<div className="flex h-full flex-1 items-center justify-center text-muted-foreground">
				Space not found
			</div>
		);

	const tabs = [
		{ name: "Overview", to: "/$slug/spaces/$id/overview" },
		{ name: "Projects", to: "/$slug/spaces/$id/projects" },
		{ name: "Tasks", to: "/$slug/spaces/$id/tasks" },
	];

	const activeTab =
		tabs.find((tab) =>
			location.pathname.includes(
				tab.to.replace("/$slug", `/${slug}`).replace("/$id", `/${id}`),
			),
		) || tabs[0];

	function Header({ space }: { space: RouterOutputs["space"]["getOverview"] }) {
		const navigate = useNavigate();
		return (
			<div className="flex w-full flex-col gap-2">
				<div className="flex flex-1 items-center gap-2">
					<div className="flex flex-1 items-center gap-2">
						<div className="flex cursor-pointer items-center gap-1">
							<div className="flex items-center gap-2 px-1">
								<AuotHidingSidebar />
								<RenderIcon
									icon={space.icon}
									color={space.colorCode}
									size={18}
								/>
								<span className="max-w-2xl font-semibold text-sm">
									{space.name}
								</span>
							</div>
						</div>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button variant="ghost" size="sm" className="gap-1 font-medium">
									<IconDots />
								</Button>
							}
						/>
						<DropdownMenuContent align="end" className="w-[160px]">
							<DropdownMenuItem>New Project</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<div className="flex w-full flex-row items-center justify-between border-b px-2">
					<div className="flex flex-1 flex-row items-center justify-between overflow-x-auto">
						<Tabs
							className="mr-4"
							value={activeTab.to}
							onValueChange={(val) => {
								navigate({ to: val, params: { slug, id } });
							}}
						>
							<TabsList className="border-none bg-transparent" variant={"line"}>
								{tabs.map((tab) => (
									<TabsTrigger
										key={tab.to}
										value={tab.to}
										className="data-[state=active]:bg-muted/50 data-[state=active]:shadow-none"
									>
										{tab.name}
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
					</div>
				</div>
			</div>
		);
	}

	return (
		<MainLayout headersNumber={2} header={<Header space={space} />}>
			<Outlet />
		</MainLayout>
	);
}
