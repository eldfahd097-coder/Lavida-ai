import { Hono } from "hono";
import { env } from "./lib/env";
import { sendMessengerMessage } from "./lib/messenger";
import { generateAIResponse } from "./ai-engine";
import { detectLanguage, type Language } from "@contracts/templates";
import nodemailer from "nodemailer";

const app = new Hono();
const senderSessions = new Map<string, SenderSession>();
const recentMessageIds = new Map<string, number>();
const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;
const MAX_HISTORY_ITEMS = 20;

function detectMessageLanguage(message: string): Language {
  if (/[\u0600-\u06FF]/.test(message)) return "ar";
  return detectLanguage(message);
}

function normalizeInput(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ً-ْ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\bresturent\b/g, "restaurant")
    .replace(/\bresturant\b/g, "restaurant")
    .replace(/\bjet\s*ski\b/g, "jetski")
    .replace(/\bjitski\b/g, "jetski")
    .replace(/\bjtski\b/g, "jetski")
    .replace(/\bas3ar\b/g, "prices")
    .replace(/\b7ajz\b/g, "booking")
    .replace(/\bsheno\b|\bshno\b|\bshn\b/g, "شنو")
    .replace(/\bwen\b|\bween\b/g, "وين")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function detectAccommodationType(text: string): BookingData["accommodation"] | undefined {
  if (hasAny(text, ["vip villa", "فيلا vip", "فلل vip", "فيلا في اي بي"])) {
    return "VIP Villa private pool up to 8 guests";
  }
  if (hasAny(text, ["presidential", "رئاسي", "رئاسية"])) {
    return "Presidential Villa private pool up to 10 guests";
  }
  if (hasAny(text, ["family chalet", "شاليه", "شاليهات", "chalet"])) {
    return "Family Chalet up to 5 guests";
  }
  if (hasAny(text, ["hotel apartment", "apartment", "شقه", "شقق"])) {
    return "Hotel Apartment up to 3 guests";
  }
  if (hasAny(text, ["villa", "فيلا", "فلل"])) {
    return "VIP Villa private pool up to 8 guests";
  }
  return undefined;
}

function extractPhone(text: string): string | undefined {
  const match = text.match(/(\+?\d[\d\s-]{7,}\d)/);
  return match?.[1]?.replace(/\s+/g, " ").trim();
}

function extractGuestCount(text: string): string | undefined {
  const rangeMatch = text.match(/\b(\d{1,2})\s*[/-]\s*(\d{1,2})\b/);
  if (rangeMatch?.[2]) return rangeMatch[2];

  const digitMatch = text.match(/\b(\d{1,2})\s*(guest|guests|people|persons|شخص|اشخاص|أشخاص)?\b/i);
  if (digitMatch?.[1]) return digitMatch[1];
  return undefined;
}

function extractDate(text: string): string | undefined {
  const fromTo = text.match(
    /(من\s+\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\s+الى\s+\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)|(from\s+\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\s+to\s+\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)/i,
  )?.[0];
  if (fromTo) return fromTo;
  const first = text.match(/\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/g);
  if (first?.length) return first.join(" to ");
  return undefined;
}

