# Valith OS - Phase 3: Outreach Synthesizer Spec

## Overview
Phase 3 takes the "Dynamic Value Proposition" and "High-Latency Nodes" identified in Phase 2 and translates them into a high-fidelity, peer-to-peer LinkedIn outreach cadence. The goal is to mimic the nuance of a Senior Solutions Architect.

## Core Tone & Directives
*   **Tone:** Founder-to-Founder. Authoritative, highly observant, and context-rich. Not a generic sales pitch.
*   **Structure:**
    1.  **Hyper-Specific Hook:** Reference a recent event, trip, or post (e.g., "saw you just got back from Accountex London").
    2.  **Inferred Priority:** Connect the hook to a presumed business goal.
    3.  **Direct Introduction & Traction:** Introduce Valith unapologetically with hard numbers (e.g., "AI startup in Islamabad... live outreach platform at 155+ waitlist signups... deployed inquiry handling system at a logistics enterprise").
    4.  **The "Broader Conversation" Pivot:** Acknowledge the scale of their operations (mentioning multiple ventures if applicable) and suggest a high-leverage discussion.
    5.  **Soft CTA:** "Worth a call to see where the highest leverage is."
*   **Cadence:** 1 Initial Deep Context DM + 1 lightweight follow-up ("Thoughts on this?") + 1 Breakup.

## The Prompt Architecture (Gemini 3.1 Pro)
The agent will be fed the `## Research Context` from the lead's markdown file. It MUST have found deep profile context (events, secondary ventures) during Phase 2 to fuel this draft.

**Rules for the LLM:**
1.  NEVER use the words "Machine Learning", "Synergy", "Transform", or "Unlock".
2.  Use localized greetings if applicable (e.g., "Salam" if in Pakistan).
3.  Inject hard Valith traction numbers (155+ waitlist, deployed logistics enterprise).
4.  Focus on "removing operational overhead" rather than "buying our software".

## Workflow
1.  `scripts/draft.py` reads `pipeline.json` for leads with `status: connection_accepted` (assuming the user updates this state).
2.  The script passes the markdown content to the agent.
3.  The agent generates the 3-step cadence.
4.  The drafts are appended to the lead's markdown file under a `## Outreach Drafts` header.
5.  State updates to `drafts_ready`.
