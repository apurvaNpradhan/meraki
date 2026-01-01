import { createFileRoute } from "@tanstack/react-router";
import NewWorkspaceForm from "@/features/workspaces/components/new-workspace";

export const Route = createFileRoute("/(authenticated)/workspace/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return <NewWorkspaceForm />;
}
