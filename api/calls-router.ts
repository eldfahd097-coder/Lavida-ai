import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { createRouter, adminQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { calls } from "@db/schema";

export const callsRouter = createRouter({
  list: adminQuery
    .input(
      z.object({
        status: z.enum([
          "initiated",
          "ringing",
          "answered",
          "completed",
          "busy",
          "failed",
          "no_answer",
          "voicemail",
        ]).optional(),
        leadId: z.number().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const p = input ?? { limit: 50, offset: 0 };
      const filters = [];
      if (p.status) filters.push(eq(calls.status, p.status));
      if (p.leadId) filters.push(eq(calls.leadId, p.leadId));

      const whereClause = filters.length > 0 ? and(...filters) : undefined;

      const items = await db.query.calls.findMany({
        where: whereClause,
        orderBy: [desc(calls.createdAt)],
        limit: p.limit,
        offset: p.offset,
      });

      return { items, limit: p.limit, offset: p.offset };
    }),

  create: publicQuery
    .input(
      z.object({
        callSid: z.string(),
        fromNumber: z.string().optional(),
        toNumber: z.string().optional(),
        status: z.enum([
          "initiated",
          "ringing",
          "answered",
          "completed",
          "busy",
          "failed",
          "no_answer",
          "voicemail",
        ]).default("initiated"),
        duration: z.number().default(0),
        recordingUrl: z.string().optional(),
        menuChoice: z.string().optional(),
        language: z.enum(["ar", "en"]).default("ar"),
        leadId: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(calls).values(input as any);
      const insertId = Number(result[0].insertId);
      return { id: insertId, ...input };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum([
          "initiated",
          "ringing",
          "answered",
          "completed",
          "busy",
          "failed",
          "no_answer",
          "voicemail",
        ]).optional(),
        duration: z.number().optional(),
        recordingUrl: z.string().optional(),
        menuChoice: z.string().optional(),
        notes: z.string().optional(),
        endedAt: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;
      await db.update(calls).set(updates).where(eq(calls.id, id));
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
  }),
});
