import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
import { taskStatuses, tasks } from "../schema/task";

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
	description: z.string().optional(),
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
