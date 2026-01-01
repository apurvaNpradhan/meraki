import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/(authenticated)/onboarding")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (session.data?.user.onboardingCompleted) {
			throw redirect({
				to: "/home",
			});
		}
	},
});

function RouteComponent() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const handleCompleteOnboarding = async () => {
		setLoading(true);
		try {
			await authClient.updateUser({
				onboardingCompleted: new Date(),
			});
			router.invalidate();
			await router.navigate({ to: "/home" });
		} catch (error) {
			console.error("Failed to complete onboarding", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4">
			<h1 className="font-bold text-2xl">Welcome Onboard!</h1>
			<p className="text-muted-foreground">
				Click the button below to complete your onboarding process.
			</p>
			<Button onClick={handleCompleteOnboarding} disabled={loading}>
				{loading ? "Completing..." : "Complete Onboarding"}
			</Button>
		</div>
	);
}
