import { Hono } from "hono";
import { env } from "./lib/env";
import { sendMessengerMessage } from "./lib/messenger";
import { generateAIResponse } from "./ai-engine";

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

  if (!senderId || !text) return;

  console.log("[messenger.webhook] sender message", {
    senderId,
    text,
  });

  const aiResult = await generateAIResponse(text, []);
  const replyText = aiResult.text;

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
