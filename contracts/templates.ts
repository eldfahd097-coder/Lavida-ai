// ─── Shared Types & Constants ───────────────────────────────────
export const MenuOptions = {
  whatsapp: {
    ar: [
      "1 - معلومات عن المنتجع",
      "2 - صور الشاليهات والتفاصيل",
      "3 - آخر التحديثات والأسعار",
      "4 - الأنشطة والمرافق",
      "5 - التحدث مع الإدارة",
    ],
    en: [
      "1 - Resort Information",
      "2 - Chalet Images & Details",
      "3 - Latest Updates & Pricing",
      "4 - Activities & Facilities",
      "5 - Speak to Management",
    ],
  },
  messenger: {
    ar: [
      "1 - معلومات عن المنتجع",
      "2 - صور الشاليهات والتفاصيل",
      "3 - آخر التحديثات والأسعار",
      "4 - الأنشطة والمرافق",
      "5 - التحدث مع الإدارة",
    ],
    en: [
      "1 - Resort Information",
      "2 - Chalet Images & Details",
      "3 - Latest Updates & Pricing",
      "4 - Activities & Facilities",
      "5 - Speak to Management",
    ],
  },
  phone: {
    ar: [
      "للحجز والأسعار، اضغط 1",
      "لمعلومات الشاليهات، اضغط 2",
      "للأنشطة والمرافق، اضغط 3",
      "للموقع ومواعيد الافتتاح، اضغط 4",
      "للتحدث مع الإدارة، اضغط 5",
    ],
    en: [
      "For booking and prices, press 1",
      "For chalet information, press 2",
      "For resort activities, press 3",
      "For location and opening updates, press 4",
      "To speak with management, press 5",
    ],
  },
} as const;

export type Language = "ar" | "en";
export type Platform = "whatsapp" | "messenger" | "phone";

// ─── Greeting Templates ─────────────────────────────────────────
export function getGreeting(_platform: Platform, lang: Language): string {
  if (lang === "ar") {
    return `مرحباً بكم في La Vida Resort & Beach Club
نشكركم على تواصلكم معنا

الافتتاح الرسمي: 1 يوليو 2026
نقدروا نساعدوكم بالمعلومات أو تسجيل بياناتكم المبدئية للحجز

يرجى إرسال رقم الخيار:`;
  }
  return `Welcome to La Vida Resort & Beach Club
Thank you for reaching out to us

Official opening: 1 July 2026
We can share information or register your preliminary booking details

Please send the option number:`;
}

// ─── Menu Builder ────────────────────────────────────────────────
export function getMenu(platform: Platform, lang: Language): string {
  const options = MenuOptions[platform][lang];
  return options.join("\n");
}

