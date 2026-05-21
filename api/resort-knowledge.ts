import type { Language } from "@contracts/templates";

export type AccommodationUnit = {
  id: string;
  nameEn: string;
  nameAr: string;
  priceLyd: number;
  detailsEn: string[];
  detailsAr: string[];
  keywords: string[];
};

export const ACCOMMODATIONS: AccommodationUnit[] = [
  {
    id: "presidential",
    nameEn: "Presidential VIP Chalet",
    nameAr: "شاليه VIP الرئاسي",
    priceLyd: 4000,
    detailsEn: [
      "Fits two families",
      "Private pool",
      "Large outdoor seating",
      "Spacious living area",
      "High privacy",
      "Partial sea view",
      "Nearby parking",
    ],
    detailsAr: [
      "مناسب لعائلتين",
      "مسبح خاص",
      "جلسة خارجية واسعة",
      "صالة معيشة واسعة",
      "خصوصية عالية",
      "إطلالة بحرية جزئية",
      "موقف قريب",
    ],
    keywords: ["presidential", "رئاسي", "رئاسية", "vip رئاسي", "4000"],
  },
  {
    id: "vip_sea",
    nameEn: "VIP Sea View Chalet",
    nameAr: "شاليه VIP إطلالة بحرية",
    priceLyd: 3000,
    detailsEn: [
      "Direct sea view",
      "Private pool",
      "Outdoor sea-facing seating",
      "High privacy",
      "Suitable for families and couples",
    ],
    detailsAr: [
      "إطلالة بحرية مباشرة",
      "مسبح خاص",
      "جلسة خارجية بإطلالة بحر",
      "خصوصية عالية",
      "مناسب للعائلات والأزواج",
    ],
    keywords: ["vip sea", "sea view chalet", "vip chalet", "بحر مباشر", "3000"],
  },
  {
    id: "pool_view",
    nameEn: "Pool and Activities View Chalet",
    nameAr: "شاليه إطلالة المسبح والأنشطة",
    priceLyd: 2000,
    detailsEn: [
      "View of main pool",
      "Close to entertainment areas",
      "Easy access to restaurant and beach",
      "Suitable for families",
    ],
    detailsAr: [
      "إطلالة على المسبح الرئيسي",
      "قريب من مناطق الترفيه",
      "سهولة الوصول للمطعم والشاطئ",
      "مناسب للعائلات",
    ],
    keywords: ["pool view", "activities view", "مسبح رئيسي", "2000"],
  },
  {
    id: "side_sea",
    nameEn: "Side Sea View Chalet",
    nameAr: "شاليه إطلالة بحر جانبية",
    priceLyd: 1500,
    detailsEn: [
      "Side sea view",
      "Private balcony",
      "Quiet location",
      "Suitable for small families and couples",
    ],
    detailsAr: [
      "إطلالة بحر جانبية",
      "شرفة خاصة",
      "موقع هادئ",
      "مناسب للعائلات الصغيرة والأزواج",
    ],
    keywords: ["side sea", "جانبي", "1500"],
  },
  {
    id: "garden_studio",
    nameEn: "Garden View Studio",
    nameAr: "استوديو إطلالة الحديقة",
    priceLyd: 1000,
    detailsEn: [
      "Garden view",
      "Close to main facilities",
      "Practical and comfortable design",
      "Good value for couples or small families",
    ],
    detailsAr: [
      "إطلالة على الحديقة",
      "قريب من المرافق الرئيسية",
      "تصميم عملي ومريح",
      "خيار اقتصادي للأزواج أو العائلات الصغيرة",
    ],
    keywords: ["garden", "studio", "استوديو", "حديقة", "1000"],
  },
];

export const INCLUDED_SERVICES_EN = [
  "Private beach access",
  "Pool access",
  "Free parking",
  "24 hour reception",
  "24 hour security",
  "Free internet in public areas",
  "Beach seating and umbrellas",
  "Family rest areas",
];

export const INCLUDED_SERVICES_AR = [
  "دخول شاطئ خاص",
  "دخول المسبح",
  "موقف سيارات مجاني",
  "استقبال 24 ساعة",
  "أمن 24 ساعة",
  "إنترنت مجاني في المناطق العامة",
  "مقاعد ومظلات الشاطئ",
  "مناطق راحة للعائلات",
];

export const ACTIVITIES_EN = [
  "Kayaks",
  "Paddle boards",
  "Sea trips",
  "Pedal boats",
  "Seasonal water games",
  "Beach football",
  "Beach volleyball",
  "Sports competitions",
  "Kids Club",
  "Trampoline",
  "Drawing and coloring workshops",
  "Daily kids competitions and prizes",
  "Children entertainment shows",
];

export const ACTIVITIES_AR = [
  "كاياك",
  "تجديف",
  "رحلات بحرية",
  "قوارب بدالية",
  "ألعاب مائية موسمية",
  "كرة قدم شاطئية",
  "كرة طائرة شاطئية",
  "مسابقات رياضية",
  "نادي أطفال",
  "ترامبولين",
  "ورش رسم وتلوين",
  "مسابقات وجوائز يومية للأطفال",
  "عروض ترفيه للأطفال",
];

export const OPENING_OFFERS_EN = [
  "Book 3 nights and get the 4th night free",
  "15% discount for confirmed bookings before the official opening",
  "10% discount for families and groups",
  "Free stay for 2 children up to 10 years old in the same unit",
  "VIP and Presidential chalets include welcome fruit basket and drinks",
  "VIP and Presidential chalets include special beach seating",
  "Discounts on water activities for VIP and Presidential chalets",
  "Special corporate and group booking offers available",
];

export const OPENING_OFFERS_AR = [
  "احجز 3 ليالي واحصل على الليلة الرابعة مجاناً",
  "خصم 15% للحجوزات المؤكدة قبل الافتتاح الرسمي",
  "خصم 10% للعائلات والمجموعات",
  "إقامة مجانية لطفلين حتى 10 سنوات في نفس الوحدة",
  "شاليهات VIP والرئاسية تشمل سلة فواكه ومشروبات ترحيبية",
  "شاليهات VIP والرئاسية تشمل جلسة شاطئية مميزة",
  "خصومات على الأنشطة المائية لشاليهات VIP والرئاسية",
  "عروض خاصة للحجوزات الشركات والمجموعات",
];

export function matchAccommodation(text: string): AccommodationUnit | undefined {
  const normalized = text.toLowerCase();
  for (const unit of ACCOMMODATIONS) {
    if (unit.keywords.some((kw) => normalized.includes(kw.toLowerCase()))) {
      return unit;
    }
  }
  if (/شاليه|chalet/.test(normalized) && !/presidential|رئاس/.test(normalized)) {
    return ACCOMMODATIONS.find((u) => u.id === "side_sea");
  }
  if (/فيلا|villa|vip/.test(normalized)) {
    return ACCOMMODATIONS.find((u) => u.id === "vip_sea");
  }
  if (/استوديو|studio|شقه|apartment/.test(normalized)) {
    return ACCOMMODATIONS.find((u) => u.id === "garden_studio");
  }
  return undefined;
}

export function accommodationBookingLabel(unit: AccommodationUnit): string {
  return `${unit.nameEn} — ${unit.priceLyd} LYD/night`;
}

export function getPriceListReply(lang: Language): string {
  if (lang === "ar") {
    const lines = ACCOMMODATIONS.map((u) => `• ${u.nameAr}: ${u.priceLyd} د.ل / ليلة`);
    return `أسعار صيف 2026 ✨\n${lines.join("\n")}\n\nللتفاصيل أو الحجز، ابعت نوع الوحدة اللي تهمك.`;
  }
  const lines = ACCOMMODATIONS.map((u) => `• ${u.nameEn}: ${u.priceLyd} LYD/night`);
  return `Summer 2026 rates ✨\n${lines.join("\n")}\n\nFor details or booking, tell us which unit interests you.`;
}

export function getUnitReply(unit: AccommodationUnit, lang: Language): string {
  if (lang === "ar") {
    const details = unit.detailsAr.map((d) => `• ${d}`).join("\n");
    return `${unit.nameAr} ✨\n${unit.priceLyd} د.ل / ليلة\n${details}`;
  }
  const details = unit.detailsEn.map((d) => `• ${d}`).join("\n");
  return `${unit.nameEn} ✨\n${unit.priceLyd} LYD/night\n${details}`;
}

