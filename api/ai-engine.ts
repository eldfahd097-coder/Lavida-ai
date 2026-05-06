import { env } from "./lib/env";
import { detectLanguage, getResponseByChoice, Responses } from "@contracts/templates";
import type { Language } from "@contracts/templates";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

// ─── System Prompt for La Vida Resort AI ─────────────────────────
function buildSystemPrompt(lang: Language): string {
  if (lang === "ar") {
    return `أنت مساعد ذكي لمنتجع La Vida Resort & Beach Club في زوارة، ليبيا.
أنت متحدث بلهجة ليبية ودودة، أنيقة، وهادئة.

المعلومات المتاحة:
- الموقع: زوارة، ليبيا، مباشرة على البحر
- 42 وحدة: 10 فيلات فاخرة (6 فيلات VIP بمسبح خاص + 4 فيلات رئاسية)، 20 شاليه عائلي، 12 شقة
- المرافق: مسبح مركزي، شاطئ خاص، رياضات مائية، ملاعب، ألعاب أطفال، مقهى، واي فاي، استقبال 24/7
- الحجز غير متاح حالياً
- الأسعار ستُعلن قريباً
- موعد الافتتاح سيُعلن قريباً
- الاتصال: +218 91 211 0392, info@lavida.ly

قواعد:
1. تحدث العربية الليبية بطبيعية (ليس رسمياً جداً ولا روبوتياً)
2. كن مؤدباً، أنيقاً، ومتعاوناً
3. لا تعدد معلومات خاطئة
4. إذا سُئلت عن الحجز أو الأسعار، قل "غير متاح حالياً، سيتم الإعلان عنه قريباً"
5. حافظ على نبرة منتجع فاخر وهادئ
6. ردودك قصيرة وواضحة`;
  }
  return `You are an intelligent assistant for La Vida Resort & Beach Club in Zuwarah, Libya.
You are elegant, helpful, warm, and calm — like a luxury resort concierge.

Available information:
- Location: Zuwarah, Libya, directly on the beach
- 42 units: 10 luxury villas (6 VIP with private pool + 4 Presidential), 20 family chalets, 12 apartments
- Facilities: central pool, private beach, water sports, courts, kids area, cafe, Wi-Fi, 24/7 reception
- Booking is not available yet
- Pricing will be announced soon
- Opening date will be announced soon
- Contact: +218 91 211 0392, info@lavida.ly

Rules:
1. Speak like a professional luxury resort concierge
2. Be polite, elegant, and helpful
3. Do not make up information
4. If asked about booking or pricing, say "not available yet, will be announced soon"
5. Keep a calm, luxurious tone
6. Keep responses concise and clear`;
}

// ─── AI Response Generator ──────────────────────────────────────
export async function generateAIResponse(
  userMessage: string,
  history: { role: "user" | "assistant"; content: string }[] = [],
  forceLang?: Language
): Promise<{ text: string; lang: Language; source: "ai" | "template" }> {
  const lang = forceLang ?? detectLanguage(userMessage);

  // Try AI first if API key is available
  if (env.openaiApiKey) {
    try {
      const aiText = await callOpenAI(userMessage, history, lang);
      if (aiText) {
        return { text: aiText, lang, source: "ai" };
      }
    } catch (err) {
      console.error("AI generation failed, falling back to templates:", err);
    }
  }

  // Fallback to template-based response
  const templateText = getTemplateResponse(userMessage, lang);
  return { text: templateText, lang, source: "template" };
}

// ─── OpenAI API Call ─────────────────────────────────────────────
async function callOpenAI(
  userMessage: string,
  history: { role: "user" | "assistant"; content: string }[],
  lang: Language
): Promise<string | null> {
  const apiKey = env.openaiApiKey;
  if (!apiKey) return null;

  const messages = [
    { role: "system", content: buildSystemPrompt(lang) },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: userMessage },
  ];

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI API error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  return data.choices?.[0]?.message?.content?.trim() ?? null;
}

// ─── Template Fallback Logic ────────────────────────────────────
function getTemplateResponse(userMessage: string, lang: Language): string {
  const text = userMessage.trim().toLowerCase();

  // Numbered menu choice
  if (/^[1-5]$/.test(text)) {
    return getResponseByChoice(text, lang);
  }

  // Keywords
  const keywords: Record<string, keyof typeof Responses> = {
    // Arabic keywords
    "حجز": "resort_info",
    "اسعار": "updates",
    "سعر": "updates",
    "شاليه": "chalet_info",
    "فيلا": "chalet_info",
    "شقة": "chalet_info",
    "نشاط": "activities",
    "ملعب": "activities",
    "مسبح": "activities",
    "موقع": "updates",
    "افتتاح": "updates",
    "ادارة": "management",
    "مدير": "management",
    "صور": "chalet_info",
    // English keywords
    "book": "resort_info",
    "price": "updates",
    "cost": "updates",
    "chalet": "chalet_info",
    "villa": "chalet_info",
    "apartment": "chalet_info",
    "unit": "chalet_info",
    "activity": "activities",
    "pool": "activities",
    "beach": "activities",
    "sport": "activities",
    "location": "updates",
    "address": "updates",
    "opening": "updates",
    "management": "management",
    "manager": "management",
    "image": "chalet_info",
    "photo": "chalet_info",
  };

  for (const [keyword, responseKey] of Object.entries(keywords)) {
    if (text.includes(keyword)) {
      return Responses[responseKey][lang];
    }
  }

  // Greetings
  if (/^(مرحب|سلام|هاي|hello|hi|hey|good morning|good afternoon|good evening)/i.test(text)) {
    return Responses.resort_info[lang];
  }

  // Goodbye
  if (/^(شكر|bye|thanks|thank you|goodbye|مع السلامة)/i.test(text)) {
    return Responses.goodbye[lang];
  }

  return Responses.fallback[lang];
}
