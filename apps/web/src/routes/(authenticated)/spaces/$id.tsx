import {
	IconDots,
	IconPlus,
	IconSearch,
	IconSettings,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { IconAndColorPicker } from "@/components/icon-and-color-picer";
import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSpace, useUpdateSpace } from "@/features/spaces/hooks/use-space";
import { useDebounce } from "@/hooks/use-debounce";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/(authenticated)/spaces/$id")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		return context.queryClient.ensureQueryData(
			orpc.space.byId.queryOptions({
				input: {
					spacePublicId: params.id,
				},
			}),
		);
	},
});

function RouteComponent() {
	const { id } = Route.useParams();
	const { data } = useSpace(id);

	const [activeTab, setActiveTab] = useState("projects");
	const updateSpace = useUpdateSpace();

	const [tabFilters, setTabFilters] = useState({
		projects: { search: "", view: "list" },
		tasks: { search: "", view: "board" },
		notes: { search: "", view: "grid" },
	});
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	const updateCurrentTabFilter = (key: string, value: string) => {
		setTabFilters((prev) => ({
			...prev,
			[activeTab]: {
				...prev[activeTab as keyof typeof prev],
				[key]: value,
			},
		}));
	};

	const [name, setName] = useState(data?.name ?? "");
	const [description, setDescription] = useState(data?.description ?? "");
	const debouncedName = useDebounce(name, 600);
	const debouncedDescription = useDebounce(description, 600);

	useEffect(() => {
		if (!data) return;
		setName(data.name ?? "");
		setDescription(data.description ?? "");
	}, [data?.name, data?.description, data]);

	useEffect(() => {
		if (!data) return;
		if (debouncedName === data.name) return;
		updateSpace.mutate({
			spacePublicId: id,
			name: debouncedName,
		});
	}, [debouncedName, data, id, updateSpace.mutate]);
	useEffect(() => {
		if (!data) return;
		if (debouncedDescription === data.description) return;

		updateSpace.mutate({
			spacePublicId: id,
			description: debouncedDescription,
		});
	}, [debouncedDescription, data, id, updateSpace.mutate]);

	return (
		<AppLayout header={<Header name={data?.name ?? ""} />}>
			<div className="flex flex-col gap-6 px-8 py-6">
				<div className="group flex items-center gap-3">
					<IconAndColorPicker
						icon={data?.icon}
						onIconChange={(newIcon) => {
							updateSpace.mutate({
								spacePublicId: id,
								icon: newIcon,
							});
						}}
						color={data?.colorCode}
						onColorChange={(newColor) => {
							updateSpace.mutate({
								spacePublicId: id,
								colorCode: newColor,
							});
						}}
						variant="soft"
						iconSize={30}
					/>

					<input
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="flex-1 border-0 bg-transparent p-0 font-bold text-4xl leading-none tracking-tight placeholder:text-muted-foreground/50 focus:ring-0 focus-visible:outline-none dark:text-dark-1000"
						placeholder="Untitled Space"
					/>

					<div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
						<Button variant="ghost" size="icon" className="size-8">
							<IconSettings size={18} />
						</Button>
						<Button variant="ghost" size="icon" className="size-8">
							<IconDots size={18} />
						</Button>
					</div>
				</div>

				<TextareaAutosize
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Add a description..."
					minRows={1}
					className="w-full max-w-4xl resize-none border-none bg-transparent px-1 text-base text-muted-foreground shadow-none outline-none focus:ring-0 focus-visible:ring-0"
				/>

				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<div className="flex items-center justify-between gap-1">
						<TabsList
							className="justify-start gap-2 bg-transparent p-0"
							variant="line"
						>
							<TabsTrigger value="projects">Projects</TabsTrigger>
							<TabsTrigger value="tasks">Tasks</TabsTrigger>
							<TabsTrigger value="notes">Notes</TabsTrigger>
						</TabsList>
						<div className="mr-2 flex items-center gap-2">
							<div className="flex items-center gap-0.5 border-r py-1 pr-2">
								{isSearchOpen ? (
									<div className="fade-in slide-in-from-right-4 flex animate-in items-center px-2 duration-200">
										<IconSearch className="mr-2 size-4 text-muted-foreground" />
										<Input
											autoFocus
											value={
												tabFilters[activeTab as keyof typeof tabFilters].search
											}
											onChange={(e) =>
												updateCurrentTabFilter("search", e.target.value)
											}
											onBlur={() =>
												!tabFilters[activeTab as keyof typeof tabFilters]
													.search && setIsSearchOpen(false)
											}
											placeholder="Search..."
										/>
									</div>
								) : (
									<Button
										variant="ghost"
										size="icon-sm"
										className="text-muted-foreground"
										title={`Search ${activeTab}`}
										onClick={() => setIsSearchOpen(true)}
									>
										<IconSearch className="size-4" />
									</Button>
								)}
							</div>
							<Button size="sm" className="h-8 shadow-sm">
								<IconPlus className="mr-1.5 size-4" />
								New{" "}
								{activeTab === "projects"
									? "Project"
									: activeTab === "tasks"
										? "Task"
										: "Note"}
							</Button>
						</div>
					</div>
					<div className="mt-6">
						<TabsContent value="projects">
							<div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
								No projects found
							</div>
						</TabsContent>

						<TabsContent value="tasks">
							<div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
								No tasks found
							</div>
						</TabsContent>

						<TabsContent value="notes">
							<div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
								No notes found
							</div>
						</TabsContent>
					</div>
				</Tabs>
			</div>
		</AppLayout>
	);
}

function Header({ name }: { name: string }) {
	return (
		<div className="flex w-full flex-row items-center justify-between border-b px-2 py-1">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<span className="font-semibold text-xs">Spaces</span>
				<Separator orientation="vertical" />
				<span className="font-semibold text-xs">{name}</span>
			</div>
		</div>
	);
}
