//Spaces

import { InsertSpace, SelectSpace, UpdateSpace } from "@meraki/db/zod";
import {
	InsertProject,
	SelectProject,
	UpdateProject,
} from "@meraki/db/zod/project.zod";
import z from "zod";

export const SpaceInsertInput = InsertSpace.omit({
	organizationId: true,
	createdBy: true,
	slug: true,
	position: true,
});

export type SpaceInsertInput = z.infer<typeof SpaceInsertInput>;

export const SpaceUpdateInput = UpdateSpace.omit({
	organizationId: true,
	createdBy: true,
}).extend({
	spacePublicId: z.string(),
});

export type SpaceUpdateInput = z.infer<typeof SpaceUpdateInput>;

export const Space = SelectSpace;
export type Space = z.infer<typeof Space>;

// Projects

export const ProjectInsertInput = InsertProject.omit({
	organizationId: true,
	createdBy: true,
	position: true,
	spaceId: true,
	statusId: true,
}).extend({ projectStatusPublicId: z.string(), spacePublicId: z.string() });

export type ProjectInsertInput = z.infer<typeof ProjectInsertInput>;

export const ProjectUpdateInput = UpdateProject.omit({
	organizationId: true,
	createdBy: true,
	spaceId: true,
	statusId: true,
}).extend({
	projectPublicId: z.string(),
	projectStatusPublicId: z.string().optional(),
});

export type ProjectUpdateInput = z.infer<typeof ProjectUpdateInput>;

export const Project = SelectProject.omit({
	spaceId: true,
	statusId: true,
});
export type Project = z.infer<typeof Project>;
