import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

function optional(name: string): string {
  return process.env[name] ?? "";
}

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  // AI
  openaiApiKey: optional("OPENAI_API_KEY"),
  // Twilio
  twilioAccountSid: optional("TWILIO_ACCOUNT_SID"),
  twilioAuthToken: optional("TWILIO_AUTH_TOKEN"),
  twilioPhoneNumber: optional("TWILIO_PHONE_NUMBER"),
  // WhatsApp
  whatsappApiVersion: optional("WHATSAPP_API_VERSION") || "v18.0",
  whatsappPhoneNumberId: optional("WHATSAPP_PHONE_NUMBER_ID"),
  whatsappAccessToken: optional("WHATSAPP_ACCESS_TOKEN"),
  whatsappVerifyToken: optional("WHATSAPP_VERIFY_TOKEN"),
  whatsappBusinessAccountId: optional("WHATSAPP_BUSINESS_ACCOUNT_ID"),
  // Messenger
  messengerPageAccessToken: optional("PAGE_ACCESS_TOKEN") || optional("MESSENGER_PAGE_ACCESS_TOKEN"),
  messengerPageId: optional("MESSENGER_PAGE_ID"),
  messengerVerifyToken: optional("VERIFY_TOKEN") || optional("MESSENGER_VERIFY_TOKEN"),
  messengerAppSecret: optional("MESSENGER_APP_SECRET"),
  // ElevenLabs
  elevenlabsApiKey: optional("ELEVENLABS_API_KEY"),
  elevenlabsVoiceId: optional("ELEVENLABS_VOICE_ID"),
  // App
  webhookBaseUrl: optional("APP_WEBHOOK_BASE_URL"),
  ownerPhoneNumber: optional("OWNER_PHONE_NUMBER") || "+218912110392",
  // SMTP
  smtpHost: optional("SMTP_HOST"),
  smtpPort: optional("SMTP_PORT"),
  smtpUser: optional("SMTP_USER"),
  smtpPass: optional("SMTP_PASS"),
};
