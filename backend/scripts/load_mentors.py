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

# 3. Unified Logging Configuration (UTF-8)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(LOG_DIR / "mentors_ingestion.log", encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# --- SMART FILE DETECTION ---
possible_names = [
    "mentors_catalog.xlsx",
    "mentors_catalog.xlsx - Hoja2.csv",
    "mentors_catalog.csv"
]

FILENAME = None
for name in possible_names:
    if (DATA_RAW / name).exists():
        FILENAME = name
        break

DATA_PATH = DATA_RAW / FILENAME if FILENAME else DATA_RAW / possible_names[0]

def get_or_create_mentor(db: Session, code: str):
    """Checks if mentor exists; if not, creates one."""
    code = code.strip()
    query = text("SELECT id FROM mentors WHERE mentor_code = :c")
    result = db.execute(query, {"c": code}).fetchone()
    
    if result:
        return result[0], False # ID, WasCreated=False

    logger.info(f"Adding new mentor: {code}")
    db.execute(text("""
        INSERT INTO mentors (mentor_code, first_name, last_name, email, phone, department, competence_level)
        VALUES (:c, 'Mentor', :ln, :e, '000', 'General', 3)
    """), {
        "c": code, "ln": f"Code-{code}", "e": f"mentor_{code.lower()}@company.com"
    })
    db.commit()
    return db.execute(query, {"c": code}).fetchone()[0], True

def get_or_create_course(db: Session, title: str):
    """Checks if course exists; if not, creates one."""
    title = title.strip()
    if not title or title.lower() == 'nan': return None, False
    
    query = text("SELECT id FROM courses WHERE title = :t")
    result = db.execute(query, {"t": title}).fetchone()
    
    if result:
        return result[0], False

    logger.info(f"Defining new course module: {title}")
    db.execute(text("""
        INSERT INTO courses (title, department, skill_level)
        VALUES (:t, 'Technology', 'intermediate')
    """), {"t": title})
    db.commit()
    return db.execute(query, {"t": title}).fetchone()[0], True

def link_mentor_to_course(db: Session, mentor_id: int, course_id: int):
    """Creates the link in the bridge table ONLY if it doesn't exist."""
    check = text("SELECT * FROM course_mentors WHERE mentor_id = :m AND course_id = :c")
    if db.execute(check, {"m": mentor_id, "c": course_id}).fetchone():
        return False # Already exists

    db.execute(text("INSERT INTO course_mentors (mentor_id, course_id) VALUES (:m, :c)"),
               {"m": mentor_id, "c": course_id})
    db.commit()
    return True

def load_mentors():
    if not DATA_PATH.exists():
        logger.error(f"File not found in {DATA_RAW}. Please ensure the file is there.")
        logger.info(f"Files found in folder: {[f.name for f in DATA_RAW.iterdir()]}")
        return

    db = SessionLocal()
    m_added, c_added, l_added, l_skipped = 0, 0, 0, 0

    try:
        logger.info(f"Processing Mentor Catalog: {FILENAME}")
        df = pd.read_csv(DATA_PATH) if DATA_PATH.suffix == '.csv' else pd.read_excel(DATA_PATH)
        df.columns = df.columns.str.strip() # Remove trailing spaces from headers
        
        # Column names from your file
        col_tutor = 'Tutor'
        col_skills = 'Tecnología - Módulos individuales de Formación'

        for _, row in df.iterrows():
            tutor_code = str(row[col_tutor]).strip()
            if not tutor_code or tutor_code.lower() == 'nan': continue

            # Handle Mentor
            mentor_id, created_m = get_or_create_mentor(db, tutor_code)
            if created_m: m_added += 1

            # Handle Skills/Courses (Split by comma, semicolon or newline)
            skills_raw = str(row[col_skills])
            skills = [s.strip() for s in skills_raw.replace(';', ',').replace('\n', ',').split(',')]

            for skill in skills:
                course_id, created_c = get_or_create_course(db, skill)
                if created_c: c_added += 1

                if course_id:
                    if link_mentor_to_course(db, mentor_id, course_id):
                        l_added += 1
                    else:
                        l_skipped += 1

        logger.info(f"Summary: {m_added} Mentors, {c_added} Courses, {l_added} Links created.")
        logger.info(f"Duplicates: {l_skipped} relationships skipped.")
        
        shutil.move(str(DATA_PATH), DATA_PROCESSED / FILENAME)
        logger.info(f"[SUCCESS] File moved to {DATA_PROCESSED}")

    except Exception as e:
        logger.error(f"[FATAL] Mentor Ingestion failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    load_mentors()