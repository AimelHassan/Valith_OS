import csv
import json
import re
from pathlib import Path

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9_]+', '-', text)
    return text.strip('-')

def ingest_csv(csv_path: Path, state_path: Path, leads_dir: Path):
    with open(state_path, 'r') as f:
        state = json.load(f)
        
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            first = row.get('First Name', '').strip()
            last = row.get('Last Name', '').strip()
            # Try 'Company Name' (Apollo) then fallback to 'Company'
            company = (row.get('Company Name') or row.get('Company') or '').strip()
            linkedin = row.get('Person Linkedin Url', '').strip()
            website = row.get('Website', '').strip()
            
            # Create a clean ID
            lead_id = slugify(f"{first}-{last}-{company}")
            
            # Update state
            state['leads'][lead_id] = {
                "first_name": first,
                "last_name": last,
                "company": company,
                "linkedin": linkedin,
                "website": website,
                "status": "ingested"
            }
            
            # Create Markdown
            md_path = leads_dir / f"{lead_id}.md"
            md_content = f"---\nstatus: ingested\nlinkedin: {linkedin}\nwebsite: {website}\n---\n# {first} {last} - {company}\n\n## Research Context\n"
            with open(md_path, 'w', encoding='utf-8') as md_file:
                md_file.write(md_content)
                
    with open(state_path, 'w') as f:
        json.dump(state, f, indent=2)
