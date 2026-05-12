import json
from pathlib import Path
import pytest
from scripts.draft import get_leads_to_draft

def test_get_leads_to_draft(tmp_path):
    state_file = tmp_path / "pipeline.json"
    state_file.write_text(json.dumps({
        "leads": {
            "lead-1": {"status": "researched"},
            "lead-2": {"status": "ingested"},
            "lead-3": {"status": "researched"}
        }
    }))
    
    leads = get_leads_to_draft(state_file)
    assert len(leads) == 2
    assert "lead-1" in leads
    assert "lead-3" in leads

from scripts.draft import update_lead_drafts

def test_update_lead_drafts(tmp_path):
    state_file = tmp_path / "pipeline.json"
    state_file.write_text(json.dumps({
        "leads": {
            "john-doe": {"status": "researched"}
        }
    }))
    
    leads_dir = tmp_path / "leads"
    leads_dir.mkdir()
    md_file = leads_dir / "john-doe.md"
    md_file.write_text("---\nstatus: researched\n---\n# John Doe\n\n## Research Context\nSome research.")
    
    draft_content = "**Step 1:** Salam John..."
    update_lead_drafts("john-doe", draft_content, state_file, leads_dir)
    
    # Verify state file
    with open(state_file, 'r') as f:
        state = json.load(f)
    assert state['leads']['john-doe']['status'] == "drafts_ready"
    
    # Verify markdown file
    content = md_file.read_text()
    assert "status: drafts_ready" in content
    assert draft_content in content
