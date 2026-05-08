import { Hono } from "hono";
import { env } from "./lib/env";
import { sendMessengerMessage } from "./lib/messenger";
import { generateAIResponse } from "./ai-engine";
import { detectLanguage, type Language } from "@contracts/templates";
import nodemailer from "nodemailer";

const app = new Hono();
const lastTopicBySender = new Map<string, string>();
const recentMessageIds = new Map<string, number>();
const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;
const bookingInterestBySender = new Map<string, BookingInterest>();

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

function isBookingIntent(text: string): boolean {
  const value = text.toLowerCase();
  return /book|booking|reservation|reserve|availability|حجز|الحجز|نحجز|نبي نحجز|طريقة الحجز|في حجز/.test(value);
}

function detectAccommodationType(text: string): string | undefined {
  const value = text.toLowerCase();
  if (/vip villa|فيلا vip|فلل vip|vip/.test(value)) return "VIP Villa (up to 8 guests, private pool)";
  if (/presidential|رئاسي|رئاسية/.test(value)) return "Presidential Villa (up to 10 guests, private pool)";
  if (/family chalet|شاليه|شاليهات/.test(value)) return "Family Chalet (up to 5 guests)";
  if (/hotel apartment|apartment|شقة|شقق/.test(value)) return "Hotel Apartment (up to 3 guests)";
  return undefined;
}

function extractPhone(text: string): string | undefined {
  const match = text.match(/(\+?\d[\d\s-]{6,}\d)/);
  return match?.[1]?.replace(/\s+/g, " ").trim();
}

function extractGuestCount(text: string): string | undefined {
  const digitMatch = text.match(/\b(\d{1,2})\s*(guest|guests|people|persons|شخص|أشخاص)?\b/i);
  if (digitMatch?.[1]) return digitMatch[1];
  const arMatch = text.match(/(\d{1,2})\s*(شخص|أشخاص)/);
  return arMatch?.[1];
}

function extractDate(text: string): string | undefined {
  const iso = text.match(/\b\d{4}-\d{1,2}-\d{1,2}\b/)?.[0];
  if (iso) return iso;
  const slash = text.match(/\b\d{1,2}[/-]\d{1,2}([/-]\d{2,4})?\b/)?.[0];
  if (slash) return slash;
  const monthWord = text.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
  )?.[0];
  return monthWord;
}

