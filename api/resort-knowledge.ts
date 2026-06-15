import type { Language } from "@contracts/templates";

export const RESORT_BRAND = {
  name: "La Vida Resort & Beach Club",
  locationAr: "منطقة أم علي بمدينة زوارة، على واجهة شاطئية مباشرة",
  locationEn: "Umm Ali area, Zuwarah, Libya — direct beachfront",
  openingDateAr: "1 يوليو 2026",
  openingDateEn: "1 July 2026",
  email: "info@lavidaresort.ly",
  phones: ["0938888868", "0938888878"],
  phonesFormatted: ["093 888 8868", "093 888 8878"],
  messengerLink: "https://www.facebook.com/share/1BSWTBJ8zJ/?mibextid=wwXIfr",
  website: "lavidaresort.ly",
} as const;

/** Final prices are under management review — do not present as confirmed. */
export const PRICING_STATUS = "under_review" as const;

export type AccommodationUnit = {
  id: string;
  nameEn: string;
  nameAr: string;
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
    nameEn: "Presidential VIP Villa",
    nameAr: "فيلا VIP الرئاسية",
    capacityEn: "Up to ~12 guests — suitable for two large families or VIP groups",
    capacityAr: "تقريباً حتى 12 شخص — مناسب لعائلتين أو ضيوف VIP",
    viewEn: "Premium beachfront location",
    viewAr: "موقع مميز على الواجهة البحرية",
    detailsEn: [
      "Premium luxury unit",
      "Private swimming pool",
      "High privacy",
      "Large spaces",
      "Suitable for two families",
      "Ideal for large families and VIP guests",
    ],
    detailsAr: [
      "وحدة فاخرة بمستوى راقٍ",
      "مسبح خاص",
      "خصوصية عالية",
      "مساحات واسعة",
      "مناسب لعائلتين",
      "مثالي للعائلات الكبيرة وضيوف VIP",
    ],
    keywords: [
      "presidential",
      "رئاسي",
      "رئاسية",
      "vip رئاسي",
      "presidential vip",
      "الرئاسي",
      "فيلا رئاسية",
    ],
  },
  {
    id: "vip",
    nameEn: "VIP Villa / VIP Chalet",
    nameAr: "فيلا VIP / شاليه VIP",
    capacityEn: "Families and couples — exact capacity to be confirmed by management",
    capacityAr: "عائلات وأزواج — السعة الدقيقة حسب تأكيد الإدارة",
    viewEn: "Sea view or premium location depending on final allocation",
    viewAr: "إطلالة بحرية أو موقع مميز حسب التخصيص النهائي",
    detailsEn: [
      "Premium family unit",
      "Sea view or premium location",
      "Private or premium outdoor seating",
      "Suitable for families and couples",
    ],
    detailsAr: [
      "وحدة عائلية فاخرة",
      "إطلالة بحرية أو موقع مميز",
      "جلسة خارجية خاصة أو مميزة",
      "مناسب للعائلات والأزواج",
    ],
    keywords: ["vip villa", "vip chalet", "vip", "فيلا vip", "شاليه vip", "فيلا"],
  },
  {
    id: "family_pool",
    nameEn: "Family Chalet / Pool View Chalet",
    nameAr: "شاليه عائلي / شاليه إطلالة المسبح",
    capacityEn: "Families — exact capacity to be confirmed by management",
    capacityAr: "عائلات — السعة الدقيقة حسب تأكيد الإدارة",
    viewEn: "Pool and activity areas",
    viewAr: "المسبح ومناطق الأنشطة",
    detailsEn: [
      "Family-friendly unit",
      "Close to pool and activity areas",
      "Easy access to beach and resort facilities",
      "Suitable for families",
    ],
    detailsAr: [
      "وحدة مناسبة للعائلات",
      "قريب من المسبح ومناطق الأنشطة",
      "سهولة الوصول للشاطئ ومرافق المنتجع",
      "مناسب للعائلات",
    ],
    keywords: [
      "pool view",
      "family chalet",
      "شاليه عائلي",
      "مسبح",
      "pool activities",
      "إطلالة المسبح",
      "شاليه",
    ],
  },
  {
    id: "apartments",
    nameEn: "Apartments",
    nameAr: "شقق",
    capacityEn: "Families and longer stays — exact capacity to be confirmed by management",
    capacityAr: "عائلات وإقامات أطول — السعة الدقيقة حسب تأكيد الإدارة",
    viewEn: "Comfortable family accommodation",
    viewAr: "إقامة عائلية مريحة",
    detailsEn: [
      "Comfortable family accommodation",
      "Fully equipped accommodation style",
      "Suitable for families and longer stays",
    ],
    detailsAr: [
      "إقامة عائلية مريحة",
      "تجهيز كامل بأسلوب الشقق الفندقية",
      "مناسب للعائلات والإقامات الأطول",
    ],
    keywords: ["apartment", "apartments", "شقة", "شقق"],
  },
  {
    id: "garden_studio",
    nameEn: "Garden View Studio",
    nameAr: "استوديو إطلالة الحديقة",
    capacityEn: "Couples and small families — exact capacity to be confirmed by management",
    capacityAr: "أزواج وعائلات صغيرة — السعة الدقيقة حسب تأكيد الإدارة",
    viewEn: "Garden view — floor-based pricing may apply (ground / first / second floor)",
    viewAr: "إطلالة حديقة — قد يُطبّق تسعير حسب الطابق (أرضي / أول / ثاني)",
    detailsEn: [
      "Studio category with garden view",
      "Suitable for couples and small families",
      "Floor categories under management review",
    ],
    detailsAr: [
      "استوديو بإطلالة حديقة",
      "مناسب للأزواج والعائلات الصغيرة",
      "تصنيفات الطوابق قيد مراجعة الإدارة",
    ],
    keywords: ["garden", "studio", "استوديو", "حديقة", "garden view"],
  },
];

