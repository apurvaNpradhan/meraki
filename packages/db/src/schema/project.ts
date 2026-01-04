import { sql } from "drizzle-orm";
import {
	bigint,
	index,
	integer,
	numeric,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import type z from "zod";
import { organization, user } from "../schema/auth";
import { timestamps } from "../utils/timestamps";
import { projectStatuses } from "./project-statuses";
import { spaces } from "./space";

export const projects = pgTable(
	"project",
	{
		id: bigint("id", { mode: "bigint" })
			.primaryKey()
			.generatedAlwaysAsIdentity(),
		publicId: uuid("public_id")
			.notNull()
			.unique()
			.default(sql`uuid_generate_v7()`),
		name: varchar("name", { length: 255 }).notNull(),
		description: text("description"),
		priority: integer("priority").notNull().default(0),
		position: varchar("position").notNull(),
		statusId: bigint("status_id", { mode: "bigint" })
			.notNull()
			.references(() => projectStatuses.id),
		spaceId: bigint("space_id", { mode: "bigint" })
			.notNull()
			.references(() => spaces.id, { onDelete: "cascade" }),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		startDate: timestamp("start_date", {
			mode: "date",
			precision: 3,
			withTimezone: true,
		}),
		dueDate: timestamp("due_date", {
			mode: "date",
			precision: 3,
			withTimezone: true,
		}),
		createdAt: timestamps.createdAt,
		updatedAt: timestamps.updatedAt,
		deletedAt: timestamps.deletedAt,
		createdBy: text("created_by")
			.notNull()
			.references(() => user.id),
		deletedBy: text("deleted_by").references(() => user.id, {
			onDelete: "set null",
		}),
	},
	(table) => [
		index("project_spaceId_idx").on(table.spaceId),
		index("project_organizationId_idx").on(table.organizationId),
		index("project_statusId_idx").on(table.statusId),
	],
).enableRLS();

export const SelectProject = createSelectSchema(projects).omit({});
export type SelectProject = z.infer<typeof SelectProject>;
export type InsertProject = typeof projects.$inferInsert;
