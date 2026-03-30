-- =========================================================================
-- SURVEY PSYCHOLOGICAL ITEMS
-- Stores the raw 1-7 Likert scale results for each dimension.
-- =========================================================================
CREATE TABLE survey_psychological_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    response_id INT UNIQUE NOT NULL, -- Links directly to the response header
    
    -- Acceptance (AT)
    at1_performance INT COMMENT 'AI improves professional performance',
    at2_learning INT COMMENT 'AI facilitates learning processes',
    at3_ease_of_use INT COMMENT 'It is easy to learn to use AI',
    at4_positive_integration INT COMMENT 'Integrating AI is positive for the company',
    
    -- Self-Efficacy (AE)
    ae1_problem_solving INT COMMENT 'Confidence in solving problems with AI',
    ae2_digital_confidence INT COMMENT 'General digital confidence',
    ae3_effective_use INT COMMENT 'Effective use of AI tools',
    ae4_application_safety INT COMMENT 'Security in applying AI to tasks',
    
    -- Motivation (M)
    m1_stimulating INT COMMENT 'AI is stimulating for work',
    m2_interest INT COMMENT 'AI increases interest in tasks',
    m3_value INT COMMENT 'AI adds value to my professional profile',
    m4_effort INT COMMENT 'Willingness to put effort into learning AI',
    
    -- Experience (E)
    e1_adaptation INT COMMENT 'Quick adaptation to AI tools',
    e2_feedback INT COMMENT 'AI feedback is useful for learning',
    e3_applicability INT COMMENT 'AI is applicable to my daily work',
    e4_pace INT COMMENT 'Learning AI at my own pace',
    
    -- Development (D)
    d1_skills INT COMMENT 'AI has improved my professional skills',
    d2_challenges INT COMMENT 'Better prepared for new challenges',
    d3_expansion INT COMMENT 'AI expanded technical/cognitive skills',
    d4_autonomous_learning INT COMMENT 'Strengthened autonomous learning',
    
    -- Criticality / Dependency (C)
    -- Remember: C3 and C4 will be stored RAW; handled via DAX/Logic later.
    c1_trust_no_verify INT COMMENT 'Trusting AI without verifying',
    c2_diff_no_ai INT COMMENT 'Difficulty working without AI',
    c3_critical_thinking INT COMMENT 'Maintaining critical thinking (Reverse)',
    c4_quality_reflection INT COMMENT 'Reflecting on AI output quality (Reverse)',

    FOREIGN KEY (response_id) REFERENCES survey_responses(id) ON DELETE CASCADE
);