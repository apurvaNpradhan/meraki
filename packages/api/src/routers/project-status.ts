import * as projectStatusRepo from "@meraki/db/repository/project-status.repo";
import { ORPCError } from "@orpc/client";
import { generateKeyBetween } from "fractional-indexing";
import z from "zod";
import { protectedProcedure } from "..";

export const projectStatusRouter = {
	all: protectedProcedure
		.output(
			z.custom<
				Awaited<ReturnType<typeof projectStatusRepo.getAllByWorkspaceId>>
			>(),
		)
		.handler(async ({ context }) => {
			const statuses = await projectStatusRepo.getAllByWorkspaceId(
				context.workspace.id,
			);
			return statuses;
		}),

	byId: protectedProcedure
		.input(z.object({ publicId: z.string() }))
		.output(
			z.custom<Awaited<ReturnType<typeof projectStatusRepo.getByPublicId>>>(),
		)
		.handler(async ({ input, context }) => {
			const status = await projectStatusRepo.getByPublicId(
				input.publicId,
				context.workspace.id,
			);
			if (!status) {
				throw new ORPCError("NOT_FOUND", {
					message: `Project status with public ID ${input.publicId} not found`,
				});
			}
			return status;
		}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(100),
				description: z.string().optional().nullable(),
				colorCode: z.string().min(1),
				type: z.enum([
					"backlog",
					"planned",
					"in_progress",
					"completed",
					"canceled",
				]),
			}),
		)
		.output(z.custom<Awaited<ReturnType<typeof projectStatusRepo.create>>>())
		.handler(async ({ input, context }) => {
			const userId = context.session?.user?.id;
			const lastPosition = await projectStatusRepo.getLastPositionByWorkspaceId(
				context.workspace.id,
			);
			const position = generateKeyBetween(lastPosition?.position, null);

			const result = await projectStatusRepo.create({
				name: input.name,
				description: input.description,
				colorCode: input.colorCode,
				type: input.type,
				position,
				organizationId: context.workspace.id,
				createdBy: userId,
			});

			return result;
		}),

	update: protectedProcedure
		.input(
			z.object({
				publicId: z.string(),
				name: z.string().optional(),
				description: z.string().optional().nullable(),
				colorCode: z.string().optional(),
				type: z
					.enum(["backlog", "planned", "in_progress", "completed", "canceled"])
					.optional(),
				position: z.string().optional(),
			}),
		)
		.output(z.custom<Awaited<ReturnType<typeof projectStatusRepo.update>>>())
		.handler(async ({ input, context }) => {
			const status = await projectStatusRepo.getIdByPublicId(input.publicId);

			if (
				!status ||
				status.organizationId !== context.session.session.activeOrganization?.id
			) {
				throw new ORPCError("NOT_FOUND", {
					message: `Project status with public ID ${input.publicId} not found`,
				});
			}

			const result = await projectStatusRepo.update({
				publicId: input.publicId,
				name: input.name,
				description: input.description,
				colorCode: input.colorCode,
				type: input.type,
				position: input.position,
			});

			return result;
		}),

	delete: protectedProcedure
		.input(z.object({ publicId: z.string() }))
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ input, context }) => {
			const userId = context.session?.user?.id;
			const status = await projectStatusRepo.getIdByPublicId(input.publicId);

			if (!status || status.organizationId !== context.workspace.id) {
				throw new ORPCError("NOT_FOUND", {
					message: `Project status with public ID ${input.publicId} not found`,
				});
			}

			await projectStatusRepo.softDelete({
				statusId: status.id,
				deletedBy: userId,
				deletedAt: new Date(),
			});

			return { success: true };
		}),
};
