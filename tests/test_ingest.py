import json
import os
from pathlib import Path
import pytest
from scripts.ingest import ingest_csv

def test_ingest_csv(tmp_path):
    # Setup mock inbox and state
    inbox_dir = tmp_path / "inbox"
    state_dir = tmp_path / "state"
    leads_dir = tmp_path / "leads"
    inbox_dir.mkdir()
    state_dir.mkdir()
    leads_dir.mkdir()
    
    state_file = state_dir / "pipeline.json"
    state_file.write_text('{"leads": {}}')
    
    csv_file = inbox_dir / "apollo_export.csv"
    csv_file.write_text("First Name,Last Name,Company\nJohn,Doe,Acme Corp")
    
    # Execute
    ingest_csv(csv_file, state_file, leads_dir)
    
    # Verify state
    state_data = json.loads(state_file.read_text())
    lead_id = "john-doe-acme-corp"
    assert lead_id in state_data["leads"]
    assert state_data["leads"][lead_id]["status"] == "ingested"
    
    # Verify markdown file
    md_file = leads_dir / f"{lead_id}.md"
    assert md_file.exists()
    content = md_file.read_text()
    assert "# John Doe - Acme Corp" in content
    assert "status: ingested" in content
