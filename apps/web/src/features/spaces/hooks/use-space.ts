import type { RouterOutputs } from "@meraki/api/routers/index";
import * as reactQuery from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { generateKeyBetween } from "fractional-indexing";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";

export function useSpaces() {
	return reactQuery.useSuspenseQuery(orpc.space.all.queryOptions());
}

export function useSpace(publicId: string) {
	return reactQuery.useSuspenseQuery(
		orpc.space.byId.queryOptions({
			input: {
				spacePublicId: publicId,
			},
		}),
	);
}

export function useUpdateSpace() {
	const queryClient = reactQuery.useQueryClient();

	return reactQuery.useMutation(
		orpc.space.update.mutationOptions({
			onMutate: async (newSpace) => {
				const queryKey = orpc.space.all.queryKey();
				await queryClient.cancelQueries({ queryKey });

				const previousSpaces = queryClient.getQueryData(queryKey);
				if (previousSpaces) {
					queryClient.setQueryData(orpc.space.all.queryKey(), (old) => {
						if (!old) return old;

						const updated = old
							.map((d) =>
								d.publicId === newSpace.spacePublicId
									? { ...d, ...newSpace }
									: d,
							)
							.sort((a, b) => {
								if (a.position < b.position) return -1;
								if (a.position > b.position) return 1;
								return 0;
							});
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
	const navigate = useNavigate();
	const queryClient = reactQuery.useQueryClient();

	return reactQuery.useMutation(
		orpc.space.create.mutationOptions({
			onMutate: async (input) => {
				await queryClient.cancelQueries({
					queryKey: orpc.space.all.queryKey(),
				});

				const previousSpaces = queryClient.getQueryData(
					orpc.space.all.queryKey(),
				);

				const optimisticSpace = {
					publicId: crypto.randomUUID(),
					name: input.name,
					position: "not-set",
					colorCode: input.colorCode,
					icon: input.icon,
				} as RouterOutputs["space"]["all"][0];

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
			onSuccess: ({ publicId }) => {
				queryClient.invalidateQueries({
					queryKey: orpc.space.all.queryKey(),
				});
				toast.success("Space created successfully");
				navigate({
					to: "/spaces/$id",
					params: {
						id: publicId,
					},
				});
			},
		}),
	);
}

export function useDeleteSpace() {
	const navigate = useNavigate();
	const router = useRouter();
	const queryClient = reactQuery.useQueryClient();
	return reactQuery.useMutation(
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
			onSuccess: ({ deletedPublicId }) => {
				queryClient.invalidateQueries({
					queryKey: orpc.space.all.queryKey(),
				});
				toast.success("Space deleted successfully");
				if (
					router.state.location.pathname.startsWith(
						`/spaces/${deletedPublicId}`,
					)
				) {
					navigate({
						to: "/home",
					});
				}
			},
		}),
	);
}
