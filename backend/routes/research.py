from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.paper import Paper
from agents.orchestrator import orchestrate
import google.generativeai as genai

# ----------------------------
# GEMINI CONFIG
# ----------------------------

genai.configure(api_key="YOUR_GEMINI_API_KEY")

model = genai.GenerativeModel("gemini-1.5-flash")

# ----------------------------
# ROUTER
# ----------------------------

router = APIRouter(prefix="/research", tags=["Research"])

# ----------------------------
# DATABASE DEPENDENCY
# ----------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------------------
# ADD PAPER
# ----------------------------

@router.post("/add")
def add_paper(title: str, content: str, db: Session = Depends(get_db)):
    paper = Paper(title=title, content=content)
    db.add(paper)
    db.commit()
    db.refresh(paper)
    return {"message": "Paper added successfully ✅"}

# ----------------------------
# ASK QUESTION (AGENTIC FLOW)
# ----------------------------

@router.post("/ask")
def ask_question(question: str, db: Session = Depends(get_db)):

    papers = db.query(Paper).all()

    if not papers:
        raise HTTPException(status_code=404, detail="No papers found")

    combined_content = "\n\n".join([p.content for p in papers])

    # Agent Orchestration
    final_prompt = orchestrate(question, combined_content)

    try:
        response = model.generate_content(final_prompt)
        return {"answer": response.text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
