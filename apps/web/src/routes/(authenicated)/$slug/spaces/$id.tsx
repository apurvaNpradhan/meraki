import { IconChevronDown, IconDots } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
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
import { SpaceOverview } from "@/features/spaces/components/space-overview";
import { useSpace } from "@/features/spaces/hooks/use-space";
import { cn } from "@/lib/utils";

type views = "overview" | "projects" | "tasks";
type SpaceSearch = {
	view: views;
};
export const Route = createFileRoute("/(authenicated)/$slug/spaces/$id")({
	component: RouteComponent,
	validateSearch: (search) => {
		const { view } = search;
		if (!view) return { view: "overview" };
		if (view !== "overview" && view !== "projects" && view !== "tasks") {
			return { view: "overview" };
		}
		return { view };
	},
});

function RouteComponent() {
	const { id } = Route.useParams();
	const { data: space, isPending } = useSpace(id);
	const { view } = Route.useSearch() as SpaceSearch;
	const [activeView, setActiveView] = useState<views>(view);

	if (isPending) return <div>Loading...</div>;
	if (!space) return <div>Space not found</div>;
	const views = [
		{
			name: "Overview",
			value: "overview",
			content: <SpaceOverview id={id} />,
		},
		{
			name: "Projects",
			value: "projects",
			content: <div>Projects</div>,
		},
		{
			name: "Tasks",
			value: "tasks",
			content: <div>Tasks</div>,
		},
	];

	interface HeaderProps {
		space: NonNullable<typeof space>;
		activeView: views;
		setActiveView: (tab: views) => void;
	}
	function Header({ space, activeView, setActiveView }: HeaderProps) {
		const currentTab = views.find((v) => v.value === activeView);

		return (
			<div className="flex w-full flex-row items-center justify-between border-b px-2">
				<div className="flex flex-1 items-center gap-2">
					<SidebarTrigger />

					<div className="hidden flex-1 items-center justify-between md:flex">
						<div className="flex cursor-pointer items-center gap-1">
							<div className="flex items-center gap-2 px-1">
								<RenderIcon
									icon={space.icon}
									color={space.colorCode}
									size={18}
								/>
								<span className="font-semibold text-sm">{space.name}</span>
							</div>
						</div>

						<Tabs
							className="mr-4"
							value={activeView}
							onValueChange={(val) => setActiveView(val as views)}
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
							<RenderIcon icon={space.icon} color={space.colorCode} size={20} />
							<span className="max-w-[120px] truncate font-bold text-sm">
								{space.name}
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
										onSelect={() => setActiveView(tab.value as views)}
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
						<DropdownMenuItem>New Project</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		);
	}

	return (
		<MainLayout
			header={
				<Header
					space={space}
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