// ─── Response Templates ─────────────────────────────────────────
export const Responses = {
  resort_info: {
    ar: `La Vida Resort & Beach Club

الموقع: منطقة أم علي بمدينة زوارة — على واجهة شاطئية مباشرة
الافتتاح الرسمي: 1 يوليو 2026

La Vida ليست مجرد إقامة — تجربة منتجع شاطئي عائلي متكامل:
شاطئ خاص، إقامة، مسابح، مطاعم، كافيهات، أنشطة مائية، مناطق عائلية، وترفيه.

الوحدات:
• فيلا VIP الرئاسية
• فيلا VIP / شاليه VIP
• شاليه عائلي / إطلالة المسبح
• شقق
• استوديو إطلالة الحديقة

المرافق: شاطئ خاص، مسبح كبير، Beach Cafe، مطاعم، كافيهات، سوبرماركت، منطقة أطفال، Game Room، أمن واستقبال 24 ساعة، موقف مجاني، واي فاي.

📱 0938888868 / 0938888878
📧 info@lavidaresort.ly`,
    en: `La Vida Resort & Beach Club

Location: Umm Ali area, Zuwarah — direct beachfront
Official opening: 1 July 2026

La Vida is a full beachfront family resort experience — private beach, accommodation, pools, restaurants, cafes, water activities, family areas, and entertainment.

Units:
• Presidential VIP Villa
• VIP Villa / VIP Chalet
• Family Chalet / Pool View Chalet
• Apartments
• Garden View Studio

Facilities: private beach, large pool, Beach Cafe, restaurants, cafes, supermarket, kids area, Game Room, 24h security & reception, free parking, WiFi.

📱 0938888868 / 0938888878
📧 info@lavidaresort.ly`,
  },

  chalet_info: {
    ar: `وحدات La Vida Resort

🏡 أسعار الإقامة الحالية:
• استوديو إطلالة الحديقة - الدور الثاني: 1000 د.ل
• استوديو إطلالة الحديقة - الدور الأول: 1200 د.ل
• استوديو إطلالة الحديقة - الدور الأرضي: 1400 د.ل
• الشقق: 1600 د.ل
• الشاليهات العائلية: 1900 د.ل
• فيلا VIP: 2900 د.ل
• الفيلا الرئاسية VIP: 3900 د.ل

ابعت اسم الوحدة ونشرحلك التفاصيل كاملة.`,
    en: `La Vida Resort Units

🏡 Current accommodation rates:
• Garden View Studio - Second floor: 1000 LYD
• Garden View Studio - First floor: 1200 LYD
• Garden View Studio - Ground floor: 1400 LYD
• Apartments: 1600 LYD
• Family Chalets: 1900 LYD
• VIP Villa: 2900 LYD
• Presidential VIP Villa: 3900 LYD

Tell us which unit interests you for full details.`,
  },

  activities: {
    ar: `الأنشطة والمرافق

• شاطئ خاص ومسبح كبير
• أنشطة مائية، جت سكي، كاياك، Paddle Board، قوارب بدالات
• ملعب كرة قدم وطائرة شاطئية
• منطقة أطفال، Kids Club، ترامبولين، Game Room، TV Lounge
• Ping Pong وPool Table
• Beach Cafe ومطاعم وكافيهات
• أمن واستقبال 24 ساعة، موقف مجاني، واي فاي`,
    en: `Activities & Facilities

• Private beach and large pool
• Water sports, jet ski, kayaks, paddle boards, pedal boats
• Beach football and volleyball courts
• Kids area, Kids Club, trampoline, Game Room, TV Lounge
• Ping pong and pool table
• Beach Cafe, restaurants, and cafes
• 24h security & reception, free parking, WiFi`,
  },

  updates: {
    ar: `آخر التحديثات

• الافتتاح الرسمي: 1 يوليو 2026 إن شاء الله

🏡 أسعار الإقامة الحالية:
• استوديو إطلالة الحديقة - الدور الثاني: 1000 د.ل
• استوديو إطلالة الحديقة - الدور الأول: 1200 د.ل
• استوديو إطلالة الحديقة - الدور الأرضي: 1400 د.ل
• الشقق: 1600 د.ل
• الشاليهات العائلية: 1900 د.ل
• فيلا VIP: 2900 د.ل
• الفيلا الرئاسية VIP: 3900 د.ل

• الحجوزات: نقدروا نسجلوا بياناتكم المبدئية للتواصل فور فتح الحجز
• الصور والفيديوهات الرسمية قيد التجهيز

📱 0938888868 / 0938888878
📧 info@lavidaresort.ly`,
    en: `Latest Updates

• Official opening: 1 July 2026, in sha Allah

🏡 Current accommodation rates:
• Garden View Studio - Second floor: 1000 LYD
• Garden View Studio - First floor: 1200 LYD
• Garden View Studio - Ground floor: 1400 LYD
• Apartments: 1600 LYD
• Family Chalets: 1900 LYD
• VIP Villa: 2900 LYD
• Presidential VIP Villa: 3900 LYD

• Bookings: we can register your preliminary details for contact when reservations open
• Official photos and videos are being prepared

📱 0938888868 / 0938888878
📧 info@lavidaresort.ly`,
  },

  management: {
    ar: `بنحول استفساركم للفريق المختص للتواصل معاكم وتأكيد التفاصيل.

أو تواصلوا مباشرة:
📱 0938888868 / 0938888878
📧 info@lavidaresort.ly
Messenger: https://www.facebook.com/share/1BSWTBJ8zJ/?mibextid=wwXIfr`,
    en: `We will forward your inquiry to our specialist team to contact you and confirm details.

Or reach us directly:
📱 0938888868 / 0938888878
📧 info@lavidaresort.ly
Messenger: https://www.facebook.com/share/1BSWTBJ8zJ/?mibextid=wwXIfr`,
  },

  fallback: {
    ar: `لم أفهم طلبكم. يرجى إرسال رقم الخيار:
1 - معلومات عن المنتجع
2 - صور الشاليهات
3 - آخر التحديثات
4 - الأنشطة
5 - التحدث مع الإدارة`,
    en: `I didn't understand your request. Please send the option number:
1 - Resort Information
2 - Chalet Images & Details
3 - Latest Updates & Pricing
4 - Activities & Facilities
5 - Speak to Management`,
  },

  goodbye: {
    ar: `شكراً لتواصلكم مع La Vida Resort & Beach Club 🌴
نتطلع لاستقبالكم قريباً!

لأي استفسار، نحن هنا دائماً. 💙`,
    en: `Thank you for contacting La Vida Resort & Beach Club 🌴
We look forward to welcoming you soon!

For any inquiry, we are always here. 💙`,
  },
} as const;

