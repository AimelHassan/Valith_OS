import json
from pathlib import Path

def get_leads_to_research(state_path: Path):
    with open(state_path, 'r') as f:
        state = json.load(f)
    return [id for id, data in state['leads'].items() if data['status'] == 'ingested']

def update_lead_state(lead_id: str, research_context: str, state_path: Path, leads_dir: Path):
    # Update JSON state
    with open(state_path, 'r') as f:
        state = json.load(f)
    state['leads'][lead_id]['status'] = 'researched'
    with open(state_path, 'w') as f:
        json.dump(state, f, indent=2)
        
    # Update Markdown file
    md_path = leads_dir / f"{lead_id}.md"
    content = md_path.read_text()
    
    # Update status in frontmatter
    content = content.replace("status: ingested", "status: researched")
    
    # Append research context
    if "## Research Context" in content:
        content = content.replace("## Research Context", f"## Research Context\n\n{research_context}")
    else:
        content += f"\n\n## Research Context\n\n{research_context}"
        
    md_path.write_text(content)

if __name__ == "__main__":
    state_path = Path("state/pipeline.json")
    leads_dir = Path("leads")
    pending = get_leads_to_research(state_path)
    
    if not pending:
        print("No leads in 'ingested' state.")
    else:
        print(f"FOUND {len(pending)} LEADS TO RESEARCH.")
        for lead_id in pending:
            with open(state_path, 'r') as f:
                lead_data = json.load(f)['leads'][lead_id]
            print(f"\n--- RESEARCH MISSION: {lead_id} ---")
            print(f"NAME: {lead_data['first_name']} {lead_data['last_name']}")
            print(f"COMPANY: {lead_data['company']}")
            print(f"LINKEDIN: {lead_data.get('linkedin', 'N/A')}")
            print(f"WEBSITE: {lead_data.get('website', 'N/A')}")
            print(f"\nACTION: AGENT, please execute the Research Mission Protocol for this lead using Gemini 2.5 Pro. When done, provide the synthesized research block.")
