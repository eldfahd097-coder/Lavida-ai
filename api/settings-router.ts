import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, adminQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { settings } from "@db/schema";

export const settingsRouter = createRouter({
  // ─── Get All Settings ───────────────────────────────────────
  list: publicQuery.query(async () => {
    const db = getDb();
    const items = await db.select().from(settings);
    return items;
  }),

  // ─── Get Setting by Key ─────────────────────────────────────
  getByKey: publicQuery
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const item = await db.query.settings.findFirst({
        where: eq(settings.key, input.key),
      });
      return item ?? null;
    }),

  // ─── Upsert Setting ─────────────────────────────────────────
  upsert: adminQuery
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
        category: z.enum(["general", "whatsapp", "messenger", "twilio", "ai", "resort"]).default("general"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.query.settings.findFirst({
        where: eq(settings.key, input.key),
      });

      if (existing) {
        await db
          .update(settings)
          .set({ value: input.value, category: input.category })
          .where(eq(settings.key, input.key));
        return { success: true, key: input.key, updated: true };
      }

      await db.insert(settings).values(input);
      return { success: true, key: input.key, updated: false };
    }),

  // ─── Bulk Upsert ────────────────────────────────────────────
  bulkUpsert: adminQuery
    .input(
      z.array(
        z.object({
          key: z.string(),
          value: z.string(),
          category: z.enum(["general", "whatsapp", "messenger", "twilio", "ai", "resort"]).default("general"),
        })
      )
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      for (const item of input) {
        const existing = await db.query.settings.findFirst({
          where: eq(settings.key, item.key),
        });
        if (existing) {
          await db
            .update(settings)
            .set({ value: item.value, category: item.category })
            .where(eq(settings.key, item.key));
        } else {
          await db.insert(settings).values(item);
        }
      }
      return { success: true, count: input.length };
    }),

  // ─── Delete Setting ──────────────────────────────────────────
  delete: adminQuery
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(settings).where(eq(settings.key, input.key));
      return { success: true };
    }),
});
