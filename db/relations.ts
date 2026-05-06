import { relations } from "drizzle-orm";
import { users, leads, messages, calls, activityLogs } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  assignedLeads: many(leads, { relationName: "assignedTo" }),
  activities: many(activityLogs),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  assignedTo: one(users, {
    fields: [leads.assignedToId],
    references: [users.id],
    relationName: "assignedTo",
  }),
  messages: many(messages),
  calls: many(calls),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  lead: one(leads, {
    fields: [messages.leadId],
    references: [leads.id],
  }),
}));

export const callsRelations = relations(calls, ({ one }) => ({
  lead: one(leads, {
    fields: [calls.leadId],
    references: [leads.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));
