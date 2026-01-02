import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { generateKeyBetween } from "fractional-indexing";
import { toast } from "sonner";

import { orpc, queryClient } from "@/utils/orpc";

export const useSpaces = () => {
	return useQuery(orpc.space.all.queryOptions());
};

export const useSpace = (slug: string) => {
	return useQuery(orpc.space.bySlug.queryOptions({ input: { slug } }));
};

export const useCreateSpace = () => {
	return useMutation(
		orpc.space.create.mutationOptions({
			onMutate: async (data) => {
				await queryClient.cancelQueries({
					queryKey: orpc.space.all.queryKey(),
				});

				const previousSpaces = queryClient.getQueryData(
					orpc.space.all.queryKey(),
				);

				const optimisticSpace = {
					id: BigInt(Date.now()),
					publicId: crypto.randomUUID(),
					name: data.name,
					description: data.description ?? null,
					slug: data.name.toLowerCase().replace(/\s+/g, "-"),
					position: generateKeyBetween(null, null),
					colorCode: data.colorCode,
					icon: data.icon,
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
					const position = generateKeyBetween(lastSpace?.position, null);

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
};

export const useCreateSpaceWithStatuses = () => {
	const navigate = useNavigate();
	return useMutation(
		orpc.space.createWithStatuses.mutationOptions({
			onMutate: async (input) => {
				await queryClient.cancelQueries({
					queryKey: orpc.space.all.queryKey(),
				});

				const previousSpaces = queryClient.getQueryData(
					orpc.space.all.queryKey(),
				);

				const { spaceInput } = input;

				const optimisticSpace = {
					id: BigInt(Date.now()),
					publicId: crypto.randomUUID(),
					name: spaceInput.name,
					description: spaceInput.description ?? null,
					slug: spaceInput.name.toLowerCase().replace(/\s+/g, "-"),
					position: generateKeyBetween(null, null),
					colorCode: spaceInput.colorCode,
					icon: spaceInput.icon,
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
					const position = generateKeyBetween(lastSpace?.position, null);

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
			onSuccess: (result) => {
				queryClient.invalidateQueries({
					queryKey: orpc.space.all.queryKey(),
				});
				toast.success("Space created successfully");
				if (result?.space?.slug) {
					navigate({
						to: "/spaces/$slug" as any,
						params: { slug: result.space.slug } as any,
					});
				}
			},
		}),
	);
};

export const useUpdateSpace = () => {
	const _navigate = useNavigate();
	return useMutation(
		orpc.space.update.mutationOptions({
			onMutate: async (input) => {
				const { publicId, data } = input;

				await queryClient.cancelQueries({
					queryKey: orpc.space.all.queryKey(),
				});

				const previousSpaces = queryClient.getQueryData(
					orpc.space.all.queryKey(),
				);

				const spaceToUpdate = previousSpaces?.find(
					(d) => d.publicId === publicId,
				);
				const previousSlug = spaceToUpdate?.slug;

				if (previousSlug) {
					await queryClient.cancelQueries({
						queryKey: orpc.space.bySlug.queryKey({
							input: { slug: previousSlug },
						}),
					});
				}

				const previousSpace = previousSlug
					? queryClient.getQueryData(
							orpc.space.bySlug.queryKey({ input: { slug: previousSlug } }),
						)
					: undefined;

				const optimisticSlug = data.name
					? data.name.toLowerCase().replace(/\s+/g, "-")
					: undefined;

				if (previousSpaces) {
					queryClient.setQueryData(orpc.space.all.queryKey(), (old) => {
						if (!old) return old;

						const updated = old.map((d) =>
							d.publicId === publicId
								? { ...d, ...data, slug: optimisticSlug ?? d.slug }
								: d,
						);

						if (data.position) {
							return updated.sort((a, b) => {
								if (a.position < b.position) return -1;
								if (a.position > b.position) return 1;
								return 0;
							});
						}

						return updated;
					});
				}

				if (previousSpace && previousSlug) {
					queryClient.setQueryData(
						orpc.space.bySlug.queryKey({ input: { slug: previousSlug } }),
						(old) =>
							old ? { ...old, ...data, slug: optimisticSlug ?? old.slug } : old,
					);
				}

				return { previousSpaces, previousSpace, previousSlug };
			},
			onError: (err, _variables, context) => {
				if (context?.previousSpaces) {
					queryClient.setQueryData(
						orpc.space.all.queryKey(),
						context.previousSpaces,
					);
				}
				if (context?.previousSpace && context.previousSlug) {
					queryClient.setQueryData(
						orpc.space.bySlug.queryKey({
							input: { slug: context.previousSlug },
						}),
						context.previousSpace,
					);
				}
				toast.error(err.message || "Failed to update space");
			},
			onSuccess: (result, _variables) => {
				queryClient.invalidateQueries({
					queryKey: orpc.space.all.queryKey(),
				});
				if (result) {
					queryClient.invalidateQueries({
						queryKey: orpc.space.bySlug.queryKey({
							input: { slug: result.slug },
						}),
					});
				}
			},
		}),
	);
};

export const useDeleteSpace = () => {
	return useMutation(
		orpc.space.delete.mutationOptions({
			onMutate: async ({ publicId }) => {
				await queryClient.cancelQueries({
					queryKey: orpc.space.all.queryKey(),
				});

				const previousSpaces = queryClient.getQueryData<any[]>(
					orpc.space.all.queryKey(),
				);

				const spaceToDelete = previousSpaces?.find(
					(d) => d.publicId === publicId,
				);
				const slug = spaceToDelete?.slug;

				if (slug) {
					await queryClient.cancelQueries({
						queryKey: orpc.space.bySlug.queryKey({ input: { slug } }),
					});
				}

				if (previousSpaces) {
					queryClient.setQueryData(orpc.space.all.queryKey(), (old: any) =>
						old?.filter((d: any) => d.publicId !== publicId),
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
			onSuccess: (_data: any) => {
				queryClient.invalidateQueries({
					queryKey: orpc.space.all.queryKey(),
				});

				toast.success("Space deleted successfully");
			},
		}),
	);
};
