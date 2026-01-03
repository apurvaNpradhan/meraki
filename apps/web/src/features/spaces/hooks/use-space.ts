import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { generateKeyBetween } from "fractional-indexing";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

export function useSpaces() {
	return useSuspenseQuery(orpc.space.all.queryOptions());
}

export function useSpace(publicId: string) {
	return useSuspenseQuery(
		orpc.space.byId.queryOptions({
			input: {
				spacePublicId: publicId,
			},
		}),
	);
}

export function useUpdateSpace() {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.space.update.mutationOptions({
			onMutate: async (newSpace) => {
				const queryKey = orpc.space.all.queryKey();
				await queryClient.cancelQueries({ queryKey });

				const previousSpaces = queryClient.getQueryData(queryKey);
				if (previousSpaces) {
					queryClient.setQueryData(orpc.space.all.queryKey(), (old) => {
						if (!old) return old;

						const updated = old.map((d) =>
							d.publicId === newSpace.spacePublicId ? { ...d, ...newSpace } : d,
						);

						if (newSpace.position) {
							return updated.sort((a, b) => {
								if (a.position < b.position) return -1;
								if (a.position > b.position) return 1;
								return 0;
							});
						}

						return updated;
					});
				}
				const singleSpaceQueryKey = orpc.space.byId.queryKey({
					input: { spacePublicId: newSpace.spacePublicId },
				});
				await queryClient.cancelQueries({ queryKey: singleSpaceQueryKey });
				const previousSingleSpace =
					queryClient.getQueryData(singleSpaceQueryKey);

				queryClient.setQueryData(singleSpaceQueryKey, (old) => {
					if (!old) return old;
					return {
						...old,
						...newSpace,
					};
				});

				return { previousSpaces, previousSingleSpace };
			},
			onError: (_err, newSpace, context) => {
				queryClient.setQueryData(
					orpc.space.all.queryKey(),
					context?.previousSpaces,
				);
				queryClient.setQueryData(
					orpc.space.byId.queryKey({
						input: { spacePublicId: newSpace.spacePublicId },
					}),
					context?.previousSingleSpace,
				);
			},
			onSettled: (_data, _error, variables) => {
				queryClient.invalidateQueries({
					queryKey: orpc.space.all.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: orpc.space.byId.queryKey({
						input: { spacePublicId: variables.spacePublicId },
					}),
				});
			},
		}),
	);
}

export function useCreateSpace() {
	const queryClient = useQueryClient();

	return useMutation(
		orpc.space.create.mutationOptions({
			onMutate: async (input) => {
				await queryClient.cancelQueries({
					queryKey: orpc.space.all.queryKey(),
				});

				const previousSpaces = queryClient.getQueryData(
					orpc.space.all.queryKey(),
				);

				const optimisticSpace = {
					id: BigInt(Date.now()),
					publicId: crypto.randomUUID(),
					name: input.name,
					description: input.description ?? null,
					slug: input.name.toLowerCase().replace(/\s+/g, "-"),
					position: generateKeyBetween(null, null),
					colorCode: input.colorCode,
					icon: input.icon,
					createdAt: new Date(),
					updatedAt: new Date(),
					createdBy: "optimistic",
					organizationId: "optimistic",
					deletedAt: null,
					creator: { id: "optimistic", email: "optimistic@example.com" },
					statuses: [],
				};

				if (previousSpaces) {
					const lastSpace = previousSpaces[previousSpaces.length - 1];
					const position = generateKeyBetween(
						lastSpace?.position ?? null,
						null,
					);

					queryClient.setQueryData(orpc.space.all.queryKey(), (old) => [
						...(old ?? []),
						{ ...optimisticSpace, position },
					]);
				}

				return { previousSpaces };
			},
			onError: (err, _variables, context) => {
				if (context?.previousSpaces) {
					queryClient.setQueryData(
						orpc.space.all.queryKey(),
						context.previousSpaces,
					);
				}
				toast.error(err.message || "Failed to create space");
			},
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.space.all.queryKey(),
				});
				toast.success("Space created successfully");
			},
		}),
	);
}

export function useDeleteSpace() {
	const queryClient = useQueryClient();
	return useMutation(
		orpc.space.delete.mutationOptions({
			onMutate: async ({ spacePublicId: publicId }) => {
				await queryClient.cancelQueries({
					queryKey: orpc.space.all.queryKey(),
				});

				const previousSpaces = queryClient.getQueryData(
					orpc.space.all.queryKey(),
				);

				if (previousSpaces) {
					queryClient.setQueryData(orpc.space.all.queryKey(), (old) =>
						old?.filter((d) => d.publicId !== publicId),
					);
				}

				return { previousSpaces };
			},
			onError: (err, _variables, context) => {
				if (context?.previousSpaces) {
					queryClient.setQueryData(
						orpc.space.all.queryKey(),
						context.previousSpaces,
					);
				}
				toast.error(err.message || "Failed to delete space");
			},
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.space.all.queryKey(),
				});

				toast.success("Space deleted successfully");
			},
		}),
	);
}
