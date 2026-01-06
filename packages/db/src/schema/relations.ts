import { relations } from "drizzle-orm";
import {
	account,
	invitation,
	member,
	organization,
	session,
	user,
} from "./auth";
import { projects } from "./project";
import { projectStatuses } from "./project-statuses";
import { spaces } from "./space";
import { statuses } from "./status";

export const spaceRelations = relations(spaces, ({ one, many }) => ({
	createdBy: one(user, {
		fields: [spaces.createdBy],
		references: [user.id],
		relationName: "spaceCreatedByUser",
	}),
	deletedBy: one(user, {
		fields: [spaces.deletedBy],
		references: [user.id],
		relationName: "spaceDeletedByUser",
	}),
	organization: one(organization, {
		fields: [spaces.organizationId],
		references: [organization.id],
	}),
	projects: many(projects),
}));

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	spaces: many(spaces, {
		relationName: "spaceCreatedByUser",
	}),
	deletedSpaces: many(spaces, {
		relationName: "spaceDeletedByUser",
	}),
	projects: many(projects, {
		relationName: "projectCreatedByUser",
	}),
	deletedProjects: many(projects, {
		relationName: "projectDeletedByUser",
	}),
	statuses: many(statuses, {
		relationName: "statusCreatedByUser",
	}),
	deletedStatuses: many(statuses, {
		relationName: "statusDeletedByUser",
	}),
	projectStatuses: many(projectStatuses, {
		relationName: "projectStatusCreatedByUser",
	}),
	deletedProjectStatuses: many(projectStatuses, {
		relationName: "projectStatusDeletedByUser",
	}),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
	members: many(member),
	invitations: many(invitation),
	spaces: many(spaces),
	projectStatuses: many(projectStatuses),
}));

export const memberRelations = relations(member, ({ one }) => ({
	organization: one(organization, {
		fields: [member.organizationId],
		references: [organization.id],
	}),
	user: one(user, {
		fields: [member.userId],
		references: [user.id],
	}),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
	organization: one(organization, {
		fields: [invitation.organizationId],
		references: [organization.id],
	}),
	inviter: one(user, {
		fields: [invitation.inviterId],
		references: [user.id],
	}),
}));

export const projectStatusRelations = relations(projectStatuses, ({ one }) => ({
	user: one(user, {
		fields: [projectStatuses.createdBy],
		references: [user.id],
	}),
	organization: one(organization, {
		fields: [projectStatuses.organizationId],
		references: [organization.id],
	}),
}));

export const projectRelations = relations(projects, ({ one, many }) => ({
	organization: one(organization, {
		fields: [projects.organizationId],
		references: [organization.id],
	}),
	space: one(spaces, {
		fields: [projects.spaceId],
		references: [spaces.id],
	}),
	deletedBy: one(user, {
		fields: [projects.deletedBy],
		references: [user.id],
	}),
	createdBy: one(user, {
		fields: [projects.createdBy],
		references: [user.id],
	}),
	projectStatus: one(projectStatuses, {
		fields: [projects.statusId],
		references: [projectStatuses.id],
	}),
	statuses: many(statuses),
}));

export const statusRelations = relations(statuses, ({ one }) => ({
	createdBy: one(user, {
		fields: [statuses.createdBy],
		references: [user.id],
	}),
	deletedBy: one(user, {
		fields: [statuses.deletedBy],
		references: [user.id],
	}),
	project: one(projects, {
		fields: [statuses.projectId],
		references: [projects.id],
	}),
}));
