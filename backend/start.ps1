# Hydrava Backend Start Script
$python = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $python)) {
    throw "Backend virtual environment not found. Create it in the backend folder and install requirements first."
}

Set-Location $PSScriptRoot
& $python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
