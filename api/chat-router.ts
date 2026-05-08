import { z } from "zod";
import { publicQuery, createRouter } from "./middleware";
import { detectLanguage, type Language } from "@contracts/templates";
import { TRPCError } from "@trpc/server";
import OpenAI from "openai";

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
      const history = input.history ?? [];

      if (includesBookingQuestion(message)) {
        return {
          reply: bookingAnnouncement(lang),
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
          temperature: 0.4,
          max_tokens: 400,
          messages: [
            { role: "system", content: buildSystemPrompt(lang) },
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
