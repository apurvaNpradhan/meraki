import type { auth } from "@meraki/auth";
import type { QueryClient } from "@tanstack/react-query";
import {
	queryOptions,
	useQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { authClient } from "../auth-client";

export interface SessionData {
	user: any;
	session: any;
}

export const sessionQueryKey = ["auth", "session"] as const;

export function sessionQueryOptions() {
	return queryOptions<SessionData | null>({
		queryKey: sessionQueryKey,
		queryFn: async () => {
			const response = await authClient.getSession();
			if (response.error) {
				throw response.error;
			}
			return response.data;
		},
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		refetchOnWindowFocus: true,
		refetchOnReconnect: "always",
		retry(failureCount, error) {
			const status = (error as { status?: number })?.status;
			if (status === 401 || status === 403) return false;
			return failureCount < 3;
		},
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
}

export function useSessionQuery() {
	return useQuery(sessionQueryOptions());
}

export function useSuspenseSessionQuery() {
	return useSuspenseQuery(sessionQueryOptions());
}

export async function prefetchSession(queryClient: QueryClient) {
	return queryClient.prefetchQuery(sessionQueryOptions());
}

export async function invalidateSession(queryClient: QueryClient) {
	return queryClient.invalidateQueries({ queryKey: sessionQueryKey });
}

export function setSessionData(
	queryClient: QueryClient,
	data: SessionData | null,
) {
	queryClient.setQueryData(sessionQueryKey, data);
}

export function getCachedSession(
	queryClient: QueryClient,
): SessionData | null | undefined {
	return queryClient.getQueryData(sessionQueryKey);
}

// Sync check of cached data only - does not trigger network request.
// Both user AND session must exist to handle partial data edge cases.
export function isAuthenticated(queryClient: QueryClient): boolean {
	const session = getCachedSession(queryClient);
	return session?.user != null && session?.session != null;
}

// Clears server session first, then invalidates caches and redirects
export async function signOut(
	queryClient: QueryClient,
	options?: { redirect?: boolean },
) {
	await authClient.signOut();
	await queryClient.invalidateQueries({ queryKey: ["auth"] });

	if (options?.redirect !== false) {
		window.location.href = "/login";
	}
}

// Only refetches if query is active (mounted in a component)
export async function refreshSession(queryClient: QueryClient) {
	return queryClient.refetchQueries({
		queryKey: sessionQueryKey,
		type: "active",
	});
}
