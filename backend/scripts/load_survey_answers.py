import pandas as pd
import logging
import os
import sys
import shutil
from pathlib import Path
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text

# 1. Setup Paths
ROOT_DIR = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT_DIR / "backend"))

from app.database import SessionLocal, engine

# 2. Configuration & Folder Setup
DATA_RAW = ROOT_DIR / "data" / "raw"
DATA_PROCESSED = ROOT_DIR / "data" / "processed"
DATA_ERROR = ROOT_DIR / "data" / "error"
LOG_DIR = ROOT_DIR / "logs"

for folder in [DATA_PROCESSED, DATA_ERROR, LOG_DIR]:
    folder.mkdir(parents=True, exist_ok=True)

# 3. FIXED: Unified Logging with UTF-8 Encoding
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        # Added encoding='utf-8' here to fix the Windows error
        logging.FileHandler(LOG_DIR / "ingestion.log", encoding='utf-8'), 
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# --- FILE CONFIGURATION ---
FILENAME_XLSX = "survey_raw.xlsx"
FILENAME_CSV = "survey_raw.xlsx - Sheet1.csv"

if (DATA_RAW / FILENAME_XLSX).exists():
    FILENAME = FILENAME_XLSX
elif (DATA_RAW / FILENAME_CSV).exists():
    FILENAME = FILENAME_CSV
else:
    FILENAME = FILENAME_XLSX

DATA_PATH = DATA_RAW / FILENAME
CAMPAIGN_TITLE = "Scalian AI Adoption - Wave T0"
CAMPAIGN_WAVE = "t0"

def get_or_create_campaign(db: Session):
    query = text("SELECT id FROM survey_campaigns WHERE wave = :wave LIMIT 1")
    result = db.execute(query, {"wave": CAMPAIGN_WAVE}).fetchone()
    if result: return result[0]
    
    db.execute(text("INSERT INTO survey_campaigns (title, wave) VALUES (:t, :w)"), 
               {"t": CAMPAIGN_TITLE, "w": CAMPAIGN_WAVE})
    db.commit()
    return db.execute(query, {"wave": CAMPAIGN_WAVE}).fetchone()[0]

def get_or_create_employee(db: Session, row: pd.Series):
    code = str(row['id_empleado']).strip()
    query = text("SELECT id FROM employees WHERE employee_code = :code")
    result = db.execute(query, {"code": code}).fetchone()
    if result: return result[0]

    db.execute(text("""
        INSERT INTO employees (employee_code, first_name, last_name, email, phone, age, gender, department, technical_role)
        VALUES (:c, 'User', :ln, :e, '000', :a, :g, :d, :t)
    """), {
        "c": code, "ln": f"Code-{code}", "e": f"{code.lower()}@company.com",
        "a": int(row.get('edad', 0)) if pd.notna(row.get('edad')) else None,
        "g": row.get('genero'), "d": row.get('departamento'),
        "t": bool(row.get('rol_tecnico', False))
    })
    db.commit()
    return db.execute(query, {"code": code}).fetchone()[0]

def load_data():
    if not DATA_PATH.exists():
        logger.error(f"File not found: {DATA_PATH}")
        return

    db = SessionLocal()
    success_count = 0
    duplicate_count = 0
    error_count = 0

    try:
        df = pd.read_csv(DATA_PATH) if DATA_PATH.suffix == '.csv' else pd.read_excel(DATA_PATH)
        campaign_id = get_or_create_campaign(db)

        for index, row in df.iterrows():
            try:
                emp_id = get_or_create_employee(db, row)
                
                check_query = text("SELECT id FROM survey_responses WHERE employee_id = :e AND campaign_id = :c")
                if db.execute(check_query, {"e": emp_id, "c": campaign_id}).fetchone():
                    duplicate_count += 1
                    continue

                db.execute(text("""
                    INSERT INTO survey_responses (employee_id, campaign_id, ai_usage_frequency, open_feedback)
                    VALUES (:e, :c, :f, :o)
                """), {
                    "e": emp_id, "c": campaign_id, "f": row.get('frecuencia_uso_ia'),
                    "o": f"Positivo: {row.get('open_positive_experience','')}"
                })
                res_id = db.execute(text("SELECT LAST_INSERT_ID()")).fetchone()[0]

                db.execute(text("""
                    INSERT INTO survey_psychological_items (response_id, at1_performance, at2_learning, ae1_problem_solving, m1_stimulating)
                    VALUES (:r, :a1, :a2, :ae1, :m1)
                """), {
                    "r": res_id, "a1": row.get('AT1_rendimiento'), "a2": row.get('AT2_facilita_aprendizaje'),
                    "ae1": row.get('AE1_resolver_problemas'), "m1": row.get('M1_estimulante')
                })
                
                db.commit()
                success_count += 1

            except Exception as e:
                db.rollback()
                error_count += 1
                logger.error(f"Row {index} failed: {e}")

        logger.info(f"Summary: {success_count} added, {duplicate_count} skipped (duplicates), {error_count} errors.")

        # --- File Movement Logic (Using standard text tags) ---
        if error_count == 0:
            shutil.move(str(DATA_PATH), DATA_PROCESSED / FILENAME)
            logger.info(f"[SUCCESS] File moved to: {DATA_PROCESSED}")
        else:
            logger.warning(f"[WARNING] Finished with {error_count} errors. File remains in raw/.")

    except Exception as e:
        logger.error(f"[FATAL] Error during processing: {e}")
        if DATA_PATH.exists():
            shutil.move(str(DATA_PATH), DATA_ERROR / FILENAME)
    finally:
        db.close()

if __name__ == "__main__":
    load_data()