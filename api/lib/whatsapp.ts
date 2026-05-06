import { env } from "./env";

const WHATSAPP_API_BASE = `https://graph.facebook.com/${env.whatsappApiVersion}`;

// ─── Send WhatsApp Text Message ───────────────────────────────────
export async function sendWhatsAppMessage(
  to: string,
  text: string,
  replyToMessageId?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!env.whatsappAccessToken || !env.whatsappPhoneNumberId) {
    return { success: false, error: "WhatsApp not configured" };
  }

  const url = `${WHATSAPP_API_BASE}/${env.whatsappPhoneNumberId}/messages`;

  const body: Record<string, unknown> = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { body: text, preview_url: false },
  };

  if (replyToMessageId) {
    body.context = { message_id: replyToMessageId };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.whatsappAccessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as {
      messages?: { id: string }[];
      error?: { message: string };
    };

    if (!res.ok) {
      return { success: false, error: data.error?.message ?? `HTTP ${res.status}` };
    }

    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ─── Send WhatsApp Interactive Menu ───────────────────────────────
export async function sendWhatsAppMenu(to: string, header: string, options: string[]): Promise<{ success: boolean; error?: string }> {
  if (!env.whatsappAccessToken || !env.whatsappPhoneNumberId) {
    return { success: false, error: "WhatsApp not configured" };
  }

  const url = `${WHATSAPP_API_BASE}/${env.whatsappPhoneNumberId}/messages`;

  const rows = options.map((opt, idx) => ({
    id: `option_${idx + 1}`,
    title: opt.length > 20 ? opt.substring(0, 20) : opt,
    description: opt,
  }));

  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: header },
      body: { text: "Please choose an option:" },
      action: {
        button: "Options",
        sections: [{ title: "Menu", rows }],
      },
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.whatsappAccessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = (await res.json()) as { error?: { message: string } };
      return { success: false, error: err.error?.message ?? `HTTP ${res.status}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ─── Send WhatsApp Template ─────────────────────────────────────
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  languageCode: string = "ar"
): Promise<{ success: boolean; error?: string }> {
  if (!env.whatsappAccessToken || !env.whatsappPhoneNumberId) {
    return { success: false, error: "WhatsApp not configured" };
  }

  const url = `${WHATSAPP_API_BASE}/${env.whatsappPhoneNumberId}/messages`;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.whatsappAccessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = (await res.json()) as { error?: { message: string } };
      return { success: false, error: err.error?.message ?? `HTTP ${res.status}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ─── Mark Message as Read ──────────────────────────────────────
export async function markWhatsAppMessageAsRead(messageId: string): Promise<void> {
  if (!env.whatsappAccessToken || !env.whatsappPhoneNumberId) return;

  const url = `${WHATSAPP_API_BASE}/${env.whatsappPhoneNumberId}/messages/${messageId}`;

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.whatsappAccessToken}`,
      },
      body: JSON.stringify({ messaging_product: "whatsapp", status: "read" }),
    });
  } catch {
    // Silently fail on read receipts
  }
}
