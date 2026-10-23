# Hydrava Backend Start Script
Set-Location $PSScriptRoot
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
