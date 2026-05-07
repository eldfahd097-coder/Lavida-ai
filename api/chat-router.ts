import { z } from "zod";
import { publicQuery, createRouter } from "./middleware";
import { detectLanguage, type Language } from "@contracts/templates";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const RESORT_INFO = {
  name: "La Vida Resort & Beach Club",
  location: "Zuwarah, Libya",
  website: "lavidaresort.ly",
  phones: ["093 888 8868", "093 888 8878"],
} as const;

function bookingAnnouncement(lang: Language): string {
  if (lang === "ar") {
    return "الأسعار وتفاصيل الحجز والتوفر والإقامة الكاملة سيتم الإعلان عنها يوم 20 مايو.";
  }
  return "Prices, booking, reservation, availability, and full board details will be announced on May 20.";
}

function includesBookingQuestion(input: string): boolean {
  const text = input.toLowerCase();
  const keywords = [
    "price",
    "prices",
    "booking",
    "book",
    "reservation",
    "availability",
    "full board",
    "rate",
    "cost",
    "سعر",
    "الاسعار",
    "أسعار",
    "حجز",
    "الحجز",
    "حجوزات",
    "توفر",
    "متاح",
    "إقامة كاملة",
  ];
  return keywords.some((keyword) => text.includes(keyword));
}

function buildSystemPrompt(lang: Language): string {
  const base = `You are La Vida AI Receptionist for ${RESORT_INFO.name}.
Resort facts you must use:
- Name: ${RESORT_INFO.name}
- Location: ${RESORT_INFO.location}
- Website: ${RESORT_INFO.website}
- Phones: ${RESORT_INFO.phones.join(" and ")}

Rules:
1) Respond as a warm, luxury resort receptionist.
2) Keep answers concise and helpful.
3) If asked about prices, booking, reservation, availability, or full board, you MUST say details will be announced on May 20.
4) Never invent facts that are not provided above.`;

  if (lang === "ar") {
    return `${base}
Respond in Arabic unless user asks in English.`;
  }

  return `${base}
Respond in English unless user asks in Arabic.`;
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
      const lang = detectLanguage(message);
      console.log("[chat.ask] Incoming message", {
        lang,
        messageLength: message.length,
        historyCount: input.history?.length ?? 0,
      });

      if (includesBookingQuestion(message)) {
        console.log("[chat.ask] Matched booking/pricing rule");
        return {
          reply: bookingAnnouncement(lang),
          language: lang,
          source: "rule" as const,
        };
      }

      const fallback =
        lang === "ar"
          ? `مرحباً بكم في ${RESORT_INFO.name}.
الموقع: ${RESORT_INFO.location}
الموقع الإلكتروني: ${RESORT_INFO.website}
للتواصل: ${RESORT_INFO.phones.join(" أو ")}`
          : `Welcome to ${RESORT_INFO.name}.
Location: ${RESORT_INFO.location}
Website: ${RESORT_INFO.website}
Contact: ${RESORT_INFO.phones.join(" or ")}`;

      const openAiApiKey = process.env.OPENAI_API_KEY;

      if (!openAiApiKey) {
        console.error("[chat.ask] Missing OPENAI_API_KEY, using fallback response");
        return {
          reply: fallback,
          language: lang,
          source: "fallback" as const,
        };
      }

      const messages = [
        { role: "system", content: buildSystemPrompt(lang) },
        ...(input.history ?? []),
        { role: "user", content: message },
      ];

      try {
        const res = await fetch(OPENAI_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiApiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0.4,
            max_tokens: 400,
            messages,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("[chat.ask] OpenAI request failed", {
            status: res.status,
            body: errorText,
          });
          return {
            reply: fallback,
            language: lang,
            source: "fallback" as const,
          };
        }

        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const reply = data.choices?.[0]?.message?.content?.trim();

        if (!reply) {
          console.error("[chat.ask] OpenAI returned empty content");
          return {
            reply: fallback,
            language: lang,
            source: "fallback" as const,
          };
        }

        console.log("[chat.ask] Assistant reply generated", {
          replyLength: reply.length,
        });
        return {
          reply,
          language: lang,
          source: "ai" as const,
        };
      } catch (error) {
        console.error("[chat.ask] Unexpected error", error);
        return {
          reply: fallback,
          language: lang,
          source: "fallback" as const,
        };
      }
    }),
});
