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
  ownerPhoneNumber: optional("OWNER_PHONE_NUMBER") || "+218912110392"
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

\u0627\u0644\u062D\u062C\u0632 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u062D\u0627\u0644\u064A\u0627\u064B \u0648\u0633\u064A\u062A\u0645 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0639\u0646\u0647 \u0642\u0631\u064A\u0628\u0627\u064B \u{1F4E2}

\u064A\u0631\u062C\u0649 \u0625\u0631\u0633\u0627\u0644 \u0631\u0642\u0645 \u0627\u0644\u062E\u064A\u0627\u0631:`;
  }
  return `Welcome to La Vida Resort & Beach Club \u{1F3D6}\uFE0F
Thank you for reaching out to us

Booking is not available yet and will be announced soon \u{1F4E2}

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
    ar: `\u{1F4E2} \u0622\u062E\u0631 \u0627\u0644\u062A\u062D\u062F\u064A\u062B\u0627\u062A

\u2022 \u0627\u0644\u062D\u062C\u0632 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u062D\u0627\u0644\u064A\u0627\u064B
\u2022 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0633\u062A\u064F\u0639\u0644\u0646 \u0642\u0631\u064A\u0628\u0627\u064B
\u2022 \u0645\u0648\u0639\u062F \u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D \u0633\u064A\u064F\u0639\u0644\u0646 \u0642\u0631\u064A\u0628\u0627\u064B

\u062A\u0627\u0628\u0639\u0648\u0646\u0627 \u0639\u0644\u0649 \u0641\u064A\u0633\u0628\u0648\u0643 \u0648\u0625\u0646\u0633\u062A\u063A\u0631\u0627\u0645 \u0644\u0622\u062E\u0631 \u0627\u0644\u0623\u062E\u0628\u0627\u0631!
\u{1F4F1} +218 91 211 0392
\u{1F4E7} info@lavida.ly

\u0634\u0643\u0631\u0627\u064B \u0644\u0627\u0647\u062A\u0645\u0627\u0645\u0643\u0645 \u0628\u0640 La Vida Resort & Beach Club \u{1F499}`,
    en: `\u{1F4E2} Latest Updates

\u2022 Booking is not available yet
\u2022 Pricing will be announced soon
\u2022 Opening date will be announced soon

Follow us on Facebook and Instagram for the latest news!
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
  option_1_ar: "\u0627\u0644\u062D\u062C\u0632 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u062D\u0627\u0644\u064A\u0627\u064B \u0648\u0633\u064A\u062A\u0645 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0639\u0646 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0642\u0631\u064A\u0628\u0627\u064B. \u0634\u0643\u0631\u0627\u064B \u0644\u0627\u0647\u062A\u0645\u0627\u0645\u0643\u0645.",
  option_1_en: "Booking is not available yet and pricing will be announced soon. Thank you for your interest.",
  option_2_ar: "\u0644\u062F\u064A\u0646\u0627 20 \u0634\u0627\u0644\u064A\u0647 \u0639\u0627\u0626\u0644\u064A \u0648 10 \u0641\u064A\u0644\u0627\u062A \u0641\u0627\u062E\u0631\u0629 \u0648 12 \u0634\u0642\u0629. \u0633\u064A\u062A\u0645 \u0645\u0634\u0627\u0631\u0643\u0629 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u0642\u0631\u064A\u0628\u0627\u064B.",
  option_2_en: "We have 20 family chalets, 10 luxury villas, and 12 apartments. Full details will be shared soon.",
  option_3_ar: "\u0645\u0631\u0627\u0641\u0642\u0646\u0627 \u062A\u0634\u0645\u0644 \u0645\u0633\u0628\u062D \u0645\u0631\u0643\u0632\u064A\u060C \u0634\u0627\u0637\u0626 \u062E\u0627\u0635\u060C \u0631\u064A\u0627\u0636\u0627\u062A \u0645\u0627\u0626\u064A\u0629\u060C \u0645\u0644\u0627\u0639\u0628\u060C \u0645\u0646\u0637\u0642\u0629 \u0623\u0637\u0641\u0627\u0644\u060C \u0648\u0645\u0642\u0647\u0649.",
  option_3_en: "Our facilities include a central pool, private beach, water sports, courts, kids area, and a beach cafe.",
  option_4_ar: "\u0646\u062D\u0646 \u0641\u064A \u0632\u0648\u0627\u0631\u0629\u060C \u0644\u064A\u0628\u064A\u0627. \u0645\u0648\u0639\u062F \u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D \u0648\u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0633\u062A\u064F\u0639\u0644\u0646 \u0642\u0631\u064A\u0628\u0627\u064B. \u062A\u0627\u0628\u0639\u0648\u0646\u0627 \u0639\u0644\u0649 \u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A.",
  option_4_en: "We are located in Zuwarah, Libya. Opening date and pricing will be announced soon. Follow us on social media.",
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
var RESORT_INFO = {
  name: "La Vida Resort & Beach Club",
  location: "Zuwarah, Libya",
  website: "lavidaresort.ly",
  phones: ["093 888 8868", "093 888 8878"]
};
function bookingAnnouncement(lang) {
  if (lang === "ar") {
    return "\u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0648\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u062D\u062C\u0632 \u0648\u0627\u0644\u062A\u0648\u0641\u0631 \u0648\u0627\u0644\u0625\u0642\u0627\u0645\u0629 \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u0633\u064A\u062A\u0645 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0639\u0646\u0647\u0627 \u064A\u0648\u0645 20 \u0645\u0627\u064A\u0648.";
  }
  return "Prices, booking, reservation, availability, and full board details will be announced on May 20.";
}
function includesBookingQuestion(input) {
  const text2 = input.toLowerCase();
  const keywords = [
    "price",
    "prices",
    "booking",
    "book",
    "reservation",
    "availability",
    "full board",
    "rate",
    "cost",
    "\u0633\u0639\u0631",
    "\u0627\u0644\u0627\u0633\u0639\u0627\u0631",
    "\u0623\u0633\u0639\u0627\u0631",
    "\u062D\u062C\u0632",
    "\u0627\u0644\u062D\u062C\u0632",
    "\u062D\u062C\u0648\u0632\u0627\u062A",
    "\u062A\u0648\u0641\u0631",
    "\u0645\u062A\u0627\u062D",
    "\u0625\u0642\u0627\u0645\u0629 \u0643\u0627\u0645\u0644\u0629"
  ];
  return keywords.some((keyword) => text2.includes(keyword));
}
function buildSystemPrompt(lang) {
  const base = `You are La Vida AI, the official receptionist for ${RESORT_INFO.name}.

