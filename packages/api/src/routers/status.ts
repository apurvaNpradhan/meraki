import * as statusRepo from "@meraki/db/repository/status";
import { InsertStatus, UpdateStatus } from "@meraki/db/schema/status";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { protectedProcedure } from "..";

export const statusRouter = {
	all: protectedProcedure
		.input(z.object({ spaceId: z.bigint() }))
		.handler(async ({ input }) => {
			try {
				return await statusRepo.getGroupsBySpaceId(input.spaceId);
			} catch (error) {
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to get groups",
					cause: error,
				});
			}
		}),

	create: protectedProcedure
		.input(
			InsertStatus.omit({
				spaceId: true,
				groupId: true,
			}).extend({
				spaceId: z.bigint(),
				groupId: z.bigint(),
			}),
		)
		.errors({
			INTERNAL_SERVER_ERROR: {
				message: "Failed to create status",
			},
		})
		.handler(async ({ input }) => {
			try {
				return await statusRepo.createStatus(input);
			} catch (error) {
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to create status",
					cause: error,
				});
			}
		}),

	update: protectedProcedure
		.input(
			z.object({
				publicId: z.string(),
				spaceId: z.bigint(),
				data: UpdateStatus,
			}),
		)
		.errors({
			NOT_FOUND: {
				message: "Status not found",
			},
		})
		.handler(async ({ input, errors }) => {
			try {
				const { publicId, spaceId, data } = input;
				const id = await statusRepo.getStatusIdByPublicId(publicId);
				if (!id) throw errors.NOT_FOUND;

				const status = await statusRepo.updateStatus(id, spaceId, data);
				if (!status) throw errors.NOT_FOUND;
				return status;
			} catch (error) {
				if (error === errors.NOT_FOUND) throw error;
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to update status",
					cause: error,
				});
			}
		}),

	delete: protectedProcedure
		.input(z.object({ publicId: z.string(), spaceId: z.bigint() }))
		.errors({
			NOT_FOUND: {
				message: "Status not found",
			},
		})
		.handler(async ({ input, errors }) => {
			try {
				const { publicId, spaceId } = input;
				const id = await statusRepo.getStatusIdByPublicId(publicId);
				if (!id) throw errors.NOT_FOUND;

				const status = await statusRepo.deleteStatus(id, spaceId);
				if (!status) throw errors.NOT_FOUND;
				return status;
			} catch (error) {
				if (error === errors.NOT_FOUND) throw error;
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to delete status",
					cause: error,
				});
			}
		}),
};
