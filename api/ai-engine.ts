import { env } from "./lib/env";
import { detectLanguage } from "@contracts/templates";
import type { Language } from "@contracts/templates";
import {
  getBookingInterestPrompt,
  getKnowledgeBlockForPrompt,
  getOffersReply,
  getIncludedServicesReply,
  getOpeningDateReply,
  getPriceListReply,
  getUnitReply,
  matchAccommodation,
  resolvePriceOrUnitReply,
} from "./resort-knowledge";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const RESORT_NAME = "La Vida Resort & Beach Club";
const WEBSITE = "lavidaresort.ly";
const PHONE_1 = "093 888 8868";
const PHONE_2 = "093 888 8878";

// ─── System Prompt for La Vida Resort AI ─────────────────────────
function buildSystemPrompt(lang: Language): string {
  if (lang === "ar") {
    return `أنت La Vida AI، موظف الاستقبال الرسمي لمنتجع ${RESORT_NAME}.
النبرة: راقية، هادئة، ودودة، طبيعية، والردود قصيرة.
اللغة: إذا المستخدم كتب بالعربي (حتى لهجة ليبية) رد بالعربي.

حقائق رسمية:
- الموقع: زوارة، ليبيا
- الموقع الإلكتروني: ${WEBSITE}
- أرقام التواصل: ${PHONE_1} / ${PHONE_2}
${getKnowledgeBlockForPrompt("ar")}

المرافق:
- شاطئ ومسبح كبير
- كافيه شاطئي ومنطقة أكل
- أنشطة بحرية وتأجير جتسكي
- ملعب كرة وملعب طائرة
- أنشطة أطفال، أجواء عائلية، ترفيه ليلي، مشاهدة مباريات، وألعاب شبابية

قواعد إلزامية:
1) استخدم الأسعار الرسمية أعلاه فقط — لا تخترع أسعاراً.
2) لا تؤكد أي حجز ولا تعد بالتوفر.
3) للحجز: اجمع البيانات وقل إن الفريق يأكد التوفر.
4) إذا السؤال عن مرفق أو وحدة معينة، جاوب على نفس الموضوع فقط وباختصار.
5) إذا الطلب غير واضح جداً، اطلب توضيح قصير ولطيف.`;
  }
  return `You are La Vida AI, the official receptionist for ${RESORT_NAME}.
Tone: luxury, calm, elegant, warm, natural. Keep replies short.
Language: reply in English unless the guest writes Arabic.

Official facts:
- Location: Zuwarah, Libya
- Website: ${WEBSITE}
- Contact numbers: ${PHONE_1} / ${PHONE_2}
${getKnowledgeBlockForPrompt("en")}

Facilities:
- Beachfront access and large pool
- Beach cafe and food area
- Water sports and jetski rentals
- Football and volleyball courts
- Kids activities, family atmosphere, evening entertainment, match screenings, arcade-style youth area

Hard rules:
1) Use only the official Summer 2026 prices above — never invent prices.
2) Never confirm bookings or guarantee availability.
3) For booking: collect details and say the team will confirm availability.
4) For specific facility or unit questions, answer only that point briefly.
5) Ask for clarification only when truly necessary.`;
}

