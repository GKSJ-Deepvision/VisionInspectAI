from app.main import app

# This acts as an entry point for uvicorn but imports the fully configured app from app.main
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
