import * as projectRepo from "@meraki/db/repository/project.repo";
import * as projectStatusRepo from "@meraki/db/repository/project-status.repo";
import * as spaceRepo from "@meraki/db/repository/space.repo";
import { ORPCError } from "@orpc/client";
import { generateKeyBetween } from "fractional-indexing";
import z from "zod";
import { protectedProcedure } from "..";
import { ProjectInsertInput, ProjectUpdateInput } from "../types/project";

export const projectRouter = {
	all: protectedProcedure
		.output(
			z.custom<Awaited<ReturnType<typeof projectRepo.getAllByWorkspaceId>>>(),
		)
		.handler(async ({ input, context }) => {
			const projects = projectRepo.getAllByWorkspaceId(context.workspace.id);
			return projects;
		}),
	list: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(50),
				cursor: z.string().optional(),
			}),
		)
		.output(
			z.object({
				items:
					z.custom<Awaited<ReturnType<typeof projectRepo.list>>["items"]>(),
				nextCursor: z.string().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			return projectRepo.list({
				organizationId: context.workspace.id,
				limit: input.limit,
				cursor: input.cursor,
			});
		}),
	byId: protectedProcedure
		.input(z.object({ projectPublicId: z.string() }))
		.handler(async ({ input, context }) => {
			const project = await projectRepo.getWorkspaceAndProjectIdByPublicId(
				input.projectPublicId,
			);
			if (!project)
				throw new ORPCError("NOT_FOUND", {
					message: `project with public ID ${input.projectPublicId} not found`,
				});
			const result = await projectRepo.getById(
				project.id,
				context.workspace.id,
			);
			return result;
		}),
	create: protectedProcedure
		.input(ProjectInsertInput)
		.errors({
			SPACE_NOT_FOUND: {
				status: 404,
				message: "Space not found",
				data: z.object({
					spacePublicId: z.string(),
				}),
			},
			PROJECT_STATUS_NOT_FOUND: {
				status: 404,
				message: "Project status not found",
				data: z.object({
					projectStatusPublicId: z.string(),
				}),
			},
		})
		.output(z.custom<Awaited<ReturnType<typeof projectRepo.create>>>())
		.handler(async ({ input, context, errors }) => {
			const userId = context.session?.user?.id;
			const space = await spaceRepo.getIdByPublicId(input.spacePublicId);
			if (!space) {
				throw errors.SPACE_NOT_FOUND({
					data: {
						spacePublicId: input.spacePublicId,
					},
				});
			}
			const statusId = await projectStatusRepo.getProjectIdByPublicId(
				input.projectStatusPublicId,
			);
			if (!statusId) {
				throw errors.PROJECT_STATUS_NOT_FOUND({
					data: {
						projectStatusPublicId: input.projectStatusPublicId,
					},
				});
			}
			const lastPosition = await projectRepo.getLastPositionBySpaceId(space.id);
			const position = generateKeyBetween(lastPosition?.position, null);
			const result = await projectRepo.create({
				input: {
					...input,
					position,
					organizationId: context.workspace.id,
					createdBy: userId,
					statusId: statusId.id,
					spaceId: space.id,
				},
			});

			return result;
		}),
	update: protectedProcedure
		.input(ProjectUpdateInput)
		.output(z.custom<Awaited<ReturnType<typeof projectRepo.update>>>())
		.handler(async ({ input }) => {
			const project = await projectRepo.getWorkspaceAndProjectIdByPublicId(
				input.projectPublicId,
			);

			if (!project) {
				throw new ORPCError("NOT_FOUND", {
					message: `project with public ID ${input.projectPublicId} not found`,
				});
			}
			let statusId: bigint | null = null;
			if (input.projectStatusPublicId) {
				statusId =
					(
						await projectStatusRepo.getProjectIdByPublicId(
							input.projectStatusPublicId,
						)
					)?.id ?? null;
				if (!statusId) {
					throw new ORPCError("PROJECT_STATUS_NOT_FOUND", {
						data: {
							projectStatusPublicId: input.projectStatusPublicId,
						},
					});
				}
			}

			const result = await projectRepo.update({
				projectId: project.id,
				input: {
					...input,
					...(statusId ? { statusId } : {}),
				},
			});

			return result;
		}),
	delete: protectedProcedure
		.input(z.object({ projectPublicId: z.string() }))
		.output(
			z.object({
				success: z.boolean(),
				deletedPublicId: z.string().optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			const project = await projectRepo.getWorkspaceAndProjectIdByPublicId(
				input.projectPublicId,
			);

			if (!project) {
				throw new ORPCError("NOT_FOUND", {
					message: `project with public ID ${input.projectPublicId} not found`,
				});
			}

			const result = await projectRepo.softDelete({
				projectId: project.id,
				deletedBy: context.session.user.id,
				deletedAt: new Date(),
			});

			return { success: true, deletedPublicId: result?.publicId };
		}),
};
