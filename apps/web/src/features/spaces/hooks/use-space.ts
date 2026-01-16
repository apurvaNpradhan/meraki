import type { InsertSpaceType, UpdateSpaceType } from "@meraki/api/types/space";
import * as reactQuery from "@tanstack/react-query";
import { toast } from "sonner";
import type { SidebarSpace } from "@/types/space";
import { orpc } from "@/utils/orpc";

export type Space = {
	publicId: string;
	name: string;
	description: string | null;
	colorCode: string;
	icon: string;
};

export function useSpaces() {
	return reactQuery.useQuery(orpc.space.all.queryOptions({}));
}

export function useSpace(spaceId: string) {
	return reactQuery.useQuery(
		orpc.space.byId.queryOptions({ input: { spaceId } }),
	);
}

export function useCreateSpace() {
	const queryClient = reactQuery.useQueryClient();

	return reactQuery.useMutation(
		orpc.space.create.mutationOptions({
			onMutate: async (variables: InsertSpaceType) => {
				const queryKey = orpc.space.all.queryKey({});
				await queryClient.cancelQueries({ queryKey });

				const previousSpaces =
					queryClient.getQueryData<SidebarSpace[]>(queryKey);

				queryClient.setQueryData<SidebarSpace[]>(queryKey, (old) => {
					const optimisticSpace: SidebarSpace = {
						publicId: crypto.randomUUID(),
						name: variables.name,
						icon: variables.icon ?? "IconFolder",
						colorCode: variables.colorCode ?? "#98BB6C",
						position: "0",
					};
					return old ? [...old, optimisticSpace] : [optimisticSpace];
				});

				return { previousSpaces };
			},
			onError: (_err, _variables, context) => {
				if (context?.previousSpaces) {
					queryClient.setQueryData(
						orpc.space.all.queryKey({}),
						context.previousSpaces,
					);
				}
				toast.error("Failed to create space");
			},
			onSettled: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.space.all.queryKey({}),
				});
			},
			onSuccess: (data) => {
				toast.success(`Space "${data?.name}" created successfully`);
			},
		}),
	);
}

export function useUpdateSpace() {
	const queryClient = reactQuery.useQueryClient();

	return reactQuery.useMutation(
		orpc.space.update.mutationOptions({
			onMutate: async (variables: {
				spacePublicId: string;
				input: Partial<UpdateSpaceType>;
			}) => {
				const allQueryKey = orpc.space.all.queryKey({});
				const byIdQueryKey = orpc.space.byId.queryKey({
					input: { spaceId: variables.spacePublicId },
				});

				await queryClient.cancelQueries({ queryKey: allQueryKey });
				await queryClient.cancelQueries({ queryKey: byIdQueryKey });

				const previousSpaces =
					queryClient.getQueryData<SidebarSpace[]>(allQueryKey);
				const previousSpace = queryClient.getQueryData(byIdQueryKey);

				queryClient.setQueryData<SidebarSpace[]>(allQueryKey, (old) => {
					if (!old) return old;
					return old
						.map((space) =>
							space.publicId === variables.spacePublicId
								? { ...space, ...variables.input }
								: space,
						)
						.sort((a, b) => {
							if (a.position < b.position) return -1;
							if (a.position > b.position) return 1;
							return 0;
						});
				});

				queryClient.setQueryData<Space>(byIdQueryKey, (old) => {
					if (!old) return old;
					return { ...old, ...variables.input };
				});

				return { previousSpaces, previousSpace };
			},
			onError: (_err, variables, context) => {
				if (context?.previousSpaces) {
					queryClient.setQueryData(
						orpc.space.all.queryKey({}),
						context.previousSpaces,
					);
				}
				if (context?.previousSpace) {
					queryClient.setQueryData(
						orpc.space.byId.queryKey({
							input: { spaceId: variables.spacePublicId },
						}),
						context.previousSpace,
					);
				}
				toast.error("Failed to update space");
			},
			onSettled: (_data, _error, variables) => {
				queryClient.invalidateQueries({
					queryKey: orpc.space.all.queryKey({}),
				});
				queryClient.invalidateQueries({
					queryKey: orpc.space.byId.queryKey({
						input: { spaceId: variables.spacePublicId },
					}),
				});
			},
		}),
	);
}

export function useDeleteSpace() {
	const queryClient = reactQuery.useQueryClient();

	return reactQuery.useMutation(
		orpc.space.delete.mutationOptions({
			onMutate: async (variables: { spacePublicId: string }) => {
				const queryKey = orpc.space.all.queryKey({});
				await queryClient.cancelQueries({ queryKey });

				const previousSpaces =
					queryClient.getQueryData<SidebarSpace[]>(queryKey);

				queryClient.setQueryData<SidebarSpace[]>(queryKey, (old) => {
					if (!old) return old;
					return old.filter(
						(space) => space.publicId !== variables.spacePublicId,
					);
				});

				return { previousSpaces };
			},
			onError: (_err, _variables, context) => {
				if (context?.previousSpaces) {
					queryClient.setQueryData(
						orpc.space.all.queryKey({}),
						context.previousSpaces,
					);
				}
				toast.error("Failed to delete space");
			},
			onSettled: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.space.all.queryKey({}),
				});
			},
			onSuccess: () => {
				toast.success("Space deleted successfully");
			},
		}),
	);
}
