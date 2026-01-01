import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { NotFound } from "@/components/not-found";
import { ModalProvider } from "@/components/providers/modal-provider";
import { authClient } from "@/lib/auth-client";
import { getCachedSession, sessionQueryOptions } from "@/lib/queries/session";

export const Route = createFileRoute("/(authenticated)")({
	component: RouteComponent,
	errorComponent: NotFound,
	beforeLoad: async ({ location }) => {
		const session = await authClient.getSession();
		if (!session.data) {
			redirect({
				to: "/sign-up",
				throw: true,
			});
		} else if (
			session.data?.user.onboardingCompleted === null &&
			location.pathname !== "/onboarding"
		) {
			redirect({
				to: "/onboarding",
				throw: true,
			});
		}
		return { session };
	},
});

function RouteComponent() {
	return (
		<>
			<Outlet />
			<ModalProvider />
		</>
	);
}
