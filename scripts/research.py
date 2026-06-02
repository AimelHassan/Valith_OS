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
        val = val.strip().strip('"').strip("'")
        env_vars[key.strip()] = val
    return env_vars

ENV = load_env()
GEMINI_API_KEY = ENV.get("VITE_GEMINI_API_KEY") or ENV.get("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY")
RESEARCH_MODEL = ENV.get("RESEARCH_MODEL") or "gemini-2.5-flash"

def call_gemini_grounded(prompt: str, system_instruction: str = None) -> str:
    """Invokes Gemini API with Google Search grounding enabled."""
    if not GEMINI_API_KEY:
        raise ValueError("Missing GEMINI_API_KEY. Set VITE_GEMINI_API_KEY in .env.")

    # Using Beta API for Google Search Grounding
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{RESEARCH_MODEL}:generateContent?key={GEMINI_API_KEY}"
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "tools": [
            {
                "googleSearch": {}
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
            # Extract text
            candidates = res_body.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "")
            return ""
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        raise RuntimeError(f"Gemini API Error {e.code}: {err_msg}")

# ----------------------------------------------------
# MAIN AUTOMATED RESEARCH PIPELINE
# ----------------------------------------------------

def run_research():
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
    print("RUNNING PHASE 2: AUTOMATED DISCOVERY ENGINE")
    print("====================================================")

    modified = False

    for lead_id, lead in list(leads_dict.items()):
        status = lead.get("status", "ingested")
        if status != "ingested":
            continue

        company = lead.get("company", "")
        website = lead.get("website", "")
        linkedin = lead.get("linkedin", "")
        first_name = lead.get("first_name", "")
        last_name = lead.get("last_name", "")

        print(f"\n[TRIAGING] Lead: {lead_id} ({company})")

        # Ensure lead markdown exists
        md_file = leads_dir / f"{lead_id}.md"
        if not md_file.exists():
            initial_content = f"""---
id: {lead_id}
first_name: {first_name}
last_name: {last_name}
company: {company}
linkedin: {linkedin}
website: {website}
status: ingested
---
# Outreach Card: {first_name} at {company}
"""
            md_file.write_text(initial_content, encoding="utf-8")

        # Stage 1: The Triage (Evaluate low-data vs high-latency node complexity)
        triage_system_prompt = (
            "You are a triage filter. Determine if the following company is a local physical "
            "commodity business with minimal data/document volume friction (e.g. a plumber, a salon, a restaurant, a local cleaning service). "
            "If yes, respond exactly with 'STATUS: COMMODITY - REJECTED'. "
            "Otherwise, respond with 'STATUS: SUCCESS'."
        )
        triage_prompt = f"Company: {company}\nWebsite: {website}\nLinkedIn: {linkedin}"

        try:
            triage_res = call_gemini_grounded(triage_prompt, triage_system_prompt)
            print(f"Triage response: {triage_res.strip()}")

            if "REJECTED" in triage_res or "COMMODITY" in triage_res:
                print(f"↳ Lead REJECTED: Business identified as low-data commodity.")
                lead["status"] = "rejected"
                modified = True
                
                # Update Markdown status
                content = md_file.read_text(encoding="utf-8")
                content = content.replace("status: ingested", "status: rejected")
                md_file.write_text(content, encoding="utf-8")
                continue

            # Stage 2: The Architect (Deep search & analysis)
            print(f"[ARCHITECT DEEP WORK] Researching {company}...")
            architect_system = (
                "You are a high-performance AI systems architect for Valith (pure Python, autonomous cognitive automation). "
                "Research the company's services, about page, and operational nodes. "
                "Identify their high-latency bottleneck. Create 3-4 specific operational observations. "
                "Write a Dynamic Value Proposition. Do NOT use corporate words like 'synergy', 'transform', or 'unlock'. "
                "Format your response exactly like this:\n"
                "## Research Context\n"
                "* **Operational Observation 1:** [Specific observation about their supply, data entry, client routing, or data flow]\n"
                "* **Operational Observation 2:** [Observation about another node]\n"
                "* **Operational Observation 3:** [Observation about another node]\n"
                "* **High-Latency Node:** [ Bottleneck X, e.g. manual checking of 300 contractor spreadsheets ]\n"
                "* **Dynamic Value Proposition:** We can automate [Workflow X] using an autonomous [Agent Type Y] to save you [Z] hours per week."
            )
            architect_prompt = f"Analyze Company: {company}\nWebsite: {website}\nRepresentative: {first_name} {last_name}"
            
            research_content = call_gemini_grounded(architect_prompt, architect_system)

            # Update Lead Markdown
            content = md_file.read_text(encoding="utf-8")
            content = content.replace("status: ingested", "status: researched")
            
            if "## Research Context" in content:
                content = re.sub(r"## Research Context.*?(?=##|$)", f"{research_content.strip()}\n\n", content, flags=re.DOTALL)
            else:
                content += f"\n\n{research_content.strip()}"
            
            md_file.write_text(content, encoding="utf-8")

            # Update JSON State
            lead["status"] = "researched"
            modified = True
            print(f"✓ Lead Triaged & Researched successfully.")

        except Exception as err:
            print(f"✗ Research failed for {lead_id}: {err}")

    if modified:
        with open(state_path, "w") as f:
            json.dump(state, f, indent=2)
        print("\n✓ Pipeline state synchronized.")
    else:
        print("\nNo pending leads found to research.")
        
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
        print("Error: VITE_GEMINI_API_KEY is not defined in your environment/env file.")
    else:
        run_research()
