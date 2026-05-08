import { Hono } from "hono";
import { env } from "./lib/env";
import { getDb } from "./queries/connection";
import { leads, messages } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";
import { sendMessengerMessage, getMessengerUserProfile } from "./lib/messenger";
import { generateAIResponse } from "./ai-engine";
import {
  getGreeting,
  getMenu,
  getResponseByChoice,
  detectLanguage,
} from "@contracts/templates";

const app = new Hono();

// ─── Messenger Verification ─────────────────────────────────────
app.get("/", async (c) => {
  const mode = c.req.query("hub.mode");
  const verifyToken = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");

  if (mode === "subscribe" && verifyToken === env.messengerVerifyToken) {
    return c.text(challenge ?? "OK");
  }

  return c.json({ error: "Verification failed" }, 403);
});

// ─── Messenger Incoming Messages ──────────────────────────────────
app.post("/", async (c) => {
  try {
    const body = (await c.req.json()) as MessengerWebhookBody;

    if (body.object && body.object !== "page") {
      // Meta may send events for other objects; acknowledge to avoid retries.
      return c.json({ success: true, ignored: true });
    }

    for (const entry of body.entry ?? []) {
      for (const messaging of entry.messaging ?? []) {
        if (messaging.message?.text) {
          console.log("[messenger.webhook] Incoming message", {
            senderId: messaging.sender?.id,
            messageId: messaging.message?.mid,
            textLength: messaging.message.text.length,
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

// ─── Handle Single Messenger Message ────────────────────────────
async function handleMessengerMessage(messaging: MessengerMessagingEvent) {
  const senderId = messaging.sender.id;
  const text = messaging.message.text;
  const messageId = messaging.message.mid;

  if (!senderId || !text) return;

  const db = getDb();
  const lang = detectLanguage(text);

  // Get user profile
  const profile = await getMessengerUserProfile(senderId);
  const senderName = profile.name ?? "Messenger User";

  // Find or create lead
  let lead = await db.query.leads.findFirst({
    where: eq(leads.phone, senderId),
  });

  let leadId: number;
  if (!lead) {
    const result = await db.insert(leads).values({
      source: "messenger",
      name: senderName,
      phone: senderId,
      language: lang,
      status: "new",
      interest: "general",
    });
    leadId = Number(result[0].insertId);
  } else {
    leadId = lead.id;
  }

  // Store incoming message
  await db.insert(messages).values({
    leadId,
    platform: "messenger",
    direction: "inbound",
    messageId,
    fromNumber: senderId,
    toNumber: env.messengerPageId ?? "",
    body: text,
    status: "read",
  });

  // Generate response
  let replyText = "";
  const trimmedText = text.trim().toLowerCase();

  if (/^[1-5]$/.test(trimmedText)) {
    replyText = getResponseByChoice(trimmedText, lang);
  } else if (/^(مرحب|سلام|هاي|hello|hi|hey)/i.test(trimmedText)) {
    replyText = `${getGreeting("messenger", lang)}\n\n${getMenu("messenger", lang)}`;
  } else {
    const recentMessages = await db.query.messages.findMany({
      where: and(eq(messages.leadId, leadId), eq(messages.platform, "messenger")),
      orderBy: [desc(messages.createdAt)],
      limit: 5,
    });

    const history = recentMessages.reverse().map((m) => ({
      role: (m.direction === "inbound" ? "user" : "assistant") as "user" | "assistant",
      content: m.body,
    }));

    const aiResult = await generateAIResponse(text, history, lang);
    replyText = aiResult.text;
  }

  // Send reply
  const sendResult = await sendMessengerMessage(senderId, replyText);

  if (sendResult.success) {
    await db.insert(messages).values({
      leadId,
      platform: "messenger",
      direction: "outbound",
      messageId: sendResult.messageId,
      fromNumber: env.messengerPageId ?? "",
      toNumber: senderId,
      body: replyText,
      status: "sent",
    });
  }
}

// ─── Types ──────────────────────────────────────────────────────
type MessengerWebhookBody = {
  object?: string;
  entry?: {
    messaging?: MessengerMessagingEvent[];
  }[];
};

type MessengerMessagingEvent = {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message: {
    mid: string;
    text: string;
  };
};

export default app;
