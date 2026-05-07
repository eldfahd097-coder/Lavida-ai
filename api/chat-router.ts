import { z } from "zod";
import { publicQuery, createRouter } from "./middleware";
import { detectLanguage, type Language } from "@contracts/templates";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TRPCError } from "@trpc/server";

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

function toGeminiHistory(
  history: { role: "user" | "assistant"; content: string }[],
): { role: "user" | "model"; parts: { text: string }[] }[] {
  const normalized = history
    .map((item) => ({
      role: item.role === "assistant" ? "model" as const : "user" as const,
      text: item.content.trim(),
    }))
    .filter((item) => item.text.length > 0);

  // Gemini chat history must start with a user message.
  while (normalized.length > 0 && normalized[0]?.role !== "user") {
    normalized.shift();
  }

  return normalized.map((item) => ({
    role: item.role,
    parts: [{ text: item.text }],
  }));
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

      const geminiApiKey = process.env.GEMINI_API_KEY;

      if (!geminiApiKey) {
        console.error("[chat.ask] Missing GEMINI_API_KEY");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "GEMINI_API_KEY is missing on the server",
        });
      }

      const history = input.history ?? [];

      try {
        const client = new GoogleGenerativeAI(geminiApiKey);
        const model = client.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction: buildSystemPrompt(lang),
        });

        const chat = model.startChat({
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 400,
          },
          history: toGeminiHistory(history),
        });

        const result = await chat.sendMessage(message);
        const reply = result.response.text()?.trim();

        if (!reply) {
          console.error("[chat.ask] Gemini returned empty content");
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Gemini returned an empty response",
          });
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
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate Gemini response",
        });
      }
    }),
});