function extractName(text: string): string | undefined {
  const en = text.match(/(?:my name is|name is)\s+([a-z][a-z\s'-]{1,40})/i)?.[1];
  if (en) return en.trim();
  const ar = text.match(/(?:اسمي|الاسم)\s*[:-]?\s*([^\d\n]{2,40})/)?.[1];
  if (ar) return ar.trim();
  if (!extractPhone(text) && text.trim().split(/\s+/).length <= 4 && /[a-zA-Z\u0600-\u06FF]/.test(text)) {
    return text.trim();
  }
  return undefined;
}

function detectIntents(text: string): IntentName[] {
  const intents: IntentName[] = [];
  const push = (intent: IntentName, matched: boolean) => {
    if (matched && !intents.includes(intent)) intents.push(intent);
  };

  push("prices", hasAny(text, ["price", "prices", "how much", "cost", "rates", "بكم", "قداش", "سعر", "اسعار", "الاسعار"]));
  push("booking", hasAny(text, ["book", "booking", "reservation", "availability", "حجز", "الحجز", "نحجز", "متاح"]));
  push("opening", hasAny(text, ["opening", "when open", "opening date", "الافتتاح", "متى تفتحو", "موعد الافتتاح"]));
  push("rooms", hasAny(text, ["room", "rooms", "villa", "villas", "chalet", "chalets", "apartment", "accommodation", "الغرف", "فلل", "شاليهات", "شقق"]));
  push("private_pool", hasAny(text, ["private pool", "مسبح خاص"]));
  push("jetski", hasAny(text, ["jetski", "water sports", "جتسكي", "انشطه بحريه", "أنشطة بحرية"]));
  push("cafe_food", hasAny(text, ["cafe", "café", "food", "restaurant", "مطعم", "مطاعم", "كافيه", "اكل", "أكل"]));
  push("supermarket", hasAny(text, ["supermarket", "market", "grocery", "سوبرماركت", "بقاله", "بقالة"]));
  push("pool", hasAny(text, ["pool", "swimming pool", "مسبح"]));
  push("football_volleyball", hasAny(text, ["football", "soccer", "volleyball", "court", "ملعب", "كرة", "طائره", "طائرة"]));
  push("kids", hasAny(text, ["kids", "children", "family", "families", "اطفال", "العائله", "عائلات", "عائلية"]));
  push("night_activities", hasAny(text, ["night", "entertainment", "world cup", "arcade", "ليل", "ترفيه", "مباريات", "ألعاب"]));
  push("location", hasAny(text, ["location", "address", "maps", "where", "وين", "موقع", "العنوان", "زوارة"]));
  push("contact", hasAny(text, ["phone", "contact", "number", "call", "whatsapp", "واتساب", "رقم", "تواصل"]));
  push("photos", hasAny(text, ["photo", "photos", "image", "gallery", "صور"]));
  push("thanks", hasAny(text, ["thanks", "thank you", "شكرا", "يسلمو", "تسلم"]));
  push("greeting", hasAny(text, ["hi", "hello", "hey", "السلام عليكم", "سلام", "مرحبا", "اهلا"]));
  push("human_handoff", hasAny(text, ["human", "agent", "manager", "admin", "complaint", "problem", "موظف", "الإدارة", "مشكلة"]));
  push("general", hasAny(text, ["what do you offer", "tell me more", "what else", "ممكن معلومات", "معلومات", "تفاصيل", "شنو عندكم"]));

  return intents;
}

function replyForIntent(intent: IntentName, lang: Language): string | undefined {
  if (intent === "prices") return lang === "ar" ? "الأسعار سيتم الإعلان عنها رسمياً يوم 20 مايو ✨" : "Prices will be announced officially on May 20 ✨";
  if (intent === "opening") return lang === "ar" ? "الافتتاح الرسمي يوم 1 يونيو 2026 ✨" : "La Vida officially opens on June 1 2026 ✨";
  if (intent === "photos") {
    return lang === "ar"
      ? "حالياً الصور الرسمية الخاصة بالشاليهات والمنتجع مش متوفرة عندنا توا ✨ وحنشاركوا كل الصور والتحديثات البصرية قريباً مع موعد الافتتاح والإعلان الرسمي للحجز"
      : "Official chalet and resort images are not available yet ✨ Photos and visual updates will be shared closer to opening and the official booking announcement";
  }
  if (intent === "location") return lang === "ar" ? "لافيدا موجودة في زوارة ليبيا ✨ lavidaresort.ly" : "La Vida is located in Zuwarah Libya ✨ lavidaresort.ly";
  if (intent === "contact") {
    return lang === "ar"
      ? "تقدروا تتواصلوا مع لافيدا على\n093 888 8868\n093 888 8878 ✨"
      : "You can contact La Vida on\n093 888 8868\n093 888 8878 ✨";
  }
  if (intent === "jetski") return lang === "ar" ? "أكيد ✨ الجتسكي والأنشطة البحرية متوفرة في لافيدا." : "Yes ✨ Jet ski and water sports are available at La Vida.";
  if (intent === "cafe_food") return lang === "ar" ? "أكيد ✨ في لافيدا كافيه شاطئي ومنطقة أكل." : "Yes ✨ La Vida has a beach café and food area.";
  if (intent === "rooms") {
    return lang === "ar"
      ? "لدينا فلل VIP بمسابح خاصة حتى 8 أشخاص، فلل رئاسية حتى 10، شاليهات عائلية حتى 5، وشقق فندقية حتى 3 ✨"
      : "We offer VIP villas with private pools up to 8 guests, presidential villas up to 10, family chalets up to 5, and hotel apartments up to 3 ✨";
  }
  if (intent === "private_pool") return lang === "ar" ? "نعم ✨ فلل VIP والفلل الرئاسية فيها مسابح خاصة." : "Yes ✨ VIP and presidential villas include private pools.";
  if (intent === "supermarket") return lang === "ar" ? "أكيد ✨ متوفر سوبرماركت ضمن الخدمات." : "Yes ✨ A supermarket is available within resort services.";
  if (intent === "pool") return lang === "ar" ? "أكيد ✨ في مسبح كبير داخل المنتجع." : "Yes ✨ There is a large pool in the resort.";
  if (intent === "football_volleyball") return lang === "ar" ? "أكيد ✨ عندنا ملعب كرة وملعب طائرة." : "Yes ✨ We have football and volleyball courts.";
  if (intent === "kids") return lang === "ar" ? "لافيدا مناسبة للعائلات وفيها أنشطة للأطفال ✨" : "La Vida is family friendly with kids activities ✨";
  if (intent === "night_activities") return lang === "ar" ? "فيه ترفيه ليلي، مشاهدة مباريات، وألعاب شبابية ✨" : "There is night entertainment, match screenings, and youth arcade activities ✨";
  if (intent === "human_handoff") return lang === "ar" ? "أكيد ✨ أحد أعضاء الفريق حيتواصل معاكم قريباً." : "Of course ✨ A team member will reach out shortly.";
  if (intent === "thanks") return lang === "ar" ? "تحت أمركم في أي وقت ✨" : "Always happy to help ✨";
  if (intent === "greeting") return lang === "ar" ? "أهلاً وسهلاً بكم في La Vida ✨ كيف نقدر نساعدكم؟" : "Welcome to La Vida ✨ How can we help you today?";
  if (intent === "general") {
    return lang === "ar"
      ? "لافيدا منتجع فاخر على البحر في زوارة فيه إقامة متنوعة وأنشطة بحرية وكافيه ومرافق عائلية ✨"
      : "La Vida is a luxury beachfront resort in Zuwarah with varied stays, water activities, café options, and family-friendly facilities ✨";
  }
  return undefined;
}

function bookingPrompt(lang: Language): string {
  return lang === "ar"
    ? "ممتاز ✨ خلونا نكمل طلب الحجز المبدئي. ابعت الاسم، رقم الهاتف، نوع الإقامة، عدد الضيوف، والتاريخ."
    : "Great ✨ Let’s complete your booking interest. Please share name, phone, accommodation type, guest count, and preferred date.";
}

function bookingSummary(interest: BookingData, lang: Language): string {
  if (lang === "ar") {
    return `تم استلام طلب الحجز المبدئي ✨
الاسم: ${interest.name ?? "-"}
رقم الهاتف: ${interest.phone ?? "-"}
نوع الإقامة: ${interest.accommodation ?? "-"}
عدد الضيوف: ${interest.guests ?? "-"}
التاريخ: ${interest.date ?? "-"}
فريق لافيدا حيتواصل معاكم عند فتح الحجز`;
  }
  return `Your booking interest has been received ✨
Name: ${interest.name ?? "-"}
Phone: ${interest.phone ?? "-"}
Accommodation: ${interest.accommodation ?? "-"}
Guests: ${interest.guests ?? "-"}
Date: ${interest.date ?? "-"}
The La Vida team will contact you once booking opens`;
}

async function sendBookingInterestEmail(
  interest: BookingData,
  senderId: string,
  history: SessionMessage[],
): Promise<boolean> {
  if (!env.smtpHost || !env.smtpPort || !env.smtpUser || !env.smtpPass) {
    console.error("EMAIL FAILED", "SMTP config missing");
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
    const formattedHistory = history
      .map((item) => `${new Date(item.timestamp).toISOString()} [${item.role}] ${item.content}`)
      .join("\n");
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
        `Notes: ${interest.notes ?? "-"}`,
        `Messenger sender ID: ${senderId}`,
        `Timestamp: ${timestamp}`,
        "",
        "Full conversation history:",
        formattedHistory || "-",
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
            <tr><td><strong>Notes</strong></td><td>${interest.notes ?? "-"}</td></tr>
            <tr><td><strong>Messenger sender ID</strong></td><td>${senderId}</td></tr>
            <tr><td><strong>Timestamp</strong></td><td>${timestamp}</td></tr>
          </table>
          <h3>Conversation History</h3>
          <pre>${formattedHistory || "-"}</pre>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("EMAIL FAILED", error);
    return false;
  }
}

function bookingMissingPrompt(missing: string[], lang: Language): string {
  if (lang === "ar") {
    return `ممتاز ✨ باقي فقط: ${missing.join("، ")}.`;
  }
  return `Great ✨ I still need: ${missing.join(", ")}.`;
}

function updateBookingData(bookingData: BookingData, rawText: string, normalizedText: string): BookingData {
  const updated: BookingData = { ...bookingData };
  updated.name = updated.name ?? extractName(rawText);
  updated.phone = updated.phone ?? extractPhone(rawText);
  updated.accommodation = updated.accommodation ?? detectAccommodationType(normalizedText);
  updated.guests = updated.guests ?? extractGuestCount(normalizedText);
  updated.date = updated.date ?? extractDate(rawText);
  if (!updated.notes && rawText.length > 10 && !updated.name && !updated.phone && !updated.date && !updated.guests) {
    updated.notes = rawText;
  }
  return updated;
}

function bookingMissingFields(data: BookingData, lang: Language): string[] {
  const missing: string[] = [];
  if (!data.name) missing.push(lang === "ar" ? "الاسم" : "name");
  if (!data.phone) missing.push(lang === "ar" ? "رقم الهاتف" : "phone");
  if (!data.accommodation) missing.push(lang === "ar" ? "نوع الإقامة" : "accommodation");
  if (!data.guests) missing.push(lang === "ar" ? "عدد الضيوف" : "guests");
  if (!data.date) missing.push(lang === "ar" ? "التاريخ" : "date");
  return missing;
}

function isBookingDataMessage(rawText: string, normalizedText: string): boolean {
  return Boolean(
    extractPhone(rawText) ||
      extractDate(rawText) ||
      extractGuestCount(normalizedText) ||
      extractName(rawText) ||
      detectAccommodationType(normalizedText),
  );
}

function getSession(senderId: string, lang: Language): SenderSession {
  const existing = senderSessions.get(senderId);
  if (existing) return existing;
  const created: SenderSession = {
    senderId,
    lastIntent: "general",
    lastTopic: "general",
    language: lang,
    bookingState: "idle",
    bookingData: {},
    history: [],
  };
  senderSessions.set(senderId, created);
  return created;
}

function addSessionMessage(session: SenderSession, role: "user" | "assistant", content: string): void {
  session.history.push({ role, content, timestamp: Date.now() });
  if (session.history.length > MAX_HISTORY_ITEMS) {
    session.history = session.history.slice(-MAX_HISTORY_ITEMS);
  }
}

function hasFollowUpPrompt(text: string): boolean {
  return /^(ok|okay|tell me more|more|details|when|what else|and\??|i want to know more|شنو اكثر|شنو اكتر|زيد|زيدني|وضح|وضّح|more details|امتى|متى|وبعدين|شن بعد)$/i.test(
    text.trim(),
  );
}

function composeMultiIntentReply(intents: IntentName[], lang: Language): string | undefined {
  const mapped = intents
    .map((intent) => replyForIntent(intent, lang))
    .filter((value): value is string => Boolean(value));
  const unique = Array.from(new Set(mapped));
  if (!unique.length) return undefined;
  return unique.slice(0, 3).join("\n");
}

async function sendAndTrackReply(session: SenderSession, text: string): Promise<void> {
  addSessionMessage(session, "assistant", text);
  session.lastBotQuestion = /[?؟]/.test(text) ? text : session.lastBotQuestion;
  const sendResult = await sendMessengerMessage(session.senderId, text);
  if (!sendResult.success) {
    console.error("[messenger.webhook] Failed to send reply", {
      senderId: session.senderId,
      error: sendResult.error,
    });
  }
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
  const lang = detectMessageLanguage(text);

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

  const session = getSession(senderId, lang);
  session.language = lang;
  session.lastMessageId = messageId;
  addSessionMessage(session, "user", text);

  const normalizedText = normalizeInput(text);
  const intents = detectIntents(normalizedText);
  if (intents.length > 0) {
    session.lastIntent = intents[0];
    session.lastTopic = intents[0];
  }

  if (session.bookingState === "active" || intents.includes("booking")) {
    session.bookingState = "active";
    session.bookingData = updateBookingData(session.bookingData, text, normalizedText);
    const missing = bookingMissingFields(session.bookingData, lang);
    const replyText = missing.length ? (missing.length === 5 ? bookingPrompt(lang) : bookingMissingPrompt(missing, lang)) : bookingSummary(session.bookingData, lang);

    if (!missing.length) {
      session.bookingState = "completed";
      await sendBookingInterestEmail(session.bookingData, senderId, session.history);
    }

    await sendAndTrackReply(session, replyText);
    return;
  }

  if (session.lastTopic === "booking" && isBookingDataMessage(text, normalizedText)) {
    session.bookingState = "active";
    session.bookingData = updateBookingData(session.bookingData, text, normalizedText);
    const missing = bookingMissingFields(session.bookingData, lang);
    const replyText = missing.length ? bookingMissingPrompt(missing, lang) : bookingSummary(session.bookingData, lang);
    if (!missing.length) {
      session.bookingState = "completed";
      await sendBookingInterestEmail(session.bookingData, senderId, session.history);
    }
    await sendAndTrackReply(session, replyText);
    return;
  }

  const followUpToLastTopic = hasFollowUpPrompt(text) && session.lastTopic !== "general";
  const resolvedIntents = intents.length
    ? intents
    : followUpToLastTopic
      ? [session.lastTopic]
      : [];

  const templateReply = composeMultiIntentReply(resolvedIntents, lang);
  if (templateReply) {
    await sendAndTrackReply(session, templateReply);
    return;
  }

  const historyForAI = session.history.map((item) => ({ role: item.role, content: item.content }));
  const resolvedText = followUpToLastTopic ? `${text} ${session.lastTopic}` : text;
  const aiResult = await generateAIResponse(resolvedText, historyForAI, lang);
  await sendAndTrackReply(session, aiResult.text);
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

type BookingData = {
  name?: string;
  phone?: string;
  accommodation?: string;
  guests?: string;
  date?: string;
  notes?: string;
};

type SessionMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

type BookingState = "idle" | "active" | "completed";

type IntentName =
  | "prices"
  | "booking"
  | "opening"
  | "rooms"
  | "private_pool"
  | "jetski"
  | "cafe_food"
  | "supermarket"
  | "pool"
  | "football_volleyball"
  | "kids"
  | "night_activities"
  | "location"
  | "contact"
  | "photos"
  | "thanks"
  | "greeting"
  | "human_handoff"
  | "general";

type SenderSession = {
  senderId: string;
  lastIntent: IntentName;
  lastTopic: IntentName | "general";
  language: Language;
  bookingState: BookingState;
  bookingData: BookingData;
  lastBotQuestion?: string;
  lastMessageId?: string;
  history: SessionMessage[];
};

export default app;
