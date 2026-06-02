# Valith OS — Founder Command Center

> **Internal operating dashboard for Valith AI Solutions.**
> Track leads, pipeline, deals, cash, MRR, expenses, proposals, documents, and strategic decisions — all in one screen.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%2C_DB%2C_Storage-3FCF8E?logo=supabase&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_API-AI_Parser-4285F4?logo=google&logoColor=white)

---

## What is Valith OS?

Valith OS is **not** a generic CRM clone. It is a **founder command center** purpose-built for a small AI automation studio. It replaces scattered spreadsheets, Notion boards, and WhatsApp screenshots with a single, fast, premium interface.

### Core Modules

| Module | Description |
|---|---|
| **Dashboard** | Real-time diagnostics — safe runway, net burn, locked revenue, active MRR, tasks due today, pipeline funnel chart |
| **Pipeline** | Kanban board with 10 stages (New → Closed Won/Lost), drag-and-drop, inline quick-task creation |
| **Leads** | Searchable table with detail drawers — org, contact, history, pain points, objections |
| **Deals** | Independent opportunities tracker with value metrics and close probability |
| **Offers** | Dynamic offer angle management — create, edit, delete offer types used across the pipeline |
| **Segments** | Dynamic segment management — define market segments for lead classification |
| **Tasks** | Today / This Week / Overdue views with type-based filtering |
| **Finance** | Cash accounts, payment tracking, burn rate calculations |
| **MRR** | Monthly recurring revenue tracker for retainer/subscription services |
| **Expenses** | Tools, ads, operations, and infrastructure cost tracking |
| **Proposals** | Contract and proposal document management via Supabase Storage |
| **AI Capture** | Paste raw WhatsApp/LinkedIn/email text → Gemini parses it into structured lead + org + contact + task |
| **Founder Brief** | One-click export of the entire operating state into structured Markdown (for pasting into ChatGPT/Claude) |
| **AI Advisor** | Workspace Q&A terminal powered by Gemini with full context building |
| **Settings** | API keys, pipeline stage config, workspace preferences |

---

## Technology Stack

```
Frontend ─── React 19  ·  TypeScript 5.8  ·  Vite 8  ·  Tailwind CSS 4
Icons ────── Lucide React
Backend ──── Supabase Auth  ·  PostgreSQL (13 tables)  ·  Supabase Storage
AI ───────── Google Gemini API (modular, swappable to OpenAI / Claude)
Theme ────── Aurum/Gold accents  ·  Off-white background  ·  Black typography
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/AimelHassan/Valith_OS.git
cd Valith_OS
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your keys:

| Variable | Source | Required? |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API | For cloud mode |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | For cloud mode |
| `VITE_GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) | For AI features |

> **Offline mode:** If Supabase keys are not set, the app automatically falls back to a LocalStorage sandbox pre-seeded with active leads (MARCEM, Protribes, Optimize Digital, Lumenex, etc.).

### 3. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Database Setup (Supabase)

1. **Create schema**: Run `supabase_schema.sql` in the Supabase SQL Editor. This creates 15 tables (including `offers` and `segments`), triggers, and configures Row Level Security.
2. **Seed data** (optional): Run `supabase_seed.sql` to populate with starter pipeline data.
3. **Create user**: Go to Supabase → Authentication → create a user with your founder email.

### Schema Overview

```
organizations  ·  contacts  ·  leads  ·  deals  ·  tasks
revenue_payments  ·  mrr_entries  ·  expenses  ·  cash_accounts
documents  ·  ai_captures  ·  settings  ·  offers  ·  segments
```

All tables use UUID primary keys, proper foreign key relationships, and RLS policies scoped to authenticated users.

---

## Sandbox Login

When running in **offline/LocalStorage mode**:

- **Email:** `founder@valith.tech`
- **Password:** `valithos`

---

## Project Structure

```
├── src/
│   ├── components/       # All view components (Dashboard, Pipeline, Leads, etc.)
│   ├── context/          # ValithOSContext — global state provider
│   ├── services/
│   │   ├── ai.ts         # Gemini API integration (modular AI provider)
│   │   ├── db.ts         # Database service (Supabase + LocalStorage fallback)
│   │   └── contextBuilder.ts  # Workspace context for AI Advisor
│   ├── types/
│   │   └── database.types.ts  # TypeScript interfaces for all entities
│   └── App.tsx           # Root app with tab routing
├── supabase_schema.sql   # Full database schema with RLS
├── supabase_seed.sql     # Seed data for pipeline
├── codex.md              # AI agent instructions for updating this repo
├── .env.example          # Template environment variables
└── index.html            # Entry point
```

---

## Pipeline Stages & Value Logic

| Stage | Has Deal Value? | Notes |
|---|---|---|
| New | ✗ | Early discovery |
| Connected | ✗ | LinkedIn/WhatsApp accepted |
| Messaged | ✗ | Outreach sent |
| Replied | ✗ | Conversation started |
| Demo Sent | ✗ | Demo/asset shared |
| Meeting Scheduled | ✗ | Call booked |
| SOW Sent | ✓ | Statement of Work delivered |
| Negotiation | ✓ | Active pricing discussions |
| Closed Won | ✓ | Deal locked |
| Closed Lost | ✓ | Deal lost (value preserved for reporting) |

---

## AI Features

- **AI Capture Inbox**: Paste unstructured chat text → Gemini extracts organization, contact, lead, and follow-up task entities. Review before committing to database.
- **AI Advisor**: Ask natural language questions about your pipeline, revenue, tasks. Context is auto-built from all operating data.
- **Founder Brief**: One-click structured Markdown export of your entire business state.

The AI provider interface is modular — swap from Gemini to OpenAI or Claude by implementing the `aiService` interface in `src/services/ai.ts`.

---

## Development

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # TypeScript check + production build
npm run preview   # Preview production build locally
```

---

## License

Private — internal use only at Valith AI Solutions.
