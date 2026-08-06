# ResearchPilot — Agent-Driven Research Intelligence System

Backend only. Minimal, production-ready FastAPI service that coordinates multiple local agents and calls the Gemini API via `google-generativeai`.

Quick start (Windows PowerShell)

1. Create and activate venv

```powershell
python -m venv venv
venv\Scripts\Activate.ps1
```

2. Install dependencies

```powershell
pip install -r requirements.txt
```

3. Add your Gemini API key to `.env` (or set `GENAI_API_KEY` in environment):

```
GENAI_API_KEY=YOUR_REAL_API_KEY
```

4. Run the app

```powershell
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Endpoints

- `POST /research/add` — form fields: `title`, `content`
- `GET /research/all` — returns stored papers
- `POST /research/ask` — form field: `question` — runs the multi-agent pipeline and calls Gemini

Example PowerShell requests

```powershell
# Add a paper
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/research/add' -Method Post -Body @{title='Test'; content='This is a test.'}

# List papers
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/research/all' -Method Get

# Ask a question (requires valid GENAI_API_KEY in .env)
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/research/ask' -Method Post -Body @{question='What are the main gaps in this area?'}
```
