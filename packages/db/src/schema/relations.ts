import { relations } from "drizzle-orm";
import {
	account,
	invitation,
	member,
	organization,
	session,
	user,
} from "./auth";
import { projectStatuses } from "./project-statuses";
import { spaces } from "./space";

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
