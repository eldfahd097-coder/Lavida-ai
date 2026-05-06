import { Hono } from "hono";
import { env } from "./lib/env";
import { getDb } from "./queries/connection";
import { leads, messages } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";
import { sendWhatsAppMessage, markWhatsAppMessageAsRead } from "./lib/whatsapp";
import { generateAIResponse } from "./ai-engine";
import {
  getGreeting,
  getMenu,
  getResponseByChoice,
  detectLanguage,
  Responses,
} from "@contracts/templates";

const app = new Hono();

// ─── Verification Endpoint ──────────────────────────────────────
app.get("/webhook", async (c) => {
  const mode = c.req.query("hub.mode");
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");

  if (mode === "subscribe" && token === env.whatsappVerifyToken) {
    return c.text(challenge ?? "OK");
  }
  return c.json({ error: "Verification failed" }, 403);
});

// ─── Incoming Messages Webhook ──────────────────────────────────
app.post("/webhook", async (c) => {
  try {
    const body = (await c.req.json()) as WhatsAppWebhookBody;

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

// ─── Handle Single Incoming Message ─────────────────────────────
async function handleIncomingMessage(msg: WhatsAppMessage) {
  const from = msg.from;
  const text = msg.text?.body ?? "";
  const messageId = msg.id;

  if (!from || !text) return;

  // Mark as read
  if (messageId) {
    await markWhatsAppMessageAsRead(messageId);
  }

  const db = getDb();
  const lang = detectLanguage(text);

  // Find or create lead
  let lead = await db.query.leads.findFirst({
    where: eq(leads.phone, from),
  });

  if (!lead) {
    const result = await db.insert(leads).values({
      source: "whatsapp",
      phone: from,
      language: lang,
      status: "new",
      interest: "general",
    } as any);
    const newId = Number(result[0].insertId);
    lead = { id: newId, source: "whatsapp", phone: from, language: lang, status: "new", interest: "general" } as NonNullable<typeof lead>;
  }

  const leadId = lead.id;

  // Store incoming message
  await db.insert(messages).values({
    leadId,
    platform: "whatsapp",
    direction: "inbound",
    messageId,
    fromNumber: from,
    toNumber: env.whatsappPhoneNumberId ?? "",
    body: text,
    status: "read",
  } as any);

  // Generate response
  let replyText = "";
  const trimmedText = text.trim();

  // Check if it's a number choice
  if (/^[1-5]$/.test(trimmedText)) {
    replyText = getResponseByChoice(trimmedText, lang);
  } else if (/^(مرحب|سلام|هاي|hello|hi|hey)/i.test(trimmedText)) {
    replyText = `${getGreeting("whatsapp", lang)}\n\n${getMenu("whatsapp", lang)}`;
  } else {
    // AI response
    const recentMessages = await db.query.messages.findMany({
      where: and(eq(messages.leadId, leadId), eq(messages.platform, "whatsapp")),
      orderBy: [desc(messages.createdAt)],
      limit: 5,
    });

    const history = recentMessages
      .reverse()
      .map((m) => ({
        role: (m.direction === "inbound" ? "user" : "assistant") as "user" | "assistant",
        content: m.body,
      }));

    const aiResult = await generateAIResponse(text, history, lang);
    replyText = aiResult.text;
  }

  // Send reply
  const sendResult = await sendWhatsAppMessage(from, replyText, messageId);

  // Store outgoing message
  if (sendResult.success) {
    await db.insert(messages).values({
      leadId,
      platform: "whatsapp",
      direction: "outbound",
      messageId: sendResult.messageId,
      fromNumber: env.whatsappPhoneNumberId ?? "",
      toNumber: from,
      body: replyText,
      status: "sent",
    } as any);
  }
}

// ─── Types ──────────────────────────────────────────────────────
type WhatsAppWebhookBody = {
  entry?: {
    changes?: {
      value?: {
        messages?: WhatsAppMessage[];
      };
    }[];
  }[];
};

type WhatsAppMessage = {
  id: string;
  from: string;
  timestamp: string;
  text?: { body: string };
  type: string;
};

export default app;
