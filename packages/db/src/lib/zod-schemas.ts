import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
import {
	projectLabelMappings,
	projectLabels,
	projects,
} from "../schema/project";
import { spaces } from "../schema/space";
import { statuses, statusesTypes } from "../schema/status";
import { tasks } from "../schema/task";

export const TaskSchema = createSelectSchema(tasks).omit({
	id: true,
	parentTaskId: true,
	assigneeId: true,
	createdBy: true,
	deletedBy: true,
	organizationId: true,
});

export const InsertTaskSchema = createInsertSchema(tasks, {
	title: z.string().min(1).max(500),
	priority: z.number().default(0),
	position: z.string().min(1).max(32),
	parentTaskId: z.bigint().optional(),
	organizationId: z.string(),
}).omit({
	publicId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	deletedBy: true,
});

export const UpdateTaskSchema = createUpdateSchema(tasks).omit({
	publicId: true,
	createdAt: true,
	organizationId: true,
});

export const SelectSpaceSchema = createSelectSchema(spaces).omit({
	id: true,
	deletedBy: true,
	organizationId: true,
	createdBy: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});
export const InsertSpaceSchema = createInsertSchema(spaces, {
	name: z.string().min(1, "Name is required").max(255, "Name is too long"),
}).omit({
	publicId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	deletedBy: true,
});

export const UpdateSpaceSchema = createUpdateSchema(spaces).omit({
	publicId: true,
	createdAt: true,
	organizationId: true,
	deletedAt: true,
	deletedBy: true,
});

export const SelectProject = createSelectSchema(projects).omit({
	id: true,
	deletedBy: true,
	organizationId: true,
	spaceId: true,
	statusId: true,
	createdBy: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export const InsertProject = createInsertSchema(projects, {
	name: z.string().min(1, "Name is required").max(255, "Name is too long"),
	position: z.string().min(1, "Position is required"),
	colorCode: z.string().min(1, "Color code is required"),
	icon: z.string().min(1, "Icon is required"),
}).omit({
	publicId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	deletedBy: true,
});

export const UpdateProject = createUpdateSchema(projects).omit({
	publicId: true,
	createdAt: true,
	organizationId: true,
	deletedAt: true,
	deletedBy: true,
});

export const SelectStatus = createSelectSchema(statuses).omit({
	id: true,
	projectId: true,
	createdBy: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	deletedBy: true,
});
export const InsertStatus = createInsertSchema(statuses, {
	name: z.string().min(1, "Name is required").max(255, "Name is too long"),
	colorCode: z
		.string()
		.min(1, "Color code is required")
		.max(255, "Color code is too long"),
	type: z.enum(statusesTypes),
	position: z
		.string()
		.min(1, "Position is required")
		.max(255, "Position is too long"),
}).omit({
	publicId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	deletedBy: true,
});

export const UpdateStatus = createUpdateSchema(statuses).omit({
	publicId: true,
	createdAt: true,
	deletedAt: true,
	deletedBy: true,
});

export const SelectProjectLabel = createSelectSchema(projectLabels).omit({
	id: true,
	spaceId: true,
	createdBy: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	deletedBy: true,
});

export const InsertProjectLabel = createInsertSchema(projectLabels, {
	name: z.string().min(1, "Name is required").max(255, "Name is too long"),
	colorCode: z.string().min(1, "Color code is required"),
}).omit({
	publicId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	deletedBy: true,
});

export const UpdateProjectLabel = createUpdateSchema(projectLabels).omit({
	publicId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	deletedBy: true,
});

export const InsertProjectLabelMapping =
	createInsertSchema(projectLabelMappings);
