import { sql } from "drizzle-orm";
import {
	bigint,
	bigserial,
	boolean,
	index,
	pgEnum,
	pgTable,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
import { timestamps } from "../utils/timestamps";
import { spaces } from "./space";

export const statusTypeEnum = pgEnum("status_type", [
	"backlog",
	"not_started",
	"in_progress",
	"completed",
	"canceled",
]);

export const statusGroups = pgTable(
	"status_group",
	{
		id: bigint("id", { mode: "bigint" })
			.primaryKey()
			.generatedAlwaysAsIdentity(),
		spaceId: bigint("space_id", { mode: "bigint" })
			.notNull()
			.references(() => spaces.id, { onDelete: "cascade" }),
		publicId: uuid("public_id")
			.notNull()
			.unique()
			.default(sql`uuid_generate_v7()`),

		name: varchar("name", { length: 100 }).notNull(),
		position: varchar("position", { length: 32 }).notNull(),
		type: statusTypeEnum("type").notNull(),
		...timestamps,
	},
	(table) => [index("status_group_space_idx").on(table.spaceId)],
).enableRLS();

export const statuses = pgTable(
	"status",
	{
		id: bigint("id", { mode: "bigint" })
			.primaryKey()
			.generatedAlwaysAsIdentity(),
		publicId: uuid("public_id")
			.notNull()
			.unique()
			.default(sql`uuid_generate_v7()`),
		spaceId: bigint("space_id", { mode: "bigint" })
			.notNull()
			.references(() => spaces.id, { onDelete: "cascade" }),
		groupId: bigint("group_id", { mode: "bigint" })
			.notNull()
			.references(() => statusGroups.id, { onDelete: "cascade" }),
		name: varchar("name", { length: 100 }).notNull(),
		color: varchar("color", { length: 50 }).notNull(),
		position: varchar("position", { length: 32 }).notNull(),
		isDefault: boolean("is_default").default(false),
		...timestamps,
	},
	(table) => [
		index("status_space_idx").on(table.spaceId),
		index("status_group_idx").on(table.groupId),
	],
).enableRLS();

export const SelectStatusGroup = createSelectSchema(statusGroups).omit({
	id: true,
	spaceId: true,
});
export const InsertStatusGroup = createInsertSchema(statusGroups).omit({
	publicId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});
export const UpdateStatusGroup = createUpdateSchema(statusGroups).omit({
	publicId: true,
	spaceId: true,
	createdAt: true,
	deletedAt: true,
});

export const SelectStatus = createSelectSchema(statuses).omit({
	spaceId: true,
	groupId: true,
});
export const InsertStatus = createInsertSchema(statuses).omit({
	publicId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});
export const UpdateStatus = createUpdateSchema(statuses).omit({
	publicId: true,
	spaceId: true,
	createdAt: true,
	deletedAt: true,
});

export type SelectStatusGroup = z.infer<typeof SelectStatusGroup>;
export type InsertStatusGroup = z.infer<typeof InsertStatusGroup>;
export type UpdateStatusGroup = z.infer<typeof UpdateStatusGroup>;

export type SelectStatus = z.infer<typeof SelectStatus>;
export type InsertStatus = z.infer<typeof InsertStatus>;
export type UpdateStatus = z.infer<typeof UpdateStatus>;

export const InsertStatusGroupWithStatuses = InsertStatusGroup.extend({
	statuses: z.array(
		InsertStatus.omit({
			spaceId: true,
			groupId: true,
		}),
	),
}).omit({
	spaceId: true,
});
export type InsertStatusGroupWithStatuses = z.infer<
	typeof InsertStatusGroupWithStatuses
>;
