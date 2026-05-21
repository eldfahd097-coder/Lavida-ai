var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// api/lib/vite.ts
var vite_exports = {};
__export(vite_exports, {
  serveStaticFiles: () => serveStaticFiles
});
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";
function serveStaticFiles(app5) {
  const distPath = path.resolve(import.meta.dirname, "../dist/public");
  app5.use("*", serveStatic({ root: "./dist/public" }));
  app5.notFound((c) => {
    const accept = c.req.header("accept") ?? "";
    if (!accept.includes("text/html")) {
      return c.json({ error: "Not Found" }, 404);
    }
    const indexPath = path.resolve(distPath, "index.html");
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(content);
  });
}
var init_vite = __esm({
  "api/lib/vite.ts"() {
  }
});

// api/boot.ts
import { Hono as Hono4 } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

// api/auth-router.ts
import * as cookie2 from "cookie";

// contracts/constants.ts
var Session = {
  cookieName: "lavida_dev_sid",
  maxAgeMs: 365 * 24 * 60 * 60 * 1e3
};
var ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions"
};

// api/lib/cookies.ts
function isLocalhost(headers) {
  const host = headers.get("host") || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}
function getSessionCookieOptions(headers) {
  const localhost = isLocalhost(headers);
  return {
    httpOnly: true,
    path: "/",
    sameSite: localhost ? "Lax" : "None",
    secure: !localhost
  };
}

// api/middleware.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var createRouter = t.router;
var publicQuery = t.procedure;
var requireAuth = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
function requireRole(role) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== role) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole
      });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  });
}
var authedQuery = t.procedure.use(requireAuth);
var adminQuery = authedQuery.use(requireRole("admin"));

// api/auth-router.ts
import { z } from "zod";
import { TRPCError as TRPCError2 } from "@trpc/server";

// api/local-auth.ts
import * as cookie from "cookie";
var DEV_ADMIN_EMAIL = "info@lavidaresort.ly";
var DEV_ADMIN_PASSWORD = "lavida123";
var DEV_ADMIN_SESSION_VALUE = "lavida_dev_admin";
var DEV_ADMIN_USER = {
  id: 1,
  unionId: "local-dev-admin",
  name: "La Vida Admin",
  email: DEV_ADMIN_EMAIL,
  avatar: null,
  role: "admin",
  createdAt: /* @__PURE__ */ new Date(0),
  updatedAt: /* @__PURE__ */ new Date(0),
  lastSignInAt: /* @__PURE__ */ new Date()
};
function isValidDevAdminLogin(email, password) {
  return email === DEV_ADMIN_EMAIL && password === DEV_ADMIN_PASSWORD;
}
function createDevAdminSessionValue() {
  return DEV_ADMIN_SESSION_VALUE;
}
function authenticateLocalSession(headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token || token !== DEV_ADMIN_SESSION_VALUE) {
    return void 0;
  }
  return DEV_ADMIN_USER;
}

// api/auth-router.ts
var authRouter = createRouter({
  login: publicQuery.input(z.object({ email: z.string().email(), password: z.string().min(1) })).mutation(async ({ input, ctx }) => {
    if (!isValidDevAdminLogin(input.email, input.password)) {
      throw new TRPCError2({
        code: "UNAUTHORIZED",
        message: "Invalid email or password"
      });
    }
    const opts = getSessionCookieOptions(ctx.req.headers);
    const token = createDevAdminSessionValue();
    ctx.resHeaders.append(
      "set-cookie",
      cookie2.serialize(Session.cookieName, token, {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase(),
        secure: opts.secure,
        maxAge: Math.floor(Session.maxAgeMs / 1e3)
      })
    );
    return { success: true };
  }),
  me: authedQuery.query((opts) => opts.ctx.user),
  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie2.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase(),
        secure: opts.secure,
        maxAge: 0
      })
    );
    return { success: true };
  })
});

// api/leads-router.ts
import { z as z2 } from "zod";
import { eq, desc, like, and, or, sql } from "drizzle-orm";

// api/queries/connection.ts
import { drizzle } from "drizzle-orm/mysql2";

// api/lib/env.ts
import "dotenv/config";
function required(name) {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}
function optional(name) {
  return process.env[name] ?? "";
}
var env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  // AI
  openaiApiKey: optional("OPENAI_API_KEY"),
  // Twilio
  twilioAccountSid: optional("TWILIO_ACCOUNT_SID"),
  twilioAuthToken: optional("TWILIO_AUTH_TOKEN"),
  twilioPhoneNumber: optional("TWILIO_PHONE_NUMBER"),
  // WhatsApp
  whatsappApiVersion: optional("WHATSAPP_API_VERSION") || "v18.0",
  whatsappPhoneNumberId: optional("WHATSAPP_PHONE_NUMBER_ID"),
  whatsappAccessToken: optional("WHATSAPP_ACCESS_TOKEN"),
  whatsappVerifyToken: optional("WHATSAPP_VERIFY_TOKEN"),
  whatsappBusinessAccountId: optional("WHATSAPP_BUSINESS_ACCOUNT_ID"),
  // Messenger
  messengerPageAccessToken: optional("PAGE_ACCESS_TOKEN") || optional("MESSENGER_PAGE_ACCESS_TOKEN"),
  messengerPageId: optional("MESSENGER_PAGE_ID"),
  messengerVerifyToken: optional("VERIFY_TOKEN") || optional("MESSENGER_VERIFY_TOKEN"),
  messengerAppSecret: optional("MESSENGER_APP_SECRET"),
  // ElevenLabs
  elevenlabsApiKey: optional("ELEVENLABS_API_KEY"),
  elevenlabsVoiceId: optional("ELEVENLABS_VOICE_ID"),
  // App
  webhookBaseUrl: optional("APP_WEBHOOK_BASE_URL"),
  ownerPhoneNumber: optional("OWNER_PHONE_NUMBER") || "+218912110392",
  // SMTP
  smtpHost: optional("SMTP_HOST"),
  smtpPort: optional("SMTP_PORT"),
  smtpUser: optional("SMTP_USER"),
  smtpPass: optional("SMTP_PASS")
};

// db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activityLogs: () => activityLogs,
  calls: () => calls,
  leads: () => leads,
  messages: () => messages,
  settings: () => settings,
  users: () => users
});
import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  json
} from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => /* @__PURE__ */ new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull()
});
var leads = mysqlTable("leads", {
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
    "general"
  ]).default("general").notNull(),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "completed", "lost"]).default("new").notNull(),
  notes: text("notes"),
  assignedToId: int("assignedToId"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => /* @__PURE__ */ new Date())
});
var messages = mysqlTable("messages", {
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
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var calls = mysqlTable("calls", {
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
    "voicemail"
  ]).default("initiated").notNull(),
  duration: int("duration").default(0),
  recordingUrl: text("recordingUrl"),
  menuChoice: varchar("menuChoice", { length: 10 }),
  language: mysqlEnum("language", ["ar", "en"]).default("ar").notNull(),
  leadId: int("leadId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  endedAt: timestamp("endedAt")
});
var settings = mysqlTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  category: mysqlEnum("category", ["general", "whatsapp", "messenger", "twilio", "ai", "resort"]).default("general").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => /* @__PURE__ */ new Date())
});
var activityLogs = mysqlTable("activity_logs", {
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
    "logout"
  ]).notNull(),
  targetType: mysqlEnum("targetType", ["lead", "call", "message", "settings", "user"]).notNull(),
  targetId: int("targetId"),
  details: json("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});

// db/relations.ts
var relations_exports = {};
__export(relations_exports, {
  activityLogsRelations: () => activityLogsRelations,
  callsRelations: () => callsRelations,
  leadsRelations: () => leadsRelations,
  messagesRelations: () => messagesRelations,
  usersRelations: () => usersRelations
});
import { relations } from "drizzle-orm";
var usersRelations = relations(users, ({ many }) => ({
  assignedLeads: many(leads, { relationName: "assignedTo" }),
  activities: many(activityLogs)
}));
var leadsRelations = relations(leads, ({ one, many }) => ({
  assignedTo: one(users, {
    fields: [leads.assignedToId],
    references: [users.id],
    relationName: "assignedTo"
  }),
  messages: many(messages),
  calls: many(calls)
}));
var messagesRelations = relations(messages, ({ one }) => ({
  lead: one(leads, {
    fields: [messages.leadId],
    references: [leads.id]
  })
}));
var callsRelations = relations(calls, ({ one }) => ({
  lead: one(leads, {
    fields: [calls.leadId],
    references: [leads.id]
  })
}));
var activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id]
  })
}));

// api/queries/connection.ts
var fullSchema = { ...schema_exports, ...relations_exports };
var instance;
function getDb() {
  if (!instance) {
    instance = drizzle(env.databaseUrl, {
      mode: "planetscale",
      schema: fullSchema
    });
  }
  return instance;
}

// api/leads-router.ts
var leadsRouter = createRouter({
  list: adminQuery.input(
    z2.object({
      status: z2.enum(["new", "contacted", "qualified", "completed", "lost"]).optional(),
      source: z2.enum(["whatsapp", "messenger", "phone", "email", "walk_in", "other"]).optional(),
      search: z2.string().optional(),
      assignedToId: z2.number().optional(),
      limit: z2.number().min(1).max(100).default(50),
      offset: z2.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const db = getDb();
    const p = input ?? { limit: 50, offset: 0 };
    const filters = [];
    if (p.status) filters.push(eq(leads.status, p.status));
    if (p.source) filters.push(eq(leads.source, p.source));
    if (p.assignedToId) filters.push(eq(leads.assignedToId, p.assignedToId));
    if (p.search) {
      const searchTerm = `%${p.search}%`;
      filters.push(
        or(
          like(leads.name, searchTerm),
          like(leads.phone, searchTerm),
          like(leads.email, searchTerm),
          like(leads.notes, searchTerm)
        )
      );
    }
    const whereClause = filters.length > 0 ? and(...filters) : void 0;
    const items = await db.query.leads.findMany({
      where: whereClause,
      orderBy: [desc(leads.createdAt)],
      limit: p.limit,
      offset: p.offset,
      with: {
        assignedTo: { columns: { id: true, name: true, email: true } }
      }
    });
    const countResult = await db.select({ count: sql`count(*)` }).from(leads).where(whereClause);
    return {
      items,
      total: countResult[0]?.count ?? 0,
      limit: p.limit,
      offset: p.offset
    };
  }),
  getById: adminQuery.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
    const db = getDb();
    const lead = await db.query.leads.findFirst({
      where: eq(leads.id, input.id),
      with: {
        assignedTo: { columns: { id: true, name: true, email: true, avatar: true } },
        messages: { orderBy: [desc(messages.createdAt)], limit: 50 },
        calls: { orderBy: [desc(calls.createdAt)], limit: 20 }
      }
    });
    if (!lead) throw new Error("Lead not found");
    return lead;
  }),
  create: publicQuery.input(
    z2.object({
      source: z2.enum(["whatsapp", "messenger", "phone", "email", "walk_in", "other"]),
      name: z2.string().optional(),
      phone: z2.string().optional(),
      email: z2.string().optional(),
      language: z2.enum(["ar", "en"]).default("ar"),
      interest: z2.enum(["booking", "chalet_info", "activities", "location", "pricing", "management", "general"]).default("general"),
      status: z2.enum(["new", "contacted", "qualified", "completed", "lost"]).default("new"),
      notes: z2.string().optional(),
      assignedToId: z2.number().optional(),
      metadata: z2.record(z2.string(), z2.any()).optional()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const result = await db.insert(leads).values(input);
    const insertId = Number(result[0].insertId);
    return { id: insertId, ...input };
  }),
  update: adminQuery.input(
    z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      phone: z2.string().optional(),
      email: z2.string().optional(),
      status: z2.enum(["new", "contacted", "qualified", "completed", "lost"]).optional(),
      interest: z2.enum(["booking", "chalet_info", "activities", "location", "pricing", "management", "general"]).optional(),
      notes: z2.string().optional(),
      assignedToId: z2.number().optional(),
      metadata: z2.record(z2.string(), z2.any()).optional()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const { id, ...updates } = input;
    await db.update(leads).set(updates).where(eq(leads.id, id));
    return { success: true, id };
  }),
  delete: adminQuery.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(leads).where(eq(leads.id, input.id));
    return { success: true };
  }),
  stats: adminQuery.query(async () => {
    const db = getDb();
    const allLeads = await db.select().from(leads);
    const total = allLeads.length;
    const byStatus = {
      new: allLeads.filter((l) => l.status === "new").length,
      contacted: allLeads.filter((l) => l.status === "contacted").length,
      qualified: allLeads.filter((l) => l.status === "qualified").length,
      completed: allLeads.filter((l) => l.status === "completed").length,
      lost: allLeads.filter((l) => l.status === "lost").length
    };
    const bySource = {
      whatsapp: allLeads.filter((l) => l.source === "whatsapp").length,
      messenger: allLeads.filter((l) => l.source === "messenger").length,
      phone: allLeads.filter((l) => l.source === "phone").length,
      email: allLeads.filter((l) => l.source === "email").length,
      walk_in: allLeads.filter((l) => l.source === "walk_in").length,
      other: allLeads.filter((l) => l.source === "other").length
    };
    return { total, byStatus, bySource };
  }),
  dashboardSummary: adminQuery.query(async () => {
    const db = getDb();
    const allLeads = await db.select().from(leads);
    const totalInquiries = allLeads.length;
    const whatsappInquiries = allLeads.filter((lead) => lead.source === "whatsapp").length;
    const messengerInquiries = allLeads.filter((lead) => lead.source === "messenger").length;
    const bookingRequests = allLeads.filter((lead) => lead.interest === "booking").length;
    const arabicInquiries = allLeads.filter((lead) => lead.language === "ar").length;
    const englishInquiries = allLeads.filter((lead) => lead.language === "en").length;
    return {
      totalInquiries,
      whatsappInquiries,
      messengerInquiries,
      bookingRequests,
      arabicInquiries,
      englishInquiries
    };
  })
});

