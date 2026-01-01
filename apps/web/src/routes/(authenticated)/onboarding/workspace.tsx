import { createFileRoute } from "@tanstack/react-router";
import OnboardingWorkspaceForm from "@/features/onboarding/components/workspace-form";

export const Route = createFileRoute("/(authenticated)/onboarding/workspace")({
	component: RouteComponent,
});

function RouteComponent() {
	return <OnboardingWorkspaceForm />;
}
