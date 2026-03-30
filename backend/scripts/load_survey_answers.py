import pandas as pd
import logging
import os
import sys  # Added this
from pathlib import Path  # Added this
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text

# Add the parent directory (backend) to the Python path
sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.database import SessionLocal, engine

# Ensure you are in the backend directory when running this
# or add the path to sys.path


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# --- CONFIGURATION ---
# This finds the project root (human-ai-sync-analytics) automatically
ROOT_DIR = Path(__file__).resolve().parents[2] 
DATA_PATH = ROOT_DIR / "data" / "raw" / "survey_raw.xlsx"

# If you are using the CSV you just uploaded, change the line above to:
# DATA_PATH = ROOT_DIR / "data" / "raw" / "survey_raw.xlsx - Sheet1.csv"

CAMPAIGN_TITLE = "Scalian AI Adoption - Wave T0"
CAMPAIGN_WAVE = "t0"


def get_or_create_campaign(db: Session):
    """Ensures there is an active campaign to link the responses to."""
    query = text("SELECT id FROM survey_campaigns WHERE wave = :wave LIMIT 1")
    result = db.execute(query, {"wave": CAMPAIGN_WAVE}).fetchone()
    
    if result:
        return result[0]
    
    insert_query = text("""
        INSERT INTO survey_campaigns (title, wave, is_active) 
        VALUES (:title, :wave, True)
    """)
    db.execute(insert_query, {"title": CAMPAIGN_TITLE, "wave": CAMPAIGN_WAVE})
    db.commit()
    
    result = db.execute(query, {"wave": CAMPAIGN_WAVE}).fetchone()
    return result[0]

def get_or_create_employee(db: Session, row: pd.Series):
    """Checks if employee exists; if not, creates one with invented data."""
    code = str(row['id_empleado']).strip()
    
    query = text("SELECT id FROM employees WHERE employee_code = :code")
    result = db.execute(query, {"code": code}).fetchone()
    
    if result:
        return result[0]
    
    # Inventing data for new employees to satisfy NOT NULL constraints
    logger.info(f"Creating placeholder for new employee: {code}")
    insert_query = text("""
        INSERT INTO employees (
            employee_code, first_name, last_name, email, phone, 
            age, gender, department, years_in_company, education_level, technical_role
        ) VALUES (
            :code, :fname, :lname, :email, :phone, 
            :age, :gender, :dept, :years, :edu, :tech
        )
    """)
    
    db.execute(insert_query, {
        "code": code,
        "fname": "User", 
        "lname": f"Code-{code}",
        "email": f"{code.lower()}@company.com", # Invented email
        "phone": "000-000-000",
        "age": int(row.get('edad', 0)) if pd.notna(row.get('edad')) else None,
        "gender": row.get('genero'),
        "dept": row.get('departamento'),
        "years": int(row.get('antiguedad_empresa', 0)) if pd.notna(row.get('antiguedad_empresa')) else None,
        "edu": row.get('nivel_educativo'),
        "tech": bool(row.get('rol_tecnico', False))
    })
    db.commit()
    
    result = db.execute(query, {"code": code}).fetchone()
    return result[0]

