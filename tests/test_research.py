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
