import pandas as pd
import logging
import sys
import shutil
from pathlib import Path
from sqlalchemy.orm import Session
from sqlalchemy import text

# 1. Setup Paths
ROOT_DIR = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT_DIR / "backend"))

from app.database import SessionLocal

# 2. Configuration & Folder Setup
DATA_RAW = ROOT_DIR / "data" / "raw"
DATA_PROCESSED = ROOT_DIR / "data" / "processed"
LOG_DIR = ROOT_DIR / "logs"

for folder in [DATA_PROCESSED, LOG_DIR]:
    folder.mkdir(parents=True, exist_ok=True)

# 3. Logging Configuration (UTF-8)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(LOG_DIR / "courses_ingestion.log", encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# --- SMART FILE DETECTION ---
possible_names = [
    "courses_catalog.xlsx - Hoja1.csv",
    "courses_catalog.xlsx",
    "courses_catalog.csv"
]

FILENAME = None
for name in possible_names:
    if (DATA_RAW / name).exists():
        FILENAME = name
        break

DATA_PATH = DATA_RAW / FILENAME if FILENAME else DATA_RAW / possible_names[0]

def get_skill_level(title: str) -> str:
    """Guess skill level based on course title keywords."""
    t = title.lower()
    if any(word in t for word in ['intro', 'básico', 'basic', 'principios']):
        return 'beginner'
    if any(word in t for word in ['advanced', 'avanzado', 'expert', 'deep dive']):
        return 'advanced'
    return 'intermediate'

def load_courses():
    if not DATA_PATH.exists():
        logger.error(f"File not found in {DATA_RAW}. Ensure courses_catalog is present.")
        return

    db = SessionLocal()
    added_count = 0
    skipped_count = 0

    try:
        logger.info(f"Processing Courses Catalog: {FILENAME}")
        df = pd.read_csv(DATA_PATH) if DATA_PATH.suffix == '.csv' else pd.read_excel(DATA_PATH)
        
        # Clean headers
        df.columns = df.columns.str.strip()
        
        # Mapping: Programas Completos -> Department, Descripcion -> Title
        col_dept = 'Programas Completos'
        col_title = 'Descripcion'

        for _, row in df.iterrows():
            title = str(row.get(col_title, "")).strip()
            dept = str(row.get(col_dept, "General")).strip()
            
            if not title or title.lower() == 'nan':
                continue

            # --- IDEMPOTENCY CHECK ---
            check_query = text("SELECT id FROM courses WHERE title = :t")
            if db.execute(check_query, {"t": title}).fetchone():
                skipped_count += 1
                continue

            # Insert new course
            level = get_skill_level(title)
            db.execute(text("""
                INSERT INTO courses (title, department, skill_level)
                VALUES (:t, :d, :l)
            """), {"t": title, "d": dept, "l": level})
            db.commit()
            added_count += 1
            logger.info(f"Added course: {title} ({level})")

        logger.info(f"Summary: {added_count} Courses added, {skipped_count} skipped (duplicates).")
        
        # Move file to processed
        shutil.move(str(DATA_PATH), DATA_PROCESSED / FILENAME)
        logger.info(f"[SUCCESS] Courses catalog moved to {DATA_PROCESSED}")

    except Exception as e:
        logger.error(f"[FATAL] Course Ingestion failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    load_courses()