// ─── Phone IVR Templates ────────────────────────────────────────
export const PhonePrompts = {
  welcome_ar: "مرحباً بكم في La Vida Resort & Beach Club.",
  welcome_en: "Welcome to La Vida Resort & Beach Club.",
  menu_ar: "للحجز والأسعار، اضغط 1. لمعلومات الشاليهات، اضغط 2. للأنشطة والمرافق، اضغط 3. للموقع ومواعيد الافتتاح، اضغط 4. للتحدث مع الإدارة، اضغط 5.",
  menu_en: "For booking and prices, press 1. For chalet information, press 2. For resort activities, press 3. For location and opening updates, press 4. To speak with management, press 5.",
  option_1_ar: "الافتتاح الرسمي 1 يوليو 2026. أسعار الإقامة من 1000 إلى 3900 د.ل. نقدروا نسجلوا بياناتكم المبدئية للحجز.",
  option_1_en: "Official opening 1 July 2026. Accommodation rates from 1000 to 3900 LYD. We can register your preliminary booking details.",
  option_2_ar: "وحداتنا: فيلا VIP الرئاسية، VIP، شاليه عائلي، شقق، واستوديو. الصور الرسمية قيد التجهيز.",
  option_2_en: "Our units: Presidential VIP Villa, VIP, family chalet, apartments, and garden studio. Official photos are being prepared.",
  option_3_ar: "شاطئ خاص، مسبح كبير، أنشطة مائية، مطاعم وكافيهات، منطقة أطفال، Game Room، وملاعب رياضية.",
  option_3_en: "Private beach, large pool, water sports, restaurants and cafes, kids area, Game Room, and sports courts.",
  option_4_ar: "نحن في منطقة أم علي بمدينة زوارة. الافتتاح الرسمي 1 يوليو 2026. الموقع lavidaresort.ly",
  option_4_en: "We are in Umm Ali area, Zuwarah. Official opening 1 July 2026. Website lavidaresort.ly",
  option_5_ar: "سيتم توصيلكم مع الإدارة. إذا لم يتم الرد، يرجى ترك اسمكم ورقم الهاتف بعد النغمة.",
  option_5_en: "Connecting you to management. If no one answers, please leave your name and phone number after the tone.",
  voicemail_ar: "لم يتم الرد. يرجى ترك اسمكم ورقم الهاتف وسنقوم بالتواصل معكم في أقرب وقت. شكراً.",
  voicemail_en: "No answer. Please leave your name and phone number and we will contact you as soon as possible. Thank you.",
  goodbye_ar: "شكراً لاتصالكم بـ La Vida Resort & Beach Club. نتطلع لاستقبالكم.",
  goodbye_en: "Thank you for calling La Vida Resort & Beach Club. We look forward to welcoming you.",
  no_input_ar: "لم نتلقَ رداً. سيتم إنهاء المكالمة. شكراً لاتصالكم.",
  no_input_en: "No response received. The call will now end. Thank you for calling.",
  fallback_ar: "لم نفهم اختياركم. يرجى الاتصال مرة أخرى أو التواصل عبر الواتساب. شكراً.",
  fallback_en: "We did not understand your selection. Please call again or reach us via WhatsApp. Thank you.",
} as const;

// ─── Helper: Detect Language ────────────────────────────────────
export function detectLanguage(text: string): Language {
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text) ? "ar" : "en";
}

// ─── Helper: Get Response by Choice ─────────────────────────────
export function getResponseByChoice(choice: string, lang: Language): string {
  const map: Record<string, keyof typeof Responses> = {
    "1": "resort_info",
    "2": "chalet_info",
    "3": "updates",
    "4": "activities",
    "5": "management",
  };
  const key = map[choice] ?? "fallback";
  return Responses[key][lang];
}
