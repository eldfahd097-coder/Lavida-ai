import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { createRouter, adminQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { messages } from "@db/schema";

export const messagesRouter = createRouter({
  list: adminQuery
    .input(
      z.object({
        leadId: z.number().optional(),
        platform: z.enum(["whatsapp", "messenger"]).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const p = input ?? { limit: 50, offset: 0 };
      const filters = [];
      if (p.leadId) filters.push(eq(messages.leadId, p.leadId));
      if (p.platform) filters.push(eq(messages.platform, p.platform));

      const whereClause = filters.length > 0 ? and(...filters) : undefined;

      const items = await db.query.messages.findMany({
        where: whereClause,
        orderBy: [desc(messages.createdAt)],
        limit: p.limit,
        offset: p.offset,
      });

      return { items, limit: p.limit, offset: p.offset };
    }),

  create: publicQuery
    .input(
      z.object({
        leadId: z.number().optional(),
        platform: z.enum(["whatsapp", "messenger"]),
        direction: z.enum(["inbound", "outbound"]),
        messageId: z.string().optional(),
        fromNumber: z.string().optional(),
        toNumber: z.string().optional(),
        body: z.string(),
        mediaUrl: z.string().optional(),
        mediaType: z.string().optional(),
        status: z.enum(["sent", "delivered", "read", "failed", "pending"]).default("pending"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(messages).values(input as any);
      const insertId = Number(result[0].insertId);
      return { id: insertId, ...input };
    }),

  updateStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["sent", "delivered", "read", "failed", "pending"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(messages).set({ status: input.status }).where(eq(messages.id, input.id));
      return { success: true };
    }),

  getConversation: adminQuery
    .input(z.object({ leadId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const items = await db.query.messages.findMany({
        where: eq(messages.leadId, input.leadId),
        orderBy: [desc(messages.createdAt)],
        limit: 100,
      });
      return items;
    }),
});