export const INCLUDED_SERVICES_EN = [
  "Private beach",
  "Large swimming pool",
  "Beach Cafe",
  "Restaurants",
  "Cafes",
  "Family seating areas",
  "Reception",
  "Free parking",
  "Public WiFi",
  "24 hour security",
  "24 hour reception",
  "Supermarket",
  "Kids area",
  "Kids playground",
  "Game Room",
  "TV Lounge",
  "Ping Pong",
  "Pool table",
];

export const INCLUDED_SERVICES_AR = [
  "شاطئ خاص",
  "مسبح كبير",
  "Beach Cafe",
  "مطاعم",
  "كافيهات",
  "جلسات عائلية",
  "استقبال",
  "موقف مجاني",
  "واي فاي عام",
  "أمن 24 ساعة",
  "استقبال 24 ساعة",
  "سوبرماركت",
  "منطقة أطفال",
  "ملعب أطفال",
  "Game Room",
  "TV Lounge",
  "Ping Pong",
  "Pool table",
];

export const ACTIVITIES_EN = [
  "Water sports",
  "Jet ski rental",
  "Kayaks",
  "Paddle boards",
  "Pedal boats",
  "Boat and sea trips when available",
  "Seasonal water activities",
  "Beach experiences",
  "Beach football court",
  "Beach volleyball court",
  "Sports competitions",
  "Group activities",
  "Kids Club / kids area",
  "Kids playground",
  "Trampoline",
  "Drawing and coloring workshops",
  "Daily kids competitions and prizes",
  "Family-friendly entertainment",
];

export const ACTIVITIES_AR = [
  "أنشطة مائية",
  "تأجير جت سكي",
  "كاياك",
  "Paddle Board",
  "قوارب بدالات",
  "رحلات بحرية عند التوفر",
  "أنشطة مائية موسمية",
  "تجارب شاطئية",
  "ملعب كرة قدم شاطئي",
  "ملعب كرة طائرة شاطئية",
  "مسابقات رياضية",
  "أنشطة جماعية",
  "Kids Club / منطقة أطفال",
  "ملعب أطفال",
  "ترامبولين",
  "ورش رسم وتلوين",
  "مسابقات وجوائز يومية للأطفال",
  "ترفيه عائلي",
];

export const OPENING_OFFERS_EN = [
  "Opening offers will be announced officially closer to launch",
  "Special corporate and group booking offers available — contact management",
];

export const OPENING_OFFERS_AR = [
  "عروض الافتتاح سيتم الإعلان عنها رسمياً قرب موعد الافتتاح",
  "عروض خاصة للحجوزات الشركات والمجموعات — تواصل مع الإدارة",
];

export type BookingLead = {
  fullName?: string;
  phone?: string;
  expectedDates?: string;
  guestCount?: number;
  unitType?: string;
};

const BOOKING_INTENT_PATTERN =
  /book|booking|reservation|reserve|availability|حجز|الحجز|نحجز|نبي نحجز|كيف نحجز|نبي حجز|حابة نحجز|نريد نحجز|متى الحجز|هل الحجز مفتوح|نبي نسجل اسمي|مهتم بالحجز|نبي نسجل|7ajz|hajz|فيه حجز|طريقة الحجز/;

export function isBookingIntent(text: string): boolean {
  return BOOKING_INTENT_PATTERN.test(text.toLowerCase());
}

export function matchAccommodation(text: string): AccommodationUnit | undefined {
  const normalized = text.toLowerCase();
  for (const unit of ACCOMMODATIONS) {
    if (unit.keywords.some((kw) => normalized.includes(kw.toLowerCase()))) {
      return unit;
    }
  }
  if (/presidential|رئاس/.test(normalized)) {
    return ACCOMMODATIONS.find((u) => u.id === "presidential");
  }
  if (/فيلا|villa/.test(normalized) && !/presidential|رئاس/.test(normalized)) {
    return ACCOMMODATIONS.find((u) => u.id === "vip");
  }
  if (/شاليه|chalet/.test(normalized) && !/vip|رئاس/.test(normalized)) {
    return ACCOMMODATIONS.find((u) => u.id === "family_pool");
  }
  if (/استوديو|studio|شقه|apartment|شقة|شقق/.test(normalized)) {
    return /استوديو|studio|حديقة|garden/.test(normalized)
      ? ACCOMMODATIONS.find((u) => u.id === "garden_studio")
      : ACCOMMODATIONS.find((u) => u.id === "apartments");
  }
  return undefined;
}

