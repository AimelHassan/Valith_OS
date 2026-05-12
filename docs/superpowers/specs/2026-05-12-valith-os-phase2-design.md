# Valith OS - Phase 2: Deep Research Loop Spec

## Overview
Phase 2 implements the autonomous "Deep Research" phase for ingested leads. This phase uses Gemini 2.5 Pro (for quota-efficient deep reasoning) to perform multi-step web research, synthesize insights, and prepare leads for personalized outreach.

## Goals
1.  Automate the transition of leads from `ingested` to `researched`.
2.  Provide high-signal research context including company pain points and lead-specific activity using Gemini 2.5 Pro.
3.  Maintain data consistency across `state/pipeline.json` and `/leads/*.md`.

## Workflow
1.  **Lead Identification:** The `scripts/research.py` orchestrator identifies all leads with `status: ingested`.
2.  **Research Directive:** For each lead, a research prompt is constructed containing:
    *   Full Name
    *   Company
    *   LinkedIn URL (if available)
    *   Website (if available)
3.  **Autonomous Research (Gemini 2.5 Pro):**
    *   **LinkedIn Deep Dive:** Perform targeted searches for the lead's LinkedIn profile and recent activity (posts, comments, career updates). Use `google_web_search` with site-specific operators (e.g., `site:linkedin.com/in/ "Name"`) if the URL is missing or to find public-facing activity.
    *   **Company Intelligence:** Perform `google_web_search` for "[Company] recent news", funding announcements, or product launches.
    *   **Contextual Synthesis:** Use `web_fetch` to extract content from the most relevant LinkedIn-related snippets or company pages.
    *   Analyze results for specific high-value triggers: recent LinkedIn posts, hiring trends, funding, or specific technical challenges mentioned by the lead or company.
4.  **Synthesis & Output:**
    *   Synthesize insights into a `## Research Context` section in the lead's markdown file.
    *   Update the frontmatter `status` to `researched`.
    *   Update `state/pipeline.json` status to `researched`.

## Error Handling
*   If research fails for a specific lead (e.g., no results found), mark status as `research_failed` and log the reason in the markdown file.
*   Gracefully handle rate limits or tool failures by skipping to the next lead and reporting at the end.

## Success Criteria
*   Leads are updated with actual, non-generalized research.
*   The state machine prevents redundant research for already researched leads.
