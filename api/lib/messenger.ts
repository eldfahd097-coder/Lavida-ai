import { env } from "./env";

const MESSENGER_API_BASE = "https://graph.facebook.com/v18.0";

// ─── Send Messenger Text Message ──────────────────────────────────
export async function sendMessengerMessage(
  recipientId: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!env.messengerPageAccessToken) {
    return { success: false, error: "Messenger not configured" };
  }

  const url = `${MESSENGER_API_BASE}/me/messages?access_token=${env.messengerPageAccessToken}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_type: "RESPONSE",
        recipient: { id: recipientId },
        message: { text },
      }),
    });

    const data = (await res.json()) as {
      message_id?: string;
      error?: { message: string };
    };

    if (!res.ok) {
      return { success: false, error: data.error?.message ?? `HTTP ${res.status}` };
    }

    return { success: true, messageId: data.message_id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ─── Send Messenger Quick Replies Menu ──────────────────────────
export async function sendMessengerMenu(
  recipientId: string,
  text: string,
  options: string[]
): Promise<{ success: boolean; error?: string }> {
  if (!env.messengerPageAccessToken) {
    return { success: false, error: "Messenger not configured" };
  }

  const url = `${MESSENGER_API_BASE}/me/messages?access_token=${env.messengerPageAccessToken}`;

  const quickReplies = options.map((opt, idx) => ({
    content_type: "text",
    title: opt.length > 20 ? opt.substring(0, 20) : opt,
    payload: `option_${idx + 1}`,
  }));

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_type: "RESPONSE",
        recipient: { id: recipientId },
        message: {
          text,
          quick_replies: quickReplies,
        },
      }),
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

// ─── Get User Profile ───────────────────────────────────────────
export async function getMessengerUserProfile(psid: string): Promise<{ name?: string; error?: string }> {
  if (!env.messengerPageAccessToken) {
    return { error: "Messenger not configured" };
  }

  const url = `${MESSENGER_API_BASE}/${psid}?fields=first_name,last_name,profile_pic&access_token=${env.messengerPageAccessToken}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return { error: `HTTP ${res.status}` };

    const data = (await res.json()) as {
      first_name?: string;
      last_name?: string;
      error?: { message: string };
    };

    if (data.error) return { error: data.error.message };

    const name = [data.first_name, data.last_name].filter(Boolean).join(" ");
    return { name };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}
