import { Hono } from "hono";
import { env } from "./lib/env";
import { getDb } from "./queries/connection";
import { leads, calls } from "@db/schema";
import { eq } from "drizzle-orm";
import { PhonePrompts } from "@contracts/templates";

const app = new Hono();

// ─── Twilio Voice Incoming Call ───────────────────────────────────
app.post("/voice", async (c) => {
  const body = await c.req.parseBody();
  const callSid = body.CallSid as string;
  const fromNumber = body.From as string;
  const toNumber = body.To as string;

  // Store call record
  const db = getDb();
  let lead = await db.query.leads.findFirst({
    where: eq(leads.phone, fromNumber),
  });

  let leadId: number | undefined;
  if (!lead) {
    const result = await db.insert(leads).values({
      source: "phone",
      phone: fromNumber,
      language: "ar",
      status: "new",
      interest: "general",
    });
    leadId = Number(result[0].insertId);
  } else {
    leadId = lead.id;
  }

  await db.insert(calls).values({
    callSid,
    fromNumber,
    toNumber,
    status: "initiated",
    leadId,
  });

  // Generate TwiML for IVR
  const twiml = buildIVRTwiML("ar");

  return new Response(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
});

// ─── Handle Menu Selection ──────────────────────────────────────
app.post("/voice/menu", async (c) => {
  const body = await c.req.parseBody();
  const digits = (body.Digits as string) ?? "";
  const callSid = body.CallSid as string;

  const db = getDb();
  const callRecord = await db.query.calls.findFirst({
    where: eq(calls.callSid, callSid),
  });

  if (callRecord) {
    await db
      .update(calls)
      .set({ menuChoice: digits })
      .where(eq(calls.id, callRecord.id));
  }

  const lang = callRecord?.language ?? "ar";
  const twiml = buildMenuResponseTwiML(digits, lang, callSid);

  return new Response(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
});

// ─── Handle Voicemail ───────────────────────────────────────────
app.post("/voice/voicemail", async (c) => {
  const body = await c.req.parseBody();
  const callSid = body.CallSid as string;
  const recordingUrl = body.RecordingUrl as string;

  const db = getDb();
  const callRecord = await db.query.calls.findFirst({
    where: eq(calls.callSid, callSid),
  });

  if (callRecord) {
    await db
      .update(calls)
      .set({
        status: "voicemail",
        recordingUrl,
        endedAt: new Date(),
      })
      .where(eq(calls.id, callRecord.id));
  }

  const lang = callRecord?.language ?? "ar";
  const goodbye = lang === "ar" ? PhonePrompts.goodbye_ar : PhonePrompts.goodbye_en;

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${lang === "ar" ? "ar-SA" : "en-US"}">${goodbye}</Say>
  <Hangup/>
</Response>`;

  return new Response(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
});

// ─── Call Status Callback ──────────────────────────────────────
app.post("/voice/status", async (c) => {
  const body = await c.req.parseBody();
  const callSid = body.CallSid as string;
  const callStatus = body.CallStatus as string;
  const callDuration = body.CallDuration as string;

  const statusMap: Record<string, string> = {
    completed: "completed",
    busy: "busy",
    failed: "failed",
    noanswer: "no_answer",
    canceled: "no_answer",
  };

  const db = getDb();
  const callRecord = await db.query.calls.findFirst({
    where: eq(calls.callSid, callSid),
  });

  if (callRecord) {
    await db
      .update(calls)
      .set({
        status: (statusMap[callStatus] ?? callStatus) as typeof callRecord.status,
        duration: parseInt(callDuration ?? "0", 10) || 0,
        endedAt: new Date(),
      })
      .where(eq(calls.id, callRecord.id));
  }

  return c.json({ success: true });
});

// ─── Build IVR TwiML ────────────────────────────────────────────
function buildIVRTwiML(lang: "ar" | "en"): string {
  const welcome = lang === "ar" ? PhonePrompts.welcome_ar : PhonePrompts.welcome_en;
  const menu = lang === "ar" ? PhonePrompts.menu_ar : PhonePrompts.menu_en;
  const noInput = lang === "ar" ? PhonePrompts.no_input_ar : PhonePrompts.no_input_en;

  const actionUrl = `${env.webhookBaseUrl}/api/twilio/voice/menu`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather action="${actionUrl}" method="POST" numDigits="1" timeout="5">
    <Say voice="alice" language="${lang === "ar" ? "ar-SA" : "en-US"}">${welcome} ${menu}</Say>
  </Gather>
  <Say voice="alice" language="${lang === "ar" ? "ar-SA" : "en-US"}">${noInput}</Say>
  <Hangup/>
</Response>`;
}

// ─── Build Menu Response TwiML ──────────────────────────────────
function buildMenuResponseTwiML(digits: string, lang: "ar" | "en", callSid: string): string {
  const prompts: Record<string, { ar: string; en: string }> = {
    "1": { ar: PhonePrompts.option_1_ar, en: PhonePrompts.option_1_en },
    "2": { ar: PhonePrompts.option_2_ar, en: PhonePrompts.option_2_en },
    "3": { ar: PhonePrompts.option_3_ar, en: PhonePrompts.option_3_en },
    "4": { ar: PhonePrompts.option_4_ar, en: PhonePrompts.option_4_en },
    "5": { ar: PhonePrompts.option_5_ar, en: PhonePrompts.option_5_en },
  };

  const selected = prompts[digits];
  const text = selected ? selected[lang] : (lang === "ar" ? PhonePrompts.fallback_ar : PhonePrompts.fallback_en);
  const goodbye = lang === "ar" ? PhonePrompts.goodbye_ar : PhonePrompts.goodbye_en;

  const voicemailUrl = `${env.webhookBaseUrl}/api/twilio/voice/voicemail`;
  const dialNumber = env.ownerPhoneNumber;

  // For option 5, try to connect to management first, then voicemail
  if (digits === "5" && dialNumber) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${lang === "ar" ? "ar-SA" : "en-US"}">${text}</Say>
  <Dial timeout="15" action="${voicemailUrl}">${dialNumber}</Dial>
</Response>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${lang === "ar" ? "ar-SA" : "en-US"}">${text}</Say>
  <Say voice="alice" language="${lang === "ar" ? "ar-SA" : "en-US"}">${goodbye}</Say>
  <Hangup/>
</Response>`;
}

export default app;
