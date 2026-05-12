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
