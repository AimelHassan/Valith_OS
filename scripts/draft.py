import json
from pathlib import Path

def get_leads_to_draft(state_path: Path):
    with open(state_path, 'r') as f:
        state = json.load(f)
    return [id for id, data in state['leads'].items() if data['status'] == 'researched']

def update_lead_drafts(lead_id: str, draft_content: str, state_path: Path, leads_dir: Path):
    # Update JSON state
    with open(state_path, 'r') as f:
        state = json.load(f)
    state['leads'][lead_id]['status'] = 'drafts_ready'
    with open(state_path, 'w') as f:
        json.dump(state, f, indent=2)
        
    # Update Markdown file
    md_path = leads_dir / f"{lead_id}.md"
    content = md_path.read_text()
    
    # Update status in frontmatter
    content = content.replace("status: researched", "status: drafts_ready")
    
    # Append drafts
    if "## Outreach Drafts" in content:
        content = content.replace("## Outreach Drafts", f"## Outreach Drafts\n\n{draft_content}")
    else:
        content += f"\n\n## Outreach Drafts\n\n{draft_content}"
        
    md_path.write_text(content)

if __name__ == "__main__":
    state_path = Path("state/pipeline.json")
    leads_dir = Path("leads")
    pending = get_leads_to_draft(state_path)
    
    if not pending:
        print("No leads in 'researched' state.")
    else:
        print(f"FOUND {len(pending)} LEADS TO DRAFT.")
        for lead_id in pending:
            with open(state_path, 'r') as f:
                lead_data = json.load(f)['leads'][lead_id]
            print(f"\n--- DRAFTING MISSION: {lead_id} ---")
            print(f"NAME: {lead_data['first_name']} {lead_data['last_name']}")
            print(f"COMPANY: {lead_data['company']}")
            print(f"\nACTION: AGENT, please execute the Outreach Synthesizer Protocol (Phase 3) for this lead using Gemini 3.1 Pro. Read their markdown file to get the research context, then provide the 3-step cadence block.")
