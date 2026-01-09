# Domain

frezafoltran.github.io

# Start http server

python -m http.server 8000

# Update article list

python scripts/build_index.py

# Venv to parse articles

python -m venv venv
source venv/bin/activate
pip install pyyaml
