import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
import { projects } from "../schema/project";
import { spaces } from "../schema/space";
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
	status: true,
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
