import { IconChevronDown, IconDots } from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { RenderIcon } from "@/components/icon-and-colorpicker";
import MainLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectOverview } from "@/features/projects/components/project-overview";
import { useProject } from "@/features/projects/hooks/use-project";
import { cn } from "@/lib/utils";

type views = "overview" | "tasks";
type ProjectSearch = {
	view: views;
};

export const Route = createFileRoute("/(authenicated)/$slug/projects/$id")({
	component: RouteComponent,
	validateSearch: (search) => {
		const { view } = search as ProjectSearch;
		if (!view) return { view: "overview" };
		if (view !== "overview" && view !== "tasks") {
			return { view: "overview" };
		}
		return { view };
	},
});

function RouteComponent() {
	const { id } = Route.useParams();
	const { data: project, isPending } = useProject(id);
	const { view } = Route.useSearch() as ProjectSearch;
	const [activeView, setActiveView] = useState<views>(view);

	if (isPending) return <div>Loading...</div>;
	if (!project) return <div>Project not found</div>;

	const views = [
		{
			name: "Overview",
			value: "overview",
			content: <ProjectOverview id={id} />,
		},
		{
			name: "Tasks",
			value: "tasks",
			content: (
				<div className="p-10 text-muted-foreground">
					Tasks view coming soon...
				</div>
			),
		},
	];

	interface HeaderProps {
		project: NonNullable<typeof project>;
		activeView: views;
		setActiveView: (tab: views) => void;
	}

	function Header({ project, activeView, setActiveView }: HeaderProps) {
		const currentTab = views.find((v) => v.value === activeView);
		const navigate = useNavigate({ from: Route.fullPath });

		return (
			<div className="flex w-full flex-row items-center justify-between border-b px-2">
				<div className="flex flex-1 items-center gap-2">
					<SidebarTrigger />

					<div className="hidden flex-1 items-center justify-between md:flex">
						<div className="flex cursor-pointer items-center gap-1">
							<div className="flex items-center gap-2 px-1">
								<RenderIcon
									icon={project.icon}
									color={project.colorCode}
									size={18}
								/>
								<span className="font-semibold text-sm">{project.name}</span>
							</div>
						</div>

						<Tabs
							className="mr-4"
							value={activeView}
							onValueChange={(val) => {
								setActiveView(val as views);
								navigate({
									search: (prev) => ({
										...prev,
										view: val as views,
									}),
								});
							}}
						>
							<TabsList className="border-none bg-transparent">
								{views.map((tab) => (
									<TabsTrigger
										key={tab.value}
										value={tab.value}
										className="data-[state=active]:bg-muted/50 data-[state=active]:shadow-none"
									>
										{tab.name}
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
					</div>

					<div className="flex flex-1 items-center justify-between md:hidden">
						<div className="flex items-center gap-2 px-1">
							<RenderIcon
								icon={project.icon}
								color={project.colorCode}
								size={20}
							/>
							<span className="max-w-[120px] truncate font-bold text-sm">
								{project.name}
							</span>
						</div>

						<DropdownMenu>
							<DropdownMenuTrigger
								render={
									<Button
										variant="ghost"
										size="sm"
										className="gap-1 font-medium"
									>
										{currentTab?.name}
										<IconChevronDown size={14} />
									</Button>
								}
							/>
							<DropdownMenuContent align="end" className="w-[160px]">
								{views.map((tab) => (
									<DropdownMenuItem
										key={tab.value}
										onSelect={() => {
											setActiveView(tab.value as views);
											navigate({
												search: (prev) => ({
													...prev,
													view: tab.value as views,
												}),
											});
										}}
										className={cn(
											"flex items-center justify-between",
											activeView === tab.value &&
												"bg-accent text-accent-foreground",
										)}
									>
										{tab.name}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
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
						<DropdownMenuItem>Project Settings</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		);
	}

	return (
		<MainLayout
			header={
				<Header
					project={project}
					activeView={activeView}
					setActiveView={setActiveView}
				/>
			}
		>
			<Tabs value={activeView} onValueChange={setActiveView}>
				{views.map((tab) => (
					<TabsContent key={tab.value} value={tab.value}>
						{tab.content}
					</TabsContent>
				))}
			</Tabs>
		</MainLayout>
	);
}
