# Valith OS Architecture & Agent Plan

Valith OS is an internal founder command center for Valith AI Solutions. It connects to Supabase for data management (Auth, Postgres, Storage) and uses the Gemini API for intelligence (AI parsing, client brief analysis, and AI Advisor Q&A).

## Core Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Component System**: Clean custom CSS / Tailwind-based premium components with aurum/gold accents on off-white/white background.
- **Database/Backend**: Supabase Auth, PostgreSQL (13 tables), Supabase Storage for documents.
- **AI Integrations**: Gemini API (modular interface, fallback when key is missing) via API routes or edge functions.

## Database Schema (Supabase)
We will create a SQL schema migration file defining the following tables:
1. `organizations`
2. `contacts`
3. `leads`
4. `deals`
5. `tasks`
6. `revenue_payments`
7. `mrr_entries`
8. `expenses`
9. `cash_accounts`
10. `documents`
11. `ai_captures`
12. `settings`

Each table will have UUID primary keys, proper foreign key relationships, Row Level Security (RLS) enabled for single-founder workspace security, and updated_at triggers.

## Frontend Layout & Navigation
Single-page application layout with sidebar navigation:
- **Dashboard**: Overview cards, runway, burn, hot leads, todolist, chart of pipeline value.
- **Pipeline**: Kanban board with drag & drop stages, filtering.
- **Leads**: Searchable table, detail views (org, contact, history, docs, payments).
- **Deals**: Independent opportunities tracker, value metrics.
- **Tasks**: Today / Week / Overdue dashboards.
- **Finance**: Cash accounts, payments, burn rate tracking.
- **MRR**: Recurring subscriptions & services tracker.
- **Expenses**: Tools, ads, operations payments.
- **Documents**: Contract, proposal uploads, storage urls.
- **AI Capture Inbox**: Parsing raw texts from WhatsApp, LinkedIn, or manual notes into pipeline items.
- **Founder Brief**: Generates structured markdown of current OS status suitable to copy-paste into Gemini/ChatGPT.
- **AI Advisor**: Workspace Q&A assistant using Gemini context-building API.
- **Settings**: Configuration of stages, segments, categories, API keys.

## Implementation Steps
1. **Database Schema & Seed**: Write SQL script (`supabase_schema.sql`) and seed script.
2. **App Initialization**: Set up React-Vite-Tailwind in the root directory.
3. **Supabase Client Setup**: Create standard clients.
4. **App Routing & State**: Build context providers for database operations.
5. **Views & Pages**: Implement views for all the 13 navigation sections.
6. **AI Components**: Integrate local/Supabase Edge function or mock Gemini parser with API key in settings/env.
7. **Refinements**: Connect CSV Import/Export, Bulk Edit, Drag-and-drop.
