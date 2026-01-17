import {
	InsertProject,
	SelectProject,
	UpdateProject,
} from "@meraki/db/lib/zod-schemas";
import z from "zod";

export const ProjectInsertInput = InsertProject.omit({
	organizationId: true,
	createdBy: true,
	position: true,
	spaceId: true,
	statusId: true,
}).extend({
	projectStatusPublicId: z.string(),
	spacePublicId: z.string(),
});

export type ProjectInsertInput = z.infer<typeof ProjectInsertInput>;

export const ProjectUpdateInput = UpdateProject.omit({
	createdBy: true,
	spaceId: true,
	statusId: true,
}).extend({
	projectPublicId: z.string(),
	projectStatusPublicId: z.string().optional(),
});

export type ProjectUpdateInput = z.infer<typeof ProjectUpdateInput>;

export const Project = SelectProject.omit({});
export type Project = z.infer<typeof Project>;
