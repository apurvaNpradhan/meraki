import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { NotFound } from "@/components/not-found";
import { ModalProvider } from "@/components/providers/modal-provider";
import { authClient } from "@/lib/auth-client";

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
			location.pathname.startsWith("/onboarding") === false
		) {
			redirect({
				to: "/onboarding/org",
				throw: true,
			});
		}

		if (
			!session.data?.session.activeOrganizationId &&
			(session.data?.user as any).defaultOrganizationId
		) {
			await authClient.organization.setActive({
				organizationId: (session.data?.user as any).defaultOrganizationId,
			});
			const newSession = await authClient.getSession();
			return { session: newSession };
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
