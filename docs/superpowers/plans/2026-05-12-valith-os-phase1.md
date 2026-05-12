# Valith OS Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the file-based Truth Repository and CSV ingestion pipeline for Valith OS.

**Architecture:** A Python-based deterministic ingestion system that sets up the local file system (inbox, leads, state) for the CLI agent's subsequent autonomous research workflows.

**Tech Stack:** Python 3 (Standard Library: `csv`, `json`, `re`, `pathlib`), `pytest` for testing.

---

### Task 1: Initialize Workspace & State File

**Files:**
- Create: `state/pipeline.json`
- Create: `tests/test_state.py`

- [ ] **Step 1: Write the failing test for initial state**

```python
import json
from pathlib import Path

def test_initial_pipeline_state(tmp_path):
    # We will test the presence of the actual file
    real_path = Path("state/pipeline.json")
    assert real_path.exists(), "State file must exist"
    
    with open(real_path, "r") as f:
        data = json.load(f)
    assert "leads" in data, "State file must have a 'leads' root key"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_state.py -v`
Expected: FAIL (FileNotFoundError or assertion failure)

- [ ] **Step 3: Write minimal implementation**

```bash
mkdir -p state inbox leads scripts tests
echo '{"leads": {}}' > state/pipeline.json
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_state.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add state/pipeline.json tests/test_state.py
git commit -m "chore: initialize workspace directories and pipeline state"
```

### Task 2: CSV Ingestion Logic

**Files:**
- Create: `scripts/ingest.py`
- Modify: `tests/test_ingest.py` (Create)

- [ ] **Step 1: Write the failing test**

```python
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
    lead_id = "john-doe_acme-corp"
    assert lead_id in state_data["leads"]
    assert state_data["leads"][lead_id]["status"] == "ingested"
    
    # Verify markdown file
    md_file = leads_dir / f"{lead_id}.md"
    assert md_file.exists()
    content = md_file.read_text()
    assert "# John Doe - Acme Corp" in content
    assert "status: ingested" in content
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_ingest.py -v`
Expected: FAIL (ModuleNotFoundError: No module named 'scripts.ingest')

- [ ] **Step 3: Write minimal implementation**

```python
import csv
import json
import re
from pathlib import Path

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def ingest_csv(csv_path: Path, state_path: Path, leads_dir: Path):
    with open(state_path, 'r') as f:
        state = json.load(f)
        
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            first = row.get('First Name', '').strip()
            last = row.get('Last Name', '').strip()
            company = row.get('Company', '').strip()
            
            lead_id = slugify(f"{first}-{last}_{company}")
            
            # Update state
            state['leads'][lead_id] = {
                "first_name": first,
                "last_name": last,
                "company": company,
                "status": "ingested"
            }
            
            # Create Markdown
            md_path = leads_dir / f"{lead_id}.md"
            md_content = f"---\nstatus: ingested\n---\n# {first} {last} - {company}\n\n## Research Context\n"
            with open(md_path, 'w', encoding='utf-8') as md_file:
                md_file.write(md_content)
                
    with open(state_path, 'w') as f:
        json.dump(state, f, indent=2)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_ingest.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/ingest.py tests/test_ingest.py
git commit -m "feat: implement CSV ingestion to state and markdown"
```

### Task 3: Agent Workflow Instruction

**Files:**
- Create: `GEMINI.md`

- [ ] **Step 1: Write the failing test**

*(No automated test for documentation, but we verify its existence)*

```bash
cat GEMINI.md || echo "FAIL"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cat GEMINI.md`
Expected: FAIL (No such file or directory)

- [ ] **Step 3: Write minimal implementation**

```markdown
# Valith OS Agent Instructions

## Role
You are the logic router, researcher, and state manager for Valith OS high-value LinkedIn outreach.

## Core Directives
1. **Ingestion:** When the user provides an `apollo_export.csv` in `/inbox/`, run `python -c "from scripts.ingest import ingest_csv; from pathlib import Path; ingest_csv(Path('inbox/apollo_export.csv'), Path('state/pipeline.json'), Path('leads'))"`.
2. **Research (`ingested` -> `researched`):** For each lead in `pipeline.json` with status `ingested`, use web search to find recent company news and lead activity. Append findings to the lead's markdown file under `## Research Context`. Then, update the status in the markdown frontmatter and `pipeline.json` to `researched`.
3. **Drafting (`researched` -> `connection_pending`):** After research, generate a personalized connection request in the markdown file and update status to `connection_pending`.
4. **Follow-ups:** The user will update you when actions are taken (e.g., "Connection accepted for John Doe"). Draft subsequent DMs and update state accordingly.
5. **Consistency:** The markdown file (`/leads/*.md`) is the ultimate source of truth. Always ensure the frontmatter status matches `state/pipeline.json`.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `ls GEMINI.md`
Expected: PASS (GEMINI.md is listed)

- [ ] **Step 5: Commit**

```bash
git add GEMINI.md
git commit -m "docs: add agent workflow instructions to GEMINI.md"
```