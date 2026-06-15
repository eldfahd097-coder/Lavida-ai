import { env } from "./lib/env";
import { detectLanguage } from "@contracts/templates";
import type { Language } from "@contracts/templates";
import {
  getBookingLeadPrompt,
  getKnowledgeBlockForPrompt,
  getResponseStyleRules,
  getOffersReply,
  getIncludedServicesReply,
  getOpeningDateReply,
  getBookingWhenReply,
  getPriceListReply,
  getChaletDetailReply,
  getAccommodationsOverviewReply,
  getResortOverviewReply,
  getActivitiesReply,
  getMealsReply,
  getPhotosReply,
  getLocationReply,
  getContactReply,
  getRestaurantsReply,
  getHumanHandoffReply,
  getGuestRecommendationReply,
  matchAccommodation,
  resolvePriceOrUnitReply,
  resolveBookingLeadReply,
  extractGuestCount,
  isActiveLeadCollection,
  isPhoneOnlyMessage,
  toBookingContext,
  type BookingConversationContext,
  RESORT_BRAND,
} from "./resort-knowledge";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

// ─── System Prompt for La Vida Resort AI ─────────────────────────
function buildSystemPrompt(lang: Language): string {
  if (lang === "ar") {
    return `أنت La Vida AI، موظف الاستقبال والمبيعات لـ ${RESORT_BRAND.name}.
النبرة: احترافية، ودودة، طبيعية، بلهجة ليبية — ردود قصيرة ومفيدة.
اللغة: إذا المستخدم كتب بالعربي رد بالعربي الليبي؛ إذا كتب بالإنجليزي رد بالإنجليزي.

${getKnowledgeBlockForPrompt("ar")}

قواعد إلزامية:
1) لا تخترع معلومات — استخدم المعرفة أعلاه فقط.
2) الأسعار معلنة رسمياً — اعرض قائمة الأسعار عند السؤال عنها.
3) الوجبات غير مشمولة في الإقامة حالياً.
4) الصور الرسمية لم تُنشر بعد — لا تقل إنها متوفرة.
5) الافتتاح الرسمي: ${RESORT_BRAND.openingDateAr}.
6) للحجز: اجمع بيانات العميل المهتم (الاسم، الهاتف، التاريخ، العدد، نوع الوحدة) — لا تؤكد حجزاً.
7) للحالات المعقدة: حوّل للفريق المختص.
8) أجب على السؤال مباشرة أولاً.
${getResponseStyleRules("ar")}`;
  }
  return `You are La Vida AI, the official receptionist and sales assistant for ${RESORT_BRAND.name}.
Tone: professional, warm, natural. Keep replies short and helpful.
Language: reply in English when the guest writes English; use Libyan Arabic when they write Arabic.

${getKnowledgeBlockForPrompt("en")}

Hard rules:
1) Never invent information — use only the knowledge above.
2) Prices are publicly announced — share the official price list when guests ask.
3) Meals are not included in the stay currently.
4) Official photos/videos are not published yet — do not claim they are available.
5) Official opening: ${RESORT_BRAND.openingDateEn}.
6) For booking interest: collect lead details (name, phone, dates, guests, unit) — never confirm a booking.
7) For complex cases: hand off to the specialist team.
8) Answer the question directly first.
${getResponseStyleRules("en")}`;
}

