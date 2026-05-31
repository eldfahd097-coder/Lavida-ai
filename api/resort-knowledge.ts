import type { Language } from "@contracts/templates";

export type AccommodationUnit = {
  id: string;
  nameEn: string;
  nameAr: string;
  priceLyd: number;
  capacityEn: string;
  capacityAr: string;
  viewEn: string;
  viewAr: string;
  detailsEn: string[];
  detailsAr: string[];
  keywords: string[];
};

export const ACCOMMODATIONS: AccommodationUnit[] = [
  {
    id: "presidential",
    nameEn: "Presidential VIP Chalet",
    nameAr: "شاليه VIP الرئاسي",
    priceLyd: 3900,
    capacityEn: "Two families",
    capacityAr: "عائلتين",
    viewEn: "Partial sea view",
    viewAr: "إطلالة بحرية جزئية",
    detailsEn: [
      "Private pool",
      "Private outdoor seating",
      "High privacy",
      "Spacious living area",
      "Partial sea view",
      "Parking near the unit",
    ],
    detailsAr: [
      "مسبح خاص",
      "جلسة خارجية خاصة",
      "خصوصية عالية",
      "صالة معيشة واسعة",
      "إطلالة بحرية جزئية",
      "موقف قريب من الوحدة",
    ],
    keywords: ["presidential", "رئاسي", "رئاسية", "vip رئاسي", "presidential vip", "3900"],
  },
  {
    id: "vip_sea",
    nameEn: "VIP Sea View Chalet",
    nameAr: "شاليه VIP إطلالة بحرية",
    priceLyd: 2900,
    capacityEn: "Families and couples",
    capacityAr: "عائلات وأزواج",
    viewEn: "Direct sea view",
    viewAr: "إطلالة بحرية مباشرة",
    detailsEn: [
      "Direct sea view",
      "Private pool",
      "Outdoor sea-facing seating",
      "High privacy",
    ],
    detailsAr: [
      "إطلالة بحرية مباشرة",
      "مسبح خاص",
      "جلسة خارجية بإطلالة بحر",
      "خصوصية عالية",
    ],
    keywords: ["vip sea", "sea view chalet", "vip chalet", "بحر مباشر", "private pool", "2900"],
  },
  {
    id: "pool_view",
    nameEn: "Pool and Activities View Chalet",
    nameAr: "شاليه إطلالة المسبح والأنشطة",
    priceLyd: 1900,
    capacityEn: "Families",
    capacityAr: "عائلات",
    viewEn: "Main pool view",
    viewAr: "إطلالة على المسبح الرئيسي",
    detailsEn: [
      "Main pool view",
      "Close to entertainment areas",
      "Easy access to restaurant, beach, and facilities",
    ],
    detailsAr: [
      "إطلالة على المسبح الرئيسي",
      "قريب من مناطق الترفيه",
      "سهولة الوصول للمطعم والشاطئ والمرافق",
    ],
    keywords: ["pool view", "activities view", "مسبح رئيسي", "pool activities", "1900"],
  },
  {
    id: "side_sea",
    nameEn: "Side Sea View Chalet",
    nameAr: "شاليه إطلالة بحر جانبية",
    priceLyd: 1400,
    capacityEn: "Small families and couples",
    capacityAr: "عائلات صغيرة وأزواج",
    viewEn: "Side sea view",
    viewAr: "إطلالة بحر جانبية",
    detailsEn: ["Side sea view", "Private balcony", "Quiet location"],
    detailsAr: ["إطلالة بحر جانبية", "شرفة خاصة", "موقع هادئ"],
    keywords: ["side sea", "جانبي", "1400"],
  },
  {
    id: "garden_studio",
    nameEn: "Garden View Studio",
    nameAr: "استوديو إطلالة الحديقة",
    priceLyd: 1000,
    capacityEn: "Couples or small families",
    capacityAr: "أزواج أو عائلات صغيرة",
    viewEn: "Garden view",
    viewAr: "إطلالة على الحديقة",
    detailsEn: [
      "Garden view",
      "Close to main facilities",
      "Practical comfortable layout",
      "Good value option",
    ],
    detailsAr: [
      "إطلالة على الحديقة",
      "قريب من المرافق الرئيسية",
      "تصميم عملي ومريح",
      "خيار اقتصادي",
    ],
    keywords: ["garden", "studio", "استوديو", "حديقة", "1000"],
  },
];

