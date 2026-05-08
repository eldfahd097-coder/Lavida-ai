import { Hono } from "hono";
import { env } from "./lib/env";
import { sendMessengerMessage } from "./lib/messenger";
import { generateAIResponse } from "./ai-engine";

const app = new Hono();
const lastTopicBySender = new Map<string, string>();
const recentMessageIds = new Map<string, number>();
const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;

function detectTopic(text: string): string | undefined {
  const value = text.toLowerCase();
  if (/price|prices|how much|cost|rates|as3ar|asaar|kam|bekam|bikam|الاسعار|الأسعار|بكم|قداش|كم السعر|سعر/.test(value))
    return "prices";
  if (/book|booking|reservation|reserve|availability|7ajz|hajz|الحجز|نحجز|نبي نحجز|حجز|متاح/.test(value)) return "booking";
  if (/opening|when open|opening date|الافتتاح|متى تفتحو|موعد الافتتاح/.test(value)) return "opening";
  if (/room|rooms|villa|villas|chalet|chalets|apartment|apartments|accommodation|الغرف|فلل|شاليهات|شقق|مسبح خاص/.test(value))
    return "accommodation";
  if (/jetski|jet ski|jet-ski|jitski|jtski|water sport|water sports|جتسكي|انشطة بحرية|أنشطة بحرية/.test(value))
    return "jetski";
  if (/cafe|kafe|café|coffee|food|restaurant|eat|مطعم|كافيه|اكل|أكل/.test(value)) return "food";
  if (/pool|swimming pool|مسبح/.test(value)) return "pool";
  if (/football|soccer|volleyball|court|courts|ملعب|كرة|طائرة/.test(value)) return "courts";
  if (/kids|children|family|families|أطفال|عائلات|العائلة/.test(value)) return "family";
  if (/location|address|where|wen|ween|maps|وين|الموقع|موقع|زوارة/.test(value)) return "location";
  if (/phone|contact|number|call|رقم|تواصل|تلفون/.test(value)) return "contact";
  if (/photo|photos|picture|pictures|image|images|صور/.test(value)) return "photos";
  return undefined;
}

function isFollowUpPrompt(text: string): boolean {
  return /^(ok|okay|tell me more|more|details|when|شنو اكثر|شنو اكتر|زيد|زيدني|وضّح|وضح|more details|and\??|امتى|متى|وبعدين|شن بعد)$/i.test(
    text.trim(),
  );
}

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

  if (!senderId || !text || !messageId) return;

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
    text,
  });

  const currentTopic = detectTopic(text);
  const priorTopic = lastTopicBySender.get(senderId);
  const resolvedText = !currentTopic && priorTopic && isFollowUpPrompt(text) ? `${text} ${priorTopic}` : text;

  const aiResult = await generateAIResponse(resolvedText, []);
  const replyText = aiResult.text;
  const nextTopic = currentTopic ?? priorTopic;
  if (nextTopic) {
    lastTopicBySender.set(senderId, nextTopic);
  }

  // Send reply
  const sendResult = await sendMessengerMessage(senderId, replyText);
  if (!sendResult.success) {
    console.error("[messenger.webhook] Failed to send reply", {
      senderId,
      error: sendResult.error,
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
