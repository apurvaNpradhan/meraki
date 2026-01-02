import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/app-layout";

export const Route = createFileRoute("/(authenticated)/spaces/$slug/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <MainLayout>Hello "/(authenticated)/spaces/$slug/"!</MainLayout>;
}
