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
    pass
