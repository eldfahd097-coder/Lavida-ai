import { authRouter } from "./auth-router";
import { leadsRouter } from "./leads-router";
import { messagesRouter } from "./messages-router";
import { callsRouter } from "./calls-router";
import { settingsRouter } from "./settings-router";
import { logsRouter } from "./logs-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  lead: leadsRouter,
  message: messagesRouter,
  calls: callsRouter,
  setting: settingsRouter,
  log: logsRouter,
});

export type AppRouter = typeof appRouter;
