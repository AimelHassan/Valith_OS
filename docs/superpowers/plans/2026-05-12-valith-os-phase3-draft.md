# Valith OS Phase 3: Outreach Synthesizer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Outreach Synthesizer to generate hyper-personalized, Founder-to-Founder DMs.

**Architecture:** A Python script (`scripts/draft.py`) that identifies `researched` leads and triggers the CLI Agent to draft the 3-step outreach cadence based on the Phase 3 protocol.

**Tech Stack:** Python 3, `pytest`, Gemini CLI.

---

### Task 1: Draft Orchestrator Shell

**Files:**
- Create: `scripts/draft.py`
- Create: `tests/test_draft.py`

- [ ] **Step 1: Write the failing test for finding leads to draft**

```python
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_draft.py -v`
Expected: FAIL (ModuleNotFoundError)

- [ ] **Step 3: Write minimal implementation**

```python
import json
from pathlib import Path

def get_leads_to_draft(state_path: Path):
    with open(state_path, 'r') as f:
        state = json.load(f)
    return [id for id, data in state['leads'].items() if data['status'] == 'researched']

if __name__ == "__main__":
    pass
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_draft.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/draft.py tests/test_draft.py
git commit -m "feat: add draft orchestrator shell and lead filtering"
```

### Task 2: State Update Logic for Drafts

**Files:**
- Modify: `scripts/draft.py`
- Modify: `tests/test_draft.py`

- [ ] **Step 1: Write the failing test for updating lead state with drafts**

```python
import json
from pathlib import Path
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_draft.py -v`
Expected: FAIL (ImportError)

- [ ] **Step 3: Write minimal implementation**

```python
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_draft.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/draft.py tests/test_draft.py
git commit -m "feat: add state and markdown update logic for outreach drafts"
```

### Task 3: Agentic Draft Directive

**Files:**
- Modify: `scripts/draft.py`

- [ ] **Step 1: Add Orchestration Logic to scripts/draft.py**

Modify the `if __name__ == "__main__":` block to print instructions for the agent.

```python
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
```

- [ ] **Step 2: Verify the orchestrator output**

Run: `python scripts/draft.py`
Expected: Lists the pending leads with the "ACTION: AGENT..." instruction.

- [ ] **Step 3: Commit**

```bash
git add scripts/draft.py
git commit -m "feat: complete outreach orchestrator"
```