// api/messages-router.ts
import { z as z3 } from "zod";
import { eq as eq2, desc as desc2, and as and2 } from "drizzle-orm";
var messagesRouter = createRouter({
  list: adminQuery.input(
    z3.object({
      leadId: z3.number().optional(),
      platform: z3.enum(["whatsapp", "messenger"]).optional(),
      limit: z3.number().min(1).max(100).default(50),
      offset: z3.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const db = getDb();
    const p = input ?? { limit: 50, offset: 0 };
    const filters = [];
    if (p.leadId) filters.push(eq2(messages.leadId, p.leadId));
    if (p.platform) filters.push(eq2(messages.platform, p.platform));
    const whereClause = filters.length > 0 ? and2(...filters) : void 0;
    const items = await db.query.messages.findMany({
      where: whereClause,
      orderBy: [desc2(messages.createdAt)],
      limit: p.limit,
      offset: p.offset
    });
    return { items, limit: p.limit, offset: p.offset };
  }),
  create: publicQuery.input(
    z3.object({
      leadId: z3.number().optional(),
      platform: z3.enum(["whatsapp", "messenger"]),
      direction: z3.enum(["inbound", "outbound"]),
      messageId: z3.string().optional(),
      fromNumber: z3.string().optional(),
      toNumber: z3.string().optional(),
      body: z3.string(),
      mediaUrl: z3.string().optional(),
      mediaType: z3.string().optional(),
      status: z3.enum(["sent", "delivered", "read", "failed", "pending"]).default("pending")
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const result = await db.insert(messages).values(input);
    const insertId = Number(result[0].insertId);
    return { id: insertId, ...input };
  }),
  updateStatus: adminQuery.input(
    z3.object({
      id: z3.number(),
      status: z3.enum(["sent", "delivered", "read", "failed", "pending"])
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(messages).set({ status: input.status }).where(eq2(messages.id, input.id));
    return { success: true };
  }),
  getConversation: adminQuery.input(z3.object({ leadId: z3.number() })).query(async ({ input }) => {
    const db = getDb();
    const items = await db.query.messages.findMany({
      where: eq2(messages.leadId, input.leadId),
      orderBy: [desc2(messages.createdAt)],
      limit: 100
    });
    return items;
  })
});

// api/calls-router.ts
import { z as z4 } from "zod";
import { eq as eq3, desc as desc3, and as and3 } from "drizzle-orm";
var callsRouter = createRouter({
  list: adminQuery.input(
    z4.object({
      status: z4.enum([
        "initiated",
        "ringing",
        "answered",
        "completed",
        "busy",
        "failed",
        "no_answer",
        "voicemail"
      ]).optional(),
      leadId: z4.number().optional(),
      limit: z4.number().min(1).max(100).default(50),
      offset: z4.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const db = getDb();
    const p = input ?? { limit: 50, offset: 0 };
    const filters = [];
    if (p.status) filters.push(eq3(calls.status, p.status));
    if (p.leadId) filters.push(eq3(calls.leadId, p.leadId));
    const whereClause = filters.length > 0 ? and3(...filters) : void 0;
    const items = await db.query.calls.findMany({
      where: whereClause,
      orderBy: [desc3(calls.createdAt)],
      limit: p.limit,
      offset: p.offset
    });
    return { items, limit: p.limit, offset: p.offset };
  }),
  create: publicQuery.input(
    z4.object({
      callSid: z4.string(),
      fromNumber: z4.string().optional(),
      toNumber: z4.string().optional(),
      status: z4.enum([
        "initiated",
        "ringing",
        "answered",
        "completed",
        "busy",
        "failed",
        "no_answer",
        "voicemail"
      ]).default("initiated"),
      duration: z4.number().default(0),
      recordingUrl: z4.string().optional(),
      menuChoice: z4.string().optional(),
      language: z4.enum(["ar", "en"]).default("ar"),
      leadId: z4.number().optional(),
      notes: z4.string().optional()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const result = await db.insert(calls).values(input);
    const insertId = Number(result[0].insertId);
    return { id: insertId, ...input };
  }),
  update: adminQuery.input(
    z4.object({
      id: z4.number(),
      status: z4.enum([
        "initiated",
        "ringing",
        "answered",
        "completed",
        "busy",
        "failed",
        "no_answer",
        "voicemail"
      ]).optional(),
      duration: z4.number().optional(),
      recordingUrl: z4.string().optional(),
      menuChoice: z4.string().optional(),
      notes: z4.string().optional(),
      endedAt: z4.date().optional()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const { id, ...updates } = input;
    await db.update(calls).set(updates).where(eq3(calls.id, id));
    return { success: true, id };
  }),
  stats: adminQuery.query(async () => {
    const db = getDb();
    const allCalls = await db.select().from(calls);
    const total = allCalls.length;
    const answered = allCalls.filter((c) => c.status === "answered" || c.status === "completed").length;
    const missed = allCalls.filter((c) => c.status === "no_answer" || c.status === "busy").length;
    const voicemail = allCalls.filter((c) => c.status === "voicemail").length;
    const totalDuration = allCalls.reduce((sum, c) => sum + (c.duration ?? 0), 0);
    return { total, answered, missed, voicemail, totalDuration };
  })
});

// api/settings-router.ts
import { z as z5 } from "zod";
import { eq as eq4 } from "drizzle-orm";
var settingsRouter = createRouter({
  // ─── Get All Settings ───────────────────────────────────────
  list: publicQuery.query(async () => {
    const db = getDb();
    const items = await db.select().from(settings);
    return items;
  }),
  // ─── Get Setting by Key ─────────────────────────────────────
  getByKey: publicQuery.input(z5.object({ key: z5.string() })).query(async ({ input }) => {
    const db = getDb();
    const item = await db.query.settings.findFirst({
      where: eq4(settings.key, input.key)
    });
    return item ?? null;
  }),
  // ─── Upsert Setting ─────────────────────────────────────────
  upsert: adminQuery.input(
    z5.object({
      key: z5.string(),
      value: z5.string(),
      category: z5.enum(["general", "whatsapp", "messenger", "twilio", "ai", "resort"]).default("general")
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const existing = await db.query.settings.findFirst({
      where: eq4(settings.key, input.key)
    });
    if (existing) {
      await db.update(settings).set({ value: input.value, category: input.category }).where(eq4(settings.key, input.key));
      return { success: true, key: input.key, updated: true };
    }
    await db.insert(settings).values(input);
    return { success: true, key: input.key, updated: false };
  }),
  // ─── Bulk Upsert ────────────────────────────────────────────
  bulkUpsert: adminQuery.input(
    z5.array(
      z5.object({
        key: z5.string(),
        value: z5.string(),
        category: z5.enum(["general", "whatsapp", "messenger", "twilio", "ai", "resort"]).default("general")
      })
    )
  ).mutation(async ({ input }) => {
    const db = getDb();
    for (const item of input) {
      const existing = await db.query.settings.findFirst({
        where: eq4(settings.key, item.key)
      });
      if (existing) {
        await db.update(settings).set({ value: item.value, category: item.category }).where(eq4(settings.key, item.key));
      } else {
        await db.insert(settings).values(item);
      }
    }
    return { success: true, count: input.length };
  }),
  // ─── Delete Setting ──────────────────────────────────────────
  delete: adminQuery.input(z5.object({ key: z5.string() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(settings).where(eq4(settings.key, input.key));
    return { success: true };
  })
});

// api/logs-router.ts
import { z as z6 } from "zod";
import { eq as eq5, desc as desc4, and as and4 } from "drizzle-orm";
var logsRouter = createRouter({
  list: adminQuery.input(
    z6.object({
      userId: z6.number().optional(),
      action: z6.enum([
        "lead_created",
        "lead_updated",
        "lead_assigned",
        "message_sent",
        "call_answered",
        "call_missed",
        "settings_updated",
        "login",
        "logout"
      ]).optional(),
      targetType: z6.enum(["lead", "call", "message", "settings", "user"]).optional(),
      limit: z6.number().min(1).max(100).default(50),
      offset: z6.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const db = getDb();
    const p = input ?? { limit: 50, offset: 0 };
    const filters = [];
    if (p.userId) filters.push(eq5(activityLogs.userId, p.userId));
    if (p.action) filters.push(eq5(activityLogs.action, p.action));
    if (p.targetType) filters.push(eq5(activityLogs.targetType, p.targetType));
    const whereClause = filters.length > 0 ? and4(...filters) : void 0;
    const items = await db.query.activityLogs.findMany({
      where: whereClause,
      orderBy: [desc4(activityLogs.createdAt)],
      limit: p.limit,
      offset: p.offset,
      with: {
        user: { columns: { id: true, name: true, email: true } }
      }
    });
    return { items, limit: p.limit, offset: p.offset };
  }),
  create: adminQuery.input(
    z6.object({
      userId: z6.number().optional(),
      action: z6.enum([
        "lead_created",
        "lead_updated",
        "lead_assigned",
        "message_sent",
        "call_answered",
        "call_missed",
        "settings_updated",
        "login",
        "logout"
      ]),
      targetType: z6.enum(["lead", "call", "message", "settings", "user"]),
      targetId: z6.number().optional(),
      details: z6.record(z6.string(), z6.any()).optional()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const result = await db.insert(activityLogs).values(input);
    const insertId = Number(result[0].insertId);
    return { id: insertId, ...input };
  })
});

// api/chat-router.ts
import { z as z7 } from "zod";

// contracts/templates.ts
var MenuOptions = {
  whatsapp: {
    ar: [
      "1 - \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0639\u0646 \u0627\u0644\u0645\u0646\u062A\u062C\u0639",
      "2 - \u0635\u0648\u0631 \u0627\u0644\u0634\u0627\u0644\u064A\u0647\u0627\u062A \u0648\u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644",
      "3 - \u0622\u062E\u0631 \u0627\u0644\u062A\u062D\u062F\u064A\u062B\u0627\u062A \u0648\u0627\u0644\u0623\u0633\u0639\u0627\u0631",
      "4 - \u0627\u0644\u0623\u0646\u0634\u0637\u0629 \u0648\u0627\u0644\u0645\u0631\u0627\u0641\u0642",
      "5 - \u0627\u0644\u062A\u062D\u062F\u062B \u0645\u0639 \u0627\u0644\u0625\u062F\u0627\u0631\u0629"
    ],
    en: [
      "1 - Resort Information",
      "2 - Chalet Images & Details",
      "3 - Latest Updates & Pricing",
      "4 - Activities & Facilities",
      "5 - Speak to Management"
    ]
  },
  messenger: {
    ar: [
      "1 - \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0639\u0646 \u0627\u0644\u0645\u0646\u062A\u062C\u0639",
      "2 - \u0635\u0648\u0631 \u0627\u0644\u0634\u0627\u0644\u064A\u0647\u0627\u062A \u0648\u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644",
      "3 - \u0622\u062E\u0631 \u0627\u0644\u062A\u062D\u062F\u064A\u062B\u0627\u062A \u0648\u0627\u0644\u0623\u0633\u0639\u0627\u0631",
      "4 - \u0627\u0644\u0623\u0646\u0634\u0637\u0629 \u0648\u0627\u0644\u0645\u0631\u0627\u0641\u0642",
      "5 - \u0627\u0644\u062A\u062D\u062F\u062B \u0645\u0639 \u0627\u0644\u0625\u062F\u0627\u0631\u0629"
    ],
    en: [
      "1 - Resort Information",
      "2 - Chalet Images & Details",
      "3 - Latest Updates & Pricing",
      "4 - Activities & Facilities",
      "5 - Speak to Management"
    ]
  },
  phone: {
    ar: [
      "\u0644\u0644\u062D\u062C\u0632 \u0648\u0627\u0644\u0623\u0633\u0639\u0627\u0631\u060C \u0627\u0636\u063A\u0637 1",
      "\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0634\u0627\u0644\u064A\u0647\u0627\u062A\u060C \u0627\u0636\u063A\u0637 2",
      "\u0644\u0644\u0623\u0646\u0634\u0637\u0629 \u0648\u0627\u0644\u0645\u0631\u0627\u0641\u0642\u060C \u0627\u0636\u063A\u0637 3",
      "\u0644\u0644\u0645\u0648\u0642\u0639 \u0648\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D\u060C \u0627\u0636\u063A\u0637 4",
      "\u0644\u0644\u062A\u062D\u062F\u062B \u0645\u0639 \u0627\u0644\u0625\u062F\u0627\u0631\u0629\u060C \u0627\u0636\u063A\u0637 5"
    ],
    en: [
      "For booking and prices, press 1",
      "For chalet information, press 2",
      "For resort activities, press 3",
      "For location and opening updates, press 4",
      "To speak with management, press 5"
    ]
  }
};
function getGreeting(_platform, lang) {
  if (lang === "ar") {
    return `\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643\u0645 \u0641\u064A La Vida Resort & Beach Club \u{1F3D6}\uFE0F
\u0646\u0634\u0643\u0631\u0643\u0645 \u0639\u0644\u0649 \u062A\u0648\u0627\u0635\u0644\u0643\u0645 \u0645\u0639\u0646\u0627

\u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D 1 \u064A\u0648\u0646\u064A\u0648 2026 \u2014 \u0623\u0633\u0639\u0627\u0631 \u0635\u064A\u0641 2026 \u0645\u062A\u0648\u0641\u0631\u0629 (\u0627\u0636\u063A\u0637 3)

\u064A\u0631\u062C\u0649 \u0625\u0631\u0633\u0627\u0644 \u0631\u0642\u0645 \u0627\u0644\u062E\u064A\u0627\u0631:`;
  }
  return `Welcome to La Vida Resort & Beach Club \u{1F3D6}\uFE0F
Thank you for reaching out to us

Opening June 1, 2026 \u2014 Summer 2026 rates available (press 3)

Please send the option number:`;
}
function getMenu(platform, lang) {
  const options = MenuOptions[platform][lang];
  return options.join("\n");
}
var Responses = {
  resort_info: {
    ar: `\u{1F3D6}\uFE0F La Vida Resort & Beach Club

\u0645\u0648\u0642\u0639\u0646\u0627: \u0632\u0648\u0627\u0631\u0629\u060C \u0644\u064A\u0628\u064A\u0627 \u2014 \u0639\u0644\u0649 \u0627\u0644\u0628\u062D\u0631 \u0645\u0628\u0627\u0634\u0631\u0629

\u0627\u0644\u0648\u062D\u062F\u0627\u062A:
\u2022 10 \u0641\u064A\u0644\u0627\u062A \u0641\u0627\u062E\u0631\u0629 (\u0641\u064A\u0644\u0627 VIP \u0628\u0645\u0633\u0628\u062D \u062E\u0627\u0635 + \u0641\u064A\u0644\u0627\u062A \u0631\u0626\u0627\u0633\u064A\u0629)
\u2022 20 \u0634\u0627\u0644\u064A\u0647 \u0639\u0627\u0626\u0644\u064A
\u2022 12 \u0634\u0642\u0629 \u0641\u0646\u062F\u0642\u064A\u0629

\u0627\u0644\u0645\u0631\u0627\u0641\u0642:
\u2022 \u0645\u0633\u0628\u062D \u0645\u0631\u0643\u0632\u064A \u0643\u0628\u064A\u0631
\u2022 \u0634\u0627\u0637\u0626 \u062E\u0627\u0635
\u2022 \u0646\u0627\u062F\u064A \u0631\u064A\u0627\u0636\u0627\u062A \u0645\u0627\u0626\u064A\u0629
\u2022 \u0645\u0644\u0639\u0628 \u0643\u0631\u0629 \u0642\u062F\u0645 \u0648\u0634\u0627\u0637\u0626\u064A\u0629
\u2022 \u0645\u0646\u0637\u0642\u0629 \u0623\u0644\u0639\u0627\u0628 \u0623\u0637\u0641\u0627\u0644
\u2022 \u0645\u0642\u0647\u0649 La Vida Beach Cafe
\u2022 \u0648\u0627\u064A \u0641\u0627\u064A \u0639\u0627\u0644\u064A \u0627\u0644\u0633\u0631\u0639\u0629
\u2022 \u0627\u0633\u062A\u0642\u0628\u0627\u0644 24/7

\u0646\u062D\u0646 \u0648\u062C\u0647\u062A\u0643\u0645 \u0627\u0644\u0645\u062B\u0627\u0644\u064A\u0629 \u0644\u0644\u0627\u0633\u062A\u062C\u0645\u0627\u0645 \u0648\u0627\u0644\u0631\u0641\u0627\u0647\u064A\u0629 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u062D\u0644 \u0627\u0644\u0644\u064A\u0628\u064A. \u2728`,
    en: `\u{1F3D6}\uFE0F La Vida Resort & Beach Club

Location: Zuwarah, Libya \u2014 directly on the beach

Accommodations:
\u2022 10 Luxury Villas (VIP villa with private pool + Presidential villas)
\u2022 20 Family Chalets
\u2022 12 Hotel Apartments

Facilities:
\u2022 Large Central Swimming Pool
\u2022 Private Beach Access
\u2022 Water Sports Club
\u2022 Football & Beach Volleyball Courts
\u2022 Kids Playground Area
\u2022 La Vida Beach Cafe
\u2022 High-Speed Wi-Fi
\u2022 24/7 Reception

Your perfect destination for relaxation and luxury on the Libyan coast. \u2728`
  },
  chalet_info: {
    ar: `\u{1F3E1} \u0627\u0644\u0634\u0627\u0644\u064A\u0647\u0627\u062A \u0641\u064A La Vida Resort

\u0644\u062F\u064A\u0646\u0627 20 \u0634\u0627\u0644\u064A\u0647 \u0639\u0627\u0626\u0644\u064A \u0628\u063A\u0631\u0641\u062A\u064A\u0646:
\u2022 \u062D\u062F\u064A\u0642\u0629 \u0623\u0645\u0627\u0645\u064A\u0629 \u0628\u0625\u0637\u0644\u0627\u0644\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u0628\u062D
\u2022 \u062D\u062F\u064A\u0642\u0629 \u062E\u0644\u0641\u064A\u0629 \u0644\u0644\u062E\u0635\u0648\u0635\u064A\u0629
\u2022 \u0645\u062B\u0627\u0644\u064A\u0629 \u0644\u0644\u0639\u0627\u0626\u0644\u0627\u062A

\u0627\u0644\u0641\u064A\u0644\u0627\u062A:
\u2022 6 \u0641\u064A\u0644\u0627\u062A VIP \u0628\u063A\u0631\u0641\u062A\u064A\u0646 + \u0645\u0633\u0628\u062D \u062E\u0627\u0635
\u2022 4 \u0641\u064A\u0644\u0627\u062A \u0631\u0626\u0627\u0633\u064A\u0629 \u0641\u0627\u062E\u0631\u0629

\u0627\u0644\u0634\u0642\u0642:
\u2022 12 \u0634\u0642\u0629 \u0628\u063A\u0631\u0641\u062A\u064A\u0646\u060C \u0645\u062C\u0647\u0632\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644

\u{1F4F8} \u0633\u064A\u062A\u0645 \u0645\u0634\u0627\u0631\u0643\u0629 \u0635\u0648\u0631 \u0627\u0644\u0648\u062D\u062F\u0627\u062A \u0642\u0631\u064A\u0628\u0627\u064B. \u062A\u0627\u0628\u0639\u0648\u0646\u0627!`,
    en: `\u{1F3E1} Chalets at La Vida Resort

We have 20 family-friendly two-bedroom chalets:
\u2022 Front garden with pool view
\u2022 Back garden for privacy
\u2022 Perfect for families

Villas:
\u2022 6 VIP two-bedroom villas with private pool
\u2022 4 Presidential luxury villas

Apartments:
\u2022 12 fully-equipped two-bedroom apartments

\u{1F4F8} Unit photos will be shared soon. Stay tuned!`
  },
  activities: {
    ar: `\u{1F3AF} \u0627\u0644\u0623\u0646\u0634\u0637\u0629 \u0648\u0627\u0644\u0645\u0631\u0627\u0641\u0642

\u2022 \u{1F3CA} \u0645\u0633\u0628\u062D \u0645\u0631\u0643\u0632\u064A \u0643\u0628\u064A\u0631
\u2022 \u{1F3D6}\uFE0F \u0634\u0627\u0637\u0626 \u062E\u0627\u0635
\u2022 \u{1F6A3} \u0646\u0627\u062F\u064A \u0631\u064A\u0627\u0636\u0627\u062A \u0645\u0627\u0626\u064A\u0629
\u2022 \u26BD \u0645\u0644\u0639\u0628 \u0643\u0631\u0629 \u0642\u062F\u0645
\u2022 \u{1F3D0} \u0645\u0644\u0639\u0628 \u0643\u0631\u0629 \u0637\u0627\u0626\u0631\u0629 \u0634\u0627\u0637\u0626\u064A\u0629
\u2022 \u{1F3A0} \u0645\u0646\u0637\u0642\u0629 \u0623\u0644\u0639\u0627\u0628 \u0623\u0637\u0641\u0627\u0644
\u2022 \u2615 La Vida Beach Cafe
\u2022 \u{1F4F6} \u0648\u0627\u064A \u0641\u0627\u064A \u0639\u0627\u0644\u064A \u0627\u0644\u0633\u0631\u0639\u0629
\u2022 \u{1F6CE}\uFE0F \u0627\u0633\u062A\u0642\u0628\u0627\u0644 \u0648\u062E\u062F\u0645\u0629 \u0636\u064A\u0627\u0641\u0629 24/7

\u0639\u0627\u0626\u0644\u062A\u0643\u0645 \u0633\u062A\u0633\u062A\u0645\u062A\u0639 \u0628\u0643\u0644 \u0644\u062D\u0638\u0629 \u0647\u0646\u0627! \u{1F30A}`,
    en: `\u{1F3AF} Activities & Facilities

\u2022 \u{1F3CA} Large Central Swimming Pool
\u2022 \u{1F3D6}\uFE0F Private Beach Access
\u2022 \u{1F6A3} Water Sports Club
\u2022 \u26BD Football Court
\u2022 \u{1F3D0} Beach Volleyball Court
\u2022 \u{1F3A0} Kids Playground Area
\u2022 \u2615 La Vida Beach Cafe
\u2022 \u{1F4F6} High-Speed Wi-Fi
\u2022 \u{1F6CE}\uFE0F 24/7 Reception & Guest Support

Your family will enjoy every moment here! \u{1F30A}`
  },
  updates: {
    ar: `\u{1F4E2} \u0623\u0633\u0639\u0627\u0631 \u0635\u064A\u0641 2026

\u2022 \u0634\u0627\u0644\u064A\u0647 VIP \u0631\u0626\u0627\u0633\u064A: 4000 \u062F.\u0644/\u0644\u064A\u0644\u0629
\u2022 \u0634\u0627\u0644\u064A\u0647 VIP \u0625\u0637\u0644\u0627\u0644\u0629 \u0628\u062D\u0631: 3000 \u062F.\u0644/\u0644\u064A\u0644\u0629
\u2022 \u0634\u0627\u0644\u064A\u0647 \u0625\u0637\u0644\u0627\u0644\u0629 \u0645\u0633\u0628\u062D \u0648\u0623\u0646\u0634\u0637\u0629: 2000 \u062F.\u0644/\u0644\u064A\u0644\u0629
\u2022 \u0634\u0627\u0644\u064A\u0647 \u0625\u0637\u0644\u0627\u0644\u0629 \u0628\u062D\u0631 \u062C\u0627\u0646\u0628\u064A: 1500 \u062F.\u0644/\u0644\u064A\u0644\u0629
\u2022 \u0627\u0633\u062A\u0648\u062F\u064A\u0648 \u0625\u0637\u0644\u0627\u0644\u0629 \u062D\u062F\u064A\u0642\u0629: 1000 \u062F.\u0644/\u0644\u064A\u0644\u0629

\u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D: 1 \u064A\u0648\u0646\u064A\u0648 2026
\u0639\u0631\u0648\u0636: \u0644\u064A\u0644\u0629 \u0631\u0627\u0628\u0639\u0629 \u0645\u062C\u0627\u0646\u064A\u0629 \u0639\u0646\u062F \u062D\u062C\u0632 3 \u0644\u064A\u0627\u0644\u064A

\u062A\u0627\u0628\u0639\u0648\u0646\u0627 \u0639\u0644\u0649 \u0641\u064A\u0633\u0628\u0648\u0643 \u0648\u0625\u0646\u0633\u062A\u063A\u0631\u0627\u0645!
\u{1F4F1} +218 91 211 0392
\u{1F4E7} info@lavida.ly

\u0634\u0643\u0631\u0627\u064B \u0644\u0627\u0647\u062A\u0645\u0627\u0645\u0643\u0645 \u0628\u0640 La Vida Resort & Beach Club \u{1F499}`,
    en: `\u{1F4E2} Summer 2026 Rates

\u2022 Presidential VIP Chalet: 4000 LYD/night
\u2022 VIP Sea View Chalet: 3000 LYD/night
\u2022 Pool & Activities View: 2000 LYD/night
\u2022 Side Sea View Chalet: 1500 LYD/night
\u2022 Garden View Studio: 1000 LYD/night

Opening: June 1, 2026
Offers: 4th night free when booking 3 nights

Follow us on Facebook and Instagram!
\u{1F4F1} +218 91 211 0392
\u{1F4E7} info@lavida.ly

Thank you for your interest in La Vida Resort & Beach Club \u{1F499}`
  },
  management: {
    ar: `\u{1F4DE} \u0633\u064A\u062A\u0645 \u062A\u0648\u0635\u064A\u0644\u0643\u0645 \u0645\u0639 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0642\u0631\u064A\u0628\u0627\u064B...

\u0641\u064A \u063A\u0636\u0648\u0646 \u0630\u0644\u0643\u060C \u064A\u0645\u0643\u0646\u0643\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0628\u0627\u0634\u0631\u0629:
\u{1F4F1} +218 91 211 0392
\u{1F4E7} info@lavida.ly

\u0623\u0648 \u0623\u0631\u0633\u0644\u0648\u0627 "\u0648\u0627\u062A\u0633\u0627\u0628" \u0648\u0633\u0646\u0631\u062F \u0639\u0644\u064A\u0643\u0645 \u062E\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629.`,
    en: `\u{1F4DE} Connecting you with management shortly...

In the meantime, you can reach us directly:
\u{1F4F1} +218 91 211 0392
\u{1F4E7} info@lavida.ly

Or send "WhatsApp" and we will reply within 24 hours.`
  },
  fallback: {
    ar: `\u0644\u0645 \u0623\u0641\u0647\u0645 \u0637\u0644\u0628\u0643\u0645. \u064A\u0631\u062C\u0649 \u0625\u0631\u0633\u0627\u0644 \u0631\u0642\u0645 \u0627\u0644\u062E\u064A\u0627\u0631:
1 - \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0639\u0646 \u0627\u0644\u0645\u0646\u062A\u062C\u0639
2 - \u0635\u0648\u0631 \u0627\u0644\u0634\u0627\u0644\u064A\u0647\u0627\u062A
3 - \u0622\u062E\u0631 \u0627\u0644\u062A\u062D\u062F\u064A\u062B\u0627\u062A
4 - \u0627\u0644\u0623\u0646\u0634\u0637\u0629
5 - \u0627\u0644\u062A\u062D\u062F\u062B \u0645\u0639 \u0627\u0644\u0625\u062F\u0627\u0631\u0629`,
    en: `I didn't understand your request. Please send the option number:
1 - Resort Information
2 - Chalet Images & Details
3 - Latest Updates & Pricing
4 - Activities & Facilities
5 - Speak to Management`
  },
  goodbye: {
    ar: `\u0634\u0643\u0631\u0627\u064B \u0644\u062A\u0648\u0627\u0635\u0644\u0643\u0645 \u0645\u0639 La Vida Resort & Beach Club \u{1F334}
\u0646\u062A\u0637\u0644\u0639 \u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644\u0643\u0645 \u0642\u0631\u064A\u0628\u0627\u064B!

\u0644\u0623\u064A \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u060C \u0646\u062D\u0646 \u0647\u0646\u0627 \u062F\u0627\u0626\u0645\u0627\u064B. \u{1F499}`,
    en: `Thank you for contacting La Vida Resort & Beach Club \u{1F334}
We look forward to welcoming you soon!

For any inquiry, we are always here. \u{1F499}`
  }
};
var PhonePrompts = {
  welcome_ar: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643\u0645 \u0641\u064A La Vida Resort & Beach Club.",
  welcome_en: "Welcome to La Vida Resort & Beach Club.",
  menu_ar: "\u0644\u0644\u062D\u062C\u0632 \u0648\u0627\u0644\u0623\u0633\u0639\u0627\u0631\u060C \u0627\u0636\u063A\u0637 1. \u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0634\u0627\u0644\u064A\u0647\u0627\u062A\u060C \u0627\u0636\u063A\u0637 2. \u0644\u0644\u0623\u0646\u0634\u0637\u0629 \u0648\u0627\u0644\u0645\u0631\u0627\u0641\u0642\u060C \u0627\u0636\u063A\u0637 3. \u0644\u0644\u0645\u0648\u0642\u0639 \u0648\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D\u060C \u0627\u0636\u063A\u0637 4. \u0644\u0644\u062A\u062D\u062F\u062B \u0645\u0639 \u0627\u0644\u0625\u062F\u0627\u0631\u0629\u060C \u0627\u0636\u063A\u0637 5.",
  menu_en: "For booking and prices, press 1. For chalet information, press 2. For resort activities, press 3. For location and opening updates, press 4. To speak with management, press 5.",
  option_1_ar: "\u0623\u0633\u0639\u0627\u0631 \u0635\u064A\u0641 2026 \u0645\u0646 1000 \u0625\u0644\u0649 4000 \u062F\u064A\u0646\u0627\u0631 \u0644\u0644\u064A\u0644\u0629. \u0644\u0644\u062D\u062C\u0632 \u062A\u0648\u0627\u0635\u0644\u0648\u0627 \u0639\u0628\u0631 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628 \u0623\u0648 \u0627\u0644\u0645\u0627\u0633\u0646\u062C\u0631. \u0627\u0644\u0641\u0631\u064A\u0642 \u064A\u0623\u0643\u062F \u0627\u0644\u062A\u0648\u0641\u0631.",
  option_1_en: "Summer 2026 rates from 1000 to 4000 dinars per night. For booking contact us on WhatsApp or Messenger. Our team confirms availability.",
  option_2_ar: "\u0644\u062F\u064A\u0646\u0627 20 \u0634\u0627\u0644\u064A\u0647 \u0639\u0627\u0626\u0644\u064A \u0648 10 \u0641\u064A\u0644\u0627\u062A \u0641\u0627\u062E\u0631\u0629 \u0648 12 \u0634\u0642\u0629. \u0633\u064A\u062A\u0645 \u0645\u0634\u0627\u0631\u0643\u0629 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u0642\u0631\u064A\u0628\u0627\u064B.",
  option_2_en: "We have 20 family chalets, 10 luxury villas, and 12 apartments. Full details will be shared soon.",
  option_3_ar: "\u0645\u0631\u0627\u0641\u0642\u0646\u0627 \u062A\u0634\u0645\u0644 \u0645\u0633\u0628\u062D \u0645\u0631\u0643\u0632\u064A\u060C \u0634\u0627\u0637\u0626 \u062E\u0627\u0635\u060C \u0631\u064A\u0627\u0636\u0627\u062A \u0645\u0627\u0626\u064A\u0629\u060C \u0645\u0644\u0627\u0639\u0628\u060C \u0645\u0646\u0637\u0642\u0629 \u0623\u0637\u0641\u0627\u0644\u060C \u0648\u0645\u0642\u0647\u0649.",
  option_3_en: "Our facilities include a central pool, private beach, water sports, courts, kids area, and a beach cafe.",
  option_4_ar: "\u0646\u062D\u0646 \u0641\u064A \u0632\u0648\u0627\u0631\u0629\u060C \u0644\u064A\u0628\u064A\u0627. \u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D \u0627\u0644\u0631\u0633\u0645\u064A 1 \u064A\u0648\u0646\u064A\u0648 2026. \u0627\u0644\u0645\u0648\u0642\u0639 lavidaresort.ly",
  option_4_en: "We are located in Zuwarah, Libya. Official opening June 1, 2026. Website lavidaresort.ly",
  option_5_ar: "\u0633\u064A\u062A\u0645 \u062A\u0648\u0635\u064A\u0644\u0643\u0645 \u0645\u0639 \u0627\u0644\u0625\u062F\u0627\u0631\u0629. \u0625\u0630\u0627 \u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0631\u062F\u060C \u064A\u0631\u062C\u0649 \u062A\u0631\u0643 \u0627\u0633\u0645\u0643\u0645 \u0648\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0628\u0639\u062F \u0627\u0644\u0646\u063A\u0645\u0629.",
  option_5_en: "Connecting you to management. If no one answers, please leave your name and phone number after the tone.",
  voicemail_ar: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0631\u062F. \u064A\u0631\u062C\u0649 \u062A\u0631\u0643 \u0627\u0633\u0645\u0643\u0645 \u0648\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0648\u0633\u0646\u0642\u0648\u0645 \u0628\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0643\u0645 \u0641\u064A \u0623\u0642\u0631\u0628 \u0648\u0642\u062A. \u0634\u0643\u0631\u0627\u064B.",
  voicemail_en: "No answer. Please leave your name and phone number and we will contact you as soon as possible. Thank you.",
  goodbye_ar: "\u0634\u0643\u0631\u0627\u064B \u0644\u0627\u062A\u0635\u0627\u0644\u0643\u0645 \u0628\u0640 La Vida Resort & Beach Club. \u0646\u062A\u0637\u0644\u0639 \u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644\u0643\u0645.",
  goodbye_en: "Thank you for calling La Vida Resort & Beach Club. We look forward to welcoming you.",
  no_input_ar: "\u0644\u0645 \u0646\u062A\u0644\u0642\u064E \u0631\u062F\u0627\u064B. \u0633\u064A\u062A\u0645 \u0625\u0646\u0647\u0627\u0621 \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0629. \u0634\u0643\u0631\u0627\u064B \u0644\u0627\u062A\u0635\u0627\u0644\u0643\u0645.",
  no_input_en: "No response received. The call will now end. Thank you for calling.",
  fallback_ar: "\u0644\u0645 \u0646\u0641\u0647\u0645 \u0627\u062E\u062A\u064A\u0627\u0631\u0643\u0645. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649 \u0623\u0648 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0639\u0628\u0631 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628. \u0634\u0643\u0631\u0627\u064B.",
  fallback_en: "We did not understand your selection. Please call again or reach us via WhatsApp. Thank you."
};
function detectLanguage(text2) {
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text2) ? "ar" : "en";
}
function getResponseByChoice(choice, lang) {
  const map = {
    "1": "resort_info",
    "2": "chalet_info",
    "3": "updates",
    "4": "activities",
    "5": "management"
  };
  const key = map[choice] ?? "fallback";
  return Responses[key][lang];
}

// api/chat-router.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import OpenAI from "openai";

// api/resort-knowledge.ts
var ACCOMMODATIONS = [
  {
    id: "presidential",
    nameEn: "Presidential VIP Chalet",
    nameAr: "\u0634\u0627\u0644\u064A\u0647 VIP \u0627\u0644\u0631\u0626\u0627\u0633\u064A",
    priceLyd: 4e3,
    detailsEn: [
      "Fits two families",
      "Private pool",
      "Large outdoor seating",
      "Spacious living area",
      "High privacy",
      "Partial sea view",
      "Nearby parking"
    ],
    detailsAr: [
      "\u0645\u0646\u0627\u0633\u0628 \u0644\u0639\u0627\u0626\u0644\u062A\u064A\u0646",
      "\u0645\u0633\u0628\u062D \u062E\u0627\u0635",
      "\u062C\u0644\u0633\u0629 \u062E\u0627\u0631\u062C\u064A\u0629 \u0648\u0627\u0633\u0639\u0629",
      "\u0635\u0627\u0644\u0629 \u0645\u0639\u064A\u0634\u0629 \u0648\u0627\u0633\u0639\u0629",
      "\u062E\u0635\u0648\u0635\u064A\u0629 \u0639\u0627\u0644\u064A\u0629",
      "\u0625\u0637\u0644\u0627\u0644\u0629 \u0628\u062D\u0631\u064A\u0629 \u062C\u0632\u0626\u064A\u0629",
      "\u0645\u0648\u0642\u0641 \u0642\u0631\u064A\u0628"
    ],
    keywords: ["presidential", "\u0631\u0626\u0627\u0633\u064A", "\u0631\u0626\u0627\u0633\u064A\u0629", "vip \u0631\u0626\u0627\u0633\u064A", "4000"]
  },
  {
    id: "vip_sea",
    nameEn: "VIP Sea View Chalet",
    nameAr: "\u0634\u0627\u0644\u064A\u0647 VIP \u0625\u0637\u0644\u0627\u0644\u0629 \u0628\u062D\u0631\u064A\u0629",
    priceLyd: 3e3,
    detailsEn: [
      "Direct sea view",
      "Private pool",
      "Outdoor sea-facing seating",
      "High privacy",
      "Suitable for families and couples"
    ],
    detailsAr: [
      "\u0625\u0637\u0644\u0627\u0644\u0629 \u0628\u062D\u0631\u064A\u0629 \u0645\u0628\u0627\u0634\u0631\u0629",
      "\u0645\u0633\u0628\u062D \u062E\u0627\u0635",
      "\u062C\u0644\u0633\u0629 \u062E\u0627\u0631\u062C\u064A\u0629 \u0628\u0625\u0637\u0644\u0627\u0644\u0629 \u0628\u062D\u0631",
      "\u062E\u0635\u0648\u0635\u064A\u0629 \u0639\u0627\u0644\u064A\u0629",
      "\u0645\u0646\u0627\u0633\u0628 \u0644\u0644\u0639\u0627\u0626\u0644\u0627\u062A \u0648\u0627\u0644\u0623\u0632\u0648\u0627\u062C"
    ],
    keywords: ["vip sea", "sea view chalet", "vip chalet", "\u0628\u062D\u0631 \u0645\u0628\u0627\u0634\u0631", "3000"]
  },
  {
    id: "pool_view",
    nameEn: "Pool and Activities View Chalet",
    nameAr: "\u0634\u0627\u0644\u064A\u0647 \u0625\u0637\u0644\u0627\u0644\u0629 \u0627\u0644\u0645\u0633\u0628\u062D \u0648\u0627\u0644\u0623\u0646\u0634\u0637\u0629",
    priceLyd: 2e3,
    detailsEn: [
      "View of main pool",
      "Close to entertainment areas",
      "Easy access to restaurant and beach",
      "Suitable for families"
    ],
    detailsAr: [
      "\u0625\u0637\u0644\u0627\u0644\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u0628\u062D \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
      "\u0642\u0631\u064A\u0628 \u0645\u0646 \u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u062A\u0631\u0641\u064A\u0647",
      "\u0633\u0647\u0648\u0644\u0629 \u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0644\u0645\u0637\u0639\u0645 \u0648\u0627\u0644\u0634\u0627\u0637\u0626",
      "\u0645\u0646\u0627\u0633\u0628 \u0644\u0644\u0639\u0627\u0626\u0644\u0627\u062A"
    ],
    keywords: ["pool view", "activities view", "\u0645\u0633\u0628\u062D \u0631\u0626\u064A\u0633\u064A", "2000"]
  },
  {
    id: "side_sea",
    nameEn: "Side Sea View Chalet",
    nameAr: "\u0634\u0627\u0644\u064A\u0647 \u0625\u0637\u0644\u0627\u0644\u0629 \u0628\u062D\u0631 \u062C\u0627\u0646\u0628\u064A\u0629",
    priceLyd: 1500,
    detailsEn: [
      "Side sea view",
      "Private balcony",
      "Quiet location",
      "Suitable for small families and couples"
    ],
    detailsAr: [
      "\u0625\u0637\u0644\u0627\u0644\u0629 \u0628\u062D\u0631 \u062C\u0627\u0646\u0628\u064A\u0629",
      "\u0634\u0631\u0641\u0629 \u062E\u0627\u0635\u0629",
      "\u0645\u0648\u0642\u0639 \u0647\u0627\u062F\u0626",
      "\u0645\u0646\u0627\u0633\u0628 \u0644\u0644\u0639\u0627\u0626\u0644\u0627\u062A \u0627\u0644\u0635\u063A\u064A\u0631\u0629 \u0648\u0627\u0644\u0623\u0632\u0648\u0627\u062C"
    ],
    keywords: ["side sea", "\u062C\u0627\u0646\u0628\u064A", "1500"]
  },
  {
    id: "garden_studio",
    nameEn: "Garden View Studio",
    nameAr: "\u0627\u0633\u062A\u0648\u062F\u064A\u0648 \u0625\u0637\u0644\u0627\u0644\u0629 \u0627\u0644\u062D\u062F\u064A\u0642\u0629",
    priceLyd: 1e3,
    detailsEn: [
      "Garden view",
      "Close to main facilities",
      "Practical and comfortable design",
      "Good value for couples or small families"
    ],
    detailsAr: [
      "\u0625\u0637\u0644\u0627\u0644\u0629 \u0639\u0644\u0649 \u0627\u0644\u062D\u062F\u064A\u0642\u0629",
      "\u0642\u0631\u064A\u0628 \u0645\u0646 \u0627\u0644\u0645\u0631\u0627\u0641\u0642 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629",
      "\u062A\u0635\u0645\u064A\u0645 \u0639\u0645\u0644\u064A \u0648\u0645\u0631\u064A\u062D",
      "\u062E\u064A\u0627\u0631 \u0627\u0642\u062A\u0635\u0627\u062F\u064A \u0644\u0644\u0623\u0632\u0648\u0627\u062C \u0623\u0648 \u0627\u0644\u0639\u0627\u0626\u0644\u0627\u062A \u0627\u0644\u0635\u063A\u064A\u0631\u0629"
    ],
    keywords: ["garden", "studio", "\u0627\u0633\u062A\u0648\u062F\u064A\u0648", "\u062D\u062F\u064A\u0642\u0629", "1000"]
  }
];
var INCLUDED_SERVICES_EN = [
  "Private beach access",
  "Pool access",
  "Free parking",
  "24 hour reception",
  "24 hour security",
  "Free internet in public areas",
  "Beach seating and umbrellas",
  "Family rest areas"
];
var INCLUDED_SERVICES_AR = [
  "\u062F\u062E\u0648\u0644 \u0634\u0627\u0637\u0626 \u062E\u0627\u0635",
  "\u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0633\u0628\u062D",
  "\u0645\u0648\u0642\u0641 \u0633\u064A\u0627\u0631\u0627\u062A \u0645\u062C\u0627\u0646\u064A",
  "\u0627\u0633\u062A\u0642\u0628\u0627\u0644 24 \u0633\u0627\u0639\u0629",
  "\u0623\u0645\u0646 24 \u0633\u0627\u0639\u0629",
  "\u0625\u0646\u062A\u0631\u0646\u062A \u0645\u062C\u0627\u0646\u064A \u0641\u064A \u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u0639\u0627\u0645\u0629",
  "\u0645\u0642\u0627\u0639\u062F \u0648\u0645\u0638\u0644\u0627\u062A \u0627\u0644\u0634\u0627\u0637\u0626",
  "\u0645\u0646\u0627\u0637\u0642 \u0631\u0627\u062D\u0629 \u0644\u0644\u0639\u0627\u0626\u0644\u0627\u062A"
];
var OPENING_OFFERS_EN = [
  "Book 3 nights and get the 4th night free",
  "15% discount for confirmed bookings before the official opening",
  "10% discount for families and groups",
  "Free stay for 2 children up to 10 years old in the same unit",
  "VIP and Presidential chalets include welcome fruit basket and drinks",
  "VIP and Presidential chalets include special beach seating",
  "Discounts on water activities for VIP and Presidential chalets",
  "Special corporate and group booking offers available"
];
var OPENING_OFFERS_AR = [
  "\u0627\u062D\u062C\u0632 3 \u0644\u064A\u0627\u0644\u064A \u0648\u0627\u062D\u0635\u0644 \u0639\u0644\u0649 \u0627\u0644\u0644\u064A\u0644\u0629 \u0627\u0644\u0631\u0627\u0628\u0639\u0629 \u0645\u062C\u0627\u0646\u0627\u064B",
  "\u062E\u0635\u0645 15% \u0644\u0644\u062D\u062C\u0648\u0632\u0627\u062A \u0627\u0644\u0645\u0624\u0643\u062F\u0629 \u0642\u0628\u0644 \u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D \u0627\u0644\u0631\u0633\u0645\u064A",
  "\u062E\u0635\u0645 10% \u0644\u0644\u0639\u0627\u0626\u0644\u0627\u062A \u0648\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A",
  "\u0625\u0642\u0627\u0645\u0629 \u0645\u062C\u0627\u0646\u064A\u0629 \u0644\u0637\u0641\u0644\u064A\u0646 \u062D\u062A\u0649 10 \u0633\u0646\u0648\u0627\u062A \u0641\u064A \u0646\u0641\u0633 \u0627\u0644\u0648\u062D\u062F\u0629",
  "\u0634\u0627\u0644\u064A\u0647\u0627\u062A VIP \u0648\u0627\u0644\u0631\u0626\u0627\u0633\u064A\u0629 \u062A\u0634\u0645\u0644 \u0633\u0644\u0629 \u0641\u0648\u0627\u0643\u0647 \u0648\u0645\u0634\u0631\u0648\u0628\u0627\u062A \u062A\u0631\u062D\u064A\u0628\u064A\u0629",
  "\u0634\u0627\u0644\u064A\u0647\u0627\u062A VIP \u0648\u0627\u0644\u0631\u0626\u0627\u0633\u064A\u0629 \u062A\u0634\u0645\u0644 \u062C\u0644\u0633\u0629 \u0634\u0627\u0637\u0626\u064A\u0629 \u0645\u0645\u064A\u0632\u0629",
  "\u062E\u0635\u0648\u0645\u0627\u062A \u0639\u0644\u0649 \u0627\u0644\u0623\u0646\u0634\u0637\u0629 \u0627\u0644\u0645\u0627\u0626\u064A\u0629 \u0644\u0634\u0627\u0644\u064A\u0647\u0627\u062A VIP \u0648\u0627\u0644\u0631\u0626\u0627\u0633\u064A\u0629",
  "\u0639\u0631\u0648\u0636 \u062E\u0627\u0635\u0629 \u0644\u0644\u062D\u062C\u0648\u0632\u0627\u062A \u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0648\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A"
];
function matchAccommodation(text2) {
  const normalized = text2.toLowerCase();
  for (const unit of ACCOMMODATIONS) {
    if (unit.keywords.some((kw) => normalized.includes(kw.toLowerCase()))) {
      return unit;
    }
  }
  if (/شاليه|chalet/.test(normalized) && !/presidential|رئاس/.test(normalized)) {
    return ACCOMMODATIONS.find((u) => u.id === "side_sea");
  }
  if (/فيلا|villa|vip/.test(normalized)) {
    return ACCOMMODATIONS.find((u) => u.id === "vip_sea");
  }
  if (/استوديو|studio|شقه|apartment/.test(normalized)) {
    return ACCOMMODATIONS.find((u) => u.id === "garden_studio");
  }
  return void 0;
}
function accommodationBookingLabel(unit) {
  return `${unit.nameEn} \u2014 ${unit.priceLyd} LYD/night`;
}
function getPriceListReply(lang) {
  if (lang === "ar") {
    const lines2 = ACCOMMODATIONS.map((u) => `\u2022 ${u.nameAr}: ${u.priceLyd} \u062F.\u0644 / \u0644\u064A\u0644\u0629`);
    return `\u0623\u0633\u0639\u0627\u0631 \u0635\u064A\u0641 2026 \u2728
${lines2.join("\n")}

\u0644\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0623\u0648 \u0627\u0644\u062D\u062C\u0632\u060C \u0627\u0628\u0639\u062A \u0646\u0648\u0639 \u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u0644\u064A \u062A\u0647\u0645\u0643.`;
  }
  const lines = ACCOMMODATIONS.map((u) => `\u2022 ${u.nameEn}: ${u.priceLyd} LYD/night`);
  return `Summer 2026 rates \u2728
${lines.join("\n")}

For details or booking, tell us which unit interests you.`;
}
function getUnitReply(unit, lang) {
  if (lang === "ar") {
    const details2 = unit.detailsAr.map((d) => `\u2022 ${d}`).join("\n");
    return `${unit.nameAr} \u2728
${unit.priceLyd} \u062F.\u0644 / \u0644\u064A\u0644\u0629
${details2}`;
  }
  const details = unit.detailsEn.map((d) => `\u2022 ${d}`).join("\n");
  return `${unit.nameEn} \u2728
${unit.priceLyd} LYD/night
${details}`;
}
function getIncludedServicesReply(lang) {
  if (lang === "ar") {
    return `\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u0634\u0645\u0648\u0644\u0629 \u2728
${INCLUDED_SERVICES_AR.map((s) => `\u2022 ${s}`).join("\n")}`;
  }
  return `Included services \u2728
${INCLUDED_SERVICES_EN.map((s) => `\u2022 ${s}`).join("\n")}`;
}
function getOffersReply(lang) {
  if (lang === "ar") {
    return `\u0639\u0631\u0648\u0636 \u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D \u2728
${OPENING_OFFERS_AR.map((s) => `\u2022 ${s}`).join("\n")}`;
  }
  return `Opening offers \u2728
${OPENING_OFFERS_EN.map((s) => `\u2022 ${s}`).join("\n")}`;
}
function getBookingInterestPrompt(lang) {
  return lang === "ar" ? "\u0623\u0643\u064A\u062F \u2728 \u0646\u0642\u062F\u0631 \u0646\u0627\u062E\u0630 \u0637\u0644\u0628 \u062D\u062C\u0632 \u0645\u0628\u062F\u0626\u064A. \u0627\u0628\u0639\u062A \u0627\u0644\u0627\u0633\u0645\u060C \u0627\u0644\u0647\u0627\u062A\u0641\u060C \u0646\u0648\u0639 \u0627\u0644\u0648\u062D\u062F\u0629\u060C \u0639\u062F\u062F \u0627\u0644\u0636\u064A\u0648\u0641\u060C \u0648\u0627\u0644\u062A\u0627\u0631\u064A\u062E. \u0627\u0644\u0641\u0631\u064A\u0642 \u064A\u0623\u0643\u062F \u0627\u0644\u062A\u0648\u0641\u0631." : "Of course \u2728 We can take a booking interest. Share name, phone, unit type, guests, and dates. Our team will confirm availability.";
}
function getKnowledgeBlockForPrompt(lang) {
  const units = lang === "ar" ? ACCOMMODATIONS.map((u) => `- ${u.nameAr}: ${u.priceLyd} \u062F.\u0644/\u0644\u064A\u0644\u0629`).join("\n") : ACCOMMODATIONS.map((u) => `- ${u.nameEn}: ${u.priceLyd} LYD/night`).join("\n");
  const included = lang === "ar" ? INCLUDED_SERVICES_AR.join("; ") : INCLUDED_SERVICES_EN.join("; ");
  const offers = lang === "ar" ? OPENING_OFFERS_AR.join("; ") : OPENING_OFFERS_EN.join("; ");
  return `
Official Summer 2026 accommodation prices (use these exact prices):
${units}

Included: ${included}

Opening offers: ${offers}

Rules: Give real prices when asked. Never confirm a booking or guarantee availability. For booking, collect details and say the team will confirm availability. Keep replies short and luxury in tone.`;
}
function resolvePriceOrUnitReply(message, lang) {
  const normalized = message.toLowerCase();
  const asksIncluded = /included|what is included|services included|مشمول|الخدمات|شنو مشمول|شن مشمول/.test(
    normalized
  );
  if (asksIncluded) return getIncludedServicesReply(lang);
  const asksOffers = /offer|offers|promo|discount|عروض|خصم|تخفيض/.test(normalized);
  if (asksOffers) return getOffersReply(lang);
  const unit = matchAccommodation(normalized);
  if (unit && /price|prices|how much|cost|بكم|قداش|سعر|اسعار|details|تفاصيل|about|عن|this|هذا|هذه/.test(normalized)) {
    return getUnitReply(unit, lang);
  }
  if (unit && !/book|booking|حجز/.test(normalized)) {
    return getUnitReply(unit, lang);
  }
  const asksPrices = /price|prices|how much|cost|rates|as3ar|بكم|قداش|سعر|اسعار|الاسعار|rates/.test(normalized);
  if (asksPrices) return getPriceListReply(lang);
  return void 0;
}

// api/chat-router.ts
var RESORT_INFO = {
  name: "La Vida Resort & Beach Club",
  location: "Zuwarah, Libya",
  website: "lavidaresort.ly",
  phones: ["093 888 8868", "093 888 8878"]
};
function detectMessageLanguage(message) {
  if (/[\u0600-\u06FF]/.test(message)) return "ar";
  return detectLanguage(message);
}
function normalizeText(input) {
  return input.toLowerCase().normalize("NFKC").replace(/[أإآ]/g, "\u0627").replace(/ى/g, "\u064A").replace(/ة/g, "\u0647").replace(/[ً-ْ]/g, "").replace(/[^\p{L}\p{N}\s/+.-]/gu, " ").replace(/\s+/g, " ").trim();
}
function hasAny(text2, keywords) {
  return keywords.some((keyword) => text2.includes(keyword));
}
function formatKnownBookingData(booking) {
  const known = [];
  if (booking.accommodationType) known.push(`accommodation=${booking.accommodationType}`);
  if (booking.dates) known.push(`dates=${booking.dates}`);
  if (booking.guestCount) known.push(`guestCount=${booking.guestCount}`);
  if (booking.phoneNumber) known.push(`phone=${booking.phoneNumber}`);
  return known.join(", ") || "none";
}
function getLastUserQuestion(history) {
  const users2 = history.filter((item) => item.role === "user").map((item) => item.content.trim()).filter(Boolean);
  const reversed = [...users2].reverse();
  const candidate = reversed.find((text2) => /[?؟]/.test(text2) || text2.length > 5);
  return candidate ?? reversed[0];
}
function extractAccommodationType(text2) {
  const unit = matchAccommodation(text2);
  if (unit) return accommodationBookingLabel(unit);
  if (hasAny(text2, ["\u0645\u0637\u0639\u0645", "\u0645\u0637\u0627\u0639\u0645", "restaurant", "resturent", "resturant", "cafe", "caf"])) return "restaurant";
  return void 0;
}
function extractGuestCount(text2) {
  const rangeMatch = text2.match(/\b(\d{1,2})\s*[/-]\s*(\d{1,2})\b/);
  if (rangeMatch) {
    const value = Number.parseInt(rangeMatch[2] ?? rangeMatch[1] ?? "", 10);
    if (Number.isFinite(value) && value > 0 && value <= 30) return value;
  }
  const guestRegexes = [
    /\b(\d{1,2})\s*(?:guests?|people|persons?)\b/i,
    /(?:عدد|ضيوف|اشخاص|أشخاص)\s*(\d{1,2})/,
    /^(\d{1,2})$/
  ];
  for (const regex of guestRegexes) {
    const match = text2.match(regex);
    const value = Number.parseInt(match?.[1] ?? "", 10);
    if (Number.isFinite(value) && value > 0 && value <= 30) return value;
  }
  return void 0;
}
function extractPhoneNumber(message) {
  const phoneMatch = message.match(/(\+?\d[\d\s-]{7,}\d)/);
  const value = phoneMatch?.[1]?.trim();
  return value || void 0;
}
function extractDates(message) {
  const datePatterns = [
    /\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/g,
    /\b(?:from|to|من|الى|إلى)\s+\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/gi,
    /\b(?:today|tomorrow|weekend|اليوم|بكره|بكرة|الويكند)\b/gi
  ];
  for (const pattern of datePatterns) {
    const match = message.match(pattern);
    if (match?.length) return match.join(" - ");
  }
  return void 0;
}
function inferConversationState(message, history) {
  const normalizedCurrent = normalizeText(message);
  const normalizedHistoryUsers = history.filter((item) => item.role === "user").map((item) => normalizeText(item.content)).join(" ");
  const mergedText = `${normalizedHistoryUsers} ${normalizedCurrent}`.trim();
  const bookingActive = hasAny(mergedText, [
    "book",
    "booking",
    "reservation",
    "availability",
    "\u062D\u062C\u0632",
    "\u062D\u062C\u0648\u0632\u0627\u062A",
    "\u0646\u0628\u064A \u0646\u062D\u062C\u0632",
    "\u0643\u064A\u0641 \u0646\u062D\u062C\u0632",
    "\u0645\u062A\u0627\u062D"
  ]);
  const asksLocation = hasAny(normalizedCurrent, ["location", "maps", "where", "\u0648\u064A\u0646", "\u0645\u0648\u0642\u0639", "\u0627\u0644\u0639\u0646\u0648\u0627\u0646"]);
  const asksFood = hasAny(normalizedCurrent, ["food", "restaurant", "resturent", "\u0645\u0637\u0627\u0639\u0645", "\u0645\u0637\u0639\u0645", "\u0643\u0627\u0641\u064A\u0647"]);
  const asksPricing = hasAny(normalizedCurrent, ["price", "prices", "rate", "cost", "\u0627\u0633\u0639\u0627\u0631", "\u0627\u0644\u0627\u0633\u0639\u0627\u0631", "\u0633\u0639\u0631"]);
  const asksContact = hasAny(normalizedCurrent, ["phone", "whatsapp", "\u0648\u0627\u062A\u0633\u0627\u0628", "\u0631\u0642\u0645", "\u062A\u0648\u0627\u0635\u0644"]);
  const asksMedia = hasAny(normalizedCurrent, ["\u0635\u0648\u0631", "photo", "photos", "picture", "gallery"]);
  const asksAmenities = hasAny(normalizedCurrent, ["pool", "\u0645\u0633\u0628\u062D", "jetski", "\u062C\u062A\u0633\u0643\u064A", "jet ski", "water sports"]);
  let topic = "general";
  if (bookingActive) topic = "booking";
  else if (asksLocation) topic = "location";
  else if (asksFood) topic = "food";
  else if (asksPricing) topic = "pricing";
  else if (asksContact) topic = "contact";
  else if (asksMedia) topic = "media";
  else if (asksAmenities) topic = "amenities";
  const mergedRaw = [...history.map((item) => item.content), message].join(" ");
  const booking = {
    active: bookingActive,
    accommodationType: extractAccommodationType(mergedText),
    dates: extractDates(mergedRaw),
    guestCount: extractGuestCount(normalizedCurrent) ?? extractGuestCount(mergedText),
    phoneNumber: extractPhoneNumber(mergedRaw)
  };
  return {
    topic,
    previousQuestion: getLastUserQuestion(history),
    booking
  };
}
function bookingNextStepReply(state, lang) {
  if (!state.booking.active) return void 0;
  if (!state.booking.accommodationType) {
    return lang === "ar" ? "\u0645\u0645\u062A\u0627\u0632 \u{1F30A} \u0623\u064A \u0648\u062D\u062F\u0629 \u062A\u0647\u0645\u0643\u0645\u061F (\u0631\u0626\u0627\u0633\u064A 4000\u060C VIP \u0628\u062D\u0631 3000\u060C \u0645\u0633\u0628\u062D 2000\u060C \u0628\u062D\u0631 \u062C\u0627\u0646\u0628\u064A 1500\u060C \u0627\u0633\u062A\u0648\u062F\u064A\u0648 1000 \u062F.\u0644/\u0644\u064A\u0644\u0629)" : "Perfect \u{1F30A} Which unit interests you? (Presidential 4000, VIP sea 3000, pool view 2000, side sea 1500, garden studio 1000 LYD/night)";
  }
  if (!state.booking.dates) {
    return lang === "ar" ? "\u062D\u0644\u0648 \u2728 \u0627\u0628\u0639\u062A\u0644\u064A \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u0627\u0644\u062E\u0631\u0648\u062C\u060C \u062D\u062A\u0649 \u0644\u0648 \u0643\u0644 \u0648\u0627\u062D\u062F \u0628\u0631\u0633\u0627\u0644\u0629 \u0645\u0646\u0641\u0635\u0644\u0629." : "Lovely \u2728 Share check-in and check-out dates, even if sent in separate messages.";
  }
  if (!state.booking.guestCount) {
    return lang === "ar" ? "\u0643\u0645 \u0639\u062F\u062F \u0627\u0644\u0636\u064A\u0648\u0641\u061F" : "How many guests will be staying?";
  }
  if (!state.booking.phoneNumber) {
    return lang === "ar" ? "\u0645\u0645\u0643\u0646 \u0631\u0642\u0645 \u0645\u0648\u0628\u0627\u064A\u0644 \u0644\u0644\u062A\u0648\u0627\u0635\u0644 \u0648\u062A\u0623\u0643\u064A\u062F \u0637\u0644\u0628 \u0627\u0644\u062D\u062C\u0632\u061F" : "May I have a phone number so our team can follow up on your booking request?";
  }
  return lang === "ar" ? `\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0637\u0644\u0628 \u0627\u0644\u062D\u062C\u0632 \u0627\u0644\u0645\u0628\u062F\u0626\u064A \u2705 (${formatKnownBookingData(state.booking)})
\u0641\u0631\u064A\u0642 \u0644\u0627\u0641\u064A\u062F\u0627 \u062D\u064A\u0623\u0643\u062F \u0627\u0644\u062A\u0648\u0641\u0631 \u0648\u064A\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0627\u0643\u0645.` : `Booking interest received \u2705 (${formatKnownBookingData(state.booking)})
The La Vida team will confirm availability and contact you.`;
}
function getShortcutReply(message, lang) {
  const text2 = normalizeText(message);
  if (!text2) return void 0;
  if (hasAny(text2, ["\u0645\u0648\u0642\u0639", "location", "maps", "address", "\u0648\u064A\u0646"])) {
    return lang === "ar" ? `\u0627\u0644\u0645\u0648\u0642\u0639: \u0632\u0648\u0627\u0631\u0629 - \u0644\u064A\u0628\u064A\u0627 \u{1F4CD}
Google Maps \u0639\u0628\u0631 \u0645\u0648\u0642\u0639\u0646\u0627: ${RESORT_INFO.website}` : `Location: Zuwarah, Libya \u{1F4CD}
Maps and directions: ${RESORT_INFO.website}`;
  }
  if (hasAny(text2, ["\u0645\u0637\u0627\u0639\u0645", "\u0645\u0637\u0639\u0645", "restaurant", "resturent", "resturant", "food", "cafe"])) {
    return lang === "ar" ? "\u0623\u0643\u064A\u062F \u2728 \u0639\u0646\u062F\u0646\u0627 \u0643\u0627\u0641\u064A\u0647 \u0648\u0645\u0646\u0637\u0642\u0629 \u0623\u0643\u0644 \u0628\u0625\u0637\u0644\u0627\u0644\u0629 \u0628\u062D\u0631\u064A\u0629 \u0636\u0645\u0646 \u0627\u0644\u0645\u0646\u062A\u062C\u0639." : "Absolutely \u2728 We have a beach caf\xE9 and dedicated food area inside the resort.";
  }
  if (hasAny(text2, ["\u062D\u062C\u0632", "booking", "book", "reservation"])) {
    return getBookingInterestPrompt(lang);
  }
  const priceReply = resolvePriceOrUnitReply(text2, lang);
  if (priceReply && hasAny(text2, ["\u0627\u0633\u0639\u0627\u0631", "\u0627\u0644\u0627\u0633\u0639\u0627\u0631", "\u0633\u0639\u0631", "price", "prices", "cost", "\u0628\u0643\u0645", "offer", "\u0639\u0631\u0648\u0636", "included", "\u0645\u0634\u0645\u0648\u0644"])) {
    return priceReply;
  }
  if (hasAny(text2, ["\u0627\u0633\u0639\u0627\u0631", "\u0627\u0644\u0627\u0633\u0639\u0627\u0631", "\u0633\u0639\u0631", "price", "prices", "cost", "\u0628\u0643\u0645"])) {
    return resolvePriceOrUnitReply("prices", lang);
  }
  if (hasAny(text2, ["\u0648\u0627\u062A\u0633\u0627\u0628", "whatsapp", "whats app", "wa"])) {
    return lang === "ar" ? `\u0648\u0627\u062A\u0633\u0627\u0628/\u0627\u062A\u0635\u0627\u0644:
${RESORT_INFO.phones[0]}
${RESORT_INFO.phones[1]}` : `WhatsApp / Call:
${RESORT_INFO.phones[0]}
${RESORT_INFO.phones[1]}`;
  }
  if (hasAny(text2, ["\u0635\u0648\u0631", "photo", "photos", "gallery", "picture"])) {
    return lang === "ar" ? "\u0627\u0644\u0635\u0648\u0631 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0642\u064A\u062F \u0627\u0644\u062A\u062D\u0636\u064A\u0631 \u2728 \u0648\u062D\u0646\u0646\u0632\u0644\u0647\u0627 \u0642\u0631\u064A\u0628\u0627\u064B \u062C\u062F\u0627\u064B." : "Official photos are being finalized \u2728 and will be shared very soon.";
  }
  if (hasAny(text2, ["\u0645\u0633\u0628\u062D", "pool", "swimming"])) {
    return lang === "ar" ? "\u0646\u0639\u0645 \u2728 \u0641\u064A \u0645\u0633\u0628\u062D \u0631\u0626\u064A\u0633\u064A \u0643\u0628\u064A\u0631\u060C \u0648\u0628\u0639\u0636 \u0627\u0644\u0641\u0644\u0644 \u0641\u064A\u0647\u0627 \u0645\u0633\u0627\u0628\u062D \u062E\u0627\u0635\u0629." : "Yes \u2728 There is a large main pool, and selected villas include private pools.";
  }
  if (hasAny(text2, ["\u062C\u062A\u0633\u0643\u064A", "jetski", "jet ski", "water sports", "jtski", "jitski"])) {
    return lang === "ar" ? "\u0623\u0643\u064A\u062F \u2728 \u0627\u0644\u062C\u062A\u0633\u0643\u064A \u0648\u0627\u0644\u0623\u0646\u0634\u0637\u0629 \u0627\u0644\u0628\u062D\u0631\u064A\u0629 \u0645\u062A\u0648\u0641\u0631\u0629 \u0641\u064A La Vida." : "Yes \u2728 Jet ski and water sports are available at La Vida.";
  }
  return void 0;
}
function buildSystemPrompt(lang, state) {
  const base = `You are La Vida AI, the official receptionist for ${RESORT_INFO.name}.

Official resort facts:
- Name: ${RESORT_INFO.name}
- Location: ${RESORT_INFO.location}
- Website: ${RESORT_INFO.website}
- Phones: ${RESORT_INFO.phones.join(" and ")}
- Opening date: June 1, 2026
${getKnowledgeBlockForPrompt(lang)}

Resort features you can mention naturally when relevant:
- Beach access
- Pool
- Luxury chalets
- Water sports
- Jetski rentals
- Football court
- Volleyball court
- Cafe
- Relaxation areas
- Kids activities
- Family atmosphere
- Night entertainment

Style and behavior rules:
1) Sound luxury, calm, warm, elegant, and natural.
2) Keep replies short, clear, and helpful.
3) Never sound robotic.
4) Use only official Summer 2026 prices from the knowledge block.
5) Never confirm bookings or guarantee availability \u2014 team confirms availability.
6) Mention the opening date (June 1, 2026) when relevant.
7) If you are unsure, clearly say management will confirm.
8) Do not invent facts outside the information above.
9) Keep conversation continuity: do not reset topic during active threads.
10) If booking is active, collect only missing booking fields naturally.
11) Understand fragmented messages and short follow-ups.
12) Understand Arabic Libyan slang and mixed Arabic-English.
13) Never ask "Could you tell us more" unless absolutely necessary.`;
  const stateContext = `
Conversation context:
- currentTopic: ${state.topic}
- previousQuestion: ${state.previousQuestion ?? "none"}
- bookingActive: ${state.booking.active ? "yes" : "no"}
- bookingKnown: ${formatKnownBookingData(state.booking)}`;
  if (lang === "ar") {
    return `${base}
${stateContext}
Language rule: Reply in Arabic when the guest writes Arabic.`;
  }
  return `${base}
${stateContext}
Language rule: Reply in English unless the guest writes Arabic.`;
}
var chatRouter = createRouter({
  ask: publicQuery.input(
    z7.object({
      message: z7.string().min(1),
      history: z7.array(
        z7.object({
          role: z7.enum(["user", "assistant"]),
          content: z7.string().min(1)
        })
      ).max(20).optional()
    })
  ).mutation(async ({ input }) => {
    const message = input.message.trim();
    const lang = detectMessageLanguage(message);
    const history = input.history ?? [];
    const state = inferConversationState(message, history);
    const priceReply = resolvePriceOrUnitReply(message, lang);
    if (priceReply && !state.booking.active) {
      return { reply: priceReply, language: lang, source: "rule" };
    }
    const bookingStepReply = bookingNextStepReply(state, lang);
    const shortcutReply = getShortcutReply(message, lang);
    if (shortcutReply && !state.booking.active) {
      return {
        reply: shortcutReply,
        language: lang,
        source: "rule"
      };
    }
    if (bookingStepReply) {
      return {
        reply: bookingStepReply,
        language: lang,
        source: "rule"
      };
    }
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.error("[chat.ask] Missing GROQ_API_KEY");
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "GROQ_API_KEY is missing on the server"
      });
    }
    try {
      const client = new OpenAI({
        apiKey: groqApiKey,
        baseURL: "https://api.groq.com/openai/v1"
      });
      const result = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        max_tokens: 400,
        messages: [
          { role: "system", content: buildSystemPrompt(lang, state) },
          ...history.map((item) => ({
            role: item.role,
            content: item.content
          })),
          { role: "user", content: message }
        ]
      });
      const reply = result.choices?.[0]?.message?.content?.trim();
      if (!reply) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "Groq returned an empty response"
        });
      }
      return {
        reply,
        language: lang,
        source: "ai"
      };
    } catch (error) {
      console.error("[chat.ask] Unexpected error", error);
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate AI response"
      });
    }
  })
});

