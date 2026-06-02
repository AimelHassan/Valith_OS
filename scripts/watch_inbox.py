import time
import os
import json
import shutil
from pathlib import Path
from scripts.ingest import ingest_csv
from scripts.research import run_research
from scripts.draft import run_drafting, export_aggregated_state

def watch_loop():
    inbox_dir = Path("inbox")
    processed_dir = inbox_dir / "processed"
    state_path = Path("state/pipeline.json")
    leads_dir = Path("leads")

    inbox_dir.mkdir(exist_ok=True)
    processed_dir.mkdir(exist_ok=True)
    leads_dir.mkdir(exist_ok=True)

    print("====================================================")
    print("VALITH OS — OPERATIONS WATCHDOG ACTIVE")
    print(f"Monitoring '{inbox_dir}' for Apollo CSV files...")
    print("====================================================")

    while True:
        try:
            # Look for CSV files in inbox (excluding subdirectories)
            csv_files = [p for p in inbox_dir.iterdir() if p.is_file() and p.suffix.lower() == '.csv']
            
            for csv_file in csv_files:
                print(f"\n[DETECTED NEW EXPORT] Processing: {csv_file.name}")
                
                # Step 1: Ingest
                print("Running Step 1: Ingesting contacts into pipeline state...")
                ingest_csv(csv_file, state_path, leads_dir)
                
                # Step 2: Research (Phase 2 Discovery Engine)
                print("Running Step 2: Running Discovery Engine research...")
                run_research()
                
                # Step 3: Draft (Phase 3 Outreach Synthesizer)
                print("Running Step 3: Running Outreach Synthesizer and Personalization...")
                run_drafting()

                # Archive processed file
                dest = processed_dir / csv_file.name
                # Handle filename collisions in processed folder
                if dest.exists():
                    dest = processed_dir / f"{csv_file.stem}_{int(time.time())}{csv_file.suffix}"
                
                shutil.move(str(csv_file), str(dest))
                print(f"✓ Completed pipeline. File archived to: {dest.relative_to(Path.cwd())}")
                
                # Generate final sync state
                export_aggregated_state()

        except Exception as e:
            print(f"✗ Watchdog error encountered: {e}")

        # Poll every 5 seconds
        time.sleep(5)

if __name__ == "__main__":
    watch_loop()
