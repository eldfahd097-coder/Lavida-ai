import { Hono } from "hono";
import { env } from "./lib/env";
import { sendMessengerMessage } from "./lib/messenger";
import { generateAIResponse } from "./ai-engine";
import { detectLanguage, type Language } from "@contracts/templates";

const app = new Hono();

function isBookingQuestion(text: string): boolean {
  const value = text.toLowerCase();
  const keywords = ["how can i book", "book", "booking", "reservation", "الحجز", "نبي نحجز"];
  return keywords.some((keyword) => value.includes(keyword));
}

function isPriceQuestion(text: string): boolean {
  const value = text.toLowerCase();
  const keywords = ["prices", "price", "الأسعار", "بكم", "كم السعر"];
  return keywords.some((keyword) => value.includes(keyword));
}

function bookingAnnouncement(lang: Language): string {
  if (lang === "ar") {
    return "الحجز بيفتح قريباً، وحنعلنوا كل التفاصيل الرسمية يوم 20 مايو ✨";
  }
  return "Bookings will open soon, and all booking details will be announced officially on May 20 ✨";
}

function priceAnnouncement(lang: Language): string {
  if (lang === "ar") {
    return "الأسعار سيتم الإعلان عنها رسمياً يوم 20 مايو ✨";
  }
  return "Prices will be announced officially on May 20 ✨";
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
  const lang = detectLanguage(text);

  if (!senderId || !text) return;

  console.log("[messenger.webhook] sender message", {
    senderId,
    text,
  });

  let replyText = "";
  if (isBookingQuestion(text)) {
    replyText = bookingAnnouncement(lang);
  } else if (isPriceQuestion(text)) {
    replyText = priceAnnouncement(lang);
  } else {
    const aiResult = await generateAIResponse(text, []);
    replyText = aiResult.text;
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
