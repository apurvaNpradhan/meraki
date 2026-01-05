import * as spaceRepo from "@meraki/db/repository/space.repo";
import { generateSlug } from "@meraki/shared/utils";
import { ORPCError } from "@orpc/client";
import { generateKeyBetween } from "fractional-indexing";
import z from "zod";
import { protectedProcedure } from "..";
import { SpaceInsertInput, SpaceUpdateInput } from "../types";

export const spaceRouter = {
	all: protectedProcedure
		.output(
			z.custom<Awaited<ReturnType<typeof spaceRepo.getAllByWorkspaceId>>>(),
		)
		.handler(async ({ input, context }) => {
			const spaces = spaceRepo.getAllByWorkspaceId(
				context.session.session.activeOrganizationId,
			);
			return spaces;
		}),
	byId: protectedProcedure
		.input(z.object({ spacePublicId: z.string() }))
		.output(z.custom<Awaited<ReturnType<typeof spaceRepo.getByPublicId>>>())
		.handler(async ({ input, context }) => {
			const space = await spaceRepo.getWorkspaceAndSpaceIdBySpacePublicId(
				input.spacePublicId,
			);
			if (!space)
				throw new ORPCError("NOT_FOUND", {
					message: `space with public ID ${input.spacePublicId} not found`,
				});
			const result = await spaceRepo.getByPublicId(
				input.spacePublicId,
				context.session.session.activeOrganizationId,
			);
			return result;
		}),
	bySlug: protectedProcedure
		.input(z.object({ spaceSlug: z.string() }))
		.output(z.custom<Awaited<ReturnType<typeof spaceRepo.getBySlug>>>())
		.handler(async ({ input, context }) => {
			const space = await spaceRepo.getBySlug(
				input.spaceSlug,
				context.session.session.activeOrganizationId,
			);
			if (!space)
				throw new ORPCError("NOT_FOUND", {
					message: `space with slug ${input.spaceSlug} not found`,
				});
			const result = await spaceRepo.getBySlug(
				input.spaceSlug,
				context.session.session.activeOrganizationId,
			);
			return result;
		}),
	create: protectedProcedure
		.input(SpaceInsertInput)
		.output(z.custom<Awaited<ReturnType<typeof spaceRepo.create>>>())
		.handler(async ({ input, context }) => {
			const userId = context.session?.user?.id;
			let slug = generateSlug(input.name);
			const isSlugUnique = await spaceRepo.isSlugUnique({
				slug,
				workspaceId: context.session.session.activeOrganizationId,
			});

			if (!isSlugUnique) {
				slug = `${slug}-${Date.now()}`;
			}
			const lastPosition = await spaceRepo.getLastPositionByPublicId(
				context.session.session.activeOrganizationId,
			);
			const position = generateKeyBetween(lastPosition?.position, null);

			const result = await spaceRepo.create({
				input: {
					description: input.description,
					slug,
					colorCode: input.colorCode,
					icon: input.icon,
					position,
					organizationId: context.session.session.activeOrganizationId,
					createdBy: userId,
					name: input.name,
				},
			});

			return result;
		}),
	update: protectedProcedure
		.input(SpaceUpdateInput)
		.output(z.custom<Awaited<ReturnType<typeof spaceRepo.update>>>())
		.handler(async ({ input }) => {
			const space = await spaceRepo.getWorkspaceAndSpaceIdBySpacePublicId(
				input.spacePublicId,
			);

			if (!space) {
				throw new ORPCError("NOT_FOUND", {
					message: `space with public ID ${input.spacePublicId} not found`,
				});
			}

			if (input.slug) {
				const isAvailable = await spaceRepo.isSpaceSlugAvailable(
					input.slug,
					space.organizationId,
				);
				if (!isAvailable) {
					throw new ORPCError("BAD_REQUEST", {
						message: `Space slug ${input.slug} is not available`,
					});
				}
			}

			const result = await spaceRepo.update({
				spaceId: space.id,
				input: {
					name: input.name,
					position: input.position,
					slug: input.slug,
					colorCode: input.colorCode,
					icon: input.icon,
					description: input.description,
				},
			});

			return result;
		}),
	delete: protectedProcedure
		.input(z.object({ spacePublicId: z.string() }))
		.output(z.object({ success: z.boolean(), deletedPublicId: z.string() }))
		.handler(async ({ input, context }) => {
			const userId = context.session?.user?.id;
			if (!userId) {
				throw new ORPCError("UNAUTHORIZED");
			}

			const space = await spaceRepo.getWorkspaceAndSpaceIdBySpacePublicId(
				input.spacePublicId,
			);

			if (!space) {
				throw new ORPCError("NOT_FOUND", {
					message: `space with public ID ${input.spacePublicId} not found`,
				});
			}

			const result = await spaceRepo.softDelete({
				spaceId: space.id,
				deletedBy: userId,
				deletedAt: new Date(),
			});

			return { success: true, deletedPublicId: result?.publicId };
		}),
	checkSlugAvailability: protectedProcedure
		.input(
			z.object({
				spaceSlug: z.string(),
			}),
		)
		.output(z.object({ isAvailable: z.boolean() }))
		.handler(async ({ input, context }) => {
			const isAvailable = await spaceRepo.isSpaceSlugAvailable(
				input.spaceSlug,
				context.session.session.activeOrganizationId,
			);
			return { isAvailable };
		}),
	hardDelete: protectedProcedure
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ input, context }) => {
			const _result = await spaceRepo.hardDelete(
				context.session.session.activeOrganizationId,
			);
			return { success: true };
		}),
};
