import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
import { projects } from "../schema";

export const SelectProject = createSelectSchema(projects).omit({
	id: true,
	deletedBy: true,
	organizationId: true,
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

export const UpdateProject = InsertProject.partial();
