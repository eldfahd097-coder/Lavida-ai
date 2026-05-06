import { z } from "zod";
import { eq, desc, like, and, or, sql } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { leads, messages, calls } from "@db/schema";

export const leadsRouter = createRouter({
  list: adminQuery
    .input(
      z.object({
        status: z.enum(["new", "contacted", "qualified", "completed", "lost"]).optional(),
        source: z.enum(["whatsapp", "messenger", "phone", "email", "walk_in", "other"]).optional(),
        search: z.string().optional(),
        assignedToId: z.number().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
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

      const whereClause = filters.length > 0 ? and(...filters) : undefined;

      const items = await db.query.leads.findMany({
        where: whereClause,
        orderBy: [desc(leads.createdAt)],
        limit: p.limit,
        offset: p.offset,
        with: {
          assignedTo: { columns: { id: true, name: true, email: true } },
        },
      });

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(whereClause);

      return {
        items,
        total: countResult[0]?.count ?? 0,
        limit: p.limit,
        offset: p.offset,
      };
    }),

  getById: adminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const lead = await db.query.leads.findFirst({
        where: eq(leads.id, input.id),
        with: {
          assignedTo: { columns: { id: true, name: true, email: true, avatar: true } },
          messages: { orderBy: [desc(messages.createdAt)], limit: 50 },
          calls: { orderBy: [desc(calls.createdAt)], limit: 20 },
        },
      });
      if (!lead) throw new Error("Lead not found");
      return lead;
    }),

  create: publicQuery
    .input(
      z.object({
        source: z.enum(["whatsapp", "messenger", "phone", "email", "walk_in", "other"]),
        name: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        language: z.enum(["ar", "en"]).default("ar"),
        interest: z.enum(["booking", "chalet_info", "activities", "location", "pricing", "management", "general"]).default("general"),
        status: z.enum(["new", "contacted", "qualified", "completed", "lost"]).default("new"),
        notes: z.string().optional(),
        assignedToId: z.number().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(leads).values(input as any);
      const insertId = Number(result[0].insertId);
      return { id: insertId, ...input };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        status: z.enum(["new", "contacted", "qualified", "completed", "lost"]).optional(),
        interest: z.enum(["booking", "chalet_info", "activities", "location", "pricing", "management", "general"]).optional(),
        notes: z.string().optional(),
        assignedToId: z.number().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;
      await db.update(leads).set(updates as any).where(eq(leads.id, id));
      return { success: true, id };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
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
      lost: allLeads.filter((l) => l.status === "lost").length,
    };
    const bySource = {
      whatsapp: allLeads.filter((l) => l.source === "whatsapp").length,
      messenger: allLeads.filter((l) => l.source === "messenger").length,
      phone: allLeads.filter((l) => l.source === "phone").length,
      email: allLeads.filter((l) => l.source === "email").length,
      walk_in: allLeads.filter((l) => l.source === "walk_in").length,
      other: allLeads.filter((l) => l.source === "other").length,
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
      englishInquiries,
    };
  }),
});
