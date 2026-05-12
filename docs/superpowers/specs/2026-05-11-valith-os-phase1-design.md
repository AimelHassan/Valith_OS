# Valith OS - Phase 1: Agentic Lead Analysis & Truth Repository

## Overview
Phase 1 of Valith OS establishes a file-based "Intelligence Node" driven entirely by the CLI Agent. It focuses on the "Apollo to Outreach" pipeline, acting as the logic router, researcher, and state manager for high-value LinkedIn outreach. The system is designed for maximum cognitive offload, handling research and drafting while maintaining a strict, queryable state of the pipeline.

## Architecture & Data Flow

The system uses a "Log-First" Hybrid Truth Repository, storing data entirely on the local file system.

1.  **`/inbox/`**: The drop-zone for raw Apollo CSV exports.
2.  **`/state/pipeline.json`**: The central state machine. A JSON index tracking all ingested leads, their current outreach stage, and timestamps.
3.  **`/leads/`**: The Knowledge Layer. Individual Markdown files for each lead containing deep research context and drafted outreach messages.

## Workflows

### 1. Ingestion & Pre-computation
*   **Trigger:** The user places an `apollo_export.csv` into `/inbox/` and commands the agent to process it.
*   **Assumption:** The user pre-filters Apollo lists; therefore, the system assumes all leads in the CSV are high-value targets requiring deep research.
*   **Action:**
    *   The agent parses the CSV.
    *   Adds new entries to `/state/pipeline.json` with the initial status `ingested`.
    *   Creates a markdown file for each lead in `/leads/` (e.g., `leads/firstname-lastname_company.md`).

### 2. Deep Research Loop
*   **Action:** For leads in the `ingested` state, the agent autonomously performs deep research using web search/scraping tools.
*   **Focus:** Recent company news, funding, product launches, lead's recent public activity, and specific industry pain points.
*   **Output:** The synthesized research is appended to the lead's markdown file under a `## Research Context` header.
*   **State Update:** The lead's status in `pipeline.json` is updated to `researched`.

### 3. The Outreach State Machine
The agent manages a multi-step outreach cadence. Drafts are generated contextually based on the current state.

**State Machine Progression:**
1.  **`connection_pending`**: Once research is complete, the agent generates a personalized connection request note (if applicable) in the markdown file.
2.  **`connection_sent`**: The user manually sends the request and informs the agent. The agent updates `pipeline.json`.
3.  **`connection_accepted`**: The user informs the agent the connection was accepted. The agent updates the state and immediately drafts 2-3 highly personalized initial DMs based on the research.
4.  **`dm_sent`**: The user sends the DM and informs the agent.
5.  **`replied`**: The user informs the agent of a reply. The agent can ingest the reply and propose a counter-response.
6.  **`follow_up_1_pending` / `follow_up_X_pending`**: If no reply is received within a specified timeframe, the agent drafts a contextual follow-up.

## Error Handling & Consistency
*   **The Consistency Rule:** The markdown file (`/leads/*.md`) acts as the primary log. If `pipeline.json` becomes corrupted or out of sync, it must be rebuildable by parsing the frontmatter and status logs within the markdown files.

## Testing & Validation
*   Validate CSV parsing handles various Apollo export formats gracefully.
*   Ensure the state machine logic strictly prevents skipping steps (e.g., cannot move to `dm_sent` without `connection_accepted`).
*   Verify that research output is specifically tailored and not hallucinated or generalized.