import { sql } from "drizzle-orm";
import {
	bigint,
	index,
	pgEnum,
	pgTable,
	text,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { timestamps } from "../utils/timestamps";
import { organization, user } from "./auth";

export const projectStatusesTypes = [
	"backlog",
	"planned",
	"in_progress",
	"completed",
	"canceled",
] as const;
export type ProjectStatusType = (typeof projectStatusesTypes)[number];
export const projectStatusTypeEnum = pgEnum(
	"project_status_type",
	projectStatusesTypes,
);

export const projectStatuses = pgTable(
	"project_statuses",
	{
		id: bigint("id", { mode: "bigint" })
			.primaryKey()
			.generatedAlwaysAsIdentity(),
		publicId: uuid("public_id")
			.notNull()
			.unique()
			.default(sql`uuid_generate_v7()`),
		createdBy: uuid("created_by")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		organizationId: uuid("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		deletedBy: uuid("deleted_by").references(() => user.id, {
			onDelete: "set null",
		}),
		name: varchar("name", { length: 255 }).notNull(),
		description: text("description"),
		colorCode: varchar("color_code", { length: 255 }).notNull(),
		type: projectStatusTypeEnum("type").notNull().default("backlog"),
		position: text("position").notNull(),
		...timestamps,
	},
	(table) => [
		index("project_statuses_organization_idx").on(table.organizationId),
		index("project_statuses_position_idx").on(table.position),
	],
).enableRLS();