// api/router.ts
var appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  lead: leadsRouter,
  message: messagesRouter,
  calls: callsRouter,
  setting: settingsRouter,
  log: logsRouter,
  chat: chatRouter
});

// api/context.ts
async function createContext(opts) {
  const ctx = { req: opts.req, resHeaders: opts.resHeaders };
  ctx.user = authenticateLocalSession(opts.req.headers);
  return ctx;
}

// api/whatsapp-webhook.ts
import { Hono } from "hono";
import { eq as eq6, and as and5, desc as desc5 } from "drizzle-orm";

// api/lib/whatsapp.ts
var WHATSAPP_API_BASE = `https://graph.facebook.com/${env.whatsappApiVersion}`;
async function sendWhatsAppMessage(to, text2, replyToMessageId) {
  if (!env.whatsappAccessToken || !env.whatsappPhoneNumberId) {
    return { success: false, error: "WhatsApp not configured" };
  }
  const url = `${WHATSAPP_API_BASE}/${env.whatsappPhoneNumberId}/messages`;
  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { body: text2, preview_url: false }
  };
  if (replyToMessageId) {
    body.context = { message_id: replyToMessageId };
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.whatsappAccessToken}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error?.message ?? `HTTP ${res.status}` };
    }
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
async function markWhatsAppMessageAsRead(messageId) {
  if (!env.whatsappAccessToken || !env.whatsappPhoneNumberId) return;
  const url = `${WHATSAPP_API_BASE}/${env.whatsappPhoneNumberId}/messages/${messageId}`;
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.whatsappAccessToken}`
      },
      body: JSON.stringify({ messaging_product: "whatsapp", status: "read" })
    });
  } catch {
  }
}

// api/ai-engine.ts
var OPENAI_URL = "https://api.openai.com/v1/chat/completions";
var RESORT_NAME = "La Vida Resort & Beach Club";
var WEBSITE = "lavidaresort.ly";
var PHONE_1 = "093 888 8868";
var PHONE_2 = "093 888 8878";
function buildSystemPrompt2(lang) {
  if (lang === "ar") {
    return `\u0623\u0646\u062A La Vida AI\u060C \u0645\u0648\u0638\u0641 \u0627\u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644 \u0627\u0644\u0631\u0633\u0645\u064A \u0644\u0645\u0646\u062A\u062C\u0639 ${RESORT_NAME}.
