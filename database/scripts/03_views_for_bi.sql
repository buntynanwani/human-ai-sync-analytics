USE ai_adoption_tracker;

-- 1. View for Survey Analysis
-- This combines Employee info, Survey Metadata, and all Psychological Scores
CREATE OR REPLACE VIEW v_survey_analysis AS
SELECT 
    e.employee_code,
    e.department,
    e.age,
    e.gender,
    e.years_in_company,
    e.education_level,
    sr.ai_usage_frequency,
    sr.uses_chatgpt,
    sr.uses_copilot,
    sr.prefers_human_vs_ai,
    sr.open_feedback,
    c.wave as campaign_wave,
    spi.at1_performance,
    spi.at2_learning,
    spi.at3_ease_of_use,
    spi.at4_positive_integration,
    spi.ae1_problem_solving,
    spi.ae2_digital_confidence,
    spi.ae3_effective_use,
    spi.ae4_application_safety,
    spi.m1_stimulating,
    spi.m2_interest,
    spi.m3_value,
    spi.m4_effort,
    spi.e1_adaptation,
    spi.e2_feedback,
    spi.e3_applicability,
    spi.e4_pace,
    spi.d1_skills,
    spi.d2_challenges,
    spi.d3_expansion,
    spi.d4_autonomous_learning,
    spi.c1_trust_no_verify,
    spi.c2_diff_no_ai,
    spi.c3_critical_thinking,
    spi.c4_quality_reflection
FROM employees e
JOIN survey_responses sr ON e.id = sr.employee_id
JOIN survey_campaigns c ON sr.campaign_id = c.id
JOIN survey_psychological_items spi ON sr.id = spi.response_id;

-- 2. View for Mentor Catalog
-- This shows which mentors are specialized in which courses
CREATE OR REPLACE VIEW v_mentor_specializations AS
SELECT 
    m.mentor_code,
    m.department as mentor_department,
    m.competence_level,
    co.title as course_title,
    co.department as course_category,
    co.skill_level as course_difficulty
FROM mentors m
JOIN course_mentors cm ON m.id = cm.mentor_id
JOIN courses co ON cm.course_id = co.id;