export const INCLUDED_SERVICES_EN = [
  "Private beach access",
  "Pool access",
  "Free parking",
  "24 hour reception and customer service",
  "24 hour security",
  "Free internet in public areas",
  "Beach seating and umbrellas",
  "Family rest areas",
  "Beach Cafe",
  "Restaurants and cafes",
  "Supermarket",
  "Kids area",
  "Game Room and TV Lounge",
  "Ping Pong and Pool Table",
  "Beach sports areas",
];

export const INCLUDED_SERVICES_AR = [
  "دخول شاطئ خاص",
  "دخول المسبح",
  "موقف سيارات مجاني",
  "استقبال وخدمة عملاء 24 ساعة",
  "أمن 24 ساعة",
  "إنترنت مجاني في المناطق العامة",
  "مقاعد ومظلات الشاطئ",
  "مناطق راحة للعائلات",
  "كافيه الشاطئ",
  "مطاعم ومقاهي",
  "سوبرماركت",
  "منطقة أطفال",
  "صالة ألعاب وتلفزيون",
  "تنس طاولة وبلياردو",
  "مناطق رياضات شاطئية",
];

export const ACTIVITIES_EN = [
  "Sea trips",
  "Kayaks",
  "Paddle boards",
  "Pedal boats for families",
  "Seasonal water games",
  "Water activities",
  "Beach football court",
  "Beach volleyball court",
  "Sports competitions",
  "Group games",
  "Kids Club",
  "Trampoline",
  "Outdoor kids games",
  "Drawing and coloring workshops",
  "Daily kids competitions and prizes",
  "Children entertainment activities",
];

export const ACTIVITIES_AR = [
  "رحلات بحرية",
  "كاياك",
  "تجديف",
  "قوارب بدالية للعائلات",
  "ألعاب مائية موسمية",
  "أنشطة مائية",
  "ملعب كرة قدم شاطئي",
  "ملعب كرة طائرة شاطئي",
  "مسابقات رياضية",
  "ألعاب جماعية",
  "نادي أطفال",
  "ترامبولين",
  "ألعاب أطفال خارجية",
  "ورش رسم وتلوين",
  "مسابقات وجوائز يومية للأطفال",
  "أنشطة ترفيه للأطفال",
];

export const OPENING_OFFERS_EN = [
  "Book 3 nights and get the 4th night free",
  "15% discount for confirmed early bookings before official opening",
  "10% discount for families and groups",
  "Free stay for 2 children up to 10 years old in the same unit",
  "Welcome fruit basket and drinks for VIP and Presidential units",
  "Special beach seating for VIP and Presidential units",
  "Discounts on water activities for VIP and Presidential units",
  "Special corporate and group booking offers available",
];

export const OPENING_OFFERS_AR = [
  "احجز 3 ليالي واحصل على الليلة الرابعة مجاناً",
  "خصم 15% للحجوزات المؤكدة المبكرة قبل الافتتاح الرسمي",
  "خصم 10% للعائلات والمجموعات",
  "إقامة مجانية لطفلين حتى 10 سنوات في نفس الوحدة",
  "سلة فواكه ومشروبات ترحيبية لوحدات VIP والرئاسية",
  "جلسة شاطئية مميزة لوحدات VIP والرئاسية",
  "خصومات على الأنشطة المائية لوحدات VIP والرئاسية",
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
    return `أسعار صيف 2026 ✨\n${lines.join("\n")}\n\nلتفاصيل أي وحدة، ابعت اسمها.`;
  }
  const lines = ACCOMMODATIONS.map((u) => `• ${u.nameEn}: ${u.priceLyd} LYD/night`);
  return `Summer 2026 rates ✨\n${lines.join("\n")}\n\nFor details on any unit, tell us which one interests you.`;
}

export function getUnitReply(unit: AccommodationUnit, lang: Language): string {
  if (lang === "ar") {
    const details = unit.detailsAr.map((d) => `• ${d}`).join("\n");
    return `${unit.nameAr} ✨\n${unit.priceLyd} د.ل / ليلة\nالسعة: ${unit.capacityAr}\n${details}`;
  }
  const details = unit.detailsEn.map((d) => `• ${d}`).join("\n");
  return `${unit.nameEn} ✨\n${unit.priceLyd} LYD/night\nCapacity: ${unit.capacityEn}\n${details}`;
}

const NEARBY_AMENITIES_EN =
  "Beach, Beach Cafe, restaurants, supermarket, main pool, entertainment areas, and family zones";
const NEARBY_AMENITIES_AR = "الشاطئ، كافيه الشاطئ، المطاعم، السوبرماركت، المسبح الرئيسي، مناطق الترفيه، ومناطق العائلات";

const INCLUDED_SNIPPET_EN =
  "Resort access includes private beach, pool, parking, 24h reception & security, WiFi, beach seating, kids area, and more";
