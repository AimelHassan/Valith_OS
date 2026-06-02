# Valith OS — Automated Lead Research & Cadence Drafting Pipeline
# Auto-executes Phase 2 (Discovery Engine) and Phase 3 (Outreach Synthesizer)

import os
import re
import json
import urllib.request
import urllib.error
from pathlib import Path

# ----------------------------------------------------
# CONFIGURATION & UTILITIES
# ----------------------------------------------------

def load_env():
    """Parses .env file directly to avoid extra package dependencies."""
    env_path = Path(".env")
    if not env_path.exists():
        return {}
    
    env_vars = {}
    content = env_path.read_text()
    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, val = line.split("=", 1)
        # Strip optional quotes
        val = val.strip().strip('"').strip("'")
        env_vars[key.strip()] = val
    return env_vars

ENV = load_env()
GEMINI_API_KEY = ENV.get("VITE_GEMINI_API_KEY") or ENV.get("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY")

def call_gemini(prompt: str, system_instruction: str = None) -> str:
    """Invokes Gemini API via clean HTTP POST requests."""
    if not GEMINI_API_KEY:
        raise ValueError("Missing GEMINI_API_KEY. Set VITE_GEMINI_API_KEY in .env or run env.")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }
    
    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [
                {"text": system_instruction}
            ]
        }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as res:
            res_body = json.loads(res.read().decode("utf-8"))
            return res_body["candidates"][0]["content"]["parts"][0]["text"]
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        raise RuntimeError(f"Gemini API Error {e.code}: {err_msg}")

# ----------------------------------------------------
# AUTOMATION FLOW
# ----------------------------------------------------

def run_pipeline():
    state_path = Path("state/pipeline.json")
    leads_dir = Path("leads")
    leads_dir.mkdir(exist_ok=True)

    if not state_path.exists():
        print(f"Error: State file {state_path} not found.")
        return

    with open(state_path, "r") as f:
        state = json.load(f)

    leads_dict = state.get("leads", {})
    if not leads_dict:
        print("No leads in pipeline state.")
        return

    print("====================================================")
    print("STARTING VALITH AUTOMATED OUTREACH RESEARCH & CADENCE")
    print("====================================================")

    modified = False

    for lead_id, lead in list(leads_dict.items()):
        status = lead.get("status", "ingested")
        
        # Ensure lead markdown exists
        md_file = leads_dir / f"{lead_id}.md"
        if not md_file.exists():
            # Scaffold default frontmatter
            initial_content = f"""---
id: {lead_id}
first_name: {lead.get('first_name', '')}
last_name: {lead.get('last_name', '')}
company: {lead.get('company', '')}
linkedin: {lead.get('linkedin', '')}
website: {lead.get('website', '')}
status: ingested
---
# Outreach Card: {lead.get('first_name')} at {lead.get('company')}
"""
            md_file.write_text(initial_content)

        # ----------------------------------------------------
        # PHASE 2: DEEP RESEARCH LOOP (ingested -> researched)
        # ----------------------------------------------------
        if status == "ingested":
            print(f"\n[RESEARCHING] Lead: {lead_id} ({lead.get('company')})")
            
            # Formulate prompt for Gemini Two-Stage Protocol
            system_prompt = """You are a high-performance AI systems architect. You represent Valith AI Solutions (pure Python, autonomous agentic infrastructure, cognitive automation).
Evaluate the lead's company and suggest high-latency bottlenecks we can automate (e.g. document ingestion, manual validation, vendor mapping, invoice parsing).
Return a markdown block formatted like this:
## Research Context
- **Industry Dynamics**: (1-2 sentences on industry overhead)
- **High-Latency Node**: (Identify specific operational bottleneck, e.g. manual RFP analysis, logistics routing)
- **Dynamic Value Proposition**: We can automate [Bottleneck X] using an autonomous [Agent Type Y] to save you [Z] hours per week."""

            prompt = f"Lead Company: {lead.get('company')}\nWebsite: {lead.get('website', 'None')}\nContact: {lead.get('first_name')} {lead.get('last_name')}"
            
            try:
                research_content = call_gemini(prompt, system_prompt)
                
                # Update Markdown file
                content = md_file.read_text()
                content = content.replace("status: ingested", "status: researched")
                
                if "## Research Context" in content:
                    # Replace existing
                    content = re.sub(r"## Research Context.*?(?=##|$)", f"{research_content}\n\n", content, flags=re.DOTALL)
                else:
                    content += f"\n\n{research_content}"
                
                md_file.write_text(content)
                
                # Update JSON State
                lead["status"] = "researched"
                modified = True
                print(f"✓ Research complete. State saved as researched.")
            except Exception as err:
                print(f"✗ Research failed for {lead_id}: {err}")

        # ----------------------------------------------------
        # PHASE 3: OUTREACH SYNTHESIZER (researched -> connection_pending)
        # ----------------------------------------------------
        # The state is updated toconnection_pending so the founder knows a DM is drafted and ready
        status = lead.get("status") # Refresh status check
        if status == "researched":
            print(f"\n[DRAFTING OUTREACH] Lead: {lead_id} ({lead.get('company')})")
            
            content = md_file.read_text()
            
            system_prompt = """You are a founder-to-founder outreach copywriter for Valith.
Read the ## Research Context in the prompt.
Write a personalized 3-step outreach cadence:
Step 1: Connection DM (approx 80-120 words). Hyper-specific hook referencing their friction, direct introduction as Valith founder in Islamabad, pitch matching traction (Waitlist 155+, inquiry routing systems), soft call-to-action.
Step 2: Day 3 Follow-up (1 sentence).
Step 3: Day 10 Breakup (1 sentence).

Rules:
1. NEVER use corporate buzzwords: "Machine Learning", "Synergy", "Transform", "Unlock".
2. Use occasional lowercase for natural human readability.
Return a markdown block formatted like this:
## Outreach Cadence
- **Step 1 (Connection DM)**:
[Draft Message]
- **Step 2 (Day 3 Follow-up)**:
[Follow-up Message]
- **Step 3 (Day 10 Breakup)**:
[Breakup Message]"""

            try:
                cadence_content = call_gemini(content, system_prompt)
                
                # Update Markdown File
                content = md_file.read_text()
                content = content.replace("status: researched", "status: connection_pending")
                
                if "## Outreach Cadence" in content:
                    content = re.sub(r"## Outreach Cadence.*", cadence_content, content, flags=re.DOTALL)
                else:
                    content += f"\n\n{cadence_content}"
                
                md_file.write_text(content)
                
                # Update JSON State
                lead["status"] = "connection_pending"
                modified = True
                print(f"✓ Outreach cadence generated. State saved as connection_pending.")
            except Exception as err:
                print(f"✗ Drafting failed for {lead_id}: {err}")

    if modified:
        with open(state_path, "w") as f:
            json.dump(state, f, indent=2)
        print("\n✓ Pipeline database state file synchronized.")
    else:
        print("\nAll leads are up to date. No pending states.")
        
    export_aggregated_state()

