# backend/app/main.py (Updated)
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from .database import get_db, engine
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Human-AI Sync Analytics API")

# CORS Configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "success", "message": "Human-AI Sync API is Live"}

@app.get("/db-test")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        # Perform a simple query to check the connection
        db.execute(text("SELECT 1"))
        return {"status": "success", "message": "Database connection is active"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