Official resort facts:
- Name: ${RESORT_INFO.name}
- Location: ${RESORT_INFO.location}
- Website: ${RESORT_INFO.website}
- Phones: ${RESORT_INFO.phones.join(" and ")}
- Opening date: June 1, 2026

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
4) Never invent prices, booking details, or availability.
5) For any question about prices, booking, reservation, availability, or full board, say details will be officially announced on May 20.
6) Mention the opening date (June 1, 2026) when relevant.
7) If you are unsure, clearly say management will confirm.
8) Do not invent facts outside the information above.`;
  if (lang === "ar") {
    return `${base}
Language rule: Reply in Arabic when the guest writes Arabic.`;
  }
  return `${base}
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
    const lang = detectLanguage(message);
    const history = input.history ?? [];
    if (includesBookingQuestion(message)) {
      return {
        reply: bookingAnnouncement(lang),
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
        temperature: 0.4,
        max_tokens: 400,
        messages: [
          { role: "system", content: buildSystemPrompt(lang) },
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
function buildSystemPrompt2(lang) {
  if (lang === "ar") {
    return `\u0623\u0646\u062A \u0645\u0633\u0627\u0639\u062F \u0630\u0643\u064A \u0644\u0645\u0646\u062A\u062C\u0639 La Vida Resort & Beach Club \u0641\u064A \u0632\u0648\u0627\u0631\u0629\u060C \u0644\u064A\u0628\u064A\u0627.
\u0623\u0646\u062A \u0645\u062A\u062D\u062F\u062B \u0628\u0644\u0647\u062C\u0629 \u0644\u064A\u0628\u064A\u0629 \u0648\u062F\u0648\u062F\u0629\u060C \u0623\u0646\u064A\u0642\u0629\u060C \u0648\u0647\u0627\u062F\u0626\u0629.

\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u062D\u0629:
- \u0627\u0644\u0645\u0648\u0642\u0639: \u0632\u0648\u0627\u0631\u0629\u060C \u0644\u064A\u0628\u064A\u0627\u060C \u0645\u0628\u0627\u0634\u0631\u0629 \u0639\u0644\u0649 \u0627\u0644\u0628\u062D\u0631
- 42 \u0648\u062D\u062F\u0629: 10 \u0641\u064A\u0644\u0627\u062A \u0641\u0627\u062E\u0631\u0629 (6 \u0641\u064A\u0644\u0627\u062A VIP \u0628\u0645\u0633\u0628\u062D \u062E\u0627\u0635 + 4 \u0641\u064A\u0644\u0627\u062A \u0631\u0626\u0627\u0633\u064A\u0629)\u060C 20 \u0634\u0627\u0644\u064A\u0647 \u0639\u0627\u0626\u0644\u064A\u060C 12 \u0634\u0642\u0629
- \u0627\u0644\u0645\u0631\u0627\u0641\u0642: \u0645\u0633\u0628\u062D \u0645\u0631\u0643\u0632\u064A\u060C \u0634\u0627\u0637\u0626 \u062E\u0627\u0635\u060C \u0631\u064A\u0627\u0636\u0627\u062A \u0645\u0627\u0626\u064A\u0629\u060C \u0645\u0644\u0627\u0639\u0628\u060C \u0623\u0644\u0639\u0627\u0628 \u0623\u0637\u0641\u0627\u0644\u060C \u0645\u0642\u0647\u0649\u060C \u0648\u0627\u064A \u0641\u0627\u064A\u060C \u0627\u0633\u062A\u0642\u0628\u0627\u0644 24/7
- \u0627\u0644\u062D\u062C\u0632 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u062D\u0627\u0644\u064A\u0627\u064B
- \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0633\u062A\u064F\u0639\u0644\u0646 \u0642\u0631\u064A\u0628\u0627\u064B
- \u0645\u0648\u0639\u062F \u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D \u0633\u064A\u064F\u0639\u0644\u0646 \u0642\u0631\u064A\u0628\u0627\u064B
- \u0627\u0644\u0627\u062A\u0635\u0627\u0644: +218 91 211 0392, info@lavida.ly

\u0627\u0644\u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629:
- \u0645\u0646\u062A\u062C\u0639 \u0634\u0627\u0637\u0626\u064A \u0641\u064A \u0632\u0648\u0627\u0631\u0629
- \u0641\u0644\u0644 VIP \u0628\u0645\u0633\u0627\u0628\u062D \u062E\u0627\u0635\u0629 (\u062D\u062A\u0649 8 \u0623\u0634\u062E\u0627\u0635)
- \u0641\u0644\u0644 \u0631\u0626\u0627\u0633\u064A\u0629 \u0641\u0627\u062E\u0631\u0629 \u0628\u0645\u0633\u0628\u062D \u062E\u0627\u0635 (\u062D\u062A\u0649 10 \u0623\u0634\u062E\u0627\u0635)
- \u0634\u0627\u0644\u064A\u0647\u0627\u062A \u0639\u0627\u0626\u0644\u064A\u0629 \u0645\u0631\u064A\u062D\u0629 (\u062D\u062A\u0649 5 \u0623\u0634\u062E\u0627\u0635)
- \u0634\u0642\u0642 \u0641\u0646\u062F\u0642\u064A\u0629 \u0623\u0646\u064A\u0642\u0629 (\u062D\u062A\u0649 3 \u0623\u0634\u062E\u0627\u0635)
- \u0645\u0633\u0628\u062D \u0643\u0628\u064A\u0631
- \u0643\u0627\u0641\u064A\u0647 \u0634\u0627\u0637\u0626\u064A \u0648\u0645\u0646\u0637\u0642\u0629 \u0623\u0643\u0644
- \u0623\u0646\u0634\u0637\u0629 \u0628\u062D\u0631\u064A\u0629 \u0648\u062A\u0623\u062C\u064A\u0631 \u062C\u062A\u0633\u0643\u064A
- \u0645\u0644\u0639\u0628 \u0643\u0631\u0629 \u0642\u062F\u0645 \u0648\u0645\u0644\u0639\u0628 \u0643\u0631\u0629 \u0637\u0627\u0626\u0631\u0629
- \u0623\u062C\u0648\u0627\u0621 \u0634\u0627\u0637\u0626\u064A\u0629 \u0647\u0627\u062F\u0626\u0629 \u0648\u0645\u0631\u064A\u062D\u0629

\u0642\u0648\u0627\u0639\u062F:
1. \u062A\u062D\u062F\u062B \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0644\u064A\u0628\u064A\u0629 \u0628\u0637\u0628\u064A\u0639\u064A\u0629 (\u0644\u064A\u0633 \u0631\u0633\u0645\u064A\u0627\u064B \u062C\u062F\u0627\u064B \u0648\u0644\u0627 \u0631\u0648\u0628\u0648\u062A\u064A\u0627\u064B)
2. \u0643\u0646 \u0645\u0624\u062F\u0628\u0627\u064B\u060C \u0623\u0646\u064A\u0642\u0627\u064B\u060C \u0648\u0645\u062A\u0639\u0627\u0648\u0646\u0627\u064B
3. \u0644\u0627 \u062A\u0639\u062F\u062F \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u062E\u0627\u0637\u0626\u0629
4. \u0625\u0630\u0627 \u0633\u064F\u0626\u0644\u062A \u0639\u0646 \u0627\u0644\u062D\u062C\u0632 \u0623\u0648 \u0627\u0644\u0623\u0633\u0639\u0627\u0631\u060C \u0642\u0644 "\u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u062D\u0627\u0644\u064A\u0627\u064B\u060C \u0633\u064A\u062A\u0645 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0639\u0646\u0647 \u0642\u0631\u064A\u0628\u0627\u064B"
5. \u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u0646\u0628\u0631\u0629 \u0645\u0646\u062A\u062C\u0639 \u0641\u0627\u062E\u0631 \u0648\u0647\u0627\u062F\u0626
6. \u0631\u062F\u0648\u062F\u0643 \u0642\u0635\u064A\u0631\u0629 \u0648\u0648\u0627\u0636\u062D\u0629
7. \u0625\u0630\u0627 \u0633\u0623\u0644 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0639\u0646 \u0627\u0644\u0645\u0631\u0627\u0641\u0642 \u0623\u0648 \u0627\u0644\u0623\u0646\u0634\u0637\u0629\u060C \u062C\u0627\u0648\u0628\u0647 \u0645\u0628\u0627\u0634\u0631\u0629 \u0628\u0634\u0643\u0644 \u0637\u0628\u064A\u0639\u064A \u0648\u0645\u062E\u062A\u0635\u0631`;
  }
  return `You are an intelligent assistant for La Vida Resort & Beach Club in Zuwarah, Libya.
You are elegant, helpful, warm, and calm \u2014 like a luxury resort concierge.

Available information:
- Location: Zuwarah, Libya, directly on the beach
- 42 units: 10 luxury villas (6 VIP with private pool + 4 Presidential), 20 family chalets, 12 apartments
- Facilities: central pool, private beach, water sports, courts, kids area, cafe, Wi-Fi, 24/7 reception
- Booking is not available yet
- Pricing will be announced soon
- Opening date will be announced soon
- Contact: +218 91 211 0392, info@lavida.ly

Core knowledge:
- Beachfront location in Zuwarah
- VIP villas with private pools (up to 8 guests)
- Presidential villas with private pools (up to 10 guests)
- Family chalets (up to 5 guests)
- Hotel apartments (up to 3 guests)
- Large swimming pool
- Beach cafe and food area
- Water sports activities and jetski rentals
- Football and volleyball courts
- Relaxing beach atmosphere

Rules:
1. Speak like a professional luxury resort concierge
2. Be polite, elegant, and helpful
3. Do not make up information
4. If asked about booking or pricing, say "not available yet, will be announced soon"
5. Keep a calm, luxurious tone
6. Keep responses concise and clear
7. For activities or facilities questions, answer directly and naturally instead of asking for clarification`;
}
async function generateAIResponse(userMessage, history = [], forceLang) {
  const lang = forceLang ?? detectLanguage(userMessage);
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
  const templateText = getTemplateResponse(userMessage, lang);
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
function getTemplateResponse(userMessage, lang) {
  const text2 = userMessage.trim().toLowerCase();
  const wantsFacilities = /(jetski|jet ski|water sport|water sports|cafe|café|food|restaurant|activities|activity|football|volleyball|beach|pool|chalet|chalets|villa|villas|apartment|apartments|جتسكي|أنشطة|نشاط|كافيه|اكل|أكل|مطعم|ملعب|كرة|طائرة|شاطئ|مسبح|شاليه|شاليهات|فيلا|فلل|شقة|شقق)/i.test(
    text2
  );
  if (wantsFacilities) {
    return lang === "ar" ? "\u0623\u0643\u064A\u062F \u2728 \u0644\u0627\u0641\u064A\u062F\u0627 \u0641\u064A\u0647\u0627 \u0643\u0627\u0641\u064A\u0647 \u0648\u0645\u0646\u0637\u0642\u0629 \u0623\u0643\u0644 \u0648\u0623\u0646\u0634\u0637\u0629 \u0628\u062D\u0631\u064A\u0629 \u0648\u062A\u0623\u062C\u064A\u0631 \u062C\u062A\u0633\u0643\u064A \u0628\u0627\u0644\u0625\u0636\u0627\u0641\u0629 \u0644\u0645\u0644\u0639\u0628 \u0643\u0631\u0629 \u0648\u0645\u0644\u0639\u0628 \u0637\u0627\u0626\u0631\u0629\u060C \u0645\u0639 \u0634\u0627\u0637\u0626 \u0648\u0645\u0633\u0628\u062D \u0648\u0623\u062C\u0648\u0627\u0621 \u0645\u0631\u064A\u062D\u0629." : "Yes \u2728 La Vida includes a beach cafe, food area, water activities, and jetski rentals, along with football and volleyball courts, plus beach and pool access.";
  }
  const wantsAccommodation = /(room|rooms|accommodation|stay|unit|units|villa|villas|vip villa|presidential|chalet|chalets|apartment|apartments|capacity|guests|how many people|private pool|private pools|مبيت|إقامة|الغرف|غرف|شن أنواع الغرف|كم شخص|شن نوع|فلل|فيلا|vip|رئاسية|شاليه|شاليهات|شقق|سعة|ضيوف|مسبح خاص|في مسبح خاص)/i.test(
    text2
  );
  if (wantsAccommodation) {
    return lang === "ar" ? "\u0644\u0627\u0641\u064A\u062F\u0627 \u062A\u0648\u0641\u0631 \u0641\u0644\u0644 VIP \u0628\u0645\u0633\u0627\u0628\u062D \u062E\u0627\u0635\u0629 \u062D\u062A\u0649 8 \u0623\u0634\u062E\u0627\u0635\u060C \u0648\u0641\u0644\u0644 \u0631\u0626\u0627\u0633\u064A\u0629 \u062D\u062A\u0649 10 \u0623\u0634\u062E\u0627\u0635\u060C \u0648\u0634\u0627\u0644\u064A\u0647\u0627\u062A \u0639\u0627\u0626\u0644\u064A\u0629 \u062D\u062A\u0649 5 \u0623\u0634\u062E\u0627\u0635\u060C \u0648\u0634\u0642\u0642 \u0641\u0646\u062F\u0642\u064A\u0629 \u0623\u0646\u064A\u0642\u0629 \u062D\u062A\u0649 3 \u0623\u0634\u062E\u0627\u0635 \u2728" : "La Vida offers VIP villas with private pools for up to 8 guests, presidential villas for up to 10 guests, family chalets for up to 5 guests, and elegant hotel apartments for up to 3 guests \u2728";
  }
  const wantsResortInfo = /(resort|la vida|details|about|facilities|features|location|zuwarah|beach|pool|chalet|villa|activities|منتجع|لافيدا|تفاصيل|مرافق|الموقع|زوارة|شاطئ|مسبح|شاليه|أنشطة)/i.test(
    text2
  );
  if (wantsResortInfo) {
    return lang === "ar" ? "La Vida Resort & Beach Club \u0641\u064A \u0632\u0648\u0627\u0631\u0629 \u062A\u062C\u0631\u0628\u0629 \u0636\u064A\u0627\u0641\u0629 \u0631\u0627\u0642\u064A\u0629 \u0639\u0644\u0649 \u0627\u0644\u0628\u062D\u0631\u060C \u0645\u0639 \u0634\u0627\u0637\u0626 \u0648\u0645\u0633\u0628\u062D \u0648\u0634\u0627\u0644\u064A\u0647\u0627\u062A \u0641\u0627\u062E\u0631\u0629 \u0648\u0623\u0646\u0634\u0637\u0629 \u0639\u0627\u0626\u0644\u064A\u0629 \u0645\u0645\u062A\u0639\u0629 \u0641\u064A \u0623\u062C\u0648\u0627\u0621 \u0647\u0627\u062F\u0626\u0629 \u0648\u0623\u0646\u064A\u0642\u0629 \u2728" : "La Vida Resort & Beach Club in Zuwarah offers an elegant beachfront escape with beach access, pool, luxury chalets, and family-friendly activities in a calm, premium atmosphere \u2728";
  }
  if (lang === "ar") {
    return "\u0645\u0645\u0643\u0646 \u062A\u0648\u0636\u062D\u0644\u0646\u0627 \u0623\u0643\u062B\u0631 \u0634\u0646\u0648 \u062A\u062D\u0628 \u062A\u0639\u0631\u0641\u061F \u2728";
  }
  return "Could you tell us a bit more about what you'd like to know? \u2728";
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
var app3 = new Hono3();
function isBookingQuestion(text2) {
  const value = text2.toLowerCase();
  const keywords = ["how can i book", "book", "booking", "reservation", "\u0627\u0644\u062D\u062C\u0632", "\u0646\u0628\u064A \u0646\u062D\u062C\u0632"];
  return keywords.some((keyword) => value.includes(keyword));
}
function isPriceQuestion(text2) {
  const value = text2.toLowerCase();
  const keywords = ["prices", "price", "\u0627\u0644\u0623\u0633\u0639\u0627\u0631", "\u0628\u0643\u0645", "\u0643\u0645 \u0627\u0644\u0633\u0639\u0631"];
  return keywords.some((keyword) => value.includes(keyword));
}
function bookingAnnouncement2(lang) {
  if (lang === "ar") {
    return "\u0627\u0644\u062D\u062C\u0632 \u0628\u064A\u0641\u062A\u062D \u0642\u0631\u064A\u0628\u0627\u064B\u060C \u0648\u062D\u0646\u0639\u0644\u0646\u0648\u0627 \u0643\u0644 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u064A\u0648\u0645 20 \u0645\u0627\u064A\u0648 \u2728";
  }
  return "Bookings will open soon, and all booking details will be announced officially on May 20 \u2728";
}
function priceAnnouncement(lang) {
  if (lang === "ar") {
    return "\u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0633\u064A\u062A\u0645 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0639\u0646\u0647\u0627 \u0631\u0633\u0645\u064A\u0627\u064B \u064A\u0648\u0645 20 \u0645\u0627\u064A\u0648 \u2728";
  }
  return "Prices will be announced officially on May 20 \u2728";
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
  const lang = detectLanguage(text2);
  if (!senderId || !text2) return;
  console.log("[messenger.webhook] sender message", {
    senderId,
    text: text2
  });
  let replyText = "";
  if (isBookingQuestion(text2)) {
    replyText = bookingAnnouncement2(lang);
  } else if (isPriceQuestion(text2)) {
    replyText = priceAnnouncement(lang);
  } else {
    const aiResult = await generateAIResponse(text2, []);
    replyText = aiResult.text;
  }
  const sendResult = await sendMessengerMessage(senderId, replyText);
  if (!sendResult.success) {
    console.error("[messenger.webhook] Failed to send reply", {
      senderId,
      error: sendResult.error
    });
  }
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