export function accommodationBookingLabel(unit: AccommodationUnit): string {
  return unit.nameEn;
}

export function getPricingUnderReviewReply(lang: Language): string {
  if (lang === "ar") {
    return "الأسعار النهائية قيد الاعتماد وسيتم الإعلان عنها بشكل رسمي قريباً";
  }
  return "Final prices are under approval and will be announced officially soon";
}

export function getPriceListReply(lang: Language): string {
  return getPricingUnderReviewReply(lang);
}

export function getUnitReply(unit: AccommodationUnit, lang: Language): string {
  return getChaletDetailReply(unit, lang, false);
}

const NEARBY_AMENITIES_EN =
  "Private beach, Beach Cafe, restaurants, main pool, entertainment areas, and family zones";
const NEARBY_AMENITIES_AR =
  "الشاطئ الخاص، Beach Cafe، المطاعم، المسبح الرئيسي، مناطق الترفيه، والمناطق العائلية";

const INCLUDED_SNIPPET_EN =
  "Resort experience includes private beach, large pool, dining options, kids areas, water activities, and family entertainment";
const INCLUDED_SNIPPET_AR =
  "تجربة المنتجع تشمل شاطئ خاص، مسبح كبير، خيارات أكل ومشروبات، مناطق أطفال، أنشطة مائية، وترفيه عائلي";

export function getChaletDetailReply(unit: AccommodationUnit, lang: Language, _includePrice = false): string {
  if (lang === "ar") {
    const features = unit.detailsAr.map((d) => `• ${d}`).join("\n");
    return `${unit.nameAr}
السعة: ${unit.capacityAr}
الإطلالة: ${unit.viewAr}
المميزات:
${features}
${INCLUDED_SNIPPET_AR}
قريب من: ${NEARBY_AMENITIES_AR}`;
  }
  const features = unit.detailsEn.map((d) => `• ${d}`).join("\n");
  return `${unit.nameEn}
Capacity: ${unit.capacityEn}
View: ${unit.viewEn}
Features:
${features}
${INCLUDED_SNIPPET_EN}
Nearby: ${NEARBY_AMENITIES_EN}`;
}

export function getAccommodationsOverviewReply(lang: Language): string {
  if (lang === "ar") {
    const lines = ACCOMMODATIONS.map((u) => `• ${u.nameAr} — ${u.capacityAr}`);
    return `وحدات La Vida ✨\n${lines.join("\n")}\nابعت اسم الوحدة ونشرحلك التفاصيل.`;
  }
  const lines = ACCOMMODATIONS.map((u) => `• ${u.nameEn} — ${u.capacityEn}`);
  return `La Vida accommodations ✨\n${lines.join("\n")}\nTell us which unit interests you and we will share details.`;
}

export function getResortOverviewReply(lang: Language): string {
  if (lang === "ar") {
    return `La Vida Resort & Beach Club ✨
منتجع شاطئي عائلي متكامل في زوارة — إقامة، شاطئ خاص، مسابح، مطاعم، كافيهات، أنشطة مائية، وترفيه للعائلات.

المرافق:
${INCLUDED_SERVICES_AR.slice(0, 8).map((s) => `• ${s}`).join("\n")}
• والمزيد من مرافق المنتجع

الأنشطة:
${ACTIVITIES_AR.slice(0, 6).map((s) => `• ${s}`).join("\n")}
• وأنشطة أطفال وعائلية متنوعة

الافتتاح الرسمي: ${RESORT_BRAND.openingDateAr}
تحب تعرف أكثر عن وحدة معينة، الأنشطة، أو الحجز المبدئي؟`;
  }
  return `La Vida Resort & Beach Club ✨
A full beachfront family resort in Zuwarah — accommodation, private beach, pools, restaurants, cafes, water activities, and family entertainment.

Facilities:
${INCLUDED_SERVICES_EN.slice(0, 8).map((s) => `• ${s}`).join("\n")}
• Plus full resort amenities

Activities:
${ACTIVITIES_EN.slice(0, 6).map((s) => `• ${s}`).join("\n")}
• Plus kids and family entertainment

Official opening: ${RESORT_BRAND.openingDateEn}
Would you like details on a specific unit, activities, or pre-registration?`;
}

