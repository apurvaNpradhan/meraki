import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/tos")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/(public)/tos"!</div>;
}
