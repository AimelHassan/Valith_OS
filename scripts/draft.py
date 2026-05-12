import json
from pathlib import Path

def get_leads_to_draft(state_path: Path):
    with open(state_path, 'r') as f:
        state = json.load(f)
    return [id for id, data in state['leads'].items() if data['status'] == 'researched']

if __name__ == "__main__":
    pass
