#!/usr/bin/env python3
# scripts/build_index.py
import os, re, json
from datetime import datetime
import yaml

ART_DIR = 'articles'
OUT_FILE = 'articles.json'

def parse_front_matter(text):
    if text.startswith('---'):
        parts = text.split('---', 2)
        if len(parts) >= 3:
            fm_raw = parts[1]
            try:
                fm = yaml.safe_load(fm_raw) or {}
            except Exception as e:
                print('YAML parse error:', e)
                fm = {}
            return fm
    return {}

items = []
for fname in os.listdir(ART_DIR):
    if not fname.endswith('.md'): continue
    path = os.path.join(ART_DIR, fname)
    with open(path, 'r', encoding='utf8') as f:
        text = f.read()
    fm = parse_front_matter(text)
    slug = os.path.splitext(fname)[0]
 
    date_value = fm.get("date", "")
    if hasattr(date_value, "isoformat"):
        date_value = date_value.isoformat()

    item = {
        "slug": slug,
        "title": fm.get("title", slug),
        "date": date_value,
        "image": fm.get("image", ""),
        "thumbnail": fm.get("thumbnail", "")

    }

    items.append(item)

# sort by date desc if possible
def date_key(it):
    try:
        return datetime.fromisoformat(it['date'])
    except:
        return datetime.min

items.sort(key=date_key, reverse=True)

os.remove(OUT_FILE)

with open(OUT_FILE, 'w', encoding='utf8') as out:
    json.dump(items, out, indent=2, ensure_ascii=False)

print(f'Wrote {OUT_FILE} with {len(items)} items.')