\u0627\u0644\u0646\u0628\u0631\u0629: \u0631\u0627\u0642\u064A\u0629\u060C \u0647\u0627\u062F\u0626\u0629\u060C \u0648\u062F\u0648\u062F\u0629\u060C \u0637\u0628\u064A\u0639\u064A\u0629\u060C \u0648\u0627\u0644\u0631\u062F\u0648\u062F \u0642\u0635\u064A\u0631\u0629.
\u0627\u0644\u0644\u063A\u0629: \u0625\u0630\u0627 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0643\u062A\u0628 \u0628\u0627\u0644\u0639\u0631\u0628\u064A (\u062D\u062A\u0649 \u0644\u0647\u062C\u0629 \u0644\u064A\u0628\u064A\u0629) \u0631\u062F \u0628\u0627\u0644\u0639\u0631\u0628\u064A.

\u062D\u0642\u0627\u0626\u0642 \u0631\u0633\u0645\u064A\u0629:
- \u0627\u0644\u0645\u0648\u0642\u0639: \u0632\u0648\u0627\u0631\u0629\u060C \u0644\u064A\u0628\u064A\u0627
- \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A: ${WEBSITE}
- \u0623\u0631\u0642\u0627\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644: ${PHONE_1} / ${PHONE_2}
- \u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D \u0627\u0644\u0631\u0633\u0645\u064A: 1 \u064A\u0648\u0646\u064A\u0648 2026
${getKnowledgeBlockForPrompt("ar")}

