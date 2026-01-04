import * as projectRepo from "@meraki/db/repository/project.repo";
import * as spaceRepo from "@meraki/db/repository/space.repo";
import { ORPCError } from "@orpc/client";
import { generateKeyBetween } from "fractional-indexing";
import z from "zod";
import { protectedProcedure } from "..";

export const projectRouter = {
	all: protectedProcedure
		.output(
			z.custom<Awaited<ReturnType<typeof projectRepo.getAllByWorkspaceId>>>(),
		)
		.handler(async ({ context }) => {
			const projects = await projectRepo.getAllByWorkspaceId(
				context.session.session.activeOrganizationId,
			);
			return projects;
		}),
	allBySpaceId: protectedProcedure
		.input(z.object({ spacePublicId: z.string() }))
		.output(
			z.custom<Awaited<ReturnType<typeof projectRepo.getProjectsBySpaceId>>>(),
		)
		.handler(async ({ input, context }) => {
			const space = await spaceRepo.getWorkspaceAndSpaceIdBySpacePublicId(
				input.spacePublicId,
			);
			if (
				!space ||
				space.organizationId !== context.session.session.activeOrganizationId
			) {
				throw new ORPCError("NOT_FOUND", {
					message: `Space with public ID ${input.spacePublicId} not found`,
				});
			}
			const projects = await projectRepo.getProjectsBySpaceId(
				space.id,
				context.session.session.activeOrganizationId,
			);
			return projects;
		}),

	byId: protectedProcedure
		.input(z.object({ publicId: z.string() }))
		.output(z.custom<Awaited<ReturnType<typeof projectRepo.getByPublicId>>>())
		.handler(async ({ input, context }) => {
			const project = await projectRepo.getByPublicId(
				input.publicId,
				context.session.session.activeOrganizationId,
			);
			if (!project) {
				throw new ORPCError("NOT_FOUND", {
					message: `Project with public ID ${input.publicId} not found`,
				});
			}
			return project;
		}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(255),
				description: z.string().optional().nullable(),
				statusPublicId: z.string(),
				spacePublicId: z.string(),
				priority: z.number(),
				startDate: z.string().datetime().optional().nullable(),
				dueDate: z.string().datetime().optional().nullable(),
			}),
		)
		.output(z.custom<Awaited<ReturnType<typeof projectRepo.create>>>())
		.handler(async ({ input, context }) => {
			const userId = context.session?.user?.id;

			const space = await spaceRepo.getWorkspaceAndSpaceIdBySpacePublicId(
				input.spacePublicId,
			);
			if (
				!space ||
				space.organizationId !== context.session.session.activeOrganizationId
			) {
				throw new ORPCError("NOT_FOUND", {
					message: `Space with public ID ${input.spacePublicId} not found`,
				});
			}

			const { getIdByPublicId } = await import(
				"@meraki/db/repository/project-status.repo"
			);
			const status = await getIdByPublicId(input.statusPublicId);

			if (
				!status ||
				status.organizationId !== context.session.session.activeOrganizationId
			) {
				throw new ORPCError("NOT_FOUND", {
					message: `Status with public ID ${input.statusPublicId} not found`,
				});
			}
			const getLastProjectBySpace = await projectRepo.getLastProjectBySpaceId(
				space.id,
			);
			const position = generateKeyBetween(
				getLastProjectBySpace?.position,
				null,
			);

			const result = await projectRepo.create({
				name: input.name,
				priority: input.priority,
				description: input.description,
				statusId: status.id,
				position: position ?? "a0",
				spaceId: space.id,
				organizationId: context.session.session.activeOrganizationId,
				startDate: input.startDate ? new Date(input.startDate) : null,
				dueDate: input.dueDate ? new Date(input.dueDate) : null,
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
				statusPublicId: z.string().optional(),
				startDate: z.string().datetime().optional().nullable(),
				dueDate: z.string().datetime().optional().nullable(),
			}),
		)
		.output(z.custom<Awaited<ReturnType<typeof projectRepo.update>>>())
		.handler(async ({ input, context }) => {
			const project = await projectRepo.getIdByPublicId(input.publicId);

			if (
				!project ||
				project.organizationId !== context.session.session.activeOrganizationId
			) {
				throw new ORPCError("NOT_FOUND", {
					message: `Project with public ID ${input.publicId} not found`,
				});
			}

			let statusId: bigint | undefined;
			if (input.statusPublicId) {
				const { getIdByPublicId } = await import(
					"@meraki/db/repository/project-status.repo"
				);
				const status = await getIdByPublicId(input.statusPublicId);
				if (
					!status ||
					status.organizationId !== context.session.session.activeOrganizationId
				) {
					throw new ORPCError("NOT_FOUND", {
						message: `Status with public ID ${input.statusPublicId} not found`,
					});
				}
				statusId = status.id;
			}

			const result = await projectRepo.update({
				publicId: input.publicId,
				name: input.name,
				description: input.description,
				statusId: statusId,
				startDate: input.startDate ? new Date(input.startDate) : undefined,
				dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
			});

			return result;
		}),

	delete: protectedProcedure
		.input(z.object({ publicId: z.string() }))
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ input, context }) => {
			const userId = context.session?.user?.id;
			const project = await projectRepo.getIdByPublicId(input.publicId);

			if (
				!project ||
				project.organizationId !== context.session.session.activeOrganizationId
			) {
				throw new ORPCError("NOT_FOUND", {
					message: `Project with public ID ${input.publicId} not found`,
				});
			}

			await projectRepo.softDelete({
				projectId: project.id,
				deletedBy: userId,
				deletedAt: new Date(),
			});

			return { success: true };
		}),
};