export function getIncludedServicesReply(lang: Language): string {
  if (lang === "ar") {
    return `الخدمات المشمولة ✨\n${INCLUDED_SERVICES_AR.map((s) => `• ${s}`).join("\n")}`;
  }
  return `Included services ✨\n${INCLUDED_SERVICES_EN.map((s) => `• ${s}`).join("\n")}`;
}

export function getActivitiesReply(lang: Language): string {
  if (lang === "ar") {
    return `الأنشطة ✨\n${ACTIVITIES_AR.slice(0, 8).map((s) => `• ${s}`).join("\n")}\nوالمزيد للأطفال والعائلات.`;
  }
  return `Activities ✨\n${ACTIVITIES_EN.slice(0, 8).map((s) => `• ${s}`).join("\n")}\nPlus more for kids and families.`;
}

export function getOffersReply(lang: Language): string {
  if (lang === "ar") {
    return `عروض الافتتاح ✨\n${OPENING_OFFERS_AR.map((s) => `• ${s}`).join("\n")}`;
  }
  return `Opening offers ✨\n${OPENING_OFFERS_EN.map((s) => `• ${s}`).join("\n")}`;
}

export function getOpeningDateReply(lang: Language): string {
  if (lang === "ar") {
    return "سيتم الإعلان عن موعد الافتتاح الرسمي قريباً ✨";
  }
  return "The official opening date will be announced soon ✨";
}

export function getBookingInterestPrompt(lang: Language): string {
  return lang === "ar"
    ? "أكيد ✨ نقدر ناخذ طلب حجز مبدئي. ابعت الاسم، الهاتف، نوع الوحدة، عدد الضيوف، والتاريخ. الفريق يأكد التوفر."
    : "Of course ✨ We can take a booking interest. Share name, phone, unit type, guests, and dates. Our team will confirm availability.";
}

export function getKnowledgeBlockForPrompt(lang: Language): string {
  const units =
    lang === "ar"
      ? ACCOMMODATIONS.map((u) => `- ${u.nameAr}: ${u.priceLyd} د.ل/ليلة`).join("\n")
      : ACCOMMODATIONS.map((u) => `- ${u.nameEn}: ${u.priceLyd} LYD/night`).join("\n");

  const included = lang === "ar" ? INCLUDED_SERVICES_AR.join("; ") : INCLUDED_SERVICES_EN.join("; ");
  const offers = lang === "ar" ? OPENING_OFFERS_AR.join("; ") : OPENING_OFFERS_EN.join("; ");

  return `
Official Summer 2026 accommodation prices (use these exact prices):
${units}

Included: ${included}

Opening offers: ${offers}

Rules: Give real prices when asked. Never confirm a booking or guarantee availability. For booking, collect details and say the team will confirm availability. Never state a fixed opening date; if asked, say the official opening date will be announced soon. Keep replies short and luxury in tone.`;
}

export function resolveOpeningDateReply(message: string, lang: Language): string | undefined {
  const normalized = message.toLowerCase();
  const asksOpening = /opening|when open|opening date|متى تفتح|متى تفتحو|موعد الافتتاح|الافتتاح|امتى الافتتاح|تاريخ الافتتاح/.test(
    normalized,
  );
  if (asksOpening) return getOpeningDateReply(lang);
  return undefined;
}

export function resolvePriceOrUnitReply(message: string, lang: Language): string | undefined {
  const normalized = message.toLowerCase();

  const openingReply = resolveOpeningDateReply(message, lang);
  if (openingReply) return openingReply;

  const asksIncluded = /included|what is included|services included|مشمول|الخدمات|شنو مشمول|شن مشمول/.test(
    normalized,
  );
  if (asksIncluded) return getIncludedServicesReply(lang);

  const asksOffers = /offer|offers|promo|discount|عروض|خصم|تخفيض/.test(normalized);
  if (asksOffers) return getOffersReply(lang);

  const unit = matchAccommodation(normalized);
  if (unit && /price|prices|how much|cost|بكم|قداش|سعر|اسعار|details|تفاصيل|about|عن|this|هذا|هذه/.test(normalized)) {
    return getUnitReply(unit, lang);
  }
  if (unit && !/book|booking|حجز/.test(normalized)) {
    return getUnitReply(unit, lang);
  }

  const asksPrices = /price|prices|how much|cost|rates|as3ar|بكم|قداش|سعر|اسعار|الاسعار|rates/.test(normalized);
  if (asksPrices) return getPriceListReply(lang);

  return undefined;
}
