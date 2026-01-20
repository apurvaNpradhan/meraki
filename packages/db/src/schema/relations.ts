import { relations } from "drizzle-orm";
import {
	account,
	invitation,
	member,
	organization,
	session,
	user,
} from "./auth";
import { projectLabelMappings, projectLabels, projects } from "./project";
import { projectStatuses } from "./project-status";
import { spaces } from "./space";
import { statuses } from "./status";
import { tasks } from "./task";

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	createdTasks: many(tasks, {
		relationName: "task_creator",
	}),
	deletedTasks: many(tasks, {
		relationName: "task_deleter",
	}),
	assignedTasks: many(tasks, {
		relationName: "task_assignee",
	}),
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
	projectLabels: many(projectLabels),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
	activeOrganization: one(organization, {
		fields: [session.activeOrganizationId],
		references: [organization.id],
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
	tasks: many(tasks),
	projectStatuses: many(projectStatuses),
	spaces: many(spaces),
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

export const taskRelations = relations(tasks, ({ many, one }) => ({
	parent: one(tasks, {
		fields: [tasks.parentTaskId],
		references: [tasks.id],
		relationName: "task_parent",
	}),
	subtasks: many(tasks, {
		relationName: "task_parent",
	}),
	assignee: one(user, {
		fields: [tasks.assigneeId],
		references: [user.id],
	}),
	createdBy: one(user, {
		fields: [tasks.createdBy],
		references: [user.id],
	}),
	deletedBy: one(user, {
		fields: [tasks.deletedBy],
		references: [user.id],
	}),
	organization: one(organization, {
		fields: [tasks.organizationId],
		references: [organization.id],
	}),
	project: one(projects, {
		fields: [tasks.projectId],
		references: [projects.id],
	}),
	status: one(statuses, {
		fields: [tasks.statusId],
		references: [statuses.id],
	}),
}));

export const projectStatusRelations = relations(projectStatuses, ({ one }) => ({
	createdByUser: one(user, {
		fields: [projectStatuses.createdBy],
		references: [user.id],
	}),
	organization: one(organization, {
		fields: [projectStatuses.organizationId],
		references: [organization.id],
	}),
	deletedByUser: one(user, {
		fields: [projectStatuses.deletedBy],
		references: [user.id],
	}),
}));

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
	projectLabels: many(projectLabels),
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
	tasks: many(tasks),
	labelMappings: many(projectLabelMappings),
}));

export const statusRelations = relations(statuses, ({ one, many }) => ({
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
	tasks: many(tasks),
}));

export const projectLabelRelations = relations(
	projectLabels,
	({ one, many }) => ({
		labelMappings: many(projectLabelMappings),
		space: one(spaces, {
			fields: [projectLabels.spaceId],
			references: [spaces.id],
		}),
		createdBy: one(user, {
			fields: [projectLabels.createdBy],
			references: [user.id],
		}),
		deletedBy: one(user, {
			fields: [projectLabels.deletedBy],
			references: [user.id],
		}),
	}),
);

export const projectLabelMappingsRelations = relations(
	projectLabelMappings,
	({ one }) => ({
		project: one(projects, {
			fields: [projectLabelMappings.projectId],
			references: [projects.id],
		}),
		label: one(projectLabels, {
			fields: [projectLabelMappings.labelId],
			references: [projectLabels.id],
		}),
	}),
);
