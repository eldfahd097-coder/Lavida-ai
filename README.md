# La Vida Resort & Beach Club — AI Receptionist System

A fullstack AI-powered receptionist and call routing system for **La Vida Resort & Beach Club** in Zuwarah, Libya. Handles phone calls (Twilio), WhatsApp messages (Meta Cloud API), and Facebook Messenger (Meta Messenger API), with a professional admin dashboard for managing leads, calls, and conversations.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Database Schema](#database-schema)
4. [Environment Variables](#environment-variables)
5. [Setup Guide](#setup-guide)
6. [Deployment Guide](#deployment-guide)
7. [WhatsApp Business API Setup](#whatsapp-business-api-setup)
8. [Facebook Messenger Setup](#facebook-messenger-setup)
9. [Twilio Voice Setup](#twilio-voice-setup)
10. [AI Voice Greeting (ElevenLabs)](#ai-voice-greeting-elevenlabs)
11. [API Routes & Webhooks](#api-routes--webhooks)
12. [Message Templates](#message-templates)
13. [Example Conversation Flows](#example-conversation-flows)
14. [Testing Checklist](#testing-checklist)
15. [Scaling Guide](#scaling-guide)

---

## Project Structure

```
app/
├── api/                          # Backend (Hono + tRPC)
│   ├── router.ts                 # Main tRPC router
│   ├── middleware.ts             # tRPC procedures (public, authed, admin)
│   ├── context.ts                # Request context builder
│   ├── boot.ts                   # Hono server bootstrap
│   ├── auth-router.ts            # Kimi OAuth routes
│   ├── leads-router.ts           # Leads CRUD + stats
│   ├── messages-router.ts        # Messages CRUD + conversations
│   ├── calls-router.ts           # Calls CRUD + stats
│   ├── settings-router.ts        # App settings management
│   ├── logs-router.ts            # Activity logs
│   ├── ai-engine.ts              # OpenAI / Kimi response generator
│   ├── whatsapp-webhook.ts       # WhatsApp incoming webhook
│   ├── twilio-webhook.ts         # Twilio voice webhook
│   ├── messenger-webhook.ts      # Messenger incoming webhook
│   ├── lib/
│   │   ├── env.ts                # Environment variable loader
│   │   ├── whatsapp.ts           # WhatsApp API sender
│   │   └── messenger.ts          # Messenger API sender
│   ├── queries/
│   │   └── connection.ts         # Drizzle DB connection
│   └── kimi/                     # Kimi OAuth SDK (auto-generated)
│
├── db/
│   ├── schema.ts                 # Drizzle ORM table definitions
│   └── relations.ts              # Drizzle table relations
│
├── contracts/
│   ├── templates.ts              # Arabic/English message templates
│   ├── constants.ts              # Shared constants
│   └── errors.ts                 # Shared error types
│
├── src/                          # Frontend (React 19 + Tailwind + shadcn/ui)
│   ├── App.tsx                   # Route definitions
│   ├── main.tsx                  # Entry point
│   ├── providers/
│   │   └── trpc.tsx              # tRPC client provider
│   ├── hooks/
│   │   └── useAuth.ts            # Authentication hook
│   ├── components/
│   │   ├── DashboardLayout.tsx   # Sidebar layout
│   │   └── ui/                   # shadcn/ui components
│   └── pages/
│       ├── Dashboard.tsx         # Overview with stats
│       ├── LeadsPage.tsx         # Leads table + detail modal
│       ├── CallsPage.tsx         # Call logs + stats
│       ├── MessagesPage.tsx      # Message history
│       ├── SettingsPage.tsx      # Configuration + env vars reference
│       ├── Login.tsx             # OAuth login
│       └── NotFound.tsx          # 404 page
│
├── .env                          # Environment variables (generated)
├── drizzle.config.ts             # Drizzle ORM config
├── vite.config.ts                # Vite + Hono dev server config
└── package.json                  # Dependencies + scripts
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Hono, tRPC 11.x, Drizzle ORM |
| Database | MySQL (via Drizzle + mysql2) |
| Auth | Kimi OAuth 2.0 |
| AI | OpenAI GPT-4o-mini / Kimi moonshot-v1 |
| Voice | Twilio Voice (IVR) + ElevenLabs (optional) |
| WhatsApp | Meta WhatsApp Cloud API |
| Messenger | Meta Messenger Platform API |

---

## Database Schema

### `users` — Admin accounts (OAuth)
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| unionId | varchar(255) | Unique Kimi union ID |
| name | varchar(255) | Display name |
| email | varchar(320) | |
| avatar | text | Profile image URL |
| role | enum("user","admin") | Default: user |
| createdAt | timestamp | |
| updatedAt | timestamp | Auto-updated |

### `leads` — Customer inquiries
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| source | enum | whatsapp, messenger, phone, email, walk_in, other |
| name | varchar(255) | |
| phone | varchar(50) | |
| email | varchar(320) | |
| language | enum("ar","en") | Default: ar |
| interest | enum | booking, chalet_info, activities, location, pricing, management, general |
| status | enum | new, contacted, qualified, completed, lost |
| notes | text | Staff notes |
| assignedToId | int FK | Assigned admin |
| metadata | json | Extra data |
| createdAt | timestamp | |
| updatedAt | timestamp | |

### `messages` — WhatsApp & Messenger history
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| leadId | int FK | |
| platform | enum("whatsapp","messenger") | |
| direction | enum("inbound","outbound") | |
| messageId | varchar(255) | Platform message ID |
| fromNumber | varchar(50) | |
| toNumber | varchar(50) | |
| body | text | Message content |
| mediaUrl | text | Optional media |
| mediaType | varchar(50) | |
| status | enum | sent, delivered, read, failed, pending |
| createdAt | timestamp | |

### `calls` — Twilio call records
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| callSid | varchar(255) | Twilio call SID |
| fromNumber | varchar(50) | |
| toNumber | varchar(50) | |
| status | enum | initiated, ringing, answered, completed, busy, failed, no_answer, voicemail |
| duration | int | Seconds |
| recordingUrl | text | Voicemail recording |
| menuChoice | varchar(10) | IVR digit pressed |
| language | enum("ar","en") | |
| leadId | int FK | |
| notes | text | |
| createdAt | timestamp | |
| endedAt | timestamp | |

### `settings` — App configuration
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| key | varchar(255) | Unique |
| value | text | |
| category | enum | general, whatsapp, messenger, twilio, ai, resort |
| updatedAt | timestamp | |

### `activity_logs` — Audit trail
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| userId | int FK | Admin who performed action |
| action | enum | lead_created, lead_updated, lead_assigned, message_sent, call_answered, call_missed, settings_updated, login, logout |
| targetType | enum | lead, call, message, settings, user |
| targetId | int | |
| details | json | |
| createdAt | timestamp | |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
# ─── App Identity ─────────────────────────────────
APP_ID=your-app-id
APP_SECRET=your-app-secret
VITE_APP_ID=your-app-id
VITE_KIMI_AUTH_URL=https://auth.kimi.com

# ─── Database ─────────────────────────────────────
DATABASE_URL=mysql://user:pass@host:port/database

# ─── Kimi OAuth ───────────────────────────────────
KIMI_AUTH_URL=https://auth.kimi.com
KIMI_OPEN_URL=https://open.kimi.com
OWNER_UNION_ID=your-owner-union-id

# ─── AI Engine ────────────────────────────────────
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ─── Twilio Voice ─────────────────────────────────
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+218912110392

# ─── WhatsApp Cloud API ───────────────────────────
WHATSAPP_API_VERSION=v18.0
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
WHATSAPP_VERIFY_TOKEN=your-webhook-verify-token
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345

# ─── Facebook Messenger ────────────────────────────
MESSENGER_PAGE_ACCESS_TOKEN=EAAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
MESSENGER_PAGE_ID=123456789012345
MESSENGER_APP_SECRET=your-app-secret

# ─── ElevenLabs Voice ─────────────────────────────
ELEVENLABS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_VOICE_ID=your-voice-id

# ─── App Settings ─────────────────────────────────
APP_WEBHOOK_BASE_URL=https://your-app-url.com
OWNER_PHONE_NUMBER=+218912110392
```

---

## Setup Guide

### Prerequisites
- Node.js 20+
- MySQL database (or use the provided one)
- A Kimi account (for OAuth + deployment)

### Step 1: Clone & Install
```bash
cd /mnt/agents/output/app
npm install
```

### Step 2: Configure Environment
Edit `.env` with your API keys. At minimum, you need:
- `DATABASE_URL` (MySQL connection)
- `APP_ID` and `APP_SECRET` (from Kimi portal)
- `OWNER_UNION_ID` (your Kimi union ID for admin access)

### Step 3: Push Database Schema
```bash
npm run db:push
```

### Step 4: Start Development
```bash
npm run dev
```
Visit `http://localhost:3000`

---

## Deployment Guide (Railway / Render)

### Railway
1. Create a new project on Railway
2. Add a MySQL database (or use PlanetScale)
3. Connect your GitHub repo
4. Set all environment variables in Railway dashboard
5. Deploy — Railway auto-detects Node.js

### Render
1. Create a new Web Service on Render
2. Connect your repo
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables in Render dashboard
6. Deploy

### Post-Deployment
Update these webhook URLs in your provider dashboards:
- **WhatsApp**: `{APP_WEBHOOK_BASE_URL}/api/whatsapp/webhook`
- **Twilio Voice**: `{APP_WEBHOOK_BASE_URL}/api/twilio/voice`
- **Messenger**: `{APP_WEBHOOK_BASE_URL}/api/messenger/webhook`

---

## WhatsApp Business API Setup

1. Go to [Meta Developers](https://developers.facebook.com/)
2. Create a Business App
3. Add **WhatsApp** product
4. Create a WhatsApp Business Account
5. Add a phone number (verify via SMS)
6. Get your **Phone Number ID** and **Access Token**
7. In your `.env`, set:
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_VERIFY_TOKEN` (any random string)
8. Configure webhook URL: `https://your-app.com/api/whatsapp/webhook`
9. Subscribe to `messages` webhook events

---

## Facebook Messenger Setup

1. In the same Meta app, add **Messenger** product
2. Connect your Facebook Page
3. Generate **Page Access Token**
4. In your `.env`, set:
   - `MESSENGER_PAGE_ACCESS_TOKEN`
   - `MESSENGER_PAGE_ID`
5. Configure webhook URL: `https://your-app.com/api/messenger/webhook`
6. Subscribe to `messages` and `messaging_postbacks` events

---

## Twilio Voice Setup

1. Create a [Twilio](https://twilio.com) account
2. Buy a phone number (or verify your existing Libya number)
3. Get **Account SID** and **Auth Token**
4. In your `.env`, set:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
5. Configure the phone number webhook:
   - **When a call comes in**: `POST` to `https://your-app.com/api/twilio/voice`
   - **Call status changes**: `POST` to `https://your-app.com/api/twilio/voice/status`

---

## AI Voice Greeting (ElevenLabs)

1. Sign up at [ElevenLabs](https://elevenlabs.io)
2. Get your **API Key**
3. Choose or clone a voice (Arabic-friendly voice recommended)
4. In your `.env`, set:
   - `ELEVENLABS_API_KEY`
   - `ELEVENLABS_VOICE_ID`
5. The system will use ElevenLabs for voice greetings when configured

---

## API Routes & Webhooks

### tRPC API Routes (`/api/trpc/*`)
| Router | Procedures |
|--------|-----------|
| `auth` | `me`, `logout` |
| `lead` | `list`, `getById`, `create`, `update`, `delete`, `stats` |
| `message` | `list`, `create`, `updateStatus`, `getConversation` |
| `call` | `list`, `create`, `update`, `stats` |
| `setting` | `list`, `getByKey`, `upsert`, `bulkUpsert`, `delete` |
| `log` | `list`, `create` |

### Webhook Routes
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/whatsapp/webhook` | GET | Webhook verification |
| `/api/whatsapp/webhook` | POST | Receive WhatsApp messages |
| `/api/twilio/voice` | POST | Incoming call IVR |
| `/api/twilio/voice/menu` | POST | IVR menu selection |
| `/api/twilio/voice/voicemail` | POST | Voicemail handler |
| `/api/twilio/voice/status` | POST | Call status callback |
| `/api/messenger/webhook` | GET | Webhook verification |
| `/api/messenger/webhook` | POST | Receive Messenger messages |

---

## Message Templates

### WhatsApp / Messenger Greeting (Arabic)
```
مرحباً بكم في La Vida Resort & Beach Club 🏖️
نشكركم على تواصلكم معنا

الحجز غير متاح حالياً وسيتم الإعلان عنه قريباً 📢

يرجى إرسال رقم الخيار:
1 - معلومات عن المنتجع
2 - صور الشاليهات والتفاصيل
3 - آخر التحديثات والأسعار
4 - الأنشطة والمرافق
5 - التحدث مع الإدارة
```

### WhatsApp / Messenger Greeting (English)
```
Welcome to La Vida Resort & Beach Club 🏖️
Thank you for reaching out to us

Booking is not available yet and will be announced soon 📢

Please send the option number:
1 - Resort Information
2 - Chalet Images & Details
3 - Latest Updates & Pricing
4 - Activities & Facilities
5 - Speak to Management
```

### Phone IVR Menu (Arabic)
```
مرحباً بكم في La Vida Resort & Beach Club.
للحجز والأسعار، اضغط 1.
لمعلومات الشاليهات، اضغط 2.
للأنشطة والمرافق، اضغط 3.
للموقع ومواعيد الافتتاح، اضغط 4.
للتحدث مع الإدارة، اضغط 5.
```

### Phone IVR Menu (English)
```
Welcome to La Vida Resort & Beach Club.
For booking and prices, press 1.
For chalet information, press 2.
For resort activities, press 3.
For location and opening updates, press 4.
To speak with management, press 5.
```

---

## Example Conversation Flows

### WhatsApp Flow
1. **Customer**: "مرحبا"
2. **AI**: Welcome message + numbered menu
3. **Customer**: "1"
4. **AI**: Full resort information (42 units, facilities, location)
5. **Customer**: "كيف احجز؟"
6. **AI**: "الحجز غير متاح حالياً وسيتم الإعلان عنه قريباً 📢"
7. **Customer**: "شكرا"
8. **AI**: Goodbye message

### Phone Flow
1. **Customer** calls `+218 91 211 0392`
2. **Twilio**: Plays welcome + menu in Arabic
3. **Customer** presses `2`
4. **Twilio**: "We have 20 family chalets, 10 luxury villas, and 12 apartments..."
5. **Twilio**: "Thank you for calling. Goodbye." → Hangs up

### Facebook Messenger Flow
1. **Customer** sends message on Facebook page
2. **AI**: Welcome message + numbered menu (same as WhatsApp)
3. **Customer** selects option or sends free text
4. **AI**: Responds with template or AI-generated answer
5. **Customer**: "Connect me to WhatsApp"
6. **AI**: Provides WhatsApp number and phone number

---

## Testing Checklist

### WhatsApp
- [ ] Send "مرحبا" → receive Arabic welcome + menu
- [ ] Send "hello" → receive English welcome + menu
- [ ] Send "1" → receive resort information
- [ ] Send "2" → receive chalet details
- [ ] Send "3" → receive updates (booking not available)
- [ ] Send "5" → receive management contact info
- [ ] Send random text → receive AI or fallback response
- [ ] Verify lead created in dashboard
- [ ] Verify message stored in database

### Phone (Twilio)
- [ ] Call the Twilio number
- [ ] Hear Arabic welcome + menu
- [ ] Press `1` → hear booking info
- [ ] Press `2` → hear chalet info
- [ ] Press `3` → hear activities info
- [ ] Press `4` → hear location info
- [ ] Press `5` → connect to management (or voicemail if no answer)
- [ ] Verify call record in dashboard
- [ ] Verify menu choice stored

### Messenger
- [ ] Send message via Facebook page
- [ ] Receive welcome + menu
- [ ] Test numbered options
- [ ] Verify lead created in dashboard

### Admin Dashboard
- [ ] Login with Kimi OAuth
- [ ] View Dashboard with stats cards
- [ ] View Leads page with filters
- [ ] Open lead detail, change status
- [ ] Add notes to lead
- [ ] View Calls page with call logs
- [ ] View Messages page with conversation history
- [ ] View Settings page with env vars reference
- [ ] Logout successfully

---

## Scaling Guide

### For Production Scale
1. **Database**: Use PlanetScale or AWS RDS for managed MySQL
2. **Caching**: Add Redis for session caching and rate limiting
3. **Queue**: Use BullMQ or SQS for handling high-volume WhatsApp/Messenger
4. **Monitoring**: Add Sentry for error tracking
5. **Analytics**: Add a separate analytics table for daily/weekly reports
6. **Multi-language**: Extend templates for Italian, French, etc.
7. **CRM Integration**: Connect to HubSpot or Salesforce via tRPC routers
8. **Voice**: Add more ElevenLabs voices for different languages
9. **Backup**: Schedule daily DB backups
10. **Rate Limiting**: Add Hono rate limit middleware per phone number

---

## Security Notes

- API keys are stored in environment variables only
- No secrets are hardcoded in source code
- Kimi OAuth 2.0 handles secure admin authentication
- Webhook verification tokens prevent spoofing
- Admin routes (`adminQuery`) require authenticated admin role
- `OWNER_UNION_ID` is set for first admin access

---

## Support

For issues or questions:
- Phone: +218 91 211 0392
- Email: info@lavida.ly
- Location: Zuwarah, Libya

fresh deploy
