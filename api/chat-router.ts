import { z } from "zod";
import { publicQuery, createRouter } from "./middleware";
import { detectLanguage, type Language } from "@contracts/templates";
import { TRPCError } from "@trpc/server";
import OpenAI from "openai";
import {
  getBookingInterestPrompt,
  getKnowledgeBlockForPrompt,
  matchAccommodation,
  accommodationBookingLabel,
  resolvePriceOrUnitReply,
} from "./resort-knowledge";

const RESORT_INFO = {
  name: "La Vida Resort & Beach Club",
  location: "Zuwarah, Libya",
  website: "lavidaresort.ly",
  phones: ["093 888 8868", "093 888 8878"],
} as const;

type ChatRole = "user" | "assistant";

type ChatHistoryItem = {
  role: ChatRole;
  content: string;
};

type BookingState = {
  active: boolean;
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

function bookingNextStepReply(state: ConversationState, lang: Language): string | undefined {
  if (!state.booking.active) return undefined;

  if (!state.booking.accommodationType) {
    return lang === "ar"
      ? "ممتاز 🌊 أي وحدة تهمكم؟ (رئاسي 4000، VIP بحر 3000، مسبح 2000، بحر جانبي 1500، استوديو 1000 د.ل/ليلة)"
      : "Perfect 🌊 Which unit interests you? (Presidential 4000, VIP sea 3000, pool view 2000, side sea 1500, garden studio 1000 LYD/night)";
  }

  if (!state.booking.dates) {
    return lang === "ar"
      ? "حلو ✨ ابعتلي تاريخ الدخول والخروج، حتى لو كل واحد برسالة منفصلة."
      : "Lovely ✨ Share check-in and check-out dates, even if sent in separate messages.";
  }

  if (!state.booking.guestCount) {
    return lang === "ar"
      ? "كم عدد الضيوف؟"
      : "How many guests will be staying?";
  }

  if (!state.booking.phoneNumber) {
    return lang === "ar"
      ? "ممكن رقم موبايل للتواصل وتأكيد طلب الحجز؟"
      : "May I have a phone number so our team can follow up on your booking request?";
  }

  return lang === "ar"
    ? `تم استلام طلب الحجز المبدئي ✅ (${formatKnownBookingData(state.booking)})\nفريق لافيدا حيأكد التوفر ويتواصل معاكم.`
    : `Booking interest received ✅ (${formatKnownBookingData(state.booking)})\nThe La Vida team will confirm availability and contact you.`;
}

function getShortcutReply(message: string, lang: Language): string | undefined {
  const text = normalizeText(message);
  if (!text) return undefined;

  if (hasAny(text, ["موقع", "location", "maps", "address", "وين"])) {
    return lang === "ar"
      ? `الموقع: زوارة - ليبيا 📍\nGoogle Maps عبر موقعنا: ${RESORT_INFO.website}`
      : `Location: Zuwarah, Libya 📍\nMaps and directions: ${RESORT_INFO.website}`;
  }
  if (hasAny(text, ["مطاعم", "مطعم", "restaurant", "resturent", "resturant", "food", "cafe"])) {
    return lang === "ar"
      ? "أكيد ✨ عندنا كافيه ومنطقة أكل بإطلالة بحرية ضمن المنتجع."
      : "Absolutely ✨ We have a beach café and dedicated food area inside the resort.";
  }
  if (hasAny(text, ["حجز", "booking", "book", "reservation"])) {
    return getBookingInterestPrompt(lang);
  }
  const priceReply = resolvePriceOrUnitReply(text, lang);
  if (priceReply && hasAny(text, ["اسعار", "الاسعار", "سعر", "price", "prices", "cost", "بكم", "offer", "عروض", "included", "مشمول"])) {
    return priceReply;
  }
  if (hasAny(text, ["اسعار", "الاسعار", "سعر", "price", "prices", "cost", "بكم"])) {
    return resolvePriceOrUnitReply("prices", lang);
  }
  if (hasAny(text, ["واتساب", "whatsapp", "whats app", "wa"])) {
    return lang === "ar"
      ? `واتساب/اتصال:\n${RESORT_INFO.phones[0]}\n${RESORT_INFO.phones[1]}`
      : `WhatsApp / Call:\n${RESORT_INFO.phones[0]}\n${RESORT_INFO.phones[1]}`;
  }
  if (hasAny(text, ["صور", "photo", "photos", "gallery", "picture"])) {
    return lang === "ar"
      ? "الصور الرسمية قيد التحضير ✨ وحننزلها قريباً جداً."
      : "Official photos are being finalized ✨ and will be shared very soon.";
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
  const base = `You are La Vida AI, the official receptionist for ${RESORT_INFO.name}.

Official resort facts:
- Name: ${RESORT_INFO.name}
- Location: ${RESORT_INFO.location}
- Website: ${RESORT_INFO.website}
- Phones: ${RESORT_INFO.phones.join(" and ")}
${getKnowledgeBlockForPrompt(lang)}

Resort features you can mention naturally when relevant:
- Beach access
- Pool
- Luxury chalets
- Water sports
- Jetski rentals
- Football court
- Volleyball court
- Cafe
- Relaxation areas
- Kids activities
- Family atmosphere
- Night entertainment

Style and behavior rules:
1) Sound luxury, calm, warm, elegant, and natural.
2) Keep replies short, clear, and helpful.
3) Never sound robotic.
4) Use only official Summer 2026 prices from the knowledge block.
5) Never confirm bookings or guarantee availability — team confirms availability.
6) Never state a fixed opening date; if asked, say the official opening date will be announced soon.
7) If you are unsure, clearly say management will confirm.
8) Do not invent facts outside the information above.
9) Keep conversation continuity: do not reset topic during active threads.
10) If booking is active, collect only missing booking fields naturally.
11) Understand fragmented messages and short follow-ups.
12) Understand Arabic Libyan slang and mixed Arabic-English.
13) Never ask "Could you tell us more" unless absolutely necessary.`;

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

      const priceReply = resolvePriceOrUnitReply(message, lang);
      if (priceReply && !state.booking.active) {
        return { reply: priceReply, language: lang, source: "rule" as const };
      }

      const bookingStepReply = bookingNextStepReply(state, lang);
      const shortcutReply = getShortcutReply(message, lang);

      if (shortcutReply && !state.booking.active) {
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
