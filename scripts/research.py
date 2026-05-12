import json
from pathlib import Path

def get_leads_to_research(state_path: Path):
    with open(state_path, 'r') as f:
        state = json.load(f)
    return [id for id, data in state['leads'].items() if data['status'] == 'ingested']

if __name__ == "__main__":
    # Placeholder for the main loop
    pass