\u0627\u0644\u0645\u0631\u0627\u0641\u0642:
- \u0634\u0627\u0637\u0626 \u0648\u0645\u0633\u0628\u062D \u0643\u0628\u064A\u0631
- \u0643\u0627\u0641\u064A\u0647 \u0634\u0627\u0637\u0626\u064A \u0648\u0645\u0646\u0637\u0642\u0629 \u0623\u0643\u0644
- \u0623\u0646\u0634\u0637\u0629 \u0628\u062D\u0631\u064A\u0629 \u0648\u062A\u0623\u062C\u064A\u0631 \u062C\u062A\u0633\u0643\u064A
- \u0645\u0644\u0639\u0628 \u0643\u0631\u0629 \u0648\u0645\u0644\u0639\u0628 \u0637\u0627\u0626\u0631\u0629
- \u0623\u0646\u0634\u0637\u0629 \u0623\u0637\u0641\u0627\u0644\u060C \u0623\u062C\u0648\u0627\u0621 \u0639\u0627\u0626\u0644\u064A\u0629\u060C \u062A\u0631\u0641\u064A\u0647 \u0644\u064A\u0644\u064A\u060C \u0645\u0634\u0627\u0647\u062F\u0629 \u0645\u0628\u0627\u0631\u064A\u0627\u062A\u060C \u0648\u0623\u0644\u0639\u0627\u0628 \u0634\u0628\u0627\u0628\u064A\u0629

\u0642\u0648\u0627\u0639\u062F \u0625\u0644\u0632\u0627\u0645\u064A\u0629:
1) \u0627\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0623\u0639\u0644\u0627\u0647 \u0641\u0642\u0637 \u2014 \u0644\u0627 \u062A\u062E\u062A\u0631\u0639 \u0623\u0633\u0639\u0627\u0631\u0627\u064B.
2) \u0644\u0627 \u062A\u0624\u0643\u062F \u0623\u064A \u062D\u062C\u0632 \u0648\u0644\u0627 \u062A\u0639\u062F \u0628\u0627\u0644\u062A\u0648\u0641\u0631.
3) \u0644\u0644\u062D\u062C\u0632: \u0627\u062C\u0645\u0639 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0648\u0642\u0644 \u0625\u0646 \u0627\u0644\u0641\u0631\u064A\u0642 \u064A\u0623\u0643\u062F \u0627\u0644\u062A\u0648\u0641\u0631.
4) \u0625\u0630\u0627 \u0627\u0644\u0633\u0624\u0627\u0644 \u0639\u0646 \u0645\u0631\u0641\u0642 \u0623\u0648 \u0648\u062D\u062F\u0629 \u0645\u0639\u064A\u0646\u0629\u060C \u062C\u0627\u0648\u0628 \u0639\u0644\u0649 \u0646\u0641\u0633 \u0627\u0644\u0645\u0648\u0636\u0648\u0639 \u0641\u0642\u0637 \u0648\u0628\u0627\u062E\u062A\u0635\u0627\u0631.
5) \u0625\u0630\u0627 \u0627\u0644\u0637\u0644\u0628 \u063A\u064A\u0631 \u0648\u0627\u0636\u062D \u062C\u062F\u0627\u064B\u060C \u0627\u0637\u0644\u0628 \u062A\u0648\u0636\u064A\u062D \u0642\u0635\u064A\u0631 \u0648\u0644\u0637\u064A\u0641.`;
  }
  return `You are La Vida AI, the official receptionist for ${RESORT_NAME}.
Tone: luxury, calm, elegant, warm, natural. Keep replies short.
Language: reply in English unless the guest writes Arabic.

Official facts:
- Location: Zuwarah, Libya
- Website: ${WEBSITE}
- Contact numbers: ${PHONE_1} / ${PHONE_2}
- Official opening date: June 1, 2026
${getKnowledgeBlockForPrompt("en")}

Facilities:
- Beachfront access and large pool
- Beach cafe and food area
- Water sports and jetski rentals
- Football and volleyball courts
- Kids activities, family atmosphere, evening entertainment, match screenings, arcade-style youth area

Hard rules:
1) Use only the official Summer 2026 prices above \u2014 never invent prices.
2) Never confirm bookings or guarantee availability.
3) For booking: collect details and say the team will confirm availability.
4) For specific facility or unit questions, answer only that point briefly.
5) Ask for clarification only when truly necessary.`;
}
async function generateAIResponse(userMessage, history = [], forceLang) {
  const lang = forceLang ?? detectMessageLanguage2(userMessage);
  const intentText = getIntentResponse(userMessage, lang);
  if (intentText) {
    return { text: intentText, lang, source: "template" };
  }
  if (env.openaiApiKey) {
    try {
      const aiText = await callOpenAI(userMessage, history, lang);
      if (aiText) {
        return { text: aiText, lang, source: "ai" };
      }
    } catch (err) {
      console.error("AI generation failed, falling back to templates:", err);
    }
  }
  const templateText = getNaturalFallback(lang);
  return { text: templateText, lang, source: "template" };
}
async function callOpenAI(userMessage, history, lang) {
  const apiKey = env.openaiApiKey;
  if (!apiKey) return null;
  const messages2 = [
    { role: "system", content: buildSystemPrompt2(lang) },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: userMessage }
  ];
  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: messages2,
      temperature: 0.7,
      max_tokens: 500
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? null;
}
function normalizeArabic(input) {
  return input.toLowerCase().normalize("NFKC").replace(/[أإآ]/g, "\u0627").replace(/ى/g, "\u064A").replace(/ة/g, "\u0647").replace(/[ً-ْ]/g, "").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}
function detectMessageLanguage2(message) {
  if (/[\u0600-\u06FF]/.test(message)) return "ar";
  return detectLanguage(message);
}
function hasAny2(text2, keywords) {
  return keywords.some((keyword) => text2.includes(keyword));
}
function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)] ?? items[0] ?? "";
}
function getNaturalFallback(lang) {
  if (lang === "ar") return "\u0645\u0645\u0643\u0646 \u062A\u0648\u0636\u062D\u0644\u0646\u0627 \u0623\u0643\u062B\u0631 \u0634\u0646\u0648 \u062A\u062D\u0628 \u062A\u0639\u0631\u0641 \u0639\u0646 \u0644\u0627\u0641\u064A\u062F\u0627\u061F \u2728";
  return "Could you tell us a bit more about what you'd like to know about La Vida? \u2728";
}
function getIntentResponse(userMessage, lang) {
  const rawText = userMessage.trim().toLowerCase();
  const text2 = normalizeArabic(rawText);
  const compact = text2.replace(/\s+/g, " ").trim();
  const replies = [];
  const priceOrUnit = resolvePriceOrUnitReply(`${text2} ${rawText}`, lang);
  if (priceOrUnit) return priceOrUnit;
  const acknowledgementPhrases = [
    "\u0645\u0648\u0627\u0641\u0642",
    "\u0645\u0648\u0627\u0641\u064A\u0646",
    "\u0645\u0648\u0627\u0641\u064A\u0646\u0643",
    "\u062A\u0645\u0627\u0645",
    "\u062A\u0645\u0627\u0645 \u062E\u0644\u0627\u0635",
    "\u0627\u0648\u0643\u064A",
    "\u062E\u0644\u0627\u0635",
    "\u0643\u0648\u064A\u0633",
    "\u0645\u0646\u064A\u062D",
    "\u062D\u0644\u0648",
    "\u062D\u0644\u0648 \u062A\u0645\u0627\u0645",
    "\u064A\u0639\u0637\u064A\u0643 \u0627\u0644\u0635\u062D\u0647",
    "\u064A\u0639\u0637\u064A\u0643\u0645 \u0627\u0644\u0635\u062D\u0647",
    "\u064A\u0633\u0644\u0645\u0648",
    "\u062A\u0633\u0644\u0645",
    "\u062A\u0633\u0644\u0645\u0648\u0627",
    "\u064A\u0639\u0637\u064A\u0643 \u0627\u0644\u0639\u0627\u0641\u064A\u0647",
    "\u0628\u0627\u0631\u0643 \u0627\u0644\u0644\u0647 \u0641\u064A\u0643",
    "\u0634\u0643\u0631\u0627",
    "\u062B\u0627\u0646\u0643\u0633",
    "thanks",
    "thank you",
    "nice",
    "perfect",
    "great",
    "sounds good",
    "awesome"
  ];
  const isAcknowledgementOnly = acknowledgementPhrases.includes(compact) || compact.length <= 28 && hasAny2(compact, [
    "\u0645\u0648\u0627\u0641\u0642",
    "\u062A\u0645\u0627\u0645",
    "\u0627\u0648\u0643\u064A",
    "\u062E\u0644\u0627\u0635",
    "\u0634\u0643\u0631\u0627",
    "\u064A\u0639\u0637\u064A\u0643",
    "\u064A\u0633\u0644\u0645\u0648",
    "\u062A\u0633\u0644\u0645",
    "thanks",
    "thank you",
    "perfect",
    "great",
    "awesome",
    "sounds good"
  ]);
  if (isAcknowledgementOnly) {
    if (lang === "ar") {
      return pickRandom([
        "\u062A\u0645\u0627\u0645 \u2728 \u0646\u0648\u0631\u062A\u0648\u0646\u0627",
        "\u064A\u0633\u0639\u062F\u0646\u0627 \u0647\u0630\u0627 \u2728",
        "\u0627\u0644\u0639\u0641\u0648 \u2728",
        "\u062A\u062D\u062A \u0623\u0645\u0631\u0643\u0645 \u0641\u064A \u0623\u064A \u0648\u0642\u062A \u2728",
        "\u0645\u0646\u0648\u0631\u064A\u0646 \u2728"
      ]);
    }
    return pickRandom([
      "Glad we could help \u2728",
      "You're very welcome \u2728",
      "Happy to help anytime \u2728",
      "Sounds great \u2728"
    ]);
  }
  const isGreeting = hasAny2(text2, [
    "hi",
    "hello",
    "hey",
    "\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645",
    "\u0633\u0644\u0627\u0645",
    "\u0645\u0631\u062D\u0628\u0627",
    "\u0627\u0647\u0644\u0627"
  ]);
  if (isGreeting) {
    replies.push(
      lang === "ar" ? "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643\u0645 \u0641\u064A La Vida Resort & Beach Club \u{1F30A}\n\u0646\u0648\u0631\u062A\u0648\u0646\u0627 \u2728\n\u0643\u064A\u0641 \u0646\u0642\u062F\u0631 \u0646\u0633\u0627\u0639\u062F\u0643\u0645 \u0627\u0644\u064A\u0648\u0645\u061F" : "Welcome to La Vida Resort & Beach Club \u{1F30A}\nWe\u2019re happy to assist you \u2728\nHow can we help you today?"
    );
  }
  const isPrice = hasAny2(text2, [
    "price",
    "prices",
    "how much",
    "kam",
    "bekam",
    "bikam",
    "as3ar",
    "asaar",
    "cost",
    "rates",
    "\u0627\u0644\u0623\u0633\u0639\u0627\u0631",
    "\u0628\u0643\u0645",
    "\u0642\u062F\u0627\u0634",
    "\u0643\u0645 \u0627\u0644\u0633\u0639\u0631",
    "\u0634\u0646 \u0627\u0644\u0633\u0639\u0631",
    "\u0643\u0645 \u062A\u0643\u0644\u0641",
    "\u0633\u0639\u0631",
    "\u0627\u0633\u0639\u0627\u0631"
  ]);
  if (isPrice) {
    replies.push(getPriceListReply(lang));
  }
  const isBooking = hasAny2(text2, [
    "book",
    "booking",
    "7ajz",
    "hajz",
    "reserve",
    "reservation",
    "availability",
    "\u0627\u0644\u062D\u062C\u0632",
    "\u0646\u0628\u064A \u0646\u062D\u062C\u0632",
    "\u0643\u064A\u0641 \u0646\u062D\u062C\u0632",
    "\u0641\u064A \u062D\u062C\u0632",
    "\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062D\u062C\u0632",
    "\u0646\u062D\u062C\u0632",
    "\u062D\u062C\u0632",
    "\u0645\u062A\u0627\u062D",
    "\u0641\u064A\u0647 \u062D\u062C\u0632"
  ]);
  if (isBooking) {
    replies.push(getBookingInterestPrompt(lang));
  }
  const asksOffers = hasAny2(text2, ["offer", "offers", "promo", "discount", "\u0639\u0631\u0648\u0636", "\u062E\u0635\u0645", "\u062A\u062E\u0641\u064A\u0636"]);
  if (asksOffers) {
    replies.push(getOffersReply(lang));
  }
  const asksIncluded = hasAny2(text2, [
    "included",
    "what is included",
    "services included",
    "\u0645\u0634\u0645\u0648\u0644",
    "\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u0634\u0645\u0648\u0644\u0647",
    "\u0634\u0646 \u0645\u0634\u0645\u0648\u0644"
  ]);
  if (asksIncluded) {
    replies.push(getIncludedServicesReply(lang));
  }
  const isOpening = hasAny2(text2, ["opening", "when open", "opening date", "\u0645\u062A\u0649 \u062A\u0641\u062A\u062D\u0648", "\u0645\u0648\u0639\u062F \u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D", "\u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D"]);
  if (isOpening) {
    replies.push(
      lang === "ar" ? "\u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D \u0627\u0644\u0631\u0633\u0645\u064A \u064A\u0648\u0645 1 \u064A\u0648\u0646\u064A\u0648 2026 \u2728" : "La Vida officially opens on June 1 2026 \u2728"
    );
  }
  const asksContact = hasAny2(text2, ["phone", "contact", "number", "call", "\u0631\u0642\u0645", "\u062A\u0648\u0627\u0635\u0644", "\u0627\u062A\u0635\u0627\u0644", "\u062A\u0644\u0641\u0648\u0646"]);
  if (asksContact) {
    replies.push(
      lang === "ar" ? `\u062A\u0642\u062F\u0631\u0648\u0627 \u062A\u062A\u0648\u0627\u0635\u0644\u0648\u0627 \u0645\u0639 \u0644\u0627\u0641\u064A\u062F\u0627 \u0639\u0644\u0649:
