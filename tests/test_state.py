import json
from pathlib import Path

def test_initial_pipeline_state():
    # We will test the presence of the actual file
    real_path = Path("state/pipeline.json")
    assert real_path.exists(), "State file must exist"
    
    with open(real_path, "r") as f:
        data = json.load(f)
    assert "leads" in data, "State file must have a 'leads' root key"
