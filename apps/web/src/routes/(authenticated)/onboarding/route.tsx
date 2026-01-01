import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/(authenticated)/onboarding")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (session.data?.user.onboardingCompleted) {
			redirect({
				to: "/home",
				throw: true,
			});
		}
	},
});

function RouteComponent() {
	return <Outlet />;
}