// ─── AI Response Generator ──────────────────────────────────────
export async function generateAIResponse(
  userMessage: string,
  history: { role: "user" | "assistant"; content: string }[] = [],
  forceLang?: Language
): Promise<{ text: string; lang: Language; source: "ai" | "template" }> {
  const lang = forceLang ?? detectMessageLanguage(userMessage);

  // Strong intent detection before AI generation.
  const intentText = getIntentResponse(userMessage, lang);
  if (intentText) {
    return { text: intentText, lang, source: "template" };
  }

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

  // Natural fallback when intent/AI are unavailable
  const templateText = getNaturalFallback(lang);
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
function normalizeArabic(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ً-ْ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectMessageLanguage(message: string): Language {
  if (/[\u0600-\u06FF]/.test(message)) return "ar";
  return detectLanguage(message);
}

function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function pickRandom(items: string[]): string {
  return items[Math.floor(Math.random() * items.length)] ?? items[0] ?? "";
}

function getNaturalFallback(lang: Language): string {
  if (lang === "ar") return "ممكن توضحلنا أكثر شنو تحب تعرف عن لافيدا؟ ✨";
  return "Could you tell us a bit more about what you'd like to know about La Vida? ✨";
}

function getIntentResponse(userMessage: string, lang: Language): string | undefined {
  const rawText = userMessage.trim().toLowerCase();
  const text = normalizeArabic(rawText);
  const compact = text.replace(/\s+/g, " ").trim();
  const replies: string[] = [];

  const priceOrUnit = resolvePriceOrUnitReply(`${text} ${rawText}`, lang);
  if (priceOrUnit) return priceOrUnit;

  const acknowledgementPhrases = [
    "موافق",
    "موافين",
    "موافينك",
    "تمام",
    "تمام خلاص",
    "اوكي",
    "خلاص",
    "كويس",
    "منيح",
    "حلو",
    "حلو تمام",
    "يعطيك الصحه",
    "يعطيكم الصحه",
    "يسلمو",
    "تسلم",
    "تسلموا",
    "يعطيك العافيه",
    "بارك الله فيك",
    "شكرا",
    "ثانكس",
    "thanks",
    "thank you",
    "nice",
    "perfect",
    "great",
    "sounds good",
    "awesome",
  ];
  const isAcknowledgementOnly =
    acknowledgementPhrases.includes(compact) ||
    (compact.length <= 28 &&
      hasAny(compact, [
        "موافق",
        "تمام",
        "اوكي",
        "خلاص",
        "شكرا",
        "يعطيك",
        "يسلمو",
        "تسلم",
        "thanks",
        "thank you",
        "perfect",
        "great",
        "awesome",
        "sounds good",
      ]));
  if (isAcknowledgementOnly) {
    if (lang === "ar") {
      return pickRandom([
        "تمام ✨ نورتونا",
        "يسعدنا هذا ✨",
        "العفو ✨",
        "تحت أمركم في أي وقت ✨",
        "منورين ✨",
      ]);
    }
    return pickRandom([
      "Glad we could help ✨",
      "You're very welcome ✨",
      "Happy to help anytime ✨",
      "Sounds great ✨",
    ]);
  }

  const isGreeting = hasAny(text, [
    "hi",
    "hello",
    "hey",
    "السلام عليكم",
    "سلام",
    "مرحبا",
    "اهلا",
  ]);
  if (isGreeting) {
    replies.push(
      lang === "ar"
      ? "مرحباً بكم في La Vida Resort & Beach Club 🌊\nنورتونا ✨\nكيف نقدر نساعدكم اليوم؟"
      : "Welcome to La Vida Resort & Beach Club 🌊\nWe’re happy to assist you ✨\nHow can we help you today?",
    );
  }

  const isPrice = hasAny(text, [
    "price",
    "prices",
    "how much",
    "kam",
    "bekam",
    "bikam",
    "as3ar",
    "asaar",
    "cost",
    "rates",
    "الأسعار",
    "بكم",
    "قداش",
    "كم السعر",
    "شن السعر",
    "كم تكلف",
    "سعر",
    "اسعار",
  ]);
  if (isPrice) {
    replies.push(getPriceListReply(lang));
  }

  const isBooking = hasAny(text, [
    "book",
    "booking",
    "7ajz",
    "hajz",
    "reserve",
    "reservation",
    "availability",
    "الحجز",
    "نبي نحجز",
    "كيف نحجز",
    "في حجز",
    "طريقة الحجز",
    "نحجز",
    "حجز",
    "متاح",
    "فيه حجز",
  ]);
  if (isBooking) {
    replies.push(getBookingInterestPrompt(lang));
  }

  const asksOffers = hasAny(text, ["offer", "offers", "promo", "discount", "عروض", "خصم", "تخفيض"]);
  if (asksOffers) {
    replies.push(getOffersReply(lang));
  }

  const asksIncluded = hasAny(text, [
    "included",
    "what is included",
    "services included",
    "مشمول",
    "الخدمات المشموله",
    "شن مشمول",
  ]);
  if (asksIncluded) {
    replies.push(getIncludedServicesReply(lang));
  }

  const isOpening = hasAny(text, ["opening", "when open", "opening date", "متى تفتحو", "موعد الافتتاح", "الافتتاح"]);
  if (isOpening) {
    replies.push(getOpeningDateReply(lang));
  }

  const asksContact = hasAny(text, ["phone", "contact", "number", "call", "رقم", "تواصل", "اتصال", "تلفون"]);
  if (asksContact) {
    replies.push(
      lang === "ar"
      ? `تقدروا تتواصلوا مع لافيدا على:\n${PHONE_1}\n${PHONE_2} ✨`
      : `You can contact La Vida on:\n${PHONE_1}\n${PHONE_2} ✨`,
    );
  }

  const asksLocation = hasAny(text, [
    "location",
    "address",
    "maps",
    "where",
    "wen",
    "ween",
    "وين",
    "موقع",
    "العنوان",
    "زواره",
    "shn",
    "sheno",
    "shno",
    "shnowa",
  ]);
  if (asksLocation) {
    replies.push(
      lang === "ar"
      ? `لافيدا موجودة في زوارة ليبيا ✨ ${WEBSITE}`
      : `La Vida is located in Zuwarah Libya ✨ ${WEBSITE}`,
    );
  }

  const asksMeals = hasAny(text, ["full board", "breakfast", "meals", "food included", "وجبات", "اقامه كامله", "فول بورد"]);
  if (asksMeals) {
    replies.push(
      lang === "ar"
        ? "الإقامة تشمل دخول الشاطئ والمسبح والخدمات المذكورة في قائمة الخدمات المشمولة ✨ اسألنا عن «الخدمات المشمولة» للتفاصيل."
        : "Your stay includes beach and pool access plus the listed included services ✨ Ask us about included services for details.",
    );
  }

  const asksPhotos = hasAny(text, [
    "photo",
    "photos",
    "picture",
    "pictures",
    "image",
    "images",
    "renders",
    "gallery",
    "show me rooms",
    "show me villas",
    "صور",
    "صور الشاليهات",
    "صور المنتجع",
    "ابعت صور",
    "نبي صور",
    "في صور",
    "صور الغرف",
    "صور الفلل",
  ]);
  if (asksPhotos) {
    replies.push(lang === "ar"
      ? "حالياً الصور الرسمية الخاصة بالشاليهات والمنتجع مش متوفرة عندنا توا ✨\nوحنشاركوا كل الصور والتحديثات البصرية قريباً مع موعد الافتتاح والإعلان الرسمي للحجز."
      : "Currently the official chalet and resort images are not available yet ✨\nAll photos and visual updates will be shared closer to the opening date and official booking announcement.");
  }

  const asksSupermarket = hasAny(text, [
    "supermarket",
    "market",
    "grocery",
    "mini market",
    "سوبرماركت",
    "بقاله",
    "بقالة",
    "سوق",
  ]);
  if (asksSupermarket) {
    replies.push(
      lang === "ar"
        ? "أكيد ✨ بخصوص السوبرماركت والخدمات القريبة، فريق لافيدا حيوجهكم بأقرب الخيارات المناسبة عند الافتتاح."
        : "Of course ✨ For supermarket and nearby essentials, the La Vida team will guide you to the closest suitable options at opening.",
    );
  }

  const asksHuman = hasAny(text, [
    "manager",
    "management",
    "human",
    "admin",
    "complaint",
    "problem",
    "مشكلة",
    "الإدارة",
    "موظف",
  ]);
  if (asksHuman) {
    replies.push(
      lang === "ar"
      ? "أكيد ✨ أحد أعضاء فريق لافيدا حيتواصل معاكم قريباً."
      : "Of course ✨ A member of the La Vida team will assist you shortly.",
    );
  }

  const asksPrivatePools = hasAny(text, [
    "private pool",
    "private pools",
    "do villas have private pools",
    "في مسبح خاص",
    "مسبح خاص",
  ]);
  if (asksPrivatePools) {
    replies.push(
      lang === "ar"
      ? "أكيد ✨ فلل VIP والفلل الرئاسية فيها مسابح خاصة."
      : "Yes ✨ VIP villas and presidential villas include private pools.",
    );
  }

  const asksAccommodation = hasAny(text, [
    "room",
    "rooms",
    "villa",
    "villas",
    "chalet",
    "chalets",
    "apartment",
    "apartments",
    "accommodation",
    "where to stay",
    "capacity",
    "guest",
    "guests",
    "how many people can stay",
    "شن أنواع الغرف",
    "كم شخص يقدر يقعد",
    "كم شخص",
    "الغرف",
    "شاليه",
    "شاليهات",
    "فلل",
    "شقق",
    "إقامة",
  ]);
  if (asksAccommodation) {
    const unit = matchAccommodation(text);
    replies.push(unit ? getUnitReply(unit, lang) : getPriceListReply(lang));
  }

  const asksJetski = hasAny(text, [
    "jetski",
    "jet ski",
    "jet-ski",
    "jitski",
    "jtski",
    "water sports",
    "water sport",
    "جتسكي",
    "الانشطه البحريه",
    "انشطه بحريه",
  ]);
  const asksCafe = hasAny(text, [
    "cafe",
    "kafe",
    "café",
    "coffee",
    "food",
    "restaurant",
    "eat",
    "eating",
    "كافيه",
    "مطعم",
    "أكل",
    "اكل",
  ]);
  if (asksJetski && asksCafe) {
    replies.push(
      lang === "ar"
        ? "أكيد ✨ في لافيدا حيكون فيه كافيه ومنطقة أكل، ومعاها تأجير جتسكي وأنشطة بحرية، والتفاصيل الكاملة حنعلنوها قريباً."
        : "Yes ✨ La Vida will include a beach cafe and food area, plus jetski rentals and water activities. Full details will be announced closer to opening.",
    );
  } else if (asksJetski) {
    replies.push(
      lang === "ar"
        ? "أكيد ✨ تأجير الجتسكي والأنشطة البحرية حيكونوا متوفرين في لافيدا، وحنعلنوا التفاصيل كاملة قريباً."
        : "Yes ✨ Jet ski rentals and water activities will be available at La Vida. Full details will be announced closer to opening.",
    );
  } else if (asksCafe) {
    replies.push(
      lang === "ar"
        ? "أكيد ✨ في لافيدا حيكون فيه كافيه ومنطقة أكل للضيوف خلال الإقامة."
        : "Yes ✨ La Vida will include a beach café and food area for guests to enjoy during their stay.",
    );
  }

  const asksCourts = hasAny(text, ["football", "soccer", "volleyball", "court", "courts", "كرة", "طائره", "ملعب"]);
  if (asksCourts) {
    replies.push(
      lang === "ar"
        ? "أكيد ✨ لافيدا فيها ملعب كرة وملعب طائرة للضيوف."
        : "Yes ✨ La Vida includes football and volleyball courts for guests.",
    );
  }

  const asksPool = hasAny(text, ["pool", "swimming pool", "مسبح", "سباحه"]);
  if (asksPool) {
    replies.push(
      lang === "ar"
        ? "أكيد ✨ لافيدا فيها مسبح، وفلل الـ VIP فيها مسابح خاصة."
        : "Yes ✨ La Vida includes pool access, and VIP villas include private pools.",
    );
  }

  const asksFamily = hasAny(text, ["kids", "children", "family", "families", "اطفال", "العائله", "عائلات", "عائليه"]);
  if (asksFamily) {
    replies.push(
      lang === "ar"
        ? "أكيد ✨ لافيدا مناسبة للعائلات وحيكون فيها أنشطة للأطفال ومساحات مريحة للعائلة."
        : "Yes ✨ La Vida is family-friendly and will include kids activities and relaxing spaces for families.",
    );
  }

  const asksNight = hasAny(text, [
    "night",
    "entertainment",
    "evening",
    "match",
    "world cup",
    "arcade",
    "ليل",
    "ترفيه",
    "مباريات",
    "ألعاب",
  ]);
  if (asksNight) {
    replies.push(
      lang === "ar"
        ? "لافيدا حتوفر أجواء ليلية حلوة، مشاهدة مباريات، ألعاب ترفيهية، وتجارب مناسبة للعائلات ✨"
        : "La Vida will include evening entertainment, football match screenings, arcade-style activities, and family-friendly night experiences ✨",
    );
  }

  const asksGeneralActivities = hasAny(text, [
    "activity",
    "activities",
    "things to do",
    "what activities",
    "what are your activity",
    "what else",
    "what can we do",
    "facilities",
    "entertainment",
    "water sports",
    "jetski",
    "football",
    "volleyball",
    "kids",
    "نشاط",
    "نشاطات",
    "أنشطة",
    "الانشطة",
    "شن النشاطات",
    "شن عندكم",
    "شنو عندكم",
    "شن فيه",
    "شنو فيه",
    "المرافق",
  ]);
  if (asksGeneralActivities) {
    replies.push(
      lang === "ar"
        ? "لافيدا حتوفر شاطئ، مسبح، أنشطة بحرية، تأجير جتسكي، ملعب كرة، ملعب طائرة، أنشطة للأطفال، كافيه، وأجواء عائلية راقية ✨"
        : "La Vida will offer beach access, pool, water sports, jet ski rentals, football and volleyball courts, kids activities, a beach café, and relaxing family-friendly spaces ✨",
    );
  }

  const asksGeneralResort = hasAny(text, [
    "what do you offer",
    "what do u offer",
    "what do you have",
    "what do u have",
    "tell me about",
    "tell me more",
    "i want to know more",
    "know more",
    "what else",
    "more details",
    "about la vida",
    "about the resort",
    "resort info",
    "information",
    "details",
    "منتجع",
    "عرفني",
    "معلومات اكثر",
    "تفاصيل اكثر",
    "ممكن معلومات اكثر",
    "شنو اكثر",
    "شن بعد",
    "شن هو المنتجع",
    "شن تقدموا",
    "شن عندكم",
    "تفاصيل لافيدا",
    "معلومات",
  ]);
  if (asksGeneralResort) {
    replies.push(
      lang === "ar"
        ? "لافيدا ريزورت آند بيتش كلوب منتجع فاخر على البحر في زوارة، فيه فلل وشاليهات وشقق فندقية ومسابح وأنشطة بحرية وكافيه وأجواء عائلية راقية ✨"
        : "La Vida Resort & Beach Club is a luxury beachfront resort in Zuwarah with villas, chalets, hotel apartments, pools, water activities, a beach café, and a calm family-friendly atmosphere ✨",
    );
  }

  const asksMoreGeneric = hasAny(text, [
    "tell me more",
    "i want to know more",
    "know more",
    "what else",
    "more details",
    "ممكن معلومات اكثر",
    "معلومات اكثر",
    "تفاصيل اكثر",
    "شنو اكثر",
    "شن بعد",
  ]);
  if (asksMoreGeneric && replies.length === 0) {
    replies.push(
      lang === "ar"
        ? "أكيد ✨ تحبوا تعرفوا أكثر على الغرف، الأنشطة، الحجز، الموقع ولا المرافق؟"
        : "Of course ✨ What would you like to know more about? Rooms, activities, booking, location, or facilities?",
    );
  }

  const uniqueReplies = Array.from(new Set(replies));
  if (uniqueReplies.length === 0) return undefined;
  return uniqueReplies.slice(0, 3).join("\n");
}
