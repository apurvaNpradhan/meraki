import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { sessionQueryOptions } from "@/lib/auth-client";

export const Route = createFileRoute("/(authenticated)/onboarding")({
	component: RouteComponent,
	beforeLoad: async ({ context, location }) => {
		const session =
			await context.queryClient.ensureQueryData(sessionQueryOptions);
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
