import * as projectLabelRepo from "@meraki/db/repository/project-label.repo";
import * as spaceRepo from "@meraki/db/repository/space.repo";
import { ORPCError } from "@orpc/server";
import { generateKeyBetween } from "fractional-indexing";
import z from "zod";
import { protectedProcedure } from "..";
import { InsertSpaceInput, UpdateSpaceInput } from "../types/space";

export const spaceRouter = {
	getOverview: protectedProcedure
		.input(z.object({ spacePublicId: z.string() }))
		.handler(async ({ context, input }) => {
			const spaceId = await spaceRepo.getIdByPublicId(input.spacePublicId);
			if (!spaceId) {
				throw new ORPCError("NOT_FOUND", {
					message: "Space not found",
				});
			}

			const space = await Promise.all([
				await spaceRepo.getSpaceDetails(context.workspace.id, spaceId.id),
			]);
			return {
				...space[0],
			};
		}),
	all: protectedProcedure.handler(async ({ context }) => {
		const spaces = await spaceRepo.getAllByWorkspaceId(context.workspace.id);
		return spaces;
	}),
	byId: protectedProcedure
		.input(z.object({ spaceId: z.string() }))
		.handler(async ({ context, input }) => {
			const spaceId = await spaceRepo.getIdByPublicId(input.spaceId);
			if (!spaceId) {
				throw new ORPCError("NOT_FOUND", {
					message: "Space not found",
				});
			}
			const space = await spaceRepo.getById(spaceId.id, context.workspace.id);
			return space;
		}),
	create: protectedProcedure
		.input(InsertSpaceInput)
		.handler(async ({ context, input }) => {
			const lastPosition = await spaceRepo.getLastPositionByWorkspaceId(
				context.workspace.id,
			);
			const newPosition = generateKeyBetween(lastPosition?.position, null);

			const result = await spaceRepo.create({
				input: {
					...input,
					organizationId: context.workspace.id,
					createdBy: context.session.user.id,
					position: newPosition,
				},
			});

			if (result) {
				await projectLabelRepo.createDefaultLabels({
					spaceId: result.id,
					userId: context.session.user.id,
				});
			}

			return result;
		}),
	update: protectedProcedure
		.input(
			z.object({
				spacePublicId: z.string(),
				input: UpdateSpaceInput.partial(),
			}),
		)
		.handler(async ({ input }) => {
			const spaceId = await spaceRepo.getIdByPublicId(input.spacePublicId);
			if (!spaceId) {
				throw new ORPCError("NOT_FOUND", {
					message: "Space not found",
				});
			}
			const result = await spaceRepo.update({
				spaceId: spaceId.id,
				input: input.input,
			});
			return result;
		}),
	delete: protectedProcedure
		.input(z.object({ spacePublicId: z.string() }))
		.handler(async ({ context, input }) => {
			const spaceId = await spaceRepo.getIdByPublicId(input.spacePublicId);
			if (!spaceId) {
				throw new ORPCError("NOT_FOUND", {
					message: "Space not found",
				});
			}
			const result = await spaceRepo.softDelete({
				spaceId: spaceId.id,
				deletedBy: context.session.user.id,
			});
			return result;
		}),
	hardDelete: protectedProcedure
		.input(z.object({ spacePublicId: z.string() }))
		.handler(async ({ input }) => {
			const spaceId = await spaceRepo.getIdByPublicId(input.spacePublicId);
			if (!spaceId) {
				throw new ORPCError("NOT_FOUND", {
					message: "Space not found",
				});
			}
			const result = await spaceRepo.hardDelete({
				spaceId: spaceId.id,
			});
			return result;
		}),
};
