import * as projectRepo from "@meraki/db/repository/project.repo";
import * as projectLabelRepo from "@meraki/db/repository/project-label.repo";
import * as spaceRepo from "@meraki/db/repository/space.repo";
import { ORPCError } from "@orpc/client";
import z from "zod";
import { protectedProcedure } from "..";
import {
	ProjectLabelInsertInput,
	ProjectLabelUpdateInput,
} from "../types/project-label";

export const projectLabelRouter = {
	allBySpaceId: protectedProcedure
		.input(z.object({ spacePublicId: z.string() }))
		.handler(async ({ input }) => {
			const spaceId = await spaceRepo.getIdByPublicId(input.spacePublicId);
			if (!spaceId) {
				throw new ORPCError("NOT_FOUND", {
					message: `space with public ID ${input.spacePublicId} not found`,
				});
			}
			const labels = await projectLabelRepo.getAllBySpaceId(spaceId.id);
			return labels;
		}),

	create: protectedProcedure
		.input(ProjectLabelInsertInput)
		.handler(async ({ input, context }) => {
			const userId = context.session?.user?.id;
			const space = await spaceRepo.getIdByPublicId(input.spacePublicId);
			if (!space) {
				throw new ORPCError("NOT_FOUND", {
					message: `space with public ID ${input.spacePublicId} not found`,
				});
			}

			const result = await projectLabelRepo.create({
				input: {
					...input,
					spaceId: space.id,
					createdBy: userId,
				},
			});

			return result;
		}),

	update: protectedProcedure
		.input(ProjectLabelUpdateInput)
		.handler(async ({ input }) => {
			const label = await projectLabelRepo.getIdByPublicId(
				input.projectLabelPublicId,
			);

			if (!label) {
				throw new ORPCError("NOT_FOUND", {
					message: `label with public ID ${input.projectLabelPublicId} not found`,
				});
			}

			const result = await projectLabelRepo.update({
				id: label.id,
				input,
			});

			return result;
		}),

	delete: protectedProcedure
		.input(z.object({ projectLabelPublicId: z.string() }))
		.handler(async ({ context, input }) => {
			const label = await projectLabelRepo.getIdByPublicId(
				input.projectLabelPublicId,
			);

			if (!label) {
				throw new ORPCError("NOT_FOUND", {
					message: `label with public ID ${input.projectLabelPublicId} not found`,
				});
			}

			const result = await projectLabelRepo.softDelete({
				id: label.id,
				deletedBy: context.session.user.id,
			});

			return { success: true, publicId: result?.publicId };
		}),

	setLabels: protectedProcedure
		.input(
			z.object({
				projectPublicId: z.string(),
				labelPublicIds: z.array(z.string()),
			}),
		)
		.handler(async ({ input }) => {
			const project = await projectRepo.getProjectIdByPublicId(
				input.projectPublicId,
			);
			if (!project) {
				throw new ORPCError("NOT_FOUND", {
					message: `project with public ID ${input.projectPublicId} not found`,
				});
			}

			const labelIds: bigint[] = [];
			for (const publicId of input.labelPublicIds) {
				const label = await projectLabelRepo.getIdByPublicId(publicId);
				if (label) {
					labelIds.push(label.id);
				}
			}

			await projectLabelRepo.setProjectLabels({
				projectId: project.id,
				labelIds,
			});

			return { success: true };
		}),
};
