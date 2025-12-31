import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/sign/reset-password")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/(public)/sign/reset-password"!</div>;
}