// ─── AI Response Generator ──────────────────────────────────────
export async function generateAIResponse(
  userMessage: string,
  history: { role: "user" | "assistant"; content: string }[] = [],
  forceLang?: Language
): Promise<{ text: string; lang: Language; source: "ai" | "template" }> {
  const lang = forceLang ?? detectMessageLanguage(userMessage);
  const bookingContext = toBookingContext(history, userMessage);

  const bookingLeadReply = resolveBookingLeadReply(userMessage, lang, bookingContext);
  if (bookingLeadReply) {
    return { text: bookingLeadReply, lang, source: "template" };
  }

  // Strong intent detection before AI generation.
  const intentText = getIntentResponse(userMessage, lang, bookingContext);
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

function getIntentResponse(
  userMessage: string,
  lang: Language,
  context: BookingConversationContext,
): string | undefined {
  if (isActiveLeadCollection(context)) return undefined;

  const rawText = userMessage.trim().toLowerCase();
  const text = normalizeArabic(rawText);
  const compact = text.replace(/\s+/g, " ").trim();
  const replies: string[] = [];

  const priceOrUnit = resolvePriceOrUnitReply(`${text} ${rawText}`, lang, {
    conversationMessages: context.allMessages,
    userMessages: context.userMessages,
  });
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
        ? "أهلاً بكم في La Vida Resort & Beach Club\nنورتونا — كيف نقدروا نساعدوكم اليوم؟"
        : "Welcome to La Vida Resort & Beach Club\nHow can we help you today?",
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
    "نبي حجز",
    "حابة نحجز",
    "نريد نحجز",
    "متى الحجز",
    "هل الحجز مفتوح",
    "نبي نسجل اسمي",
    "مهتم بالحجز",
    "في حجز",
    "طريقة الحجز",
    "نحجز",
    "حجز",
    "فيه حجز",
  ]);
  if (isBooking) {
    replies.push(getBookingLeadPrompt(lang));
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

  const isOpening = hasAny(text, [
    "opening",
    "when open",
    "opening date",
    "متى الافتتاح",
    "موعد الافتتاح",
    "الافتتاح",
    "تاريخ الافتتاح",
  ]);
  if (isOpening) {
    replies.push(getOpeningDateReply(lang));
  }

  const isBookingWhen = hasAny(text, ["متى الحجز", "هل الحجز مفتوح", "when booking", "booking open"]);
  if (isBookingWhen) {
    replies.push(getBookingWhenReply(lang));
  }

  const asksContact =
    !isPhoneOnlyMessage(userMessage) &&
    hasAny(text, ["phone", "contact", "call", "رقم", "تواصل", "اتصال", "تلفون", "whatsapp", "واتساب"]) &&
    !/^\d[\d\s+-]{7,}$/.test(userMessage.trim());
  if (asksContact) {
    replies.push(getContactReply(lang));
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
    replies.push(getLocationReply(lang));
  }

  const asksMeals = hasAny(text, [
    "full board",
    "breakfast",
    "meals",
    "food included",
    "شامل الوجبات",
    "شامل الفطور",
    "وجبات",
    "اقامه كامله",
    "فول بورد",
  ]);
  if (asksMeals) {
    replies.push(getMealsReply(lang));
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
    replies.push(getPhotosReply(lang));
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
    "payment",
    "corporate",
    "large group",
    "custom event",
    "special request",
    "booking confirmation",
    "confirm booking",
    "مشكلة",
    "الإدارة",
    "موظف",
    "دفع",
    "شكوى",
    "مجموعة كبيرة",
    "طلب خاص",
    "تأكيد الحجز",
  ]);
  if (asksHuman) {
    replies.push(getHumanHandoffReply(lang));
  }

  const guestCount = extractGuestCount(`${text} ${rawText}`);
  if (
    guestCount &&
    hasAny(text, ["شن تنصحني", "شنو تنصحني", "تنصحني", "recommend", "suggest", "عندي"])
  ) {
    replies.push(getGuestRecommendationReply(guestCount, lang));
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
    replies.push(unit ? getChaletDetailReply(unit, lang) : getAccommodationsOverviewReply(lang));
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
    replies.push(getRestaurantsReply(lang));
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
    replies.push(getActivitiesReply(lang));
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
    replies.push(getResortOverviewReply(lang));
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
    replies.push(getResortOverviewReply(lang));
  }

  const uniqueReplies = Array.from(new Set(replies));
  if (uniqueReplies.length === 0) return undefined;
  return uniqueReplies.slice(0, 3).join("\n");
}