function extractName(text: string): string | undefined {
  const lower = text.toLowerCase();
  const en = lower.match(/(?:my name is|name is)\s+([a-z][a-z\s'-]{1,40})/i)?.[1];
  if (en) return en.trim();
  const ar = text.match(/(?:اسمي|الاسم)\s*[:\-]?\s*([^\d\n]{2,40})/)?.[1];
  if (ar) return ar.trim();
  if (!extractPhone(text) && text.trim().split(/\s+/).length <= 4 && /[a-zA-Z\u0600-\u06FF]/.test(text)) {
    return text.trim();
  }
  return undefined;
}

function bookingPrompt(lang: Language): string {
  if (lang === "ar") {
    return "الحجز الرسمي بيفتح قريباً وحنعلنوا كل التفاصيل يوم 20 مايو ✨\nنقدر ناخذ بياناتكم مبدئياً باش يتواصل معاكم الفريق أول ما يفتح الحجز\n\nشن الاسم ورقم الهاتف ونوع الإقامة اللي مهتمين بيها؟";
  }
  return "Official booking will open soon and all details will be announced on May 20 ✨\nI can take your details now so the team can contact you once booking opens\n\nPlease send your name phone number and preferred accommodation type";
}

function bookingSummary(interest: BookingInterest, lang: Language): string {
  const name = interest.name ?? "-";
  const phone = interest.phone ?? "-";
  const accommodation = interest.accommodation ?? "-";
  const guests = interest.guests ?? "-";
  const date = interest.date ?? "-";
  if (lang === "ar") {
    return `تم استلام بياناتكم مبدئياً ✨
الاسم: ${name}
رقم الهاتف: ${phone}
نوع الإقامة: ${accommodation}
عدد الضيوف: ${guests}
التاريخ: ${date}
فريق لافيدا حيتواصل معاكم عند فتح الحجز`;
  }
  return `Your booking interest has been received ✨
Name: ${name}
Phone: ${phone}
Accommodation: ${accommodation}
Guests: ${guests}
Date: ${date}
The La Vida team will contact you once booking opens`;
}

async function sendBookingInterestEmail(
  interest: BookingInterest,
  senderId: string,
): Promise<boolean> {
  if (!env.smtpHost || !env.smtpPort || !env.smtpUser || !env.smtpPass) {
    console.error("[messenger.webhook] SMTP config missing; skipping booking interest email");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: Number(env.smtpPort),
      secure: Number(env.smtpPort) === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });

    const timestamp = new Date().toISOString();
    await transporter.sendMail({
      from: `"La Vida AI" <${env.smtpUser}>`,
      to: "info@lavidaresort.ly",
      subject: "New Booking Interest - La Vida AI",
      text: [
        "New booking interest received from Messenger.",
        "",
        `Name: ${interest.name ?? "-"}`,
        `Phone number: ${interest.phone ?? "-"}`,
        `Accommodation type: ${interest.accommodation ?? "-"}`,
        `Guest count: ${interest.guests ?? "-"}`,
        `Preferred dates: ${interest.date ?? "-"}`,
        `Messenger sender ID: ${senderId}`,
        `Timestamp: ${timestamp}`,
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222">
          <h2>New Booking Interest - La Vida AI</h2>
          <p>A new booking interest was received from Messenger.</p>
          <table cellpadding="6" cellspacing="0" border="0">
            <tr><td><strong>Name</strong></td><td>${interest.name ?? "-"}</td></tr>
            <tr><td><strong>Phone number</strong></td><td>${interest.phone ?? "-"}</td></tr>
            <tr><td><strong>Accommodation type</strong></td><td>${interest.accommodation ?? "-"}</td></tr>
            <tr><td><strong>Guest count</strong></td><td>${interest.guests ?? "-"}</td></tr>
            <tr><td><strong>Preferred dates</strong></td><td>${interest.date ?? "-"}</td></tr>
            <tr><td><strong>Messenger sender ID</strong></td><td>${senderId}</td></tr>
            <tr><td><strong>Timestamp</strong></td><td>${timestamp}</td></tr>
          </table>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("[messenger.webhook] Failed to send booking interest email", error);
    return false;
  }
}

function bookingMissingPrompt(missing: string[], lang: Language): string {
  if (lang === "ar") {
    return `ممتاز ✨ باقي فقط: ${missing.join("، ")}.`;
  }
  return `Great ✨ I still need: ${missing.join(", ")}.`;
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
  const lang = detectLanguage(text);

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

  const existingInterest = bookingInterestBySender.get(senderId);
  if (isBookingIntent(text) && !existingInterest?.completed) {
    const draft: BookingInterest = existingInterest ?? { completed: false };
    draft.name = draft.name ?? extractName(text);
    draft.phone = draft.phone ?? extractPhone(text);
    draft.accommodation = draft.accommodation ?? detectAccommodationType(text);
    draft.guests = draft.guests ?? extractGuestCount(text);
    draft.date = draft.date ?? extractDate(text);
    bookingInterestBySender.set(senderId, draft);

    const missing: string[] = [];
    if (!draft.name) missing.push(lang === "ar" ? "الاسم" : "name");
    if (!draft.phone) missing.push(lang === "ar" ? "رقم الهاتف" : "phone number");
    if (!draft.accommodation) missing.push(lang === "ar" ? "نوع الإقامة" : "accommodation type");

    const replyText =
      missing.length === 3
        ? bookingPrompt(lang)
        : missing.length > 0
          ? bookingMissingPrompt(missing, lang)
          : bookingSummary(draft, lang);

    if (missing.length === 0) {
      draft.completed = true;
      bookingInterestBySender.set(senderId, draft);
      const emailed = await sendBookingInterestEmail(draft, senderId);
      if (emailed) {
        const successReply =
          lang === "ar"
            ? "تم استلام طلبكم المبدئي ✨\nفريق لافيدا حيتواصل معاكم عند فتح الحجز"
            : "Your booking interest has been received ✨\nThe La Vida team will contact you once booking opens";
        const sendResult = await sendMessengerMessage(senderId, successReply);
        if (!sendResult.success) {
          console.error("[messenger.webhook] Failed to send booking-interest confirmation", {
            senderId,
            error: sendResult.error,
          });
        }
        return;
      }
    }

    const sendResult = await sendMessengerMessage(senderId, replyText);
    if (!sendResult.success) {
      console.error("[messenger.webhook] Failed to send booking-interest reply", {
        senderId,
        error: sendResult.error,
      });
    }
    return;
  }

  if (existingInterest && !existingInterest.completed) {
    existingInterest.name = existingInterest.name ?? extractName(text);
    existingInterest.phone = existingInterest.phone ?? extractPhone(text);
    existingInterest.accommodation = existingInterest.accommodation ?? detectAccommodationType(text);
    existingInterest.guests = existingInterest.guests ?? extractGuestCount(text);
    existingInterest.date = existingInterest.date ?? extractDate(text);
    bookingInterestBySender.set(senderId, existingInterest);

    const missing: string[] = [];
    if (!existingInterest.name) missing.push(lang === "ar" ? "الاسم" : "name");
    if (!existingInterest.phone) missing.push(lang === "ar" ? "رقم الهاتف" : "phone number");
    if (!existingInterest.accommodation) missing.push(lang === "ar" ? "نوع الإقامة" : "accommodation type");

    const replyText =
      missing.length > 0
        ? bookingMissingPrompt(missing, lang)
        : bookingSummary(existingInterest, lang);
    if (missing.length === 0) {
      existingInterest.completed = true;
      bookingInterestBySender.set(senderId, existingInterest);
      const emailed = await sendBookingInterestEmail(existingInterest, senderId);
      if (emailed) {
        const successReply =
          lang === "ar"
            ? "تم استلام طلبكم المبدئي ✨\nفريق لافيدا حيتواصل معاكم عند فتح الحجز"
            : "Your booking interest has been received ✨\nThe La Vida team will contact you once booking opens";
        const sendResult = await sendMessengerMessage(senderId, successReply);
        if (!sendResult.success) {
          console.error("[messenger.webhook] Failed to send booking-interest confirmation", {
            senderId,
            error: sendResult.error,
          });
        }
        return;
      }
    }

    const sendResult = await sendMessengerMessage(senderId, replyText);
    if (!sendResult.success) {
      console.error("[messenger.webhook] Failed to send booking-interest follow-up", {
        senderId,
        error: sendResult.error,
      });
    }
    return;
  }

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

type BookingInterest = {
  name?: string;
  phone?: string;
  accommodation?: string;
  guests?: string;
  date?: string;
  completed: boolean;
};

export default app;