const INCLUDED_SNIPPET_AR =
  "تشمل الإقامة: شاطئ خاص، مسبح، موقف، استقبال وأمن 24 ساعة، واي فاي، جلسات الشاطئ، منطقة أطفال، والمزيد";

/** Rich chalet detail without leading with price — for detail questions. */
export function getChaletDetailReply(unit: AccommodationUnit, lang: Language, includePrice = false): string {
  if (lang === "ar") {
    const features = unit.detailsAr.map((d) => `• ${d}`).join("\n");
    const priceLine = includePrice ? `\nالسعر: ${unit.priceLyd} د.ل / ليلة` : "";
    return `${unit.nameAr} ✨
السعة: ${unit.capacityAr}
الإطلالة: ${unit.viewAr}
المميزات:
${features}
${INCLUDED_SNIPPET_AR}
قريب من: ${NEARBY_AMENITIES_AR}${priceLine}`;
  }
  const features = unit.detailsEn.map((d) => `• ${d}`).join("\n");
  const priceLine = includePrice ? `\nRate: ${unit.priceLyd} LYD/night` : "";
  return `${unit.nameEn} ✨
Capacity: ${unit.capacityEn}
View: ${unit.viewEn}
Features:
${features}
${INCLUDED_SNIPPET_EN}
Nearby: ${NEARBY_AMENITIES_EN}${priceLine}`;
}

export function getAccommodationsOverviewReply(lang: Language): string {
  if (lang === "ar") {
    const lines = ACCOMMODATIONS.map((u) => `• ${u.nameAr} — ${u.capacityAr} — ${u.viewAr}`);
    return `وحدات لافيدا ✨\n${lines.join("\n")}\nابعت اسم الوحدة ونشرحلك التفاصيل كاملة.`;
  }
  const lines = ACCOMMODATIONS.map((u) => `• ${u.nameEn} — ${u.capacityEn} — ${u.viewEn}`);
  return `La Vida accommodations ✨\n${lines.join("\n")}\nTell us which unit interests you and we will share full details.`;
}

export function getResortOverviewReply(lang: Language): string {
  if (lang === "ar") {
    return `La Vida Resort & Beach Club ✨
منتجع فاخر على البحر في زوارة — إقامة راقية، شاطئ خاص، مسابح، ومرافق عائلية.

المرافق والخدمات:
${INCLUDED_SERVICES_AR.slice(0, 8).map((s) => `• ${s}`).join("\n")}
• والمزيد من مرافق المنتجع

الأنشطة:
${ACTIVITIES_AR.slice(0, 6).map((s) => `• ${s}`).join("\n")}
• وأنشطة أطفال وعائلية متنوعة

الإقامة: شاليهات VIP، إطلالات بحرية، استوديوهات، وخيارات للعائلات والأزواج.
تحب تعرف أكثر عن وحدة معينة، الأنشطة، أو الخدمات المشمولة؟`;
  }
  return `La Vida Resort & Beach Club ✨
A luxury beachfront resort in Zuwarah with elegant stays, a private beach, pools, and family-friendly facilities.

Facilities & services:
${INCLUDED_SERVICES_EN.slice(0, 8).map((s) => `• ${s}`).join("\n")}
• Plus full resort amenities

Activities:
${ACTIVITIES_EN.slice(0, 6).map((s) => `• ${s}`).join("\n")}
• Plus kids and family entertainment

Stays include VIP chalets, sea-view options, garden studios, and family-friendly layouts.
Would you like details on a specific unit, activities, or included services?`;
}

export function getUnitCapacityReply(unit: AccommodationUnit, lang: Language): string {
  if (lang === "ar") {
    return `${unit.nameAr} ✨\nالسعة: ${unit.capacityAr}\nللعدد الدقيق، الإدارة تقدر تأكد التفاصيل.`;
  }
  return `${unit.nameEn} ✨\nCapacity: ${unit.capacityEn}\nFor an exact guest count, management can confirm details.`;
}

export function getAllCapacitiesReply(lang: Language): string {
  if (lang === "ar") {
    const lines = ACCOMMODATIONS.map((u) => `• ${u.nameAr}: ${u.capacityAr}`);
    return `سعة الوحدات ✨\n${lines.join("\n")}\nللعدد الدقيق، الإدارة تقدر تأكد التفاصيل.`;
  }
  const lines = ACCOMMODATIONS.map((u) => `• ${u.nameEn}: ${u.capacityEn}`);
  return `Unit capacity ✨\n${lines.join("\n")}\nFor exact numbers, management can confirm details.`;
}

