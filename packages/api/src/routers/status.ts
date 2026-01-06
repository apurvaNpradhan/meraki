import * as projectRepo from "@meraki/db/repository/project.repo";
import * as statusRepo from "@meraki/db/repository/status.repo";
import { InsertStatus, UpdateStatus } from "@meraki/db/zod/status.zod";
import { ORPCError } from "@orpc/client";
import { generateKeyBetween } from "fractional-indexing";
import z from "zod";
import { protectedProcedure } from "..";

export const statusRouter = {
	all: protectedProcedure
		.input(z.object({ projectPublicId: z.string() }))
		.output(
			z.custom<Awaited<ReturnType<typeof statusRepo.getAllByProjectId>>>(),
		)
		.handler(async ({ input, context }) => {
			const project = await projectRepo.getWorkspaceAndProjectIdByPublicId(
				input.projectPublicId,
			);
			if (
				!project ||
				project.organizationId !== context.session.session.activeOrganizationId
			) {
				throw new ORPCError("NOT_FOUND", {
					message: `Project with public ID ${input.projectPublicId} not found`,
				});
			}

			const statuses = await statusRepo.getAllByProjectId(project.id);
			return statuses;
		}),

	byId: protectedProcedure
		.input(z.object({ publicId: z.string() }))
		.output(z.custom<Awaited<ReturnType<typeof statusRepo.getByPublicId>>>())
		.handler(async ({ input, context }) => {
			const status = await statusRepo.getIdByPublicId(input.publicId);
			if (
				!status ||
				status.project.organizationId !==
					context.session.session.activeOrganizationId
			) {
				throw new ORPCError("NOT_FOUND", {
					message: `Status with public ID ${input.publicId} not found`,
				});
			}
			const result = await statusRepo.getByPublicId(input.publicId);
			return result;
		}),

	create: protectedProcedure
		.input(
			InsertStatus.pick({
				name: true,
				colorCode: true,
				type: true,
			}).extend({
				projectPublicId: z.string(),
			}),
		)
		.output(z.custom<Awaited<ReturnType<typeof statusRepo.create>>>())
		.handler(async ({ input, context }) => {
			const userId = context.session?.user?.id;
			const project = await projectRepo.getWorkspaceAndProjectIdByPublicId(
				input.projectPublicId,
			);

			if (
				!project ||
				project.organizationId !== context.session.session.activeOrganizationId
			) {
				throw new ORPCError("NOT_FOUND", {
					message: `Project with public ID ${input.projectPublicId} not found`,
				});
			}

			const lastPosition = await statusRepo.getLastPositionByProjectId(
				project.id,
			);
			const position = generateKeyBetween(lastPosition?.position, null);

			const result = await statusRepo.create({
				name: input.name,
				colorCode: input.colorCode,
				type: input.type,
				position,
				projectId: project.id,
				createdBy: userId,
			});

			return result;
		}),

	update: protectedProcedure
		.input(
			UpdateStatus.pick({
				name: true,
				colorCode: true,
				type: true,
				position: true,
			}).extend({
				publicId: z.string(),
			}),
		)
		.output(z.custom<Awaited<ReturnType<typeof statusRepo.update>>>())
		.handler(async ({ input, context }) => {
			const status = await statusRepo.getIdByPublicId(input.publicId);

			if (
				!status ||
				status.project.organizationId !==
					context.session.session.activeOrganizationId
			) {
				throw new ORPCError("NOT_FOUND", {
					message: `Status with public ID ${input.publicId} not found`,
				});
			}

			const result = await statusRepo.update({
				statusId: status.id,
				input: {
					name: input.name,
					colorCode: input.colorCode,
					type: input.type,
					position: input.position,
				},
			});

			return result;
		}),

	delete: protectedProcedure
		.input(z.object({ publicId: z.string() }))
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ input, context }) => {
			const userId = context.session?.user?.id;
			const status = await statusRepo.getIdByPublicId(input.publicId);

			if (
				!status ||
				status.project.organizationId !==
					context.session.session.activeOrganizationId
			) {
				throw new ORPCError("NOT_FOUND", {
					message: `Status with public ID ${input.publicId} not found`,
				});
			}

			await statusRepo.softDelete({
				statusId: status.id,
				deletedBy: userId,
				deletedAt: new Date(),
			});

			return { success: true };
		}),
};
