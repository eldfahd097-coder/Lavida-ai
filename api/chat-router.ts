import { z } from "zod";
import { publicQuery, createRouter } from "./middleware";
import { detectLanguage, type Language } from "@contracts/templates";
import { TRPCError } from "@trpc/server";
import OpenAI from "openai";
import {
  getBookingLeadPrompt,
  getKnowledgeBlockForPrompt,
  getResponseStyleRules,
  getMealsReply,
  getPhotosReply,
  getLocationReply,
  getRestaurantsReply,
  getHumanHandoffReply,
  getOpeningDateReply,
  getContactReply,
  matchAccommodation,
  accommodationBookingLabel,
  resolvePriceOrUnitReply,
  resolveBookingLeadReply,
  RESORT_BRAND,
} from "./resort-knowledge";

const RESORT_INFO = {
  name: RESORT_BRAND.name,
  location: RESORT_BRAND.locationEn,
  website: RESORT_BRAND.website,
  phones: RESORT_BRAND.phonesFormatted,
  email: RESORT_BRAND.email,
  messengerLink: RESORT_BRAND.messengerLink,
} as const;

type ChatRole = "user" | "assistant";

type ChatHistoryItem = {
  role: ChatRole;
  content: string;
};

type BookingState = {
  active: boolean;
  fullName?: string;
  accommodationType?: string;
  dates?: string;
  guestCount?: number;
  phoneNumber?: string;
};

type ConversationState = {
  topic: "booking" | "location" | "food" | "pricing" | "contact" | "media" | "amenities" | "general";
  previousQuestion?: string;
  booking: BookingState;
};