${PHONE_1}
${PHONE_2} \u2728` : `You can contact La Vida on:
${PHONE_1}
${PHONE_2} \u2728`
    );
  }
  const asksLocation = hasAny2(text2, [
    "location",
    "address",
    "maps",
    "where",
    "wen",
    "ween",
    "\u0648\u064A\u0646",
    "\u0645\u0648\u0642\u0639",
    "\u0627\u0644\u0639\u0646\u0648\u0627\u0646",
    "\u0632\u0648\u0627\u0631\u0647",
    "shn",
    "sheno",
    "shno",
    "shnowa"
  ]);
  if (asksLocation) {
    replies.push(
      lang === "ar" ? `\u0644\u0627\u0641\u064A\u062F\u0627 \u0645\u0648\u062C\u0648\u062F\u0629 \u0641\u064A \u0632\u0648\u0627\u0631\u0629 \u0644\u064A\u0628\u064A\u0627 \u2728 ${WEBSITE}` : `La Vida is located in Zuwarah Libya \u2728 ${WEBSITE}`
    );
  }
  const asksMeals = hasAny2(text2, ["full board", "breakfast", "meals", "food included", "\u0648\u062C\u0628\u0627\u062A", "\u0627\u0642\u0627\u0645\u0647 \u0643\u0627\u0645\u0644\u0647", "\u0641\u0648\u0644 \u0628\u0648\u0631\u062F"]);
  if (asksMeals) {
    replies.push(
      lang === "ar" ? "\u0627\u0644\u0625\u0642\u0627\u0645\u0629 \u062A\u0634\u0645\u0644 \u062F\u062E\u0648\u0644 \u0627\u0644\u0634\u0627\u0637\u0626 \u0648\u0627\u0644\u0645\u0633\u0628\u062D \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u0630\u0643\u0648\u0631\u0629 \u0641\u064A \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u0634\u0645\u0648\u0644\u0629 \u2728 \u0627\u0633\u0623\u0644\u0646\u0627 \u0639\u0646 \xAB\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u0634\u0645\u0648\u0644\u0629\xBB \u0644\u0644\u062A\u0641\u0627\u0635\u064A\u0644." : "Your stay includes beach and pool access plus the listed included services \u2728 Ask us about included services for details."
    );
  }
  const asksPhotos = hasAny2(text2, [
    "photo",
    "photos",
    "picture",
    "pictures",
    "image",
    "images",
    "renders",
    "gallery",
    "show me rooms",
    "show me villas",
    "\u0635\u0648\u0631",
    "\u0635\u0648\u0631 \u0627\u0644\u0634\u0627\u0644\u064A\u0647\u0627\u062A",
    "\u0635\u0648\u0631 \u0627\u0644\u0645\u0646\u062A\u062C\u0639",
    "\u0627\u0628\u0639\u062A \u0635\u0648\u0631",
    "\u0646\u0628\u064A \u0635\u0648\u0631",
    "\u0641\u064A \u0635\u0648\u0631",
    "\u0635\u0648\u0631 \u0627\u0644\u063A\u0631\u0641",
    "\u0635\u0648\u0631 \u0627\u0644\u0641\u0644\u0644"
  ]);
  if (asksPhotos) {
    replies.push(lang === "ar" ? "\u062D\u0627\u0644\u064A\u0627\u064B \u0627\u0644\u0635\u0648\u0631 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0627\u0644\u0634\u0627\u0644\u064A\u0647\u0627\u062A \u0648\u0627\u0644\u0645\u0646\u062A\u062C\u0639 \u0645\u0634 \u0645\u062A\u0648\u0641\u0631\u0629 \u0639\u0646\u062F\u0646\u0627 \u062A\u0648\u0627 \u2728\n\u0648\u062D\u0646\u0634\u0627\u0631\u0643\u0648\u0627 \u0643\u0644 \u0627\u0644\u0635\u0648\u0631 \u0648\u0627\u0644\u062A\u062D\u062F\u064A\u062B\u0627\u062A \u0627\u0644\u0628\u0635\u0631\u064A\u0629 \u0642\u0631\u064A\u0628\u0627\u064B \u0645\u0639 \u0645\u0648\u0639\u062F \u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D \u0648\u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0627\u0644\u0631\u0633\u0645\u064A \u0644\u0644\u062D\u062C\u0632." : "Currently the official chalet and resort images are not available yet \u2728\nAll photos and visual updates will be shared closer to the opening date and official booking announcement.");
  }
  const asksSupermarket = hasAny2(text2, [
    "supermarket",
    "market",
    "grocery",
    "mini market",
    "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A",
    "\u0628\u0642\u0627\u0644\u0647",
    "\u0628\u0642\u0627\u0644\u0629",
    "\u0633\u0648\u0642"
  ]);
  if (asksSupermarket) {
    replies.push(
      lang === "ar" ? "\u0623\u0643\u064A\u062F \u2728 \u0628\u062E\u0635\u0648\u0635 \u0627\u0644\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0642\u0631\u064A\u0628\u0629\u060C \u0641\u0631\u064A\u0642 \u0644\u0627\u0641\u064A\u062F\u0627 \u062D\u064A\u0648\u062C\u0647\u0643\u0645 \u0628\u0623\u0642\u0631\u0628 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629 \u0639\u0646\u062F \u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D." : "Of course \u2728 For supermarket and nearby essentials, the La Vida team will guide you to the closest suitable options at opening."
    );
  }
  const asksHuman = hasAny2(text2, [
    "manager",
    "management",
    "human",
    "admin",
    "complaint",
    "problem",
    "\u0645\u0634\u0643\u0644\u0629",
    "\u0627\u0644\u0625\u062F\u0627\u0631\u0629",
    "\u0645\u0648\u0638\u0641"
  ]);
  if (asksHuman) {
    replies.push(
      lang === "ar" ? "\u0623\u0643\u064A\u062F \u2728 \u0623\u062D\u062F \u0623\u0639\u0636\u0627\u0621 \u0641\u0631\u064A\u0642 \u0644\u0627\u0641\u064A\u062F\u0627 \u062D\u064A\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0627\u0643\u0645 \u0642\u0631\u064A\u0628\u0627\u064B." : "Of course \u2728 A member of the La Vida team will assist you shortly."
    );
  }
  const asksPrivatePools = hasAny2(text2, [
    "private pool",
    "private pools",
    "do villas have private pools",
    "\u0641\u064A \u0645\u0633\u0628\u062D \u062E\u0627\u0635",
    "\u0645\u0633\u0628\u062D \u062E\u0627\u0635"
  ]);
  if (asksPrivatePools) {
    replies.push(
      lang === "ar" ? "\u0623\u0643\u064A\u062F \u2728 \u0641\u0644\u0644 VIP \u0648\u0627\u0644\u0641\u0644\u0644 \u0627\u0644\u0631\u0626\u0627\u0633\u064A\u0629 \u0641\u064A\u0647\u0627 \u0645\u0633\u0627\u0628\u062D \u062E\u0627\u0635\u0629." : "Yes \u2728 VIP villas and presidential villas include private pools."
    );
  }
  const asksAccommodation = hasAny2(text2, [
    "room",
    "rooms",
    "villa",
    "villas",
    "chalet",
    "chalets",
    "apartment",
    "apartments",
    "accommodation",
    "where to stay",
    "capacity",
    "guest",
    "guests",
    "how many people can stay",
    "\u0634\u0646 \u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u063A\u0631\u0641",
    "\u0643\u0645 \u0634\u062E\u0635 \u064A\u0642\u062F\u0631 \u064A\u0642\u0639\u062F",
    "\u0643\u0645 \u0634\u062E\u0635",
    "\u0627\u0644\u063A\u0631\u0641",
    "\u0634\u0627\u0644\u064A\u0647",
    "\u0634\u0627\u0644\u064A\u0647\u0627\u062A",
    "\u0641\u0644\u0644",
    "\u0634\u0642\u0642",
    "\u0625\u0642\u0627\u0645\u0629"
  ]);
  if (asksAccommodation) {
    const unit = matchAccommodation(text2);
    replies.push(unit ? getUnitReply(unit, lang) : getPriceListReply(lang));
  }
  const asksJetski = hasAny2(text2, [
    "jetski",
    "jet ski",
    "jet-ski",
    "jitski",
    "jtski",
    "water sports",
    "water sport",
    "\u062C\u062A\u0633\u0643\u064A",
    "\u0627\u0644\u0627\u0646\u0634\u0637\u0647 \u0627\u0644\u0628\u062D\u0631\u064A\u0647",
    "\u0627\u0646\u0634\u0637\u0647 \u0628\u062D\u0631\u064A\u0647"
  ]);
  const asksCafe = hasAny2(text2, [
    "cafe",
    "kafe",
    "caf\xE9",
    "coffee",
    "food",
    "restaurant",
    "eat",
    "eating",
    "\u0643\u0627\u0641\u064A\u0647",
    "\u0645\u0637\u0639\u0645",
    "\u0623\u0643\u0644",
    "\u0627\u0643\u0644"
  ]);
  if (asksJetski && asksCafe) {
    replies.push(
      lang === "ar" ? "\u0623\u0643\u064A\u062F \u2728 \u0641\u064A \u0644\u0627\u0641\u064A\u062F\u0627 \u062D\u064A\u0643\u0648\u0646 \u0641\u064A\u0647 \u0643\u0627\u0641\u064A\u0647 \u0648\u0645\u0646\u0637\u0642\u0629 \u0623\u0643\u0644\u060C \u0648\u0645\u0639\u0627\u0647\u0627 \u062A\u0623\u062C\u064A\u0631 \u062C\u062A\u0633\u0643\u064A \u0648\u0623\u0646\u0634\u0637\u0629 \u0628\u062D\u0631\u064A\u0629\u060C \u0648\u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u062D\u0646\u0639\u0644\u0646\u0648\u0647\u0627 \u0642\u0631\u064A\u0628\u0627\u064B." : "Yes \u2728 La Vida will include a beach cafe and food area, plus jetski rentals and water activities. Full details will be announced closer to opening."
    );
  } else if (asksJetski) {
    replies.push(
      lang === "ar" ? "\u0623\u0643\u064A\u062F \u2728 \u062A\u0623\u062C\u064A\u0631 \u0627\u0644\u062C\u062A\u0633\u0643\u064A \u0648\u0627\u0644\u0623\u0646\u0634\u0637\u0629 \u0627\u0644\u0628\u062D\u0631\u064A\u0629 \u062D\u064A\u0643\u0648\u0646\u0648\u0627 \u0645\u062A\u0648\u0641\u0631\u064A\u0646 \u0641\u064A \u0644\u0627\u0641\u064A\u062F\u0627\u060C \u0648\u062D\u0646\u0639\u0644\u0646\u0648\u0627 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0643\u0627\u0645\u0644\u0629 \u0642\u0631\u064A\u0628\u0627\u064B." : "Yes \u2728 Jet ski rentals and water activities will be available at La Vida. Full details will be announced closer to opening."
    );
  } else if (asksCafe) {
    replies.push(
      lang === "ar" ? "\u0623\u0643\u064A\u062F \u2728 \u0641\u064A \u0644\u0627\u0641\u064A\u062F\u0627 \u062D\u064A\u0643\u0648\u0646 \u0641\u064A\u0647 \u0643\u0627\u0641\u064A\u0647 \u0648\u0645\u0646\u0637\u0642\u0629 \u0623\u0643\u0644 \u0644\u0644\u0636\u064A\u0648\u0641 \u062E\u0644\u0627\u0644 \u0627\u0644\u0625\u0642\u0627\u0645\u0629." : "Yes \u2728 La Vida will include a beach caf\xE9 and food area for guests to enjoy during their stay."
    );
  }
  const asksCourts = hasAny2(text2, ["football", "soccer", "volleyball", "court", "courts", "\u0643\u0631\u0629", "\u0637\u0627\u0626\u0631\u0647", "\u0645\u0644\u0639\u0628"]);
  if (asksCourts) {
    replies.push(
      lang === "ar" ? "\u0623\u0643\u064A\u062F \u2728 \u0644\u0627\u0641\u064A\u062F\u0627 \u0641\u064A\u0647\u0627 \u0645\u0644\u0639\u0628 \u0643\u0631\u0629 \u0648\u0645\u0644\u0639\u0628 \u0637\u0627\u0626\u0631\u0629 \u0644\u0644\u0636\u064A\u0648\u0641." : "Yes \u2728 La Vida includes football and volleyball courts for guests."
    );
  }
  const asksPool = hasAny2(text2, ["pool", "swimming pool", "\u0645\u0633\u0628\u062D", "\u0633\u0628\u0627\u062D\u0647"]);
  if (asksPool) {
    replies.push(
      lang === "ar" ? "\u0623\u0643\u064A\u062F \u2728 \u0644\u0627\u0641\u064A\u062F\u0627 \u0641\u064A\u0647\u0627 \u0645\u0633\u0628\u062D\u060C \u0648\u0641\u0644\u0644 \u0627\u0644\u0640 VIP \u0641\u064A\u0647\u0627 \u0645\u0633\u0627\u0628\u062D \u062E\u0627\u0635\u0629." : "Yes \u2728 La Vida includes pool access, and VIP villas include private pools."
    );
  }
  const asksFamily = hasAny2(text2, ["kids", "children", "family", "families", "\u0627\u0637\u0641\u0627\u0644", "\u0627\u0644\u0639\u0627\u0626\u0644\u0647", "\u0639\u0627\u0626\u0644\u0627\u062A", "\u0639\u0627\u0626\u0644\u064A\u0647"]);
  if (asksFamily) {
    replies.push(
      lang === "ar" ? "\u0623\u0643\u064A\u062F \u2728 \u0644\u0627\u0641\u064A\u062F\u0627 \u0645\u0646\u0627\u0633\u0628\u0629 \u0644\u0644\u0639\u0627\u0626\u0644\u0627\u062A \u0648\u062D\u064A\u0643\u0648\u0646 \u0641\u064A\u0647\u0627 \u0623\u0646\u0634\u0637\u0629 \u0644\u0644\u0623\u0637\u0641\u0627\u0644 \u0648\u0645\u0633\u0627\u062D\u0627\u062A \u0645\u0631\u064A\u062D\u0629 \u0644\u0644\u0639\u0627\u0626\u0644\u0629." : "Yes \u2728 La Vida is family-friendly and will include kids activities and relaxing spaces for families."
    );
  }
  const asksNight = hasAny2(text2, [
    "night",
    "entertainment",
    "evening",
    "match",
    "world cup",
    "arcade",
    "\u0644\u064A\u0644",
    "\u062A\u0631\u0641\u064A\u0647",
    "\u0645\u0628\u0627\u0631\u064A\u0627\u062A",
    "\u0623\u0644\u0639\u0627\u0628"
  ]);
  if (asksNight) {
    replies.push(
      lang === "ar" ? "\u0644\u0627\u0641\u064A\u062F\u0627 \u062D\u062A\u0648\u0641\u0631 \u0623\u062C\u0648\u0627\u0621 \u0644\u064A\u0644\u064A\u0629 \u062D\u0644\u0648\u0629\u060C \u0645\u0634\u0627\u0647\u062F\u0629 \u0645\u0628\u0627\u0631\u064A\u0627\u062A\u060C \u0623\u0644\u0639\u0627\u0628 \u062A\u0631\u0641\u064A\u0647\u064A\u0629\u060C \u0648\u062A\u062C\u0627\u0631\u0628 \u0645\u0646\u0627\u0633\u0628\u0629 \u0644\u0644\u0639\u0627\u0626\u0644\u0627\u062A \u2728" : "La Vida will include evening entertainment, football match screenings, arcade-style activities, and family-friendly night experiences \u2728"
    );
  }
  const asksGeneralActivities = hasAny2(text2, [
    "activity",
    "activities",
    "things to do",
    "what activities",
    "what are your activity",
    "what else",
    "what can we do",
    "facilities",
    "entertainment",
    "water sports",
    "jetski",
    "football",
    "volleyball",
    "kids",
    "\u0646\u0634\u0627\u0637",
    "\u0646\u0634\u0627\u0637\u0627\u062A",
    "\u0623\u0646\u0634\u0637\u0629",
    "\u0627\u0644\u0627\u0646\u0634\u0637\u0629",
    "\u0634\u0646 \u0627\u0644\u0646\u0634\u0627\u0637\u0627\u062A",
    "\u0634\u0646 \u0639\u0646\u062F\u0643\u0645",
    "\u0634\u0646\u0648 \u0639\u0646\u062F\u0643\u0645",
    "\u0634\u0646 \u0641\u064A\u0647",
    "\u0634\u0646\u0648 \u0641\u064A\u0647",
    "\u0627\u0644\u0645\u0631\u0627\u0641\u0642"
  ]);
  if (asksGeneralActivities) {
    replies.push(
      lang === "ar" ? "\u0644\u0627\u0641\u064A\u062F\u0627 \u062D\u062A\u0648\u0641\u0631 \u0634\u0627\u0637\u0626\u060C \u0645\u0633\u0628\u062D\u060C \u0623\u0646\u0634\u0637\u0629 \u0628\u062D\u0631\u064A\u0629\u060C \u062A\u0623\u062C\u064A\u0631 \u062C\u062A\u0633\u0643\u064A\u060C \u0645\u0644\u0639\u0628 \u0643\u0631\u0629\u060C \u0645\u0644\u0639\u0628 \u0637\u0627\u0626\u0631\u0629\u060C \u0623\u0646\u0634\u0637\u0629 \u0644\u0644\u0623\u0637\u0641\u0627\u0644\u060C \u0643\u0627\u0641\u064A\u0647\u060C \u0648\u0623\u062C\u0648\u0627\u0621 \u0639\u0627\u0626\u0644\u064A\u0629 \u0631\u0627\u0642\u064A\u0629 \u2728" : "La Vida will offer beach access, pool, water sports, jet ski rentals, football and volleyball courts, kids activities, a beach caf\xE9, and relaxing family-friendly spaces \u2728"
    );
  }
  const asksGeneralResort = hasAny2(text2, [
    "what do you offer",
    "what do u offer",
    "what do you have",
    "what do u have",
    "tell me about",
    "tell me more",
    "i want to know more",
    "know more",
    "what else",
    "more details",
    "about la vida",
    "about the resort",
    "resort info",
    "information",
    "details",
    "\u0645\u0646\u062A\u062C\u0639",
    "\u0639\u0631\u0641\u0646\u064A",
    "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0643\u062B\u0631",
    "\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0643\u062B\u0631",
    "\u0645\u0645\u0643\u0646 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0643\u062B\u0631",
    "\u0634\u0646\u0648 \u0627\u0643\u062B\u0631",
    "\u0634\u0646 \u0628\u0639\u062F",
    "\u0634\u0646 \u0647\u0648 \u0627\u0644\u0645\u0646\u062A\u062C\u0639",
    "\u0634\u0646 \u062A\u0642\u062F\u0645\u0648\u0627",
    "\u0634\u0646 \u0639\u0646\u062F\u0643\u0645",
    "\u062A\u0641\u0627\u0635\u064A\u0644 \u0644\u0627\u0641\u064A\u062F\u0627",
    "\u0645\u0639\u0644\u0648\u0645\u0627\u062A"
  ]);
  if (asksGeneralResort) {
    replies.push(
      lang === "ar" ? "\u0644\u0627\u0641\u064A\u062F\u0627 \u0631\u064A\u0632\u0648\u0631\u062A \u0622\u0646\u062F \u0628\u064A\u062A\u0634 \u0643\u0644\u0648\u0628 \u0645\u0646\u062A\u062C\u0639 \u0641\u0627\u062E\u0631 \u0639\u0644\u0649 \u0627\u0644\u0628\u062D\u0631 \u0641\u064A \u0632\u0648\u0627\u0631\u0629\u060C \u0641\u064A\u0647 \u0641\u0644\u0644 \u0648\u0634\u0627\u0644\u064A\u0647\u0627\u062A \u0648\u0634\u0642\u0642 \u0641\u0646\u062F\u0642\u064A\u0629 \u0648\u0645\u0633\u0627\u0628\u062D \u0648\u0623\u0646\u0634\u0637\u0629 \u0628\u062D\u0631\u064A\u0629 \u0648\u0643\u0627\u0641\u064A\u0647 \u0648\u0623\u062C\u0648\u0627\u0621 \u0639\u0627\u0626\u0644\u064A\u0629 \u0631\u0627\u0642\u064A\u0629 \u2728" : "La Vida Resort & Beach Club is a luxury beachfront resort in Zuwarah with villas, chalets, hotel apartments, pools, water activities, a beach caf\xE9, and a calm family-friendly atmosphere \u2728"
    );
  }
  const asksMoreGeneric = hasAny2(text2, [
    "tell me more",
    "i want to know more",
    "know more",
    "what else",
    "more details",
    "\u0645\u0645\u0643\u0646 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0643\u062B\u0631",
    "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0643\u062B\u0631",
    "\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0643\u062B\u0631",
    "\u0634\u0646\u0648 \u0627\u0643\u062B\u0631",
    "\u0634\u0646 \u0628\u0639\u062F"
  ]);
  if (asksMoreGeneric && replies.length === 0) {
    replies.push(
      lang === "ar" ? "\u0623\u0643\u064A\u062F \u2728 \u062A\u062D\u0628\u0648\u0627 \u062A\u0639\u0631\u0641\u0648\u0627 \u0623\u0643\u062B\u0631 \u0639\u0644\u0649 \u0627\u0644\u063A\u0631\u0641\u060C \u0627\u0644\u0623\u0646\u0634\u0637\u0629\u060C \u0627\u0644\u062D\u062C\u0632\u060C \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0644\u0627 \u0627\u0644\u0645\u0631\u0627\u0641\u0642\u061F" : "Of course \u2728 What would you like to know more about? Rooms, activities, booking, location, or facilities?"
    );
  }
  const uniqueReplies = Array.from(new Set(replies));
  if (uniqueReplies.length === 0) return void 0;
  return uniqueReplies.slice(0, 3).join("\n");
}

// api/whatsapp-webhook.ts
var app = new Hono();
app.get("/webhook", async (c) => {
  const mode = c.req.query("hub.mode");
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");
  if (mode === "subscribe" && token === env.whatsappVerifyToken) {
    return c.text(challenge ?? "OK");
  }
  return c.json({ error: "Verification failed" }, 403);
});
app.post("/webhook", async (c) => {
  try {
    const body = await c.req.json();
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        if (!value?.messages?.length) continue;
        for (const msg of value.messages) {
          await handleIncomingMessage(msg);
        }
      }
    }
    return c.json({ success: true });
  } catch (err) {
    console.error("WhatsApp webhook error:", err);
    return c.json({ error: "Internal error" }, 500);
  }
});
async function handleIncomingMessage(msg) {
  const from = msg.from;
  const text2 = msg.text?.body ?? "";
  const messageId = msg.id;
  if (!from || !text2) return;
  if (messageId) {
    await markWhatsAppMessageAsRead(messageId);
  }
  const db = getDb();
  const lang = detectLanguage(text2);
  let lead = await db.query.leads.findFirst({
    where: eq6(leads.phone, from)
  });
  if (!lead) {
    const result = await db.insert(leads).values({
      source: "whatsapp",
      phone: from,
      language: lang,
      status: "new",
      interest: "general"
    });
    const newId = Number(result[0].insertId);
    lead = { id: newId, source: "whatsapp", phone: from, language: lang, status: "new", interest: "general" };
  }
  const leadId = lead.id;
  await db.insert(messages).values({
    leadId,
    platform: "whatsapp",
    direction: "inbound",
    messageId,
    fromNumber: from,
    toNumber: env.whatsappPhoneNumberId ?? "",
    body: text2,
    status: "read"
  });
  let replyText = "";
  const trimmedText = text2.trim();
  if (/^[1-5]$/.test(trimmedText)) {
    replyText = getResponseByChoice(trimmedText, lang);
  } else if (/^(مرحب|سلام|هاي|hello|hi|hey)/i.test(trimmedText)) {
    replyText = `${getGreeting("whatsapp", lang)}