export function getUnitCapacityReply(unit: AccommodationUnit, lang: Language): string {
  if (unit.id === "presidential") {
    if (lang === "ar") {
      return "الشاليه الرئاسي VIP مناسب لعائلتين ويستوعب تقريباً حتى 12 شخص، ويتميز بمسبح خاص ومساحات واسعة وخصوصية عالية.";
    }
    return "The Presidential VIP Villa suits two families and accommodates approximately up to 12 guests, with a private pool, large spaces, and high privacy.";
  }
  if (lang === "ar") {
    return `${unit.nameAr}\nالسعة: ${unit.capacityAr}`;
  }
  return `${unit.nameEn}\nCapacity: ${unit.capacityEn}`;
}

export function getGuestRecommendationReply(guestCount: number, lang: Language): string {
  if (guestCount >= 7) {
    if (lang === "ar") {
      return `للعدد ${guestCount} غالباً أنسب خيار هو الشاليه الرئاسي VIP أو أكثر من وحدة متقاربة حسب التوفر، لأنه يوفر مساحة وخصوصية أكثر للعائلات. نقدروا نسجلوا بياناتكم ويتواصل معاكم فريق الحجوزات للتأكيد.`;
    }
    return `For ${guestCount} guests, the Presidential VIP Villa or multiple nearby units are usually the best fit depending on availability — more space and privacy for families. We can register your details and our reservations team will confirm.`;
  }
  if (lang === "ar") {
    return `للعدد ${guestCount} نقدروا نرشحلكم الوحدة الأنسب حسب نوع الإقامة والتوفر. نقدروا نسجلوا بياناتكم ويتواصل معاكم الفريق للتأكيد.`;
  }
  return `For ${guestCount} guests we can recommend the best unit type based on your stay and availability. We can register your details and our team will confirm.`;
}

export function getAllCapacitiesReply(lang: Language): string {
  if (lang === "ar") {
    const lines = ACCOMMODATIONS.map((u) => `• ${u.nameAr}: ${u.capacityAr}`);
    return `سعة الوحدات ✨\n${lines.join("\n")}\nللعدد الدقيق، الإدارة تؤكد التفاصيل النهائية.`;
  }
  const lines = ACCOMMODATIONS.map((u) => `• ${u.nameEn}: ${u.capacityEn}`);
  return `Unit capacity ✨\n${lines.join("\n")}\nFor exact numbers, management confirms final details.`;
}

export function getIncludedServicesReply(lang: Language): string {
  if (lang === "ar") {
    return `المرافق والخدمات ✨\n${INCLUDED_SERVICES_AR.map((s) => `• ${s}`).join("\n")}`;
  }
  return `Facilities & services ✨\n${INCLUDED_SERVICES_EN.map((s) => `• ${s}`).join("\n")}`;
}

export function getActivitiesReply(lang: Language): string {
  if (lang === "ar") {
    return "عندنا شاطئ خاص، مسبح كبير، أنشطة مائية، جت سكي، كاياك، Paddle Board، قوارب بدالات، ملاعب كرة قدم وطائرة شاطئية، منطقة أطفال، Game Room، TV Lounge، Ping Pong وPool Table.";
  }
  return "We have a private beach, large pool, water sports, jet ski, kayaks, paddle boards, pedal boats, beach football and volleyball courts, kids area, Game Room, TV Lounge, ping pong, and pool table.";
}

export function getOffersReply(lang: Language): string {
  if (lang === "ar") {
    return `عروض الافتتاح ✨\n${OPENING_OFFERS_AR.map((s) => `• ${s}`).join("\n")}`;
  }
  return `Opening offers ✨\n${OPENING_OFFERS_EN.map((s) => `• ${s}`).join("\n")}`;
}

export function getOpeningDateReply(lang: Language): string {
  if (lang === "ar") {
    return `الافتتاح الرسمي لـ ${RESORT_BRAND.name} سيكون بتاريخ ${RESORT_BRAND.openingDateAr} إن شاء الله`;
  }
  return `The official opening of ${RESORT_BRAND.name} will be on ${RESORT_BRAND.openingDateEn}, in sha Allah`;
}

export function getBookingWhenReply(lang: Language): string {
  if (lang === "ar") {
    return "آلية الحجز الرسمية سيتم الإعلان عنها قريباً، ونقدروا نسجلوا بياناتكم للتواصل معاكم فور فتح الحجوزات";
  }
  return "Official booking will be announced soon, and we can register your details to contact you as soon as reservations open";
}

export function getBookingLeadPrompt(lang: Language): string {
  if (lang === "ar") {
    return "الحجوزات الرسمية سيتم الإعلان عنها قريباً، لكن نقدروا نسجلوا بياناتكم المبدئية ونتواصل معاكم فور فتح الحجز. ممكن تبعتولنا الاسم ورقم الهاتف والتاريخ المتوقع وعدد الأشخاص ونوع الوحدة المطلوبة؟";
  }
  return "Official bookings will be announced soon, but we can register your preliminary details and contact you when reservations open. Please share your full name, phone number, expected stay dates, number of guests, and preferred unit type if any.";
}

