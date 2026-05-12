import json
from pathlib import Path
import pytest
from scripts.research import get_leads_to_research

def test_get_leads_to_research(tmp_path):
    state_file = tmp_path / "pipeline.json"
    state_file.write_text(json.dumps({
        "leads": {
            "lead-1": {"status": "ingested"},
            "lead-2": {"status": "researched"},
            "lead-3": {"status": "ingested"}
        }
    }))
    
    leads = get_leads_to_research(state_file)
    assert len(leads) == 2
    assert "lead-1" in leads
    assert "lead-3" in leads

from scripts.research import update_lead_state

def test_update_lead_state(tmp_path):
    state_file = tmp_path / "pipeline.json"
    state_file.write_text(json.dumps({
        "leads": {
            "john-doe": {"status": "ingested"}
        }
    }))
    
    leads_dir = tmp_path / "leads"
    leads_dir.mkdir()
    md_file = leads_dir / "john-doe.md"
    md_file.write_text("---\nstatus: ingested\n---\n# John Doe\n\n## Research Context\n")
    
    research_content = "Found deep interest in AI agents."
    update_lead_state("john-doe", research_content, state_file, leads_dir)
    
    # Verify state file
    with open(state_file, 'r') as f:
        state = json.load(f)
    assert state['leads']['john-doe']['status'] == "researched"
    
    # Verify markdown file
    content = md_file.read_text()
    assert "status: researched" in content
    assert research_content in content
