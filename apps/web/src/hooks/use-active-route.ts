import { useRouterState } from "@tanstack/react-router";

export function useRouteActive() {
	const {
		location: { pathname },
	} = useRouterState();
	return (path: string) => pathname.startsWith(path);
}