${getMenu("whatsapp", lang)}`;
  } else {
    const recentMessages = await db.query.messages.findMany({
      where: and5(eq6(messages.leadId, leadId), eq6(messages.platform, "whatsapp")),
      orderBy: [desc5(messages.createdAt)],
      limit: 5
    });
    const history = recentMessages.reverse().map((m) => ({
      role: m.direction === "inbound" ? "user" : "assistant",
      content: m.body
    }));
    const aiResult = await generateAIResponse(text2, history, lang);
    replyText = aiResult.text;
  }
  const sendResult = await sendWhatsAppMessage(from, replyText, messageId);
  if (sendResult.success) {
    await db.insert(messages).values({
      leadId,
      platform: "whatsapp",
      direction: "outbound",
      messageId: sendResult.messageId,
      fromNumber: env.whatsappPhoneNumberId ?? "",
      toNumber: from,
      body: replyText,
      status: "sent"
    });
  }
}
var whatsapp_webhook_default = app;

// api/twilio-webhook.ts
import { Hono as Hono2 } from "hono";
import { eq as eq7 } from "drizzle-orm";
var app2 = new Hono2();
app2.post("/voice", async (c) => {
  const body = await c.req.parseBody();
  const callSid = body.CallSid;
  const fromNumber = body.From;
  const toNumber = body.To;
  const db = getDb();
  let lead = await db.query.leads.findFirst({
    where: eq7(leads.phone, fromNumber)
  });
  let leadId;
  if (!lead) {
    const result = await db.insert(leads).values({
      source: "phone",
      phone: fromNumber,
      language: "ar",
      status: "new",
      interest: "general"
    });
    leadId = Number(result[0].insertId);
  } else {
    leadId = lead.id;
  }
  await db.insert(calls).values({
    callSid,
    fromNumber,
    toNumber,
    status: "initiated",
    leadId
  });
  const twiml = buildIVRTwiML("ar");
  return new Response(twiml, {
    headers: { "Content-Type": "text/xml" }
  });
});
app2.post("/voice/menu", async (c) => {
  const body = await c.req.parseBody();
  const digits = body.Digits ?? "";
  const callSid = body.CallSid;
  const db = getDb();
  const callRecord = await db.query.calls.findFirst({
    where: eq7(calls.callSid, callSid)
  });
  if (callRecord) {
    await db.update(calls).set({ menuChoice: digits }).where(eq7(calls.id, callRecord.id));
  }
  const lang = callRecord?.language ?? "ar";
  const twiml = buildMenuResponseTwiML(digits, lang, callSid);
  return new Response(twiml, {
    headers: { "Content-Type": "text/xml" }
  });
});
app2.post("/voice/voicemail", async (c) => {
  const body = await c.req.parseBody();
  const callSid = body.CallSid;
  const recordingUrl = body.RecordingUrl;
  const db = getDb();
  const callRecord = await db.query.calls.findFirst({
    where: eq7(calls.callSid, callSid)
  });
  if (callRecord) {
    await db.update(calls).set({
      status: "voicemail",
      recordingUrl,
      endedAt: /* @__PURE__ */ new Date()
    }).where(eq7(calls.id, callRecord.id));
  }
  const lang = callRecord?.language ?? "ar";
  const goodbye = lang === "ar" ? PhonePrompts.goodbye_ar : PhonePrompts.goodbye_en;
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${lang === "ar" ? "ar-SA" : "en-US"}">${goodbye}</Say>
  <Hangup/>
</Response>`;
  return new Response(twiml, {
    headers: { "Content-Type": "text/xml" }
  });
});
app2.post("/voice/status", async (c) => {
  const body = await c.req.parseBody();
  const callSid = body.CallSid;
  const callStatus = body.CallStatus;
  const callDuration = body.CallDuration;
  const statusMap = {
    completed: "completed",
    busy: "busy",
    failed: "failed",
    noanswer: "no_answer",
    canceled: "no_answer"
  };
  const db = getDb();
  const callRecord = await db.query.calls.findFirst({
    where: eq7(calls.callSid, callSid)
  });
  if (callRecord) {
    await db.update(calls).set({
      status: statusMap[callStatus] ?? callStatus,
      duration: parseInt(callDuration ?? "0", 10) || 0,
      endedAt: /* @__PURE__ */ new Date()
    }).where(eq7(calls.id, callRecord.id));
  }
  return c.json({ success: true });
});
function buildIVRTwiML(lang) {
  const welcome = lang === "ar" ? PhonePrompts.welcome_ar : PhonePrompts.welcome_en;
  const menu = lang === "ar" ? PhonePrompts.menu_ar : PhonePrompts.menu_en;
  const noInput = lang === "ar" ? PhonePrompts.no_input_ar : PhonePrompts.no_input_en;
  const actionUrl = `${env.webhookBaseUrl}/api/twilio/voice/menu`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather action="${actionUrl}" method="POST" numDigits="1" timeout="5">
    <Say voice="alice" language="${lang === "ar" ? "ar-SA" : "en-US"}">${welcome} ${menu}</Say>
  </Gather>
  <Say voice="alice" language="${lang === "ar" ? "ar-SA" : "en-US"}">${noInput}</Say>
  <Hangup/>
</Response>`;
}
function buildMenuResponseTwiML(digits, lang, callSid) {
  const prompts = {
    "1": { ar: PhonePrompts.option_1_ar, en: PhonePrompts.option_1_en },
    "2": { ar: PhonePrompts.option_2_ar, en: PhonePrompts.option_2_en },
    "3": { ar: PhonePrompts.option_3_ar, en: PhonePrompts.option_3_en },
    "4": { ar: PhonePrompts.option_4_ar, en: PhonePrompts.option_4_en },
    "5": { ar: PhonePrompts.option_5_ar, en: PhonePrompts.option_5_en }
  };
  const selected = prompts[digits];
  const text2 = selected ? selected[lang] : lang === "ar" ? PhonePrompts.fallback_ar : PhonePrompts.fallback_en;
  const goodbye = lang === "ar" ? PhonePrompts.goodbye_ar : PhonePrompts.goodbye_en;
  const voicemailUrl = `${env.webhookBaseUrl}/api/twilio/voice/voicemail`;
  const dialNumber = env.ownerPhoneNumber;
  if (digits === "5" && dialNumber) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${lang === "ar" ? "ar-SA" : "en-US"}">${text2}</Say>
  <Dial timeout="15" action="${voicemailUrl}">${dialNumber}</Dial>
</Response>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${lang === "ar" ? "ar-SA" : "en-US"}">${text2}</Say>
  <Say voice="alice" language="${lang === "ar" ? "ar-SA" : "en-US"}">${goodbye}</Say>
  <Hangup/>
</Response>`;
}
var twilio_webhook_default = app2;

// api/messenger-webhook.ts
import { Hono as Hono3 } from "hono";

