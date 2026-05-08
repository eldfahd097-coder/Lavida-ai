import { env } from "./lib/env";
import { detectLanguage } from "@contracts/templates";
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

المعرفة الأساسية:
- منتجع شاطئي في زوارة
- فيلات فاخرة، شاليهات عائلية، وشقق فندقية
- مسبح كبير
- كافيه شاطئي ومنطقة أكل
- أنشطة بحرية وتأجير جتسكي
- ملعب كرة قدم وملعب كرة طائرة
- أجواء شاطئية هادئة ومريحة

قواعد:
1. تحدث العربية الليبية بطبيعية (ليس رسمياً جداً ولا روبوتياً)
2. كن مؤدباً، أنيقاً، ومتعاوناً
3. لا تعدد معلومات خاطئة
4. إذا سُئلت عن الحجز أو الأسعار، قل "غير متاح حالياً، سيتم الإعلان عنه قريباً"
5. حافظ على نبرة منتجع فاخر وهادئ
6. ردودك قصيرة وواضحة
7. إذا سأل المستخدم عن المرافق أو الأنشطة، جاوبه مباشرة بشكل طبيعي ومختصر`;
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

Core knowledge:
- Beachfront location in Zuwarah
- Luxury villas, family chalets, and hotel apartments
- Large swimming pool
- Beach cafe and food area
- Water sports activities and jetski rentals
- Football and volleyball courts
- Relaxing beach atmosphere

Rules:
1. Speak like a professional luxury resort concierge
2. Be polite, elegant, and helpful
3. Do not make up information
4. If asked about booking or pricing, say "not available yet, will be announced soon"
5. Keep a calm, luxurious tone
6. Keep responses concise and clear
7. For activities or facilities questions, answer directly and naturally instead of asking for clarification`;
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

  const wantsFacilities =
    /(jetski|jet ski|water sport|water sports|cafe|café|food|restaurant|activities|activity|football|volleyball|beach|pool|chalet|chalets|villa|villas|apartment|apartments|جتسكي|أنشطة|نشاط|كافيه|اكل|أكل|مطعم|ملعب|كرة|طائرة|شاطئ|مسبح|شاليه|شاليهات|فيلا|فلل|شقة|شقق)/i.test(
      text,
    );
  if (wantsFacilities) {
    return lang === "ar"
      ? "أكيد ✨ لافيدا فيها كافيه ومنطقة أكل وأنشطة بحرية وتأجير جتسكي بالإضافة لملعب كرة وملعب طائرة، مع شاطئ ومسبح وأجواء مريحة."
      : "Yes ✨ La Vida includes a beach cafe, food area, water activities, and jetski rentals, along with football and volleyball courts, plus beach and pool access.";
  }

  const wantsResortInfo =
    /(resort|la vida|details|about|facilities|features|location|zuwarah|beach|pool|chalet|villa|activities|منتجع|لافيدا|تفاصيل|مرافق|الموقع|زوارة|شاطئ|مسبح|شاليه|أنشطة)/i.test(
      text,
    );
  if (wantsResortInfo) {
    return lang === "ar"
      ? "La Vida Resort & Beach Club في زوارة تجربة ضيافة راقية على البحر، مع شاطئ ومسبح وشاليهات فاخرة وأنشطة عائلية ممتعة في أجواء هادئة وأنيقة ✨"
      : "La Vida Resort & Beach Club in Zuwarah offers an elegant beachfront escape with beach access, pool, luxury chalets, and family-friendly activities in a calm, premium atmosphere ✨";
  }

  if (lang === "ar") {
    return "ممكن توضحلنا أكثر شنو تحب تعرف؟ ✨";
  }
  return "Could you tell us a bit more about what you'd like to know? ✨";
}
