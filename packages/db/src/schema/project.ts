import { sql } from "drizzle-orm";
import {
	bigint,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { organization, user } from "../schema/auth";
import { timestamps } from "../utils/timestamps";
import { projectStatuses } from "./project-statuses";
import { spaces } from "./space";

export const boardTypes = ["regular", "template"] as const;
export type BoardType = (typeof boardTypes)[number];
export const boardTypeEnum = pgEnum("board_type", boardTypes);
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
		summary: text("summary"),
		priority: integer("priority").default(0).notNull(),
		statusId: bigint("status_id", { mode: "bigint" })
			.notNull()
			.references(() => projectStatuses.id),
		spaceId: bigint("space_id", { mode: "bigint" })
			.notNull()
			.references(() => spaces.id),
		startDate: timestamp("start_date", {
			mode: "date",
			precision: 3,
			withTimezone: true,
		}),
		targetDate: timestamp("target_date", {
			mode: "date",
			precision: 3,
			withTimezone: true,
		}),
		position: varchar("position", { length: 32 }).notNull(),
		colorCode: varchar("color_code", { length: 255 }).notNull(),
		icon: varchar("icon", { length: 255 }).notNull(),
		createdBy: text("created_by")
			.notNull()
			.references(() => user.id),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		deletedBy: text("deleted_by").references(() => user.id, {
			onDelete: "set null",
		}),

		...timestamps,
	},
	(table) => [
		index("project_organizationId_idx").on(table.organizationId),
		index("project_createdBy_idx").on(table.createdBy),
		index("project_spaceId_idx").on(table.spaceId),
	],
).enableRLS();
