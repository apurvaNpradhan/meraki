import { relations } from "drizzle-orm";
import {
	account,
	invitation,
	member,
	organization,
	session,
	user,
} from "./auth";
import { spaces } from "./space";
import { statuses, statusGroups } from "./status";

export const spaceRelations = relations(spaces, ({ one, many }) => ({
	creator: one(user, {
		fields: [spaces.createdBy],
		references: [user.id],
	}),
	organization: one(organization, {
		fields: [spaces.organizationId],
		references: [organization.id],
	}),
	statusGroups: many(statusGroups),
	statuses: many(statuses),
}));

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	spaces: many(spaces),
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

export const statusGroupsRelations = relations(
	statusGroups,
	({ one, many }) => ({
		space: one(spaces, {
			fields: [statusGroups.spaceId],
			references: [spaces.id],
		}),
		statuses: many(statuses),
	}),
);

export const statusesRelations = relations(statuses, ({ one }) => ({
	space: one(spaces, {
		fields: [statuses.spaceId],
		references: [spaces.id],
	}),
	group: one(statusGroups, {
		fields: [statuses.groupId],
		references: [statusGroups.id],
	}),
}));