export function getIncludedServicesReply(lang: Language): string {
  if (lang === "ar") {
    return `الخدمات والمرافق المشمولة ✨\n${INCLUDED_SERVICES_AR.map((s) => `• ${s}`).join("\n")}`;
  }
  return `Included services & facilities ✨\n${INCLUDED_SERVICES_EN.map((s) => `• ${s}`).join("\n")}`;
}

export function getActivitiesReply(lang: Language): string {
  if (lang === "ar") {
    return `الأنشطة ✨\n${ACTIVITIES_AR.map((s) => `• ${s}`).join("\n")}`;
  }
  return `Activities ✨\n${ACTIVITIES_EN.map((s) => `• ${s}`).join("\n")}`;
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

/** Booking is not open yet — use for any booking/reservation request. */
export function getBookingUnavailableReply(lang: Language): string {
  if (lang === "ar") {
    return "حاليًا الحجز مازال غير متوفر وقريب حيتم الإعلان عن تفاصيل وآلية الحجز الرسمية 🤍";
  }
  return "Booking is not available yet 🤍 Official booking details and how to reserve will be announced soon.";
}

/** @deprecated Use getBookingUnavailableReply */
export function getBookingInterestPrompt(lang: Language): string {
  return getBookingUnavailableReply(lang);
}

export function resolveBookingReply(message: string, lang: Language): string | undefined {
  const normalized = message.toLowerCase();
  const asksBooking = /book|booking|reservation|reserve|availability|حجز|الحجز|نحجز|نبي نحجز|كيف نحجز|متاح|فيه حجز|7ajz|hajz/.test(
    normalized,
  );
  if (asksBooking) return getBookingUnavailableReply(lang);
  return undefined;
}

function asksExplicitPrices(normalized: string): boolean {
  return /price list|accommodation prices|room rates|list of prices|اسعار|الاسعار|أسعار|سعر|بكم|قداش|how much|price|prices|rates|cost|rate|as3ar|كم السعر|شن السعر/.test(
    normalized,
  );
}

function asksResortDetailsQuestion(normalized: string): boolean {
  return /tell me more|more details|resort details|about the resort|about la vida|what do you offer|what do you have|resort info|information|details|what facilities|what activities|what is included|what services|what's included|services available|facilities do you|activities do you|included services|tell me about|know more|what else|معلومات|تفاصيل|تفاصيل اكثر|ممكن معلومات|عن المنتجع|شن عندكم|شنو عندكم|شن تقدموا|المرافق|الخدمات|شن مشمول|شنو مشمول|زيد|زيدني|وضح|شن بعد|شنو اكثر/.test(
    normalized,
  );
}

function asksCapacityQuestion(normalized: string): boolean {
  return /how many|capacity|guest|guests|people|person|persons|fits|fit|كم شخص|عدد|ضيوف|اشخاص|أشخاص|قداش شخص|سعة/.test(
    normalized,
  );
}

function asksActivitiesQuestion(normalized: string): boolean {
  return /activit|things to do|what to do|أنشطة|الانشطة|نشاط|نشاطات|شن النشاطات|شنو النشاطات/.test(normalized);
}

function asksFacilitiesQuestion(normalized: string): boolean {
  return /facilit|amenit|what services|services available|service do you|المرافق|الخدمات|شن الخدمات|شنو الخدمات|خدمات متوفرة|مرافق/.test(
    normalized,
  );
}

export function getKnowledgeBlockForPrompt(lang: Language): string {
  const units =
    lang === "ar"
      ? ACCOMMODATIONS.map(
          (u) => `- ${u.nameAr}: ${u.priceLyd} د.ل/ليلة، السعة: ${u.capacityAr}`,
        ).join("\n")
      : ACCOMMODATIONS.map(
          (u) => `- ${u.nameEn}: ${u.priceLyd} LYD/night, capacity: ${u.capacityEn}`,
        ).join("\n");

  const included = lang === "ar" ? INCLUDED_SERVICES_AR.join("; ") : INCLUDED_SERVICES_EN.join("; ");
  const activities = lang === "ar" ? ACTIVITIES_AR.join("; ") : ACTIVITIES_EN.join("; ");
  const offers = lang === "ar" ? OPENING_OFFERS_AR.join("; ") : OPENING_OFFERS_EN.join("; ");

  return `
Official Summer 2026 accommodation prices (use these exact prices):
${units}

Included services & facilities: ${included}

Activities: ${activities}

Opening offers: ${offers}

Behavior rules:
- Answer the guest's question directly first. Guide naturally like a resort host — not a pricing menu.
- Do NOT send the full price list unless the guest explicitly asks for prices, rates, cost, or a price list.
- For "tell me more", resort details, facilities, activities, or included services: give detailed resort information — not prices.
- For chalet/unit detail questions: share capacity, view, features, included resort access, and nearby amenities — do not lead with price unless they asked for price.
- If asked how many people a unit fits, use capacity listed above; management can confirm exact numbers.
- If asked what is included, list services and facilities.
- If asked about activities, list all activity categories.
- If asked about offers, list opening offers.
- Never invent room counts, bathrooms, or bed counts.
- Booking is NOT open — never ask for booking details or say book now.
- Never confirm reservations. Never state a fixed opening date.
- Keep replies short, elegant, and attractive.`;
}