def load_data():
    # 1. Load Data
    try:
        # Path objects use .suffix to check extensions (e.g., '.csv', '.xlsx')
        if DATA_PATH.suffix.lower() == '.csv':
            logger.info(f"Reading CSV file: {DATA_PATH}")
            df = pd.read_csv(DATA_PATH)
        else:
            logger.info(f"Reading Excel file: {DATA_PATH}")
            df = pd.read_excel(DATA_PATH)
    except Exception as e:
        logger.error(f"Could not read file: {e}")
        return

    # ... rest of your code
    db = SessionLocal()
    try:
        campaign_id = get_or_create_campaign(db)
        logger.info(f"Using Campaign ID: {campaign_id}")

        for index, row in df.iterrows():
            try:
                # 2. Handle Employee
                employee_id = get_or_create_employee(db, row)

                # 3. Create Survey Response (Header)
                # Combine open feedback columns
                feedback = f"Positivo: {row.get('open_positive_experience', '')}. Dificultades: {row.get('open_difficulties_and_training_needs', '')}"
                
                resp_query = text("""
                    INSERT INTO survey_responses (
                        employee_id, campaign_id, ai_usage_frequency, 
                        uses_chatgpt, uses_copilot, prefers_human_vs_ai, open_feedback
                    ) VALUES (:emp_id, :camp_id, :freq, :gpt, :cpt, :pref, :feed)
                """)
                
                db.execute(resp_query, {
                    "emp_id": employee_id,
                    "camp_id": campaign_id,
                    "freq": row.get('frecuencia_uso_ia'),
                    "gpt": bool(row.get('usa_chatgpt', False)),
                    "cpt": bool(row.get('usa_copilot', False)),
                    "pref": row.get('prefiere_humano_vs_ia'),
                    "feed": feedback
                })
                
                # Get the last inserted ID for the response
                response_id = db.execute(text("SELECT LAST_INSERT_ID()")).fetchone()[0]

                # 4. Create Psychological Items (Scores)
                item_query = text("""
                    INSERT INTO survey_psychological_items (
                        response_id, at1_performance, at2_learning, at3_ease_of_use, at4_positive_integration,
                        ae1_problem_solving, ae2_digital_confidence, ae3_effective_use, ae4_application_safety,
                        m1_stimulating, m2_interest, m3_value, m4_effort,
                        e1_adaptation, e2_feedback, e3_applicability, e4_pace,
                        d1_skills, d2_challenges, d3_expansion, d4_autonomous_learning,
                        c1_trust_no_verify, c2_diff_no_ai, c3_critical_thinking, c4_quality_reflection
                    ) VALUES (
                        :rid, :at1, :at2, :at3, :at4, :ae1, :ae2, :ae3, :ae4, :m1, :m2, :m3, :m4,
                        :e1, :e2, :e3, :e4, :d1, :d2, :d3, :d4, :c1, :c2, :c3, :c4
                    )
                """)
                
                db.execute(item_query, {
                    "rid": response_id,
                    "at1": row.get('AT1_rendimiento'), "at2": row.get('AT2_facilita_aprendizaje'), 
                    "at3": row.get('AT3_facilidad_uso'), "at4": row.get('AT4_integracion_positiva'),
                    "ae1": row.get('AE1_resolver_problemas'), "ae2": row.get('AE2_confianza_digital'), 
                    "ae3": row.get('AE3_uso_eficaz'), "ae4": row.get('AE4_seguridad_aplicacion'),
                    "m1": row.get('M1_estimulante'), "m2": row.get('M2_aumenta_interes'), 
                    "m3": row.get('M3_aporta_valor'), "m4": row.get('M4_mayor_esfuerzo'),
                    "e1": row.get('E1_adaptacion'), "e2": row.get('E2_feedback_util'), 
                    "e3": row.get('E3_aplicable_trabajo'), "e4": row.get('E4_aprendizaje_ritmo'),
                    "d1": row.get('D1_mejora_competencias'), "d2": row.get('D2_preparado_retos'), 
                    "d3": row.get('D3_amplia_habilidades'), "d4": row.get('D4_aprendizaje_autonomo'),
                    "c1": row.get('C1_confio_sin_verificar'), "c2": row.get('C2_dificil_sin_ia'), 
                    "c3": row.get('C3_pensamiento_critico'), "c4": row.get('C4_reflexiono_calidad')
                })
                
                db.commit()
                logger.info(f"Successfully loaded survey for {row['id_empleado']}")

            except Exception as row_error:
                db.rollback()
                logger.error(f"Error processing row {index} ({row['id_empleado']}): {row_error}")

    finally:
        db.close()
        logger.info("Database connection closed.")

if __name__ == "__main__":
    load_data()