export function getBookingLeadConfirmation(lang: Language): string {
  if (lang === "ar") {
    return "تم استلام بياناتكم المبدئية وسيتم التواصل معكم فور فتح الحجوزات رسمياً";
  }
  return "We have received your preliminary details and will contact you as soon as official bookings open";
}

export function getBookingUnavailableReply(lang: Language): string {
  return getBookingLeadPrompt(lang);
}

/** @deprecated Use getBookingLeadPrompt */
export function getBookingInterestPrompt(lang: Language): string {
  return getBookingLeadPrompt(lang);
}

export function getMealsReply(lang: Language): string {
  if (lang === "ar") {
    return "لا، الإقامة حالياً غير شاملة للوجبات، لكن يتوفر داخل المنتجع Beach Cafe ومطاعم وكافيهات وخيارات للأكل والمشروبات";
  }
  return "No, stays are currently not inclusive of meals, but Beach Cafe, restaurants, cafes, and food and drink options are available inside the resort";
}

export function getPhotosReply(lang: Language): string {
  if (lang === "ar") {
    return "الصور والفيديوهات الرسمية للشاليهات والمرافق قيد التجهيز وسيتم نشرها قريباً إن شاء الله";
  }
  return "Official photos and videos of the chalets and facilities are being prepared and will be published soon, in sha Allah";
}

export function getLocationReply(lang: Language): string {
  if (lang === "ar") {
    return `المنتجع في ${RESORT_BRAND.locationAr}.`;
  }
  return `The resort is in ${RESORT_BRAND.locationEn}.`;
}

export function getContactReply(lang: Language): string {
  if (lang === "ar") {
    return `تقدروا تتواصلوا معنا على:\n${RESORT_BRAND.phonesFormatted.join("\n")}\n${RESORT_BRAND.email}\nأو عبر Messenger: ${RESORT_BRAND.messengerLink}`;
  }
  return `You can reach us on:\n${RESORT_BRAND.phonesFormatted.join("\n")}\n${RESORT_BRAND.email}\nOr via Messenger: ${RESORT_BRAND.messengerLink}`;
}

export function getRestaurantsReply(lang: Language): string {
  if (lang === "ar") {
    return "نعم، متوفر Beach Cafe ومطاعم وكافيهات داخل المنتجع، مع جلسات عائلية وأجواء بحرية.";
  }
  return "Yes — Beach Cafe, restaurants, and cafes are available inside the resort, with family seating and a beach atmosphere.";
}

export function getHumanHandoffReply(lang: Language): string {
  if (lang === "ar") {
    return "بنحول استفساركم للفريق المختص للتواصل معاكم وتأكيد التفاصيل";
  }
  return "We will forward your inquiry to our specialist team to contact you and confirm the details";
}

function extractPhoneNumber(message: string): string | undefined {
  const phoneMatch = message.match(/(\+?218?\s*9[0-9]\s*[0-9]{3}\s*[0-9]{4}|0?9[0-9]{8,9})/);
  return phoneMatch?.[0]?.replace(/\s+/g, "") || undefined;
}

export function extractGuestCount(text: string): number | undefined {
  const rangeMatch = text.match(/\b(\d{1,2})\s*[/-]\s*(\d{1,2})\b/);
  if (rangeMatch) {
    const value = Number.parseInt(rangeMatch[2] ?? rangeMatch[1] ?? "", 10);
    if (Number.isFinite(value) && value > 0 && value <= 30) return value;
  }
  const patterns = [
    /(\d{1,2})\s*(?:guests?|people|persons?|اشخاص|أشخاص|شخص|ناس)/i,
    /(?:عدد|ضيوف|اشخاص|أشخاص)\s*(\d{1,2})/,
    /(?:عندي|عندنا|نحن)\s*(\d{1,2})/,
    /^(\d{1,2})$/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const value = Number.parseInt(match?.[1] ?? "", 10);
    if (Number.isFinite(value) && value > 0 && value <= 30) return value;
  }
  return undefined;
}

function extractDates(message: string): string | undefined {
  const datePatterns = [
    /\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/g,
    /\b(?:from|to|من|الى|إلى)\s+\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/gi,
    /\b(?:today|tomorrow|weekend|اليوم|بكره|بكرة|الويكند)\b/gi,
    /(?:يناير|فبراير|مارس|ابريل|أبريل|مايو|يونيو|يوليو|اغسطس|أغسطس|سبتمبر|اكتوبر|أكتوبر|نوفمبر|ديسمبر|january|february|march|april|may|june|july|august|september|october|november|december)\s*\d{4}/gi,
    /\b(?:صيف|summer)\s*\d{4}\b/gi,
  ];
  for (const pattern of datePatterns) {
    const match = message.match(pattern);
    if (match?.length) return match.join(" - ");
  }
  return undefined;
}

