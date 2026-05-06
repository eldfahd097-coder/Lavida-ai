import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { activityLogs } from "@db/schema";

export const logsRouter = createRouter({
  list: adminQuery
    .input(
      z.object({
        userId: z.number().optional(),
        action: z.enum([
          "lead_created",
          "lead_updated",
          "lead_assigned",
          "message_sent",
          "call_answered",
          "call_missed",
          "settings_updated",
          "login",
          "logout",
        ]).optional(),
        targetType: z.enum(["lead", "call", "message", "settings", "user"]).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const p = input ?? { limit: 50, offset: 0 };
      const filters = [];
      if (p.userId) filters.push(eq(activityLogs.userId, p.userId));
      if (p.action) filters.push(eq(activityLogs.action, p.action));
      if (p.targetType) filters.push(eq(activityLogs.targetType, p.targetType));

      const whereClause = filters.length > 0 ? and(...filters) : undefined;

      const items = await db.query.activityLogs.findMany({
        where: whereClause,
        orderBy: [desc(activityLogs.createdAt)],
        limit: p.limit,
        offset: p.offset,
        with: {
          user: { columns: { id: true, name: true, email: true } },
        },
      });

      return { items, limit: p.limit, offset: p.offset };
    }),

  create: adminQuery
    .input(
      z.object({
        userId: z.number().optional(),
        action: z.enum([
          "lead_created",
          "lead_updated",
          "lead_assigned",
          "message_sent",
          "call_answered",
          "call_missed",
          "settings_updated",
          "login",
          "logout",
        ]),
        targetType: z.enum(["lead", "call", "message", "settings", "user"]),
        targetId: z.number().optional(),
        details: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(activityLogs).values(input as any);
      const insertId = Number(result[0].insertId);
      return { id: insertId, ...input };
    }),
});
