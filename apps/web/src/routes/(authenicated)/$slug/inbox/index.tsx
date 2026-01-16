import { IconPlus } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
	type GroupBy,
	type SortBy,
	TaskList,
	ViewSettingsSelector,
} from "@/features/tasks/components/task-list";
import { useModal } from "@/stores/modal.store";

export const Route = createFileRoute("/(authenicated)/$slug/inbox/")({
	component: RouteComponent,
	beforeLoad({ context }) {
		const { workspace } = context;
		return { workspace };
	},
});

function RouteComponent() {
	const { open } = useModal();
	const [groupBy, setGroupBy] = useState<GroupBy>("priority");
	const [sortBy, setSortBy] = useState<SortBy>("createdAt");
	const { slug } = Route.useParams();

	return (
		<AppLayout header={<Header />}>
			<div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8">
				<div className="flex items-center justify-between">
					<h1 className="font-bold text-3xl text-foreground tracking-tight">
						Inbox
					</h1>
					<div className="flex items-center gap-2">
						<ViewSettingsSelector
							groupBy={groupBy}
							onGroupByChange={setGroupBy}
							sortBy={sortBy}
							onSortByChange={setSortBy}
						/>
						<Button
							size="sm"
							onClick={() => {
								open({
									type: "CREATE_TASK",
									modalSize: "lg",
								});
							}}
							className="gap-2"
						>
							<IconPlus className="h-4 w-4" />
							<span>Create Task</span>
						</Button>
					</div>
				</div>
				<TaskList groupBy={groupBy} sortBy={sortBy} workspaceId={slug} />
			</div>
		</AppLayout>
	);
}

function Header() {
	return (
		<div className="flex w-full flex-row items-center justify-between border-b px-4 py-2">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<span className="font-semibold text-sm">Inbox</span>
			</div>
		</div>
	);
}
