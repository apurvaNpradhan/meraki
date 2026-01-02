import * as spaceRepo from "@meraki/db/repository/space";
import { InsertSpace, UpdateSpace } from "@meraki/db/schema/space";
import { InsertStatusGroupWithStatuses } from "@meraki/db/schema/status";
import { generateSlug } from "@meraki/shared/utils";
import { ORPCError } from "@orpc/server";
import { generateKeyBetween } from "fractional-indexing";
import { z } from "zod";
import { protectedProcedure } from "..";

export const spaceRouter = {
	all: protectedProcedure.handler(async ({ context }) => {
		try {
			return await spaceRepo.getSpaces({
				organizationId: context.session.user.defaultOrganizationId,
			});
		} catch (error) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to get spaces",
				cause: error,
			});
		}
	}),
	bySlug: protectedProcedure
		.input(z.object({ slug: z.string() }))
		.errors({
			NOT_FOUND: {
				message: "Space not found",
			},
		})
		.handler(async ({ context, input, errors }) => {
			try {
				const space = await spaceRepo.getSpaceBySlug({
					slug: input.slug,
					organizationId: context.session.user.defaultOrganizationId,
				});

				if (!space) throw errors.NOT_FOUND;
				const { ...rest } = space;
				return rest ?? null;
			} catch (error) {
				if (error === errors.NOT_FOUND) throw error;
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to get space",
					cause: error,
				});
			}
		}),
	create: protectedProcedure
		.input(
			InsertSpace.omit({
				organizationId: true,
				createdBy: true,
			}),
		)
		.errors({
			INTERNAL_SERVER_ERROR: {
				message: "Failed to create space",
			},
			SLUG_TAKEN: {
				message: "Slug already taken",
			},
		})
		.handler(async ({ context, input, errors }) => {
			try {
				let slug = generateSlug(input.name);
				const organizationId = context.session.user.defaultOrganizationId;

				const existingSpace = await spaceRepo.getSpaceBySlug({
					slug,
					organizationId,
				});

				if (existingSpace) {
					slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
				}

				const lastPosition = await spaceRepo.getLastSpacePosition({
					organizationId,
				});
				const position = lastPosition
					? generateKeyBetween(lastPosition, null)
					: "a0";
				const newSpace = await spaceRepo.createSpace({
					...input,
					slug,
					organizationId,
					createdBy: context.session.user.id,
					position,
				});

				return {
					space: newSpace,
				};
			} catch (error) {
				if (error === errors.SLUG_TAKEN) throw error;
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to create space",
					cause: error,
				});
			}
		}),
	createWithStatuses: protectedProcedure
		.input(
			z.object({
				spaceInput: InsertSpace.extend({
					flow: z.enum(["starter", "project_management", "custom"]).optional(),
				}).omit({
					organizationId: true,
					createdBy: true,
				}),
				customStatusInput: z.array(InsertStatusGroupWithStatuses).optional(),
			}),
		)
		.errors({
			INTERNAL_SERVER_ERROR: {
				message: "Failed to create space",
			},
			SLUG_TAKEN: {
				message: "Slug already taken",
			},
		})
		.handler(async ({ context, input, errors }) => {
			try {
				const { spaceInput, customStatusInput } = input;
				let slug = generateSlug(spaceInput.name);
				const { flow, ...spaceData } = spaceInput;
				const organizationId = context.session.user.defaultOrganizationId;

				const existingSpace = await spaceRepo.getSpaceBySlug({
					slug,
					organizationId,
				});

				if (existingSpace) {
					slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
				}

				const lastPosition = await spaceRepo.getLastSpacePosition({
					organizationId,
				});
				const position = lastPosition
					? generateKeyBetween(lastPosition, null)
					: "a0";
				const newSpace = await spaceRepo.createSpaceWithStatuses({
					data: {
						...spaceData,
						slug,
						organizationId,
						createdBy: context.session.user.id,
						position,
					},
					flow: flow || "starter",
					customData: customStatusInput,
				});
				return {
					space: newSpace,
				};
			} catch (error) {
				if (error === errors.SLUG_TAKEN) throw error;
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to create space with statuses",
					cause: error,
				});
			}
		}),

	update: protectedProcedure
		.input(
			z.object({
				publicId: z.string(),
				data: UpdateSpace,
			}),
		)
		.errors({
			NOT_FOUND: {
				message: "Space not found",
			},
			SLUG_TAKEN: {
				message: "Slug already taken",
			},
		})
		.handler(async ({ context, input, errors }) => {
			try {
				const { publicId, data } = input;
				const organizationId = context.session.user.defaultOrganizationId;

				const existingSpace = await spaceRepo.getSpaceByPublicId({
					publicId,
					organizationId,
				});

				if (!existingSpace) throw errors.NOT_FOUND;

				if (data.slug && data.slug !== existingSpace.slug) {
					const conflict = await spaceRepo.getSpaceBySlug({
						slug: data.slug,
						organizationId,
					});
					if (conflict) throw errors.SLUG_TAKEN;
				}
				if (data.name) {
					data.slug = generateSlug(data.name);
				}
				const result = await spaceRepo.updateSpace({
					id: existingSpace.id,
					organizationId,
					data,
				});

				return result;
			} catch (error) {
				if (error === errors.NOT_FOUND || error === errors.SLUG_TAKEN)
					throw error;
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to update space",
				});
			}
		}),

	delete: protectedProcedure
		.input(z.object({ publicId: z.string() }))
		.errors({
			NOT_FOUND: {
				message: "Space not found",
			},
		})
		.handler(async ({ context, input, errors }) => {
			try {
				const organizationId = context.session.user.defaultOrganizationId;
				const existingSpace = await spaceRepo.getSpaceByPublicId({
					publicId: input.publicId,
					organizationId,
				});
				if (!existingSpace) throw errors.NOT_FOUND;
				await spaceRepo.softDeleteSpace({
					id: existingSpace.id,
					organizationId,
				});
			} catch (error) {
				if (error === errors.NOT_FOUND) throw error;
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to delete space",
					cause: error,
				});
			}
		}),
};