// api/lib/messenger.ts
var MESSENGER_API_BASE = "https://graph.facebook.com/v18.0";
async function sendMessengerMessage(recipientId, text2) {
  if (!env.messengerPageAccessToken) {
    return { success: false, error: "Messenger not configured" };
  }
  const url = `${MESSENGER_API_BASE}/me/messages?access_token=${env.messengerPageAccessToken}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_type: "RESPONSE",
        recipient: { id: recipientId },
        message: { text: text2 }
      })
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error?.message ?? `HTTP ${res.status}` };
    }
    return { success: true, messageId: data.message_id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// api/messenger-webhook.ts
import nodemailer from "nodemailer";
var app3 = new Hono3();
var senderSessions = /* @__PURE__ */ new Map();
var recentMessageIds = /* @__PURE__ */ new Map();
var DUPLICATE_WINDOW_MS = 2 * 60 * 1e3;
var MAX_HISTORY_ITEMS = 20;
function detectMessageLanguage3(message) {
  if (/[\u0600-\u06FF]/.test(message)) return "ar";
  return detectLanguage(message);
}
function normalizeInput(input) {
  return input.toLowerCase().normalize("NFKC").replace(/[أإآ]/g, "\u0627").replace(/ى/g, "\u064A").replace(/ة/g, "\u0647").replace(/[ً-ْ]/g, "").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\bresturent\b/g, "restaurant").replace(/\bresturant\b/g, "restaurant").replace(/\bjet\s*ski\b/g, "jetski").replace(/\bjitski\b/g, "jetski").replace(/\bjtski\b/g, "jetski").replace(/\bas3ar\b/g, "prices").replace(/\b7ajz\b/g, "booking").replace(/\bsheno\b|\bshno\b|\bshn\b/g, "\u0634\u0646\u0648").replace(/\bwen\b|\bween\b/g, "\u0648\u064A\u0646").replace(/\s+/g, " ").trim();
}
function hasAny3(text2, keywords) {
  return keywords.some((keyword) => text2.includes(keyword));
}
function detectAccommodationType(text2) {
  const unit = matchAccommodation(text2);
  if (unit) return accommodationBookingLabel(unit);
  return void 0;
}
function extractPhone(text2) {
  const match = text2.match(/(\+?\d[\d\s-]{7,}\d)/);
  return match?.[1]?.replace(/\s+/g, " ").trim();
}
function extractGuestCount2(text2) {
  const rangeMatch = text2.match(/\b(\d{1,2})\s*[/-]\s*(\d{1,2})\b/);
  if (rangeMatch?.[2]) return rangeMatch[2];
  const digitMatch = text2.match(/\b(\d{1,2})\s*(guest|guests|people|persons|شخص|اشخاص|أشخاص)?\b/i);
  if (digitMatch?.[1]) return digitMatch[1];
  return void 0;
}
function extractDate(text2) {
  const fromTo = text2.match(
    /(من\s+\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\s+الى\s+\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)|(from\s+\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\s+to\s+\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)/i
  )?.[0];
  if (fromTo) return fromTo;
  const first = text2.match(/\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/g);
  if (first?.length) return first.join(" to ");
  return void 0;
}
function extractName(text2) {
  const en = text2.match(/(?:my name is|name is)\s+([a-z][a-z\s'-]{1,40})/i)?.[1];
  if (en) return en.trim();
  const ar = text2.match(/(?:اسمي|الاسم)\s*[:-]?\s*([^\d\n]{2,40})/)?.[1];
  if (ar) return ar.trim();
  if (!extractPhone(text2) && text2.trim().split(/\s+/).length <= 4 && /[a-zA-Z\u0600-\u06FF]/.test(text2)) {
    return text2.trim();
  }
  return void 0;
}
function detectIntents(text2) {
  const intents = [];
  const push = (intent, matched) => {
    if (matched && !intents.includes(intent)) intents.push(intent);
  };
  push("prices", hasAny3(text2, ["price", "prices", "how much", "cost", "rates", "\u0628\u0643\u0645", "\u0642\u062F\u0627\u0634", "\u0633\u0639\u0631", "\u0627\u0633\u0639\u0627\u0631", "\u0627\u0644\u0627\u0633\u0639\u0627\u0631"]));
  push("booking", hasAny3(text2, ["book", "booking", "reservation", "availability", "\u062D\u062C\u0632", "\u0627\u0644\u062D\u062C\u0632", "\u0646\u062D\u062C\u0632", "\u0645\u062A\u0627\u062D"]));
  push("opening", hasAny3(text2, ["opening", "when open", "opening date", "\u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D", "\u0645\u062A\u0649 \u062A\u0641\u062A\u062D\u0648", "\u0645\u0648\u0639\u062F \u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D"]));
  push("rooms", hasAny3(text2, ["room", "rooms", "villa", "villas", "chalet", "chalets", "apartment", "accommodation", "\u0627\u0644\u063A\u0631\u0641", "\u0641\u0644\u0644", "\u0634\u0627\u0644\u064A\u0647\u0627\u062A", "\u0634\u0642\u0642"]));
  push("private_pool", hasAny3(text2, ["private pool", "\u0645\u0633\u0628\u062D \u062E\u0627\u0635"]));
  push("jetski", hasAny3(text2, ["jetski", "water sports", "\u062C\u062A\u0633\u0643\u064A", "\u0627\u0646\u0634\u0637\u0647 \u0628\u062D\u0631\u064A\u0647", "\u0623\u0646\u0634\u0637\u0629 \u0628\u062D\u0631\u064A\u0629"]));
  push("cafe_food", hasAny3(text2, ["cafe", "caf\xE9", "food", "restaurant", "\u0645\u0637\u0639\u0645", "\u0645\u0637\u0627\u0639\u0645", "\u0643\u0627\u0641\u064A\u0647", "\u0627\u0643\u0644", "\u0623\u0643\u0644"]));
  push("supermarket", hasAny3(text2, ["supermarket", "market", "grocery", "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A", "\u0628\u0642\u0627\u0644\u0647", "\u0628\u0642\u0627\u0644\u0629"]));
  push("pool", hasAny3(text2, ["pool", "swimming pool", "\u0645\u0633\u0628\u062D"]));
  push("football_volleyball", hasAny3(text2, ["football", "soccer", "volleyball", "court", "\u0645\u0644\u0639\u0628", "\u0643\u0631\u0629", "\u0637\u0627\u0626\u0631\u0647", "\u0637\u0627\u0626\u0631\u0629"]));
  push("kids", hasAny3(text2, ["kids", "children", "family", "families", "\u0627\u0637\u0641\u0627\u0644", "\u0627\u0644\u0639\u0627\u0626\u0644\u0647", "\u0639\u0627\u0626\u0644\u0627\u062A", "\u0639\u0627\u0626\u0644\u064A\u0629"]));
  push("night_activities", hasAny3(text2, ["night", "entertainment", "world cup", "arcade", "\u0644\u064A\u0644", "\u062A\u0631\u0641\u064A\u0647", "\u0645\u0628\u0627\u0631\u064A\u0627\u062A", "\u0623\u0644\u0639\u0627\u0628"]));
  push("location", hasAny3(text2, ["location", "address", "maps", "where", "\u0648\u064A\u0646", "\u0645\u0648\u0642\u0639", "\u0627\u0644\u0639\u0646\u0648\u0627\u0646", "\u0632\u0648\u0627\u0631\u0629"]));
  push("contact", hasAny3(text2, ["phone", "contact", "number", "call", "whatsapp", "\u0648\u0627\u062A\u0633\u0627\u0628", "\u0631\u0642\u0645", "\u062A\u0648\u0627\u0635\u0644"]));
  push("photos", hasAny3(text2, ["photo", "photos", "image", "gallery", "\u0635\u0648\u0631"]));
  push("thanks", hasAny3(text2, ["thanks", "thank you", "\u0634\u0643\u0631\u0627", "\u064A\u0633\u0644\u0645\u0648", "\u062A\u0633\u0644\u0645"]));
  push("greeting", hasAny3(text2, ["hi", "hello", "hey", "\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645", "\u0633\u0644\u0627\u0645", "\u0645\u0631\u062D\u0628\u0627", "\u0627\u0647\u0644\u0627"]));
  push("human_handoff", hasAny3(text2, ["human", "agent", "manager", "admin", "complaint", "problem", "\u0645\u0648\u0638\u0641", "\u0627\u0644\u0625\u062F\u0627\u0631\u0629", "\u0645\u0634\u0643\u0644\u0629"]));
  push("offers", hasAny3(text2, ["offer", "offers", "promo", "discount", "\u0639\u0631\u0648\u0636", "\u062E\u0635\u0645", "\u062A\u062E\u0641\u064A\u0636"]));
  push("included", hasAny3(text2, ["included", "what is included", "services included", "\u0645\u0634\u0645\u0648\u0644", "\u0627\u0644\u062E\u062F\u0645\u0627\u062A", "\u0634\u0646 \u0645\u0634\u0645\u0648\u0644"]));
  push("general", hasAny3(text2, ["what do you offer", "tell me more", "what else", "\u0645\u0645\u0643\u0646 \u0645\u0639\u0644\u0648\u0645\u0627\u062A", "\u0645\u0639\u0644\u0648\u0645\u0627\u062A", "\u062A\u0641\u0627\u0635\u064A\u0644", "\u0634\u0646\u0648 \u0639\u0646\u062F\u0643\u0645"]));
  return intents;
}
function replyForIntent(intent, lang, messageText) {
  if (intent === "prices") return getPriceListReply(lang);
  if (intent === "offers") return getOffersReply(lang);
  if (intent === "included") return getIncludedServicesReply(lang);
  if (intent === "booking") return getBookingInterestPrompt(lang);
  if (intent === "opening") return lang === "ar" ? "\u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D \u0627\u0644\u0631\u0633\u0645\u064A \u064A\u0648\u0645 1 \u064A\u0648\u0646\u064A\u0648 2026 \u2728" : "La Vida officially opens on June 1 2026 \u2728";
  if (intent === "photos") {
    return lang === "ar" ? "\u062D\u0627\u0644\u064A\u0627\u064B \u0627\u0644\u0635\u0648\u0631 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0627\u0644\u0634\u0627\u0644\u064A\u0647\u0627\u062A \u0648\u0627\u0644\u0645\u0646\u062A\u062C\u0639 \u0645\u0634 \u0645\u062A\u0648\u0641\u0631\u0629 \u0639\u0646\u062F\u0646\u0627 \u062A\u0648\u0627 \u2728 \u0648\u062D\u0646\u0634\u0627\u0631\u0643\u0648\u0627 \u0643\u0644 \u0627\u0644\u0635\u0648\u0631 \u0648\u0627\u0644\u062A\u062D\u062F\u064A\u062B\u0627\u062A \u0627\u0644\u0628\u0635\u0631\u064A\u0629 \u0642\u0631\u064A\u0628\u0627\u064B \u0645\u0639 \u0645\u0648\u0639\u062F \u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D \u0648\u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0627\u0644\u0631\u0633\u0645\u064A \u0644\u0644\u062D\u062C\u0632" : "Official chalet and resort images are not available yet \u2728 Photos and visual updates will be shared closer to opening and the official booking announcement";
  }
  if (intent === "location") return lang === "ar" ? "\u0644\u0627\u0641\u064A\u062F\u0627 \u0645\u0648\u062C\u0648\u062F\u0629 \u0641\u064A \u0632\u0648\u0627\u0631\u0629 \u0644\u064A\u0628\u064A\u0627 \u2728 lavidaresort.ly" : "La Vida is located in Zuwarah Libya \u2728 lavidaresort.ly";
  if (intent === "contact") {
    return lang === "ar" ? "\u062A\u0642\u062F\u0631\u0648\u0627 \u062A\u062A\u0648\u0627\u0635\u0644\u0648\u0627 \u0645\u0639 \u0644\u0627\u0641\u064A\u062F\u0627 \u0639\u0644\u0649\n093 888 8868\n093 888 8878 \u2728" : "You can contact La Vida on\n093 888 8868\n093 888 8878 \u2728";
  }
  if (intent === "jetski") return lang === "ar" ? "\u0623\u0643\u064A\u062F \u2728 \u0627\u0644\u062C\u062A\u0633\u0643\u064A \u0648\u0627\u0644\u0623\u0646\u0634\u0637\u0629 \u0627\u0644\u0628\u062D\u0631\u064A\u0629 \u0645\u062A\u0648\u0641\u0631\u0629 \u0641\u064A \u0644\u0627\u0641\u064A\u062F\u0627." : "Yes \u2728 Jet ski and water sports are available at La Vida.";
  if (intent === "cafe_food") return lang === "ar" ? "\u0623\u0643\u064A\u062F \u2728 \u0641\u064A \u0644\u0627\u0641\u064A\u062F\u0627 \u0643\u0627\u0641\u064A\u0647 \u0634\u0627\u0637\u0626\u064A \u0648\u0645\u0646\u0637\u0642\u0629 \u0623\u0643\u0644." : "Yes \u2728 La Vida has a beach caf\xE9 and food area.";
  if (intent === "rooms") {
    const unit = messageText ? matchAccommodation(normalizeInput(messageText)) : void 0;
    return unit ? getUnitReply(unit, lang) : getPriceListReply(lang);
  }
  if (intent === "private_pool") return lang === "ar" ? "\u0646\u0639\u0645 \u2728 \u0641\u0644\u0644 VIP \u0648\u0627\u0644\u0641\u0644\u0644 \u0627\u0644\u0631\u0626\u0627\u0633\u064A\u0629 \u0641\u064A\u0647\u0627 \u0645\u0633\u0627\u0628\u062D \u062E\u0627\u0635\u0629." : "Yes \u2728 VIP and presidential villas include private pools.";
  if (intent === "supermarket") return lang === "ar" ? "\u0623\u0643\u064A\u062F \u2728 \u0645\u062A\u0648\u0641\u0631 \u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0636\u0645\u0646 \u0627\u0644\u062E\u062F\u0645\u0627\u062A." : "Yes \u2728 A supermarket is available within resort services.";
  if (intent === "pool") return lang === "ar" ? "\u0623\u0643\u064A\u062F \u2728 \u0641\u064A \u0645\u0633\u0628\u062D \u0643\u0628\u064A\u0631 \u062F\u0627\u062E\u0644 \u0627\u0644\u0645\u0646\u062A\u062C\u0639." : "Yes \u2728 There is a large pool in the resort.";
  if (intent === "football_volleyball") return lang === "ar" ? "\u0623\u0643\u064A\u062F \u2728 \u0639\u0646\u062F\u0646\u0627 \u0645\u0644\u0639\u0628 \u0643\u0631\u0629 \u0648\u0645\u0644\u0639\u0628 \u0637\u0627\u0626\u0631\u0629." : "Yes \u2728 We have football and volleyball courts.";
  if (intent === "kids") return lang === "ar" ? "\u0644\u0627\u0641\u064A\u062F\u0627 \u0645\u0646\u0627\u0633\u0628\u0629 \u0644\u0644\u0639\u0627\u0626\u0644\u0627\u062A \u0648\u0641\u064A\u0647\u0627 \u0623\u0646\u0634\u0637\u0629 \u0644\u0644\u0623\u0637\u0641\u0627\u0644 \u2728" : "La Vida is family friendly with kids activities \u2728";
  if (intent === "night_activities") return lang === "ar" ? "\u0641\u064A\u0647 \u062A\u0631\u0641\u064A\u0647 \u0644\u064A\u0644\u064A\u060C \u0645\u0634\u0627\u0647\u062F\u0629 \u0645\u0628\u0627\u0631\u064A\u0627\u062A\u060C \u0648\u0623\u0644\u0639\u0627\u0628 \u0634\u0628\u0627\u0628\u064A\u0629 \u2728" : "There is night entertainment, match screenings, and youth arcade activities \u2728";
  if (intent === "human_handoff") return lang === "ar" ? "\u0623\u0643\u064A\u062F \u2728 \u0623\u062D\u062F \u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0641\u0631\u064A\u0642 \u062D\u064A\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0627\u0643\u0645 \u0642\u0631\u064A\u0628\u0627\u064B." : "Of course \u2728 A team member will reach out shortly.";
  if (intent === "thanks") return lang === "ar" ? "\u062A\u062D\u062A \u0623\u0645\u0631\u0643\u0645 \u0641\u064A \u0623\u064A \u0648\u0642\u062A \u2728" : "Always happy to help \u2728";
  if (intent === "greeting") return lang === "ar" ? "\u0623\u0647\u0644\u0627\u064B \u0648\u0633\u0647\u0644\u0627\u064B \u0628\u0643\u0645 \u0641\u064A La Vida \u2728 \u0643\u064A\u0641 \u0646\u0642\u062F\u0631 \u0646\u0633\u0627\u0639\u062F\u0643\u0645\u061F" : "Welcome to La Vida \u2728 How can we help you today?";
  if (intent === "general") {
    return lang === "ar" ? "\u0644\u0627\u0641\u064A\u062F\u0627 \u0645\u0646\u062A\u062C\u0639 \u0641\u0627\u062E\u0631 \u0639\u0644\u0649 \u0627\u0644\u0628\u062D\u0631 \u0641\u064A \u0632\u0648\u0627\u0631\u0629 \u0641\u064A\u0647 \u0625\u0642\u0627\u0645\u0629 \u0645\u062A\u0646\u0648\u0639\u0629 \u0648\u0623\u0646\u0634\u0637\u0629 \u0628\u062D\u0631\u064A\u0629 \u0648\u0643\u0627\u0641\u064A\u0647 \u0648\u0645\u0631\u0627\u0641\u0642 \u0639\u0627\u0626\u0644\u064A\u0629 \u2728" : "La Vida is a luxury beachfront resort in Zuwarah with varied stays, water activities, caf\xE9 options, and family-friendly facilities \u2728";
  }
  return void 0;
}
function bookingPrompt(lang) {
  return lang === "ar" ? "\u0645\u0645\u062A\u0627\u0632 \u2728 \u062E\u0644\u0648\u0646\u0627 \u0646\u0643\u0645\u0644 \u0637\u0644\u0628 \u0627\u0644\u062D\u062C\u0632 \u0627\u0644\u0645\u0628\u062F\u0626\u064A. \u0627\u0628\u0639\u062A \u0627\u0644\u0627\u0633\u0645\u060C \u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641\u060C \u0646\u0648\u0639 \u0627\u0644\u0625\u0642\u0627\u0645\u0629\u060C \u0639\u062F\u062F \u0627\u0644\u0636\u064A\u0648\u0641\u060C \u0648\u0627\u0644\u062A\u0627\u0631\u064A\u062E." : "Great \u2728 Let\u2019s complete your booking interest. Please share name, phone, accommodation type, guest count, and preferred date.";
}
function bookingSummary(interest, lang) {
  if (lang === "ar") {
    return `\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0637\u0644\u0628 \u0627\u0644\u062D\u062C\u0632 \u0627\u0644\u0645\u0628\u062F\u0626\u064A \u2728
\u0627\u0644\u0627\u0633\u0645: ${interest.name ?? "-"}
\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641: ${interest.phone ?? "-"}
\u0646\u0648\u0639 \u0627\u0644\u0625\u0642\u0627\u0645\u0629: ${interest.accommodation ?? "-"}
\u0639\u062F\u062F \u0627\u0644\u0636\u064A\u0648\u0641: ${interest.guests ?? "-"}
\u0627\u0644\u062A\u0627\u0631\u064A\u062E: ${interest.date ?? "-"}
\u0641\u0631\u064A\u0642 \u0644\u0627\u0641\u064A\u062F\u0627 \u062D\u064A\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0627\u0643\u0645 \u0639\u0646\u062F \u0641\u062A\u062D \u0627\u0644\u062D\u062C\u0632`;
  }
  return `Your booking interest has been received \u2728
Name: ${interest.name ?? "-"}
Phone: ${interest.phone ?? "-"}
Accommodation: ${interest.accommodation ?? "-"}
Guests: ${interest.guests ?? "-"}
Date: ${interest.date ?? "-"}
The La Vida team will contact you once booking opens`;
}
async function sendBookingInterestEmail(interest, senderId, history) {
  if (!env.smtpHost || !env.smtpPort || !env.smtpUser || !env.smtpPass) {
    console.error("EMAIL FAILED", "SMTP config missing");
    return false;
  }
  try {
    const transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: Number(env.smtpPort),
      secure: Number(env.smtpPort) === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass
      }
    });
    const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
    const formattedHistory = history.map((item) => `${new Date(item.timestamp).toISOString()} [${item.role}] ${item.content}`).join("\n");
    await transporter.sendMail({
      from: `"La Vida AI" <${env.smtpUser}>`,
      to: "info@lavidaresort.ly",
      subject: "New Booking Interest - La Vida AI",
      text: [
        "New booking interest received from Messenger.",
        "",
        `Name: ${interest.name ?? "-"}`,
        `Phone number: ${interest.phone ?? "-"}`,
        `Accommodation type: ${interest.accommodation ?? "-"}`,
        `Guest count: ${interest.guests ?? "-"}`,
        `Preferred dates: ${interest.date ?? "-"}`,
        `Notes: ${interest.notes ?? "-"}`,
        `Messenger sender ID: ${senderId}`,
        `Timestamp: ${timestamp2}`,
        "",
        "Full conversation history:",
        formattedHistory || "-"
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222">
          <h2>New Booking Interest - La Vida AI</h2>
          <p>A new booking interest was received from Messenger.</p>
          <table cellpadding="6" cellspacing="0" border="0">
            <tr><td><strong>Name</strong></td><td>${interest.name ?? "-"}</td></tr>
            <tr><td><strong>Phone number</strong></td><td>${interest.phone ?? "-"}</td></tr>
            <tr><td><strong>Accommodation type</strong></td><td>${interest.accommodation ?? "-"}</td></tr>
            <tr><td><strong>Guest count</strong></td><td>${interest.guests ?? "-"}</td></tr>
            <tr><td><strong>Preferred dates</strong></td><td>${interest.date ?? "-"}</td></tr>
            <tr><td><strong>Notes</strong></td><td>${interest.notes ?? "-"}</td></tr>
            <tr><td><strong>Messenger sender ID</strong></td><td>${senderId}</td></tr>
            <tr><td><strong>Timestamp</strong></td><td>${timestamp2}</td></tr>
          </table>
          <h3>Conversation History</h3>
          <pre>${formattedHistory || "-"}</pre>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error("EMAIL FAILED", error);
    return false;
  }
}
function bookingMissingPrompt(missing, lang) {
  if (lang === "ar") {
    return `\u0645\u0645\u062A\u0627\u0632 \u2728 \u0628\u0627\u0642\u064A \u0641\u0642\u0637: ${missing.join("\u060C ")}.`;
  }
  return `Great \u2728 I still need: ${missing.join(", ")}.`;
}
function updateBookingData(bookingData, rawText, normalizedText) {
  const updated = { ...bookingData };
  updated.name = updated.name ?? extractName(rawText);
  updated.phone = updated.phone ?? extractPhone(rawText);
  updated.accommodation = updated.accommodation ?? detectAccommodationType(normalizedText);
  updated.guests = updated.guests ?? extractGuestCount2(normalizedText);
  updated.date = updated.date ?? extractDate(rawText);
  if (!updated.notes && rawText.length > 10 && !updated.name && !updated.phone && !updated.date && !updated.guests) {
    updated.notes = rawText;
  }
  return updated;
}
function bookingMissingFields(data, lang) {
  const missing = [];
  if (!data.name) missing.push(lang === "ar" ? "\u0627\u0644\u0627\u0633\u0645" : "name");
  if (!data.phone) missing.push(lang === "ar" ? "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641" : "phone");
  if (!data.accommodation) missing.push(lang === "ar" ? "\u0646\u0648\u0639 \u0627\u0644\u0625\u0642\u0627\u0645\u0629" : "accommodation");
  if (!data.guests) missing.push(lang === "ar" ? "\u0639\u062F\u062F \u0627\u0644\u0636\u064A\u0648\u0641" : "guests");
  if (!data.date) missing.push(lang === "ar" ? "\u0627\u0644\u062A\u0627\u0631\u064A\u062E" : "date");
  return missing;
}
function isBookingDataMessage(rawText, normalizedText) {
  return Boolean(
    extractPhone(rawText) || extractDate(rawText) || extractGuestCount2(normalizedText) || extractName(rawText) || detectAccommodationType(normalizedText)
  );
}
function getSession(senderId, lang) {
  const existing = senderSessions.get(senderId);
  if (existing) return existing;
  const created = {
    senderId,
    lastIntent: "general",
    lastTopic: "general",
    language: lang,
    bookingState: "idle",
    bookingData: {},
    history: []
  };
  senderSessions.set(senderId, created);
  return created;
}
function addSessionMessage(session, role, content) {
  session.history.push({ role, content, timestamp: Date.now() });
  if (session.history.length > MAX_HISTORY_ITEMS) {
    session.history = session.history.slice(-MAX_HISTORY_ITEMS);
  }
}
function hasFollowUpPrompt(text2) {
  return /^(ok|okay|tell me more|more|details|when|what else|and\??|i want to know more|شنو اكثر|شنو اكتر|زيد|زيدني|وضح|وضّح|more details|امتى|متى|وبعدين|شن بعد)$/i.test(
    text2.trim()
  );
}
function composeMultiIntentReply(intents, lang, messageText) {
  const mapped = intents.map((intent) => replyForIntent(intent, lang, messageText)).filter((value) => Boolean(value));
  const unique = Array.from(new Set(mapped));
  if (!unique.length) return void 0;
  return unique.slice(0, 3).join("\n");
}
async function sendAndTrackReply(session, text2) {
  addSessionMessage(session, "assistant", text2);
  session.lastBotQuestion = /[?؟]/.test(text2) ? text2 : session.lastBotQuestion;
  const sendResult = await sendMessengerMessage(session.senderId, text2);
  if (!sendResult.success) {
    console.error("[messenger.webhook] Failed to send reply", {
      senderId: session.senderId,
      error: sendResult.error
    });
  }
}
app3.get("/", async (c) => {
  const mode = c.req.query("hub.mode");
  const verifyToken = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");
  if (mode === "subscribe" && verifyToken === env.messengerVerifyToken) {
    return c.text(challenge ?? "OK");
  }
  return c.json({ error: "Verification failed" }, 403);
});
app3.post("/", async (c) => {
  try {
    const body = await c.req.json();
    if (body.object && body.object !== "page") {
      return c.json({ success: true, ignored: true });
    }
    for (const entry of body.entry ?? []) {
      for (const messaging of entry.messaging ?? []) {
        if (messaging.message?.text) {
          console.log("[messenger.webhook] Incoming message", {
            senderId: messaging.sender?.id,
            messageId: messaging.message?.mid,
            textLength: messaging.message.text.length
          });
          await handleMessengerMessage(messaging);
        }
      }
    }
    return c.json({ success: true });
  } catch (err) {
    console.error("Messenger webhook error:", err);
    return c.json({ error: "Internal error" }, 500);
  }
});
async function handleMessengerMessage(messaging) {
  const senderId = messaging.sender.id;
  const text2 = messaging.message.text;
  const messageId = messaging.message.mid;
  const lang = detectMessageLanguage3(text2);
  if (!senderId || !text2 || !messageId) return;
  const now = Date.now();
  const seenAt = recentMessageIds.get(messageId);
  if (seenAt && now - seenAt < DUPLICATE_WINDOW_MS) {
    console.log("[messenger.webhook] Duplicate message ignored", { senderId, messageId });
    return;
  }
  recentMessageIds.set(messageId, now);
  for (const [id, ts] of recentMessageIds.entries()) {
    if (now - ts > DUPLICATE_WINDOW_MS) recentMessageIds.delete(id);
  }
  console.log("[messenger.webhook] sender message", {
    senderId,
    messageId,
    text: text2
  });
  const session = getSession(senderId, lang);
  session.language = lang;
  session.lastMessageId = messageId;
  addSessionMessage(session, "user", text2);
  const normalizedText = normalizeInput(text2);
  const intents = detectIntents(normalizedText);
  if (intents.length > 0) {
    session.lastIntent = intents[0];
    session.lastTopic = intents[0];
  }
  const priceOrUnitReply = resolvePriceOrUnitReply(`${normalizedText} ${text2}`, lang);
  if (priceOrUnitReply && session.bookingState !== "active" && !intents.includes("booking")) {
    await sendAndTrackReply(session, priceOrUnitReply);
    return;
  }
  if (session.bookingState === "active" || intents.includes("booking")) {
    session.bookingState = "active";
    session.bookingData = updateBookingData(session.bookingData, text2, normalizedText);
    const missing = bookingMissingFields(session.bookingData, lang);
    const replyText = missing.length ? missing.length === 5 ? bookingPrompt(lang) : bookingMissingPrompt(missing, lang) : bookingSummary(session.bookingData, lang);
    if (!missing.length) {
      session.bookingState = "completed";
      await sendBookingInterestEmail(session.bookingData, senderId, session.history);
    }
    await sendAndTrackReply(session, replyText);
    return;
  }
  if (session.lastTopic === "booking" && isBookingDataMessage(text2, normalizedText)) {
    session.bookingState = "active";
    session.bookingData = updateBookingData(session.bookingData, text2, normalizedText);
    const missing = bookingMissingFields(session.bookingData, lang);
    const replyText = missing.length ? bookingMissingPrompt(missing, lang) : bookingSummary(session.bookingData, lang);
    if (!missing.length) {
      session.bookingState = "completed";
      await sendBookingInterestEmail(session.bookingData, senderId, session.history);
    }
    await sendAndTrackReply(session, replyText);
    return;
  }
  const followUpToLastTopic = hasFollowUpPrompt(text2) && session.lastTopic !== "general";
  const resolvedIntents = intents.length ? intents : followUpToLastTopic ? [session.lastTopic] : [];
  const templateReply = composeMultiIntentReply(resolvedIntents, lang, text2);
  if (templateReply) {
    await sendAndTrackReply(session, templateReply);
    return;
  }
  const historyForAI = session.history.map((item) => ({ role: item.role, content: item.content }));
  const resolvedText = followUpToLastTopic ? `${text2} ${session.lastTopic}` : text2;
  const aiResult = await generateAIResponse(resolvedText, historyForAI, lang);
  await sendAndTrackReply(session, aiResult.text);
}
var messenger_webhook_default = app3;

// api/boot.ts
var app4 = new Hono4();
app4.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app4.route("/api/whatsapp", whatsapp_webhook_default);
app4.route("/api/twilio", twilio_webhook_default);
app4.route("/api/messenger", messenger_webhook_default);
app4.route("/webhook", messenger_webhook_default);
app4.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext
  });
});
app4.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));
var boot_default = app4;
if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles: serveStaticFiles2 } = await Promise.resolve().then(() => (init_vite(), vite_exports));
  serveStaticFiles2(app4);
  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app4.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
export {
  boot_default as default
};
