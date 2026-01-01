import { createFileRoute } from "@tanstack/react-router";
import { NotImplemented } from "@/components/not-implemented";

export const Route = createFileRoute("/(public)/sign/reset-password")({
	component: RouteComponent,
});

function RouteComponent() {
	return <NotImplemented />;
}
