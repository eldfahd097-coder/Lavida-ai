import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  json,
} from "drizzle-orm/mysql-core";

// ─── Users (Auth) ───────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Leads ──────────────────────────────────────────────────────
export const leads = mysqlTable("leads", {
  id: serial("id").primaryKey(),
  source: mysqlEnum("source", ["whatsapp", "messenger", "phone", "email", "walk_in", "other"]).notNull(),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  language: mysqlEnum("language", ["ar", "en"]).default("ar").notNull(),
  interest: mysqlEnum("interest", [
    "booking",
    "chalet_info",
    "activities",
    "location",
    "pricing",
    "management",
    "general",
  ]).default("general").notNull(),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "completed", "lost"]).default("new").notNull(),
  notes: text("notes"),
  assignedToId: int("assignedToId"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ─── Messages (WhatsApp / Messenger) ──────────────────────────────
export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  leadId: int("leadId"),
  platform: mysqlEnum("platform", ["whatsapp", "messenger"]).notNull(),
  direction: mysqlEnum("direction", ["inbound", "outbound"]).notNull(),
  messageId: varchar("messageId", { length: 255 }),
  fromNumber: varchar("fromNumber", { length: 50 }),
  toNumber: varchar("toNumber", { length: 50 }),
  body: text("body").notNull(),
  mediaUrl: text("mediaUrl"),
  mediaType: varchar("mediaType", { length: 50 }),
  status: mysqlEnum("status", ["sent", "delivered", "read", "failed", "pending"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ─── Calls (Twilio) ─────────────────────────────────────────────
export const calls = mysqlTable("calls", {
  id: serial("id").primaryKey(),
  callSid: varchar("callSid", { length: 255 }).notNull().unique(),
  fromNumber: varchar("fromNumber", { length: 50 }),
  toNumber: varchar("toNumber", { length: 50 }),
  status: mysqlEnum("status", [
    "initiated",
    "ringing",
    "answered",
    "completed",
    "busy",
    "failed",
    "no_answer",
    "voicemail",
  ]).default("initiated").notNull(),
  duration: int("duration").default(0),
  recordingUrl: text("recordingUrl"),
  menuChoice: varchar("menuChoice", { length: 10 }),
  language: mysqlEnum("language", ["ar", "en"]).default("ar").notNull(),
  leadId: int("leadId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  endedAt: timestamp("endedAt"),
});

export type Call = typeof calls.$inferSelect;
export type InsertCall = typeof calls.$inferInsert;

// ─── Settings ─────────────────────────────────────────────────────
export const settings = mysqlTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  category: mysqlEnum("category", ["general", "whatsapp", "messenger", "twilio", "ai", "resort"]).default("general").notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;

// ─── Activities Log (Admin actions) ──────────────────────────────
export const activityLogs = mysqlTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: int("userId"),
  action: mysqlEnum("action", [
    "lead_created",
    "lead_updated",
    "lead_assigned",
    "message_sent",
    "call_answered",
    "call_missed",
    "settings_updated",
    "login",
    "logout",
  ]).notNull(),
  targetType: mysqlEnum("targetType", ["lead", "call", "message", "settings", "user"]).notNull(),
  targetId: int("targetId"),
  details: json("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;
