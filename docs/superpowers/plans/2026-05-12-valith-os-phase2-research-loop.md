# Valith OS Phase 2: Deep Research Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the autonomous research loop using Gemini 2.5 Pro for deep research and LinkedIn intelligence.

**Architecture:** A Python orchestrator (`scripts/research.py`) that identifies `ingested` leads and triggers the CLI Agent (Gemini 3.1 Pro/2.5 Pro) to perform the actual research mission using its built-in tools (`google_web_search`, `web_fetch`).

**Tech Stack:** Python 3, `pytest`, Gemini CLI (Internal Tools).

---

### Task 1: Research Orchestrator Shell

**Files:**
- Create: `scripts/research.py`
- Create: `tests/test_research.py`

- [ ] **Step 1: Write the failing test for finding leads to research**

```python
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_research.py -v`
Expected: FAIL (ModuleNotFoundError)

- [ ] **Step 3: Write minimal implementation**

```python
import json
from pathlib import Path

def get_leads_to_research(state_path: Path):
    with open(state_path, 'r') as f:
        state = json.load(f)
    return [id for id, data in state['leads'].items() if data['status'] == 'ingested']

if __name__ == "__main__":
    # Placeholder for the main loop
    pass
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_research.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/research.py tests/test_research.py
git commit -m "feat: add research orchestrator shell and lead filtering"
```

### Task 2: State Update Logic

**Files:**
- Modify: `scripts/research.py`
- Modify: `tests/test_research.py`

- [ ] **Step 1: Write the failing test for updating lead state**

```python
import json
from pathlib import Path
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_research.py -v`
Expected: FAIL (ImportError or AttributeError)

- [ ] **Step 3: Write minimal implementation**

```python
import re

def update_lead_state(lead_id: str, research_context: str, state_path: Path, leads_dir: Path):
    # Update JSON state
    with open(state_path, 'r') as f:
        state = json.load(f)
    state['leads'][lead_id]['status'] = 'researched'
    with open(state_path, 'w') as f:
        json.dump(state, f, indent=2)
        
    # Update Markdown file
    md_path = leads_dir / f"{lead_id}.md"
    content = md_path.read_text()
    
    # Update status in frontmatter
    content = content.replace("status: ingested", "status: researched")
    
    # Append research context
    if "## Research Context" in content:
        content = content.replace("## Research Context", f"## Research Context\n\n{research_context}")
    else:
        content += f"\n\n## Research Context\n\n{research_context}"
        
    md_path.write_text(content)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_research.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/research.py tests/test_research.py
git commit -m "feat: add state and markdown update logic for research"
```

### Task 3: Agentic Research Directive

**Files:**
- Modify: `GEMINI.md`
- Modify: `scripts/research.py`

- [ ] **Step 1: Define the Research Mission in GEMINI.md**

Update `GEMINI.md` to include a specific protocol for the "Research Mission".

```markdown
## Research Mission Protocol (Phase 2)
When the user or `scripts/research.py` asks you to "Execute Research Mission" for a lead:
1.  **Identify Goals:** Find lead's LinkedIn profile, company website, and recent news/posts.
2.  **Search:** Use `google_web_search` with queries like `site:linkedin.com/in/ "Name"`, `"[Company] news 2026"`, etc.
3.  **Fetch:** Use `web_fetch` on the top 2-3 most relevant results.
4.  **Synthesize:** Extract:
    *   3-4 specific high-value observations (pain points, hiring, new products).
    *   Lead's recent public activity or career milestones.
    *   A "Relevance Score" (1-10).
5.  **Report:** Return ONLY the synthesized research block (no chat filler) so it can be ingested by the script.
```

- [ ] **Step 2: Add Orchestration Logic to scripts/research.py**

Modify the `if __name__ == "__main__":` block to print instructions for the agent.

```python
if __name__ == "__main__":
    state_path = Path("state/pipeline.json")
    leads_dir = Path("leads")
    pending = get_leads_to_research(state_path)
    
    if not pending:
        print("No leads in 'ingested' state.")
    else:
        print(f"FOUND {len(pending)} LEADS TO RESEARCH.")
        for lead_id in pending:
            with open(state_path, 'r') as f:
                lead_data = json.load(f)['leads'][lead_id]
            print(f"\n--- RESEARCH MISSION: {lead_id} ---")
            print(f"NAME: {lead_data['first_name']} {lead_data['last_name']}")
            print(f"COMPANY: {lead_data['company']}")
            print(f"LINKEDIN: {lead_data.get('linkedin', 'N/A')}")
            print(f"WEBSITE: {lead_data.get('website', 'N/A')}")
            print(f"\nACTION: AGENT, please execute the Research Mission Protocol for this lead using Gemini 2.5 Pro. When done, provide the synthesized research block.")
```

- [ ] **Step 3: Verify the orchestrator output**

Run: `python scripts/research.py`
Expected: Lists the pending leads with the "ACTION: AGENT..." instruction.

- [ ] **Step 4: Commit**

```bash
git add scripts/research.py GEMINI.md
git commit -m "feat: complete research orchestrator and update agent mission protocol"
```