/** Prompt-only guidance for AI-generated replies (does not alter template/FAQ answers). */
export function getResponseStyleRules(lang: Language): string {
  const features =
    lang === "ar"
      ? `مرافق يمكن ذكرها بشكل طبيعي عند الصلة: شاطئ خاص، مسابح، كافيه الشاطئ، مطاعم ومقاهي، أنشطة بحرية، جتسكي، منطقة أطفال، صالة ألعاب وتلفزيون، تنس طاولة وبلياردو، رياضات شاطئية، جلسات عائلية، أمن 24/7، موقف مجاني، واي فاي في المناطق العامة.`
      : `Features you may mention naturally when relevant: private beach, swimming pools, Beach Cafe, restaurants and cafes, water activities, Jet Ski, kids area, Game Room & TV Lounge, ping pong & pool table, beach sports, family seating areas, 24/7 security, free parking, public area WiFi.`;

  if (lang === "ar") {
    return `
أسلوب الرد (للردود التي يولّدها الذكاء الاصطناعي فقط):
1) أجب على سؤال الضيف مباشرة أولاً.
2) بعد الإجابة، إذا كان مناسباً، اذكر باختصار 2–4 مرافق أو ميزات مرتبطة بسؤاله — بشكل طبيعي وليس إعلاناً.
3) ${features}
4) لا تطيل الرد ولا تحوّله لإعلان. لا تطلب الحجز. لا ترسل قائمة الأسعار إلا إذا طلبها الضيف صراحة.
5) كن مفيداً وطبيعياً كموظف استقبال — لا روبوتياً ولا مبيعاتياً.`;
  }

  return `
Response style (AI-generated replies only):
1) Answer the guest's question directly first.
2) After answering, when relevant, briefly mention 2–4 related resort features — naturally, not as an ad.
3) ${features}
4) Do not make replies longer than needed. Do not ask users to book. Do not send the price list unless the guest explicitly asks for prices or rates.
5) Guide the guest naturally like a resort host — helpful, not salesy or robotic.`;
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

  const bookingReply = resolveBookingReply(message, lang);
  if (bookingReply) return bookingReply;

  const openingReply = resolveOpeningDateReply(message, lang);
  if (openingReply) return openingReply;

  const unit = matchAccommodation(normalized);
  const wantsPrice = asksExplicitPrices(normalized);

  if (unit && wantsPrice) {
    return getUnitReply(unit, lang);
  }

  if (unit) {
    return getChaletDetailReply(unit, lang, false);
  }

  if (asksResortDetailsQuestion(normalized) && !wantsPrice) {
    if (/activit|things to do|what to do|أنشطة|الانشطة|نشاط|نشاطات/.test(normalized)) {
      return getActivitiesReply(lang);
    }
    if (/included|what is included|services included|مشمول|شن مشمول|شنو مشمول/.test(normalized)) {
      return getIncludedServicesReply(lang);
    }
    if (asksFacilitiesQuestion(normalized)) {
      return getIncludedServicesReply(lang);
    }
    return getResortOverviewReply(lang);
  }

  if (asksCapacityQuestion(normalized)) {
    const unit = matchAccommodation(normalized);
    return unit ? getUnitCapacityReply(unit, lang) : getAllCapacitiesReply(lang);
  }

  if (asksActivitiesQuestion(normalized)) {
    return getActivitiesReply(lang);
  }

  const asksIncluded = /included|what is included|services included|مشمول|شن مشمول|شنو مشمول/.test(
    normalized,
  );
  if (asksIncluded) return getIncludedServicesReply(lang);

  if (asksFacilitiesQuestion(normalized)) {
    return getIncludedServicesReply(lang);
  }

  const asksOffers = /offer|offers|promo|discount|عروض|خصم|تخفيض/.test(normalized);
  if (asksOffers) return getOffersReply(lang);

  if (wantsPrice) {
    return getPriceListReply(lang);
  }

  return undefined;
}