function extractFullName(message: string): string | undefined {
  const named = message.match(/(?:اسمي|اسمي هو|انا|أنا|my name is|i am|i'm)\s+(.+)/i);
  if (named?.[1]) {
    let value = named[1].trim().replace(/[?.!،,]/g, " ").trim();
    value = value.replace(/\d[\d\s-]{6,}\d/g, "").trim();
    value = value.slice(0, 80);
    if (value.length >= 2) return value;
  }
  const trimmed = message.trim();
  if (
    trimmed.length >= 3 &&
    trimmed.length <= 60 &&
    !/\d/.test(trimmed) &&
    !isBookingIntent(trimmed) &&
    !/(?:مرحب|السلام|شكر|تمام|اهلا)/.test(trimmed.toLowerCase())
  ) {
    const words = trimmed.split(/\s+/);
    if (words.length >= 2 && words.length <= 5) return trimmed;
  }
  return undefined;
}

export function extractBookingLeadFromText(message: string): Partial<BookingLead> {
  const unit = matchAccommodation(message);
  return {
    fullName: extractFullName(message),
    phone: extractPhoneNumber(message),
    expectedDates: extractDates(message),
    guestCount: extractGuestCount(message),
    unitType: unit ? (unit.nameAr) : undefined,
  };
}

export function extractBookingLeadFromConversation(messages: string[]): BookingLead {
  const lead: BookingLead = {};
  for (const message of messages) {
    const partial = extractBookingLeadFromText(message);
    if (partial.fullName) lead.fullName = partial.fullName;
    if (partial.phone) lead.phone = partial.phone;
    if (partial.expectedDates) lead.expectedDates = partial.expectedDates;
    if (partial.guestCount) lead.guestCount = partial.guestCount;
    if (partial.unitType) lead.unitType = partial.unitType;
  }
  return lead;
}

function getMissingLeadFields(lead: BookingLead): (keyof BookingLead)[] {
  const missing: (keyof BookingLead)[] = [];
  if (!lead.fullName) missing.push("fullName");
  if (!lead.phone) missing.push("phone");
  if (!lead.expectedDates) missing.push("expectedDates");
  if (!lead.guestCount) missing.push("guestCount");
  if (!lead.unitType) missing.push("unitType");
  return missing;
}

function getLeadFollowUpReply(missing: (keyof BookingLead)[], lang: Language): string {
  if (lang === "ar") {
    const prompts: string[] = [];
    if (missing.includes("fullName")) prompts.push("الاسم بالكامل");
    if (missing.includes("phone")) prompts.push("رقم الهاتف");
    if (missing.includes("expectedDates")) prompts.push("التاريخ المتوقع للإقامة");
    if (missing.includes("guestCount")) prompts.push("عدد الأشخاص");
    if (missing.includes("unitType")) prompts.push("نوع الوحدة المطلوبة إن وجدت");
    if (prompts.length === 0) return getBookingLeadConfirmation(lang);
    return `تمام، باقي نحتاج: ${prompts.join("، ")}.`;
  }
  const prompts: string[] = [];
  if (missing.includes("fullName")) prompts.push("full name");
  if (missing.includes("phone")) prompts.push("phone number");
  if (missing.includes("expectedDates")) prompts.push("expected stay dates");
  if (missing.includes("guestCount")) prompts.push("number of guests");
  if (missing.includes("unitType")) prompts.push("preferred unit type if any");
  if (prompts.length === 0) return getBookingLeadConfirmation(lang);
  return `Great — we still need: ${prompts.join(", ")}.`;
}

export function isLeadCollectionContext(conversationText: string): boolean {
  const normalized = conversationText.toLowerCase();
  return (
    isBookingIntent(normalized) ||
    /بياناتكم المبدئية|نسجلوا بياناتكم|الاسم ورقم الهاتف|preliminary details|register your details/.test(
      normalized,
    )
  );
}

export function resolveBookingLeadReply(
  message: string,
  conversationMessages: string[],
  lang: Language,
): string | undefined {
  const merged = [...conversationMessages, message].join(" ");
  const normalized = merged.toLowerCase();
  const bookingWhenOnly = /^(متى الحجز|هل الحجز مفتوح|when.*booking|booking open)\??$/i.test(
    message.trim(),
  );
  if (bookingWhenOnly) return getBookingWhenReply(lang);

  const leadContext = isLeadCollectionContext(merged);
  const bookingNow = isBookingIntent(message) || isBookingIntent(normalized);

  if (!bookingNow && !leadContext) return undefined;

  const lead = extractBookingLeadFromConversation([...conversationMessages, message]);
  const hasAnyLeadData = Boolean(
    lead.fullName || lead.phone || lead.expectedDates || lead.guestCount || lead.unitType,
  );

  if (!hasAnyLeadData && bookingNow) {
    return getBookingLeadPrompt(lang);
  }

  if (!hasAnyLeadData) return undefined;

  const missing = getMissingLeadFields(lead);
  const requiredMissing = missing.filter((field) => field !== "unitType");

  if (requiredMissing.length === 0) {
    return getBookingLeadConfirmation(lang);
  }

  return getLeadFollowUpReply(missing, lang);
}

function asksExplicitPrices(normalized: string): boolean {
  return /price list|accommodation prices|room rates|list of prices|اسعار|الاسعار|أسعار|سعر|بكم|قداش|how much|price|prices|rates|cost|rate|as3ar|كم السعر|شن السعر|الاسعار/.test(
    normalized,
  );
}

function asksResortDetailsQuestion(normalized: string): boolean {
  return /tell me more|more details|resort details|about the resort|about la vida|what do you offer|what do you have|resort info|information|details|what facilities|what activities|what is included|what services|what's included|services available|facilities do you|activities do you|included services|tell me about|know more|what else|معلومات|تفاصيل|تفاصيل اكثر|ممكن معلومات|عن المنتجع|شن عندكم|شنو عندكم|شن تقدموا|المرافق|الخدمات|شن مشمول|شنو مشمول|زيد|زيدني|وضح|شن بعد|شنو اكثر/.test(
    normalized,
  );
}

function asksCapacityQuestion(normalized: string): boolean {
  return /how many|capacity|guest|guests|people|person|persons|fits|fit|كم شخص|كم يسع|عدد|ضيوف|اشخاص|أشخاص|قداش شخص|سعة|عندي \d+/.test(
    normalized,
  );
}

function asksActivitiesQuestion(normalized: string): boolean {
  return /activit|things to do|what to do|أنشطة|الانشطة|نشاط|نشاطات|شن الأنشطة|شن الانشطة|شنو الأنشطة/.test(
    normalized,
  );
}

function asksFacilitiesQuestion(normalized: string): boolean {
  return /facilit|amenit|what services|services available|service do you|المرافق|الخدمات|شن الخدمات|شنو الخدمات|خدمات متوفرة|مرافق|مطاعم|مطعم|restaurant/.test(
    normalized,
  );
}

function asksMealsQuestion(normalized: string): boolean {
  return /full board|breakfast|meals|food included|شامل الوجبات|شامل الفطور|شامل الوجبه|وجبات|فطور/.test(
    normalized,
  );
}

function asksPhotosQuestion(normalized: string): boolean {
  return /photo|photos|picture|pictures|image|gallery|video|صور|فيديو|صور الشاليهات|في صور/.test(normalized);
}

function asksLocationQuestion(normalized: string): boolean {
  return /location|address|maps|where|وين|موقع|العنوان|زواره|زوارة/.test(normalized);
}

function asksHumanHandoffQuestion(normalized: string): boolean {
  return /complaint|payment|corporate|large group|custom event|special request|exact availability|room assignment|booking confirmation|confirm.*book|دفع|شكوى|مجموعة كبيرة|طلب خاص|تأكيد الحجز|توفر محدد/.test(
    normalized,
  );
}

export function getKnowledgeBlockForPrompt(lang: Language): string {
  const units =
    lang === "ar"
      ? ACCOMMODATIONS.map((u) => `- ${u.nameAr}: ${u.capacityAr}`).join("\n")
      : ACCOMMODATIONS.map((u) => `- ${u.nameEn}: ${u.capacityEn}`).join("\n");

  const included = lang === "ar" ? INCLUDED_SERVICES_AR.join("; ") : INCLUDED_SERVICES_EN.join("; ");
  const activities = lang === "ar" ? ACTIVITIES_AR.join("; ") : ACTIVITIES_EN.join("; ");

  const pricingNote =
    lang === "ar"
      ? "الأسعار النهائية قيد الاعتماد — لا تذكر أسعاراً نهائية إلا إذا أكدتها الإدارة رسمياً"
      : "Final prices are under approval — do not state final prices unless officially confirmed by management";

  return `
Brand: ${RESORT_BRAND.name}
Location: ${lang === "ar" ? RESORT_BRAND.locationAr : RESORT_BRAND.locationEn}
Official opening: ${lang === "ar" ? RESORT_BRAND.openingDateAr : RESORT_BRAND.openingDateEn}
Contact: ${RESORT_BRAND.phonesFormatted.join(" / ")} | ${RESORT_BRAND.email}
Messenger: ${RESORT_BRAND.messengerLink}

Positioning: La Vida is a full beachfront family resort experience — private beach, accommodation, pools, restaurants, cafes, water activities, family areas, entertainment, and hospitality.

Accommodation categories (exact capacity for most units pending management confirmation):
${units}

Facilities & services: ${included}

Activities: ${activities}

Pricing: ${pricingNote}

Booking status:
- Official bookings not fully open yet unless management says otherwise
- Collect interested leads: full name, phone, expected dates, guest count, preferred unit
- After details received: confirm preliminary registration only — never confirm booking, availability, or payment
- For booking interest use lead collection flow

Meals: NOT included in accommodation unless management announces otherwise

Photos/videos: official visuals being prepared — not yet published

Human handoff triggers: special requests, corporate/large groups, complaints, payment, exact availability, room assignment, booking confirmation, custom events, uncertain cases`;
}

export function getResponseStyleRules(lang: Language): string {
  if (lang === "ar") {
    return `
أسلوب الرد:
1) أجب على سؤال الضيف مباشرة أولاً.
2) بعد الإجابة، أضف 1–3 تفاصيل جذابة ومرتبطة فقط إن كانت مفيدة.
3) اللغة الافتراضية: عربي ليبي طبيعي (مازال، حنعلنوا، نقدروا، توا، شن، لو تحب) — تجنب المصري.
4) لا تكرر قائمة الأسعار إلا إذا طلبها صراحة — عندها قل إن الأسعار قيد الاعتماد.
5) لا تؤكد حجزاً ولا توفراً ولا تطلب دفعاً.
6) للحجز: اجمع بيانات العميل المهتمة بشكل طبيعي.
7) للحالات المعقدة: حوّل للفريق المختص.
8) ردود قصيرة، أنيقة، ودودة — بدون إفراط في الإيموجي.`;
  }

  return `
Response style:
1) Answer the guest's question directly first.
2) Add 1–3 attractive relevant details only when helpful.
3) Default to Libyan Arabic when guest writes Arabic; reply in English when guest writes English.
4) Do not repeat the full price list unless explicitly asked — then say prices are under approval.
5) Never confirm bookings, availability, or request payment.
6) For booking interest: collect lead details naturally.
7) For complex cases: hand off to the specialist team.
8) Keep replies short, elegant, and friendly — minimal emojis.`;
}

export function resolveOpeningDateReply(message: string, lang: Language): string | undefined {
  const normalized = message.toLowerCase();
  const asksOpening = /متى الافتتاح|موعد الافتتاح|تاريخ الافتتاح|opening date|when open|when.*opening/.test(
    normalized,
  );
  if (asksOpening) return getOpeningDateReply(lang);
  return undefined;
}

export function resolvePriceOrUnitReply(message: string, lang: Language): string | undefined {
  const normalized = message.toLowerCase();

  const openingReply = resolveOpeningDateReply(message, lang);
  if (openingReply) return openingReply;

  if (asksHumanHandoffQuestion(normalized)) return getHumanHandoffReply(lang);
  if (asksMealsQuestion(normalized)) return getMealsReply(lang);
  if (asksPhotosQuestion(normalized)) return getPhotosReply(lang);
  if (asksLocationQuestion(normalized)) return getLocationReply(lang);

  const guestCount = extractGuestCount(normalized);
  if (guestCount && /شن تنصحني|شنو تنصحني|تنصحني|recommend|suggest|عندي \d+/.test(normalized)) {
    return getGuestRecommendationReply(guestCount, lang);
  }

  const unit = matchAccommodation(normalized);
  const wantsPrice = asksExplicitPrices(normalized);

  if (wantsPrice) {
    return getPricingUnderReviewReply(lang);
  }

  if (unit && /كم يسع|capacity|سعة|كم شخص/.test(normalized)) {
    return getUnitCapacityReply(unit, lang);
  }

  if (unit) {
    return getChaletDetailReply(unit, lang, false);
  }

  if (asksResortDetailsQuestion(normalized)) {
    if (asksActivitiesQuestion(normalized)) return getActivitiesReply(lang);
    if (/included|what is included|services included|مشمول|شن مشمول|شنو مشمول/.test(normalized)) {
      return getIncludedServicesReply(lang);
    }
    if (asksFacilitiesQuestion(normalized)) {
      if (/مطعم|مطاعم|restaurant/.test(normalized)) return getRestaurantsReply(lang);
      return getIncludedServicesReply(lang);
    }
    return getResortOverviewReply(lang);
  }

  if (asksCapacityQuestion(normalized)) {
    const matched = matchAccommodation(normalized);
    if (matched) return getUnitCapacityReply(matched, lang);
    if (guestCount) return getGuestRecommendationReply(guestCount, lang);
    return getAllCapacitiesReply(lang);
  }

  if (asksActivitiesQuestion(normalized)) return getActivitiesReply(lang);

  if (/included|what is included|services included|مشمول|شن مشمول|شنو مشمول/.test(normalized)) {
    return getIncludedServicesReply(lang);
  }

  if (asksFacilitiesQuestion(normalized)) {
    if (/مطعم|مطاعم|restaurant/.test(normalized)) return getRestaurantsReply(lang);
    return getIncludedServicesReply(lang);
  }

  const asksOffers = /offer|offers|promo|discount|عروض|خصم|تخفيض/.test(normalized);
  if (asksOffers) return getOffersReply(lang);

  return undefined;
}

/** @deprecated Booking is handled via resolveBookingLeadReply */
export function resolveBookingReply(_message: string, _lang: Language): string | undefined {
  return undefined;
}
