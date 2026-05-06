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
export function getGreeting(platform: Platform, lang: Language): string {
  if (lang === "ar") {
    return `مرحباً بكم في La Vida Resort & Beach Club 🏖️
نشكركم على تواصلكم معنا

الحجز غير متاح حالياً وسيتم الإعلان عنه قريباً 📢

يرجى إرسال رقم الخيار:`;
  }
  return `Welcome to La Vida Resort & Beach Club 🏖️
Thank you for reaching out to us

Booking is not available yet and will be announced soon 📢

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
    ar: `🏖️ La Vida Resort & Beach Club

موقعنا: زوارة، ليبيا — على البحر مباشرة

الوحدات:
• 10 فيلات فاخرة (فيلا VIP بمسبح خاص + فيلات رئاسية)
• 20 شاليه عائلي
• 12 شقة فندقية

المرافق:
• مسبح مركزي كبير
• شاطئ خاص
• نادي رياضات مائية
• ملعب كرة قدم وشاطئية
• منطقة ألعاب أطفال
• مقهى La Vida Beach Cafe
• واي فاي عالي السرعة
• استقبال 24/7

نحن وجهتكم المثالية للاستجمام والرفاهية على الساحل الليبي. ✨`,
    en: `🏖️ La Vida Resort & Beach Club

Location: Zuwarah, Libya — directly on the beach

Accommodations:
• 10 Luxury Villas (VIP villa with private pool + Presidential villas)
• 20 Family Chalets
• 12 Hotel Apartments

Facilities:
• Large Central Swimming Pool
• Private Beach Access
• Water Sports Club
• Football & Beach Volleyball Courts
• Kids Playground Area
• La Vida Beach Cafe
• High-Speed Wi-Fi
• 24/7 Reception

Your perfect destination for relaxation and luxury on the Libyan coast. ✨`,
  },

  chalet_info: {
    ar: `🏡 الشاليهات في La Vida Resort

لدينا 20 شاليه عائلي بغرفتين:
• حديقة أمامية بإطلالة على المسبح
• حديقة خلفية للخصوصية
• مثالية للعائلات

الفيلات:
• 6 فيلات VIP بغرفتين + مسبح خاص
• 4 فيلات رئاسية فاخرة

الشقق:
• 12 شقة بغرفتين، مجهزة بالكامل

📸 سيتم مشاركة صور الوحدات قريباً. تابعونا!`,
    en: `🏡 Chalets at La Vida Resort

We have 20 family-friendly two-bedroom chalets:
• Front garden with pool view
• Back garden for privacy
• Perfect for families

Villas:
• 6 VIP two-bedroom villas with private pool
• 4 Presidential luxury villas

Apartments:
• 12 fully-equipped two-bedroom apartments

📸 Unit photos will be shared soon. Stay tuned!`,
  },

  activities: {
    ar: `🎯 الأنشطة والمرافق

• 🏊 مسبح مركزي كبير
• 🏖️ شاطئ خاص
• 🚣 نادي رياضات مائية
• ⚽ ملعب كرة قدم
• 🏐 ملعب كرة طائرة شاطئية
• 🎠 منطقة ألعاب أطفال
• ☕ La Vida Beach Cafe
• 📶 واي فاي عالي السرعة
• 🛎️ استقبال وخدمة ضيافة 24/7

عائلتكم ستستمتع بكل لحظة هنا! 🌊`,
    en: `🎯 Activities & Facilities

• 🏊 Large Central Swimming Pool
• 🏖️ Private Beach Access
• 🚣 Water Sports Club
• ⚽ Football Court
• 🏐 Beach Volleyball Court
• 🎠 Kids Playground Area
• ☕ La Vida Beach Cafe
• 📶 High-Speed Wi-Fi
• 🛎️ 24/7 Reception & Guest Support

Your family will enjoy every moment here! 🌊`,
  },

  updates: {
    ar: `📢 آخر التحديثات

• الحجز غير متاح حالياً
• الأسعار ستُعلن قريباً
• موعد الافتتاح سيُعلن قريباً

تابعونا على فيسبوك وإنستغرام لآخر الأخبار!
📱 +218 91 211 0392
📧 info@lavida.ly

شكراً لاهتمامكم بـ La Vida Resort & Beach Club 💙`,
    en: `📢 Latest Updates

• Booking is not available yet
• Pricing will be announced soon
• Opening date will be announced soon

Follow us on Facebook and Instagram for the latest news!
📱 +218 91 211 0392
📧 info@lavida.ly

Thank you for your interest in La Vida Resort & Beach Club 💙`,
  },

  management: {
    ar: `📞 سيتم توصيلكم مع الإدارة قريباً...

في غضون ذلك، يمكنكم التواصل مباشرة:
📱 +218 91 211 0392
📧 info@lavida.ly

أو أرسلوا "واتساب" وسنرد عليكم خلال 24 ساعة.`,
    en: `📞 Connecting you with management shortly...

In the meantime, you can reach us directly:
📱 +218 91 211 0392
📧 info@lavida.ly

Or send "WhatsApp" and we will reply within 24 hours.`,
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
  option_1_ar: "الحجز غير متاح حالياً وسيتم الإعلان عن الأسعار قريباً. شكراً لاهتمامكم.",
  option_1_en: "Booking is not available yet and pricing will be announced soon. Thank you for your interest.",
  option_2_ar: "لدينا 20 شاليه عائلي و 10 فيلات فاخرة و 12 شقة. سيتم مشاركة التفاصيل الكاملة قريباً.",
  option_2_en: "We have 20 family chalets, 10 luxury villas, and 12 apartments. Full details will be shared soon.",
  option_3_ar: "مرافقنا تشمل مسبح مركزي، شاطئ خاص، رياضات مائية، ملاعب، منطقة أطفال، ومقهى.",
  option_3_en: "Our facilities include a central pool, private beach, water sports, courts, kids area, and a beach cafe.",
  option_4_ar: "نحن في زوارة، ليبيا. موعد الافتتاح والأسعار ستُعلن قريباً. تابعونا على وسائل التواصل الاجتماعي.",
  option_4_en: "We are located in Zuwarah, Libya. Opening date and pricing will be announced soon. Follow us on social media.",
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
