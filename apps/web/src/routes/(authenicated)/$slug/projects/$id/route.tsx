import type { RouterOutputs } from "@meraki/api/routers/index";
import { IconDotsVertical, IconPlus, IconTrash } from "@tabler/icons-react";
import {
	createFileRoute,
	Outlet,
	useLoaderData,
	useLocation,
	useNavigate,
} from "@tanstack/react-router";
import { RenderIcon } from "@/components/icon-and-colorpicker";
import MainLayout, { AuotHidingSidebar } from "@/components/layout/app-layout";
import { PrioritySelector } from "@/components/priority-selector";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusSelector } from "@/features/projects/components/status-selector";
import {
	useProject,
	useUpdateProject,
} from "@/features/projects/hooks/use-project";
import { useModal } from "@/stores/modal.store";
import type { ProjectBySpaceItem } from "@/types/project";

export const Route = createFileRoute("/(authenicated)/$slug/projects/$id")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		const { queryClient, orpc } = context;
		const projects = queryClient.ensureQueryData(
			orpc.project.getOverview.queryOptions({
				input: { projectPublicId: params.id },
			}),
		);
		return {
			projects,
		};
	},
	pendingComponent: ProjectPending,
});

function ProjectPending() {
	return (
		<MainLayout
			headersNumber={2}
			header={
				<div className="flex w-full flex-col gap-2">
					<div className="flex h-12 w-full items-center border-b px-4">
						<Skeleton className="h-6 w-32" />
					</div>
					<div className="flex h-10 w-full items-center border-b px-4">
						<div className="flex gap-4">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-4 w-20" />
						</div>
					</div>
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
				</div>
			</div>
		</MainLayout>
	);
}

function RouteComponent() {
	const { id, slug } = Route.useParams();
	const { data: project } = useProject(id);
	const location = useLocation();

	if (!project) return <div>Project not found</div>;

	const tabs = [
		{ name: "Overview", to: "/$slug/projects/$id/overview" },
		{ name: "Tasks", to: "/$slug/projects/$id/tasks" },
		{ name: "Notes", to: "/$slug/projects/$id/notes" },
		{ name: "Calendar", to: "/$slug/projects/$id/calendar" },
	];

	const activeTab =
		tabs.find((tab) =>
			location.pathname.includes(
				tab.to.replace("/$slug", `/${slug}`).replace("/$id", `/${id}`),
			),
		) || tabs[0];

	function Header({
		data,
	}: {
		data: NonNullable<RouterOutputs["project"]["getOverview"]>;
	}) {
		const navigate = useNavigate();
		const { workspace } = useLoaderData({ from: "/(authenicated)/$slug" });
		const updateProject = useUpdateProject({
			spacePublicId: data?.space?.publicId,
		});
		const { open } = useModal();

		return (
			<div className="flex w-full flex-col gap-2">
				<div className="flex w-full flex-row items-center justify-between px-4 pt-2">
					<div className="flex flex-1 items-center gap-2">
						<AuotHidingSidebar />
						<div className="flex flex-1 items-center justify-between">
							<div className="flex cursor-pointer items-center gap-2">
								<div className="flex items-center gap-2">
									<Tooltip>
										<TooltipTrigger
											onClick={() =>
												navigate({
													to: "/$slug/spaces/$id",
													params: {
														id: data?.space?.publicId ?? "",
														slug: workspace.slug,
													},
												})
											}
										>
											<RenderIcon
												icon={data?.space?.icon ?? ""}
												color={data?.space?.colorCode ?? ""}
												size={20}
											/>
										</TooltipTrigger>
										<TooltipContent>{data?.space?.name}</TooltipContent>
									</Tooltip>

									<Separator orientation="vertical" />
									<RenderIcon
										icon={data.icon}
										color={data.colorCode}
										size={20}
									/>
									<span className="font-semibold text-lg">{data.name}</span>
									<DropdownMenu>
										<DropdownMenuTrigger
											render={
												<Button
													variant="ghost"
													size="icon-sm"
													className="gap-1 font-medium"
												>
													<IconDotsVertical />
												</Button>
											}
										/>
										<DropdownMenuContent
											align="end"
											side="inline-end"
											className="w-[200px]"
										>
											<Button
												size="icon-sm"
												onClick={() => {
													open({
														type: "CREATE_TASK",
														modalSize: "lg",
														data: {
															projectPublicId: data.publicId,
															statuses: data.statuses,
														},
													});
												}}
												className="gap-2"
											>
												<IconPlus />
											</Button>

											<div className="flex flex-col gap-2 p-2">
												<div className="flex items-center justify-between px-2 py-1">
													<span className="font-medium text-muted-foreground text-xs">
														Status
													</span>
													<StatusSelector
														project={data as unknown as ProjectBySpaceItem}
														spacePublicId={data.space?.publicId}
														projectPublicId={data.publicId}
														className="h-7 w-fit border-none bg-accent/50"
														showLabel={true}
													/>
												</div>
												<div className="flex items-center justify-between px-2 py-1">
													<span className="font-medium text-muted-foreground text-xs">
														Priority
													</span>
													<PrioritySelector
														value={data.priority}
														className="h-7 w-fit border-none bg-accent/50"
														onPriorityChange={(priority) =>
															updateProject.mutate({
																projectPublicId: data.publicId,
																priority,
															})
														}
														showLabel={true}
													/>
												</div>
											</div>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
												onClick={() => {
													open({
														type: "DELETE_PROJECT",
														data: {
															project,
														},
													});
												}}
											>
												<IconTrash className="mr-2 h-4 w-4" />
												Delete Project
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="flex w-full flex-row items-center justify-between border-b px-2">
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
		);
	}

	return (
		<MainLayout headersNumber={2} header={<Header data={project} />}>
			<div className="flex-1 transition-opacity duration-300">
				<Outlet />
			</div>
		</MainLayout>
	);
}