def export_aggregated_state():
    state_path = Path("state/pipeline.json")
    leads_dir = Path("leads")
    output_path = Path("public/automation_state.json")
    
    if not state_path.exists():
        return
        
    with open(state_path, "r", encoding="utf-8") as f:
        state = json.load(f)
        
    leads_dict = state.get("leads", {})
    aggregated_leads = []
    
    for lead_id, lead in leads_dict.items():
        md_file = leads_dir / f"{lead_id}.md"
        research_context = ""
        outreach_cadence = ""
        
        if md_file.exists():
            content = md_file.read_text(encoding="utf-8")
            
            # Extract Research Context
            res_match = re.search(r"## Research Context(.*?)(?=##|$)", content, re.DOTALL)
            if res_match:
                research_context = res_match.group(1).strip()
                
            # Extract Outreach Cadence
            cad_match = re.search(r"## Outreach Cadence(.*?)(?=##|$)", content, re.DOTALL)
            if cad_match:
                outreach_cadence = cad_match.group(1).strip()
                
        aggregated_leads.append({
            "id": lead_id,
            "first_name": lead.get("first_name", ""),
            "last_name": lead.get("last_name", ""),
            "company": lead.get("company", ""),
            "linkedin": lead.get("linkedin", ""),
            "website": lead.get("website", ""),
            "status": lead.get("status", "ingested"),
            "research_context": research_context,
            "outreach_cadence": outreach_cadence
        })
        
    output_path.parent.mkdir(exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({"leads": aggregated_leads}, f, indent=2)
    print(f"✓ Aggregated automation state exported to {output_path}")

if __name__ == "__main__":
    if not GEMINI_API_KEY:
        print("Error: VITE_GEMINI_API_KEY is not defined in your environmental files. Please set it to proceed.")
    else:
        run_pipeline()

