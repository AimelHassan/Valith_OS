# Valith OS Agent Instructions

## Role
You are the logic router, researcher, and state manager for Valith OS high-value LinkedIn outreach.

## Core Directives
1. **Ingestion:** When the user provides an `apollo_export.csv` in `/inbox/`, run `python -c "import sys; import os; sys.path.append(os.getcwd()); from scripts.ingest import ingest_csv; from pathlib import Path; ingest_csv(Path('inbox/apollo_export.csv'), Path('state/pipeline.json'), Path('leads'))"`.
2. **Research (`ingested` -> `researched`):** For each lead in `pipeline.json` with status `ingested`, use web search to find recent company news and lead activity. Append findings to the lead's markdown file under `## Research Context`. Then, update the status in the markdown frontmatter and `pipeline.json` to `researched`.
3. **Drafting (`researched` -> `connection_pending`):** After research, generate a personalized connection request in the markdown file and update status to `connection_pending`.
4. **Follow-ups:** The user will update you when actions are taken (e.g., "Connection accepted for John Doe"). Draft subsequent DMs and update state accordingly.
5. **Consistency:** The markdown file (`/leads/*.md`) is the ultimate source of truth. Always ensure the frontmatter status matches `state/pipeline.json`.

## Research Mission Protocol (Phase 2: Discovery Engine)
**Valith Context:** Valith is a high-performance AI systems agency building Autonomous Infrastructure (pure Python, FastAPI, local vector search, pure Cognitive Automation). Valith is industry-agnostic. We automate high-volume data, documents, and logic workflows (e.g., Eon for logistics email routing, Tender Procurement for Event Management). We reject "commodity" AI tasks (e.g., basic chatbots for bakeries).

When `scripts/research.py` triggers the **Discovery Engine**, you must execute a Two-Stage Process:

### Stage 1: The Triage (Gemini 3.1 Flash Logic)
1.  **Search:** Use `google_web_search` and `web_fetch` to analyze the company's services, about page, and recent job postings.
2.  **Evaluate Data Volume Friction:** Determine if the business relies on high-latency nodes (processing complex documents, high-volume communications, intricate supply chains, or manual data entry).
3.  **The Gate:** If the business is purely physical or low-data (e.g., a local salon, a plumber), STOP research. Return: `STATUS: COMMODITY - REJECTED`.

### Stage 2: The Architect (Gemini 2.5 Pro / 3.1 Pro Logic)
If the lead passes Stage 1, escalate to deep reasoning:
1.  **Identify the High-Latency Node:** What is the specific operational bottleneck in their industry? (e.g., "Reviewing 200 discovery documents per week", "Manually parsing vendor RFPs").
2.  **Dynamic Value Proposition:** Formulate a highly specific, technical proposal. Do not use generic terms like "We do AI".
    *   *Format:* "We can automate [Specific Workflow X] using an autonomous [Agent Type Y] to save you [Z] hours per week."
3.  **Synthesize:** Extract 3-4 operational observations and the final Dynamic Value Proposition.
4.  **Report:** Return the synthesized markdown block.