function detectMessageLanguage(message: string): Language {
  if (/[\u0600-\u06FF]/.test(message)) return "ar";
  return detectLanguage(message);
}

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ً-ْ]/g, "")
    .replace(/[^\p{L}\p{N}\s/+.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function formatKnownBookingData(booking: BookingState): string {
  const known: string[] = [];
  if (booking.fullName) known.push(`name=${booking.fullName}`);
  if (booking.accommodationType) known.push(`accommodation=${booking.accommodationType}`);
  if (booking.dates) known.push(`dates=${booking.dates}`);
  if (booking.guestCount) known.push(`guestCount=${booking.guestCount}`);
  if (booking.phoneNumber) known.push(`phone=${booking.phoneNumber}`);
  return known.join(", ") || "none";
}

function getLastUserQuestion(history: ChatHistoryItem[]): string | undefined {
  const users = history
    .filter((item) => item.role === "user")
    .map((item) => item.content.trim())
    .filter(Boolean);
  const reversed = [...users].reverse();
  const candidate = reversed.find((text) => /[?؟]/.test(text) || text.length > 5);
  return candidate ?? reversed[0];
}

function extractFullName(message: string): string | undefined {
  const named = message.match(/(?:اسمي|اسمي هو|انا|أنا|my name is|i am|i'm)\s+(.+)/i);
  if (named?.[1]) {
    const value = named[1].trim().replace(/[?.!،,]/g, "").slice(0, 80);
    if (value.length >= 2) return value;
  }
  return undefined;
}
function extractAccommodationType(text: string): string | undefined {
  const unit = matchAccommodation(text);
  if (unit) return accommodationBookingLabel(unit);
  if (hasAny(text, ["مطعم", "مطاعم", "restaurant", "resturent", "resturant", "cafe", "caf"])) return "restaurant";
  return undefined;
}

function extractGuestCount(text: string): number | undefined {
  const rangeMatch = text.match(/\b(\d{1,2})\s*[/-]\s*(\d{1,2})\b/);
  if (rangeMatch) {
    const value = Number.parseInt(rangeMatch[2] ?? rangeMatch[1] ?? "", 10);
    if (Number.isFinite(value) && value > 0 && value <= 30) return value;
  }
  const guestRegexes = [
    /\b(\d{1,2})\s*(?:guests?|people|persons?)\b/i,
    /(?:عدد|ضيوف|اشخاص|أشخاص)\s*(\d{1,2})/,
    /^(\d{1,2})$/,
  ];
  for (const regex of guestRegexes) {
    const match = text.match(regex);
    const value = Number.parseInt(match?.[1] ?? "", 10);
    if (Number.isFinite(value) && value > 0 && value <= 30) return value;
  }
  return undefined;
}

function extractPhoneNumber(message: string): string | undefined {
  const phoneMatch = message.match(/(\+?\d[\d\s-]{7,}\d)/);
  const value = phoneMatch?.[1]?.trim();
  return value || undefined;
}

function extractDates(message: string): string | undefined {
  const datePatterns = [
    /\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/g,
    /\b(?:from|to|من|الى|إلى)\s+\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/gi,
    /\b(?:today|tomorrow|weekend|اليوم|بكره|بكرة|الويكند)\b/gi,
  ];
  for (const pattern of datePatterns) {
    const match = message.match(pattern);
    if (match?.length) return match.join(" - ");
  }
  return undefined;
}

function inferConversationState(message: string, history: ChatHistoryItem[]): ConversationState {
  const normalizedCurrent = normalizeText(message);
  const normalizedHistoryUsers = history
    .filter((item) => item.role === "user")
    .map((item) => normalizeText(item.content))
    .join(" ");
  const mergedText = `${normalizedHistoryUsers} ${normalizedCurrent}`.trim();

  const bookingActive = hasAny(mergedText, [
    "book",
    "booking",
    "reservation",
    "availability",
    "حجز",
    "حجوزات",
    "نبي نحجز",
    "كيف نحجز",
    "متاح",
  ]);
  const asksLocation = hasAny(normalizedCurrent, ["location", "maps", "where", "وين", "موقع", "العنوان"]);
  const asksFood = hasAny(normalizedCurrent, ["food", "restaurant", "resturent", "مطاعم", "مطعم", "كافيه"]);
  const asksPricing = hasAny(normalizedCurrent, ["price", "prices", "rate", "cost", "اسعار", "الاسعار", "سعر"]);
  const asksContact = hasAny(normalizedCurrent, ["phone", "whatsapp", "واتساب", "رقم", "تواصل"]);
  const asksMedia = hasAny(normalizedCurrent, ["صور", "photo", "photos", "picture", "gallery"]);
  const asksAmenities = hasAny(normalizedCurrent, ["pool", "مسبح", "jetski", "جتسكي", "jet ski", "water sports"]);

  let topic: ConversationState["topic"] = "general";
  if (bookingActive) topic = "booking";
  else if (asksLocation) topic = "location";
  else if (asksFood) topic = "food";
  else if (asksPricing) topic = "pricing";
  else if (asksContact) topic = "contact";
  else if (asksMedia) topic = "media";
  else if (asksAmenities) topic = "amenities";

  const mergedRaw = [...history.map((item) => item.content), message].join(" ");
  const booking: BookingState = {
    active: bookingActive,
    fullName: extractFullName(mergedRaw),
    accommodationType: extractAccommodationType(mergedText),
    dates: extractDates(mergedRaw),
    guestCount: extractGuestCount(normalizedCurrent) ?? extractGuestCount(mergedText),
    phoneNumber: extractPhoneNumber(mergedRaw),
  };

  return {
    topic,
    previousQuestion: getLastUserQuestion(history),
    booking,
  };
}

function bookingNextStepReply(state: ConversationState, message: string, history: ChatHistoryItem[], lang: Language): string | undefined {
  if (!state.booking.active) return undefined;
  const conversationMessages = history.map((item) => item.content);
  return resolveBookingLeadReply(message, conversationMessages, lang);
}

function getShortcutReply(message: string, lang: Language): string | undefined {
  const text = normalizeText(message);
  if (!text) return undefined;

  if (hasAny(text, ["موقع", "location", "maps", "address", "وين"])) {
    return getLocationReply(lang);
  }
  if (hasAny(text, ["شامل الوجبات", "شامل الفطور", "وجبات", "فطور", "full board", "breakfast", "meals included"])) {
    return getMealsReply(lang);
  }
  if (hasAny(text, ["مطاعم", "مطعم", "restaurant", "resturent", "resturant", "food", "cafe"])) {
    return getRestaurantsReply(lang);
  }
  if (hasAny(text, ["حجز", "booking", "book", "reservation", "نبي نحجز", "كيف نحجز"])) {
    return getBookingLeadPrompt(lang);
  }
  if (hasAny(text, ["متى الافتتاح", "الافتتاح", "opening date", "opening"])) {
    return getOpeningDateReply(lang);
  }
  if (hasAny(text, ["شكوى", "دفع", "payment", "complaint", "تأكيد الحجز"])) {
    return getHumanHandoffReply(lang);
  }
  const priceReply = resolvePriceOrUnitReply(text, lang);
  if (priceReply && hasAny(text, ["اسعار", "الاسعار", "سعر", "price", "prices", "cost", "بكم", "offer", "عروض", "included", "مشمول"])) {
    return priceReply;
  }
  if (hasAny(text, ["اسعار", "الاسعار", "سعر", "price", "prices", "cost", "بكم"])) {
    return resolvePriceOrUnitReply("prices", lang);
  }
  if (hasAny(text, ["واتساب", "whatsapp", "whats app", "wa", "تواصل", "contact", "رقم"])) {
    return getContactReply(lang);
  }
  if (hasAny(text, ["صور", "photo", "photos", "gallery", "picture", "فيديو"])) {
    return getPhotosReply(lang);
  }
  if (hasAny(text, ["مسبح", "pool", "swimming"])) {
    return lang === "ar"
      ? "نعم ✨ في مسبح رئيسي كبير، وبعض الفلل فيها مسابح خاصة."
      : "Yes ✨ There is a large main pool, and selected villas include private pools.";
  }
  if (hasAny(text, ["جتسكي", "jetski", "jet ski", "water sports", "jtski", "jitski"])) {
    return lang === "ar"
      ? "أكيد ✨ الجتسكي والأنشطة البحرية متوفرة في La Vida."
      : "Yes ✨ Jet ski and water sports are available at La Vida.";
  }
  return undefined;
}

function buildSystemPrompt(lang: Language, state: ConversationState): string {
  const base = `You are La Vida AI, the official receptionist and sales assistant for ${RESORT_INFO.name}.

Official resort facts:
- Name: ${RESORT_INFO.name}
- Location: ${lang === "ar" ? RESORT_BRAND.locationAr : RESORT_INFO.location}
- Website: ${RESORT_INFO.website}
- Email: ${RESORT_INFO.email}
- Phones: ${RESORT_INFO.phones.join(" and ")}
- Messenger: ${RESORT_INFO.messengerLink}
${getKnowledgeBlockForPrompt(lang)}

Style and behavior rules:
1) Professional, warm, natural — Libyan Arabic when guest writes Arabic.
2) Keep replies short, clear, and helpful — answer the exact question first.
3) Never invent information. Prices are under approval — do not state final prices.
4) Meals are NOT included unless management announces otherwise.
5) Official photos/videos not published yet — do not claim they are available.
6) Official opening: ${lang === "ar" ? RESORT_BRAND.openingDateAr : RESORT_BRAND.openingDateEn}.
7) For booking interest: collect lead details (name, phone, dates, guests, unit) — never confirm booking or availability.
8) For complex cases: hand off to specialist team.
9) Keep conversation continuity during active threads.
10) Understand Libyan Arabic slang and mixed Arabic-English.
${getResponseStyleRules(lang)}`;

  const stateContext = `
Conversation context:
- currentTopic: ${state.topic}
- previousQuestion: ${state.previousQuestion ?? "none"}
- bookingActive: ${state.booking.active ? "yes" : "no"}
- bookingKnown: ${formatKnownBookingData(state.booking)}`;

  if (lang === "ar") {
    return `${base}
${stateContext}
Language rule: Reply in Arabic when the guest writes Arabic.`;
  }

  return `${base}
${stateContext}
Language rule: Reply in English unless the guest writes Arabic.`;
}

export const chatRouter = createRouter({
  ask: publicQuery
    .input(
      z.object({
        message: z.string().min(1),
        history: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string().min(1),
            }),
          )
          .max(20)
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const message = input.message.trim();
      const lang = detectMessageLanguage(message);
      const history = input.history ?? [];
      const state = inferConversationState(message, history);
      const historyContents = history.map((item) => item.content);

      const bookingLeadReply = resolveBookingLeadReply(message, historyContents, lang);
      if (bookingLeadReply) {
        return { reply: bookingLeadReply, language: lang, source: "rule" as const };
      }

      const priceReply = resolvePriceOrUnitReply(message, lang, { conversationMessages: historyContents });
      if (priceReply) {
        return { reply: priceReply, language: lang, source: "rule" as const };
      }

      const bookingStepReply = bookingNextStepReply(state, message, history, lang);
      const shortcutReply = getShortcutReply(message, lang);

      if (shortcutReply) {
        return {
          reply: shortcutReply,
          language: lang,
          source: "rule" as const,
        };
      }

      if (bookingStepReply) {
        return {
          reply: bookingStepReply,
          language: lang,
          source: "rule" as const,
        };
      }

      const groqApiKey = process.env.GROQ_API_KEY;

      if (!groqApiKey) {
        console.error("[chat.ask] Missing GROQ_API_KEY");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "GROQ_API_KEY is missing on the server",
        });
      }

      try {
        const client = new OpenAI({
          apiKey: groqApiKey,
          baseURL: "https://api.groq.com/openai/v1",
        });

        const result = await client.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          temperature: 0.5,
          max_tokens: 400,
          messages: [
            { role: "system", content: buildSystemPrompt(lang, state) },
            ...history.map((item) => ({
              role: item.role,
              content: item.content,
            })),
            { role: "user", content: message },
          ],
        });

        const reply = result.choices?.[0]?.message?.content?.trim();

        if (!reply) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Groq returned an empty response",
          });
        }

        return {
          reply,
          language: lang,
          source: "ai" as const,
        };
      } catch (error) {
        console.error("[chat.ask] Unexpected error", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate AI response",
        });
      }
    }),
});
