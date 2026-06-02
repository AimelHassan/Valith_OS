# Valith OS — Codebase Codex & Developer Map

This file serves as the definitive structural reference for Valith OS. If an AI coding agent or developer wants to audit, update, or expand this system, they must follow these specifications.

---

## 1. Directory Structure

```text
D:\development\Valith_OS
├── README.md                 # Setup and run guide
├── agents.md                 # Original architecture planning doc
├── codex.md                  # This developer map and index
├── supabase_schema.sql       # Database schema creation scripts (excluding interactions)
├── supabase_seed.sql         # Seed data insertion script (excluding interactions)
├── index.html                # Vite app entry and font imports
├── tailwind.config.js        # Color palette (Gold/Charcoal theme)
├── package.json              # Client dependencies
├── public/
│   └── automation_state.json # Aggregated output of the outreach automation pipeline
├── state/
│   └── pipeline.json         # High-value LinkedIn outreach state tracking database
├── leads/
│   └── *.md                  # Individual outreach lead cards containing research and cadences
├── scripts/
│   ├── __init__.py           # Python package marker
│   ├── ingest.py             # Parses CSV files into pipeline state
│   ├── research.py           # Runs automated deep research with Gemini & Google Search Grounding
│   ├── draft.py              # Personalizes outreach cadences (Step 1-3) using Gemini API
│   ├── automate.py           # Combined research and drafting script (Phase 2 + Phase 3)
│   └── watch_inbox.py        # Watchdog script that automatically watches inbox/ for CSVs, runs pipeline, and archives files
├── src/
│   ├── main.tsx              # React mounting root
│   ├── App.tsx               # AppContent Tab Router & Provider wrapper
│   ├── index.css             # Tailwind base and premium card styles
│   ├── App.css               # Empty stylesheet
│   ├── supabaseClient.ts     # Configures live Supabase or sandbox status
│   ├── types/
│   │   └── database.types.ts # TypeScript interfaces for all DB tables (no interactions)
│   ├── context/
│   │   └── ValithOSContext.tsx # Global state provider and database client wrappers
│   ├── services/
│   │   ├── db.ts             # CRUD services syncing Supabase / LocalStorage (no interactions)
│   │   ├── ai.ts             # Gemini API adapter (structured parsers & chat)
│   │   └── contextBuilder.ts # Dynamic summaries collector for AI Advisor
│   └── components/
│       ├── Layout.tsx        # Shell sidebar frame, global search, and alerts
│       ├── AuthView.tsx      # Sign in form with local sandbox bypass
│       ├── DashboardView.tsx # Metrics counters, runway stats, and charts
│       ├── PipelineView.tsx  # Kanban board with draggable items & modals (no interactions)
│       ├── LeadsView.tsx     # Leads table directory, dossiers, and CSV imports (no interactions)
│       ├── DealsView.tsx     # Deal opportunity values & probabilities
│       ├── TasksView.tsx     # Todo lists with due warnings & snooze actions
│       ├── FinanceView.tsx   # Receivables invoices and cash accounts
│       ├── MRRView.tsx       # Subscriptions and monthly retainers
│       ├── ExpensesView.tsx  # Monthly operational bills & category trackers
│       ├── ProposalsView.tsx # SOW, Proposal, and Invoice locker
│       ├── AICaptureInboxView.tsx # Outreach text structured parsing workbench
│       ├── FounderBriefView.tsx # Markdown brief exporter
│       ├── AIAdvisorView.tsx # Strategic Advisor Q&A console
│       └── SettingsView.tsx  # API key configs and db connections
```

---

## 2. Operating Paradigms

### Data Operations & Sandbox Fallback
All components read and update state through `useValithOS()` in `src/context/ValithOSContext.tsx`.
Under the hood, `db.ts` exposes CRUD operations. It executes an internal check:
- If environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are populated, it routes queries to **Supabase** databases.
- If missing, it falls back to browser **LocalStorage**, which hydrates itself with seeded records (Optimize Digital, MARCEM, Protribes, etc.) on the first run.
- When saving entities, `id`, `created_at`, and `updated_at` parameters are generated automatically if omitted.

### AI Integration
The AI utilities (`src/services/ai.ts`) make direct fetch calls to the Gemini API (`gemini-2.5-flash`).
- Loads API keys from `VITE_GEMINI_API_KEY` or falls back to `vos_gemini_api_key` in browser LocalStorage (editable inside the Settings tab).
- **Offline Fallback**: If no key is configured, the services return mock analysis lists and a regex-based parser to ensure the app never crashes.

### The Outreach Operations Layer
Valith OS features a file-system based outreach automation pipeline inside `scripts/`:
1. **Ingestion (`ingest.py`)**: Imports LinkedIn CSV files (e.g. Apollo exports) from `inbox/`, generating slugs and lead cards in `leads/*.md` and updating `state/pipeline.json`.
2. **Discovery Engine (`research.py`)**: Processes leads in `ingested` state.
   - *Stage 1 Triage*: Uses `gemini-2.5-flash` with **Google Search Grounding** to evaluate target data volume friction. Rejects low-data physical commodity businesses (e.g. salons, plumbers) by updating status to `rejected`.
   - *Stage 2 Architect*: Identifies high-latency operational bottlenecks and formulates a dynamic value proposition, appending findings to `leads/{lead_id}.md` under `## Research Context` and updating status to `researched`.
3. **Outreach Synthesizer (`draft.py`)**: Processes leads in `researched` state. Personalizes a 3-step founder-to-founder outreach cadence (no corporate buzzwords, human feel), appending results under `## Outreach Cadence` and updating status to `connection_pending`.
4. **Watchdog (`watch_inbox.py`)**: Runs in the background, polling `inbox/` for new CSV exports. Automatically executes the ingest -> research -> draft chain, moves completions to `inbox/processed/`, and exports a unified `public/automation_state.json`.

---

## 3. Core Database Schemas & TypeScript Types

Refer to [database.types.ts](file:///D:/development/Valith_OS/src/types/database.types.ts) and [supabase_schema.sql](file:///D:/development/Valith_OS/supabase_schema.sql) for exact fields. Keep in mind:
- **`DBDocument`**: Renamed from `Document` to avoid global browser DOM conflicts.
- **Lead `stage`**: Expanded union types including `'Routed to Contact'` to support strategic outreach flows.
- **Lead `priority`**: Standardized to `'High' | 'Medium' | 'Low'`.
- **Expense `category`**: Defined as `'Tools' | 'Ads' | 'Transport' | 'Coworking' | 'Hosting' | 'Domain' | 'Software' | 'Contractors' | 'Food/Meeting' | 'Other'`.
- **Interactions**: Completely removed from database structures and layout routes to focus on tasks and direct cadences.

---

## 4. Extension Rules for Agents & Developers

When modifying Valith OS:
1. **Never modify type interfaces** without reflecting updates in `database.types.ts`, `db.ts`, and the PostgreSQL schema (`supabase_schema.sql`).
2. **Ensure Sandbox Sync**: Make sure any new database tables/fields are Hydrated inside `initLocalStorage()` in `src/services/db.ts` so the offline sandbox mirrors production.
3. **Outreach Cadence Rules**: Background DMs must never use corporate buzzwords: "Machine Learning", "Synergy", "Transform", or "Unlock". Maintain direct founder-to-founder tone.
4. **Build Integrity**: Ensure `npm run build` compiles without errors after making code changes.
