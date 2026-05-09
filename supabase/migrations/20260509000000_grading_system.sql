-- ============================================================
-- MIGRATION: 20260509000000_grading_system.sql
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/csxycmjujoyaflpwoqcu/sql/new
-- ============================================================

-- 1. SECTIONS ENHANCEMENT
ALTER TABLE sections ADD COLUMN IF NOT EXISTS level_range TEXT;

-- 2. CLASSES ENHANCEMENT
ALTER TABLE classes ADD COLUMN IF NOT EXISTS standard_number INTEGER;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS stream TEXT;

-- 3. ACADEMIC TERMS TABLE
CREATE TABLE IF NOT EXISTS academic_terms (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id   UUID REFERENCES schools(id) ON DELETE CASCADE,
  year        TEXT NOT NULL,
  term_number INTEGER NOT NULL CHECK (term_number IN (1, 2, 3)),
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  is_current  BOOLEAN DEFAULT false,
  UNIQUE(school_id, year, term_number)
);

-- 4. EXAMS ENHANCEMENT
ALTER TABLE exams ADD COLUMN IF NOT EXISTS term_id UUID REFERENCES academic_terms(id) ON DELETE SET NULL;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS sequence_no INTEGER;

-- 5. MARKS ENHANCEMENT
ALTER TABLE marks ADD COLUMN IF NOT EXISTS is_absent BOOLEAN DEFAULT false;

-- 6. SUBJECT AGGREGATES TABLE
CREATE TABLE IF NOT EXISTS subject_aggregates (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id          UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id          UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id            UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  term_id             UUID NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
  total_score         NUMERIC NOT NULL DEFAULT 0,
  total_possible      NUMERIC NOT NULL DEFAULT 0,
  percentage          NUMERIC GENERATED ALWAYS AS (
                        CASE WHEN total_possible > 0
                        THEN (total_score / total_possible) * 100
                        ELSE 0 END) STORED,
  grade               TEXT,
  last_computed_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, subject_id, term_id)
);

-- 7. STUDENT RESULTS TABLE
CREATE TABLE IF NOT EXISTS student_results (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id          UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id            UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  term_id             UUID NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
  overall_aggregate   NUMERIC NOT NULL DEFAULT 0,
  total_possible      NUMERIC NOT NULL DEFAULT 0,
  overall_percentage  NUMERIC GENERATED ALWAYS AS (
                        CASE WHEN total_possible > 0
                        THEN (overall_aggregate / total_possible) * 100
                        ELSE 0 END) STORED,
  overall_grade       TEXT,
  class_position      INTEGER,
  attendance_rate     NUMERIC,
  teacher_remarks     TEXT,
  last_computed_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, class_id, term_id)
);

-- 8. DEFAULT GRADING SCALE CONFIGURATION
INSERT INTO system_config (key, value)
VALUES ('grading_scale', '[
  {"grade":"A","min":80,"max":100,"label":"Distinction"},
  {"grade":"B","min":65,"max":79,"label":"Merit"},
  {"grade":"C","min":50,"max":64,"label":"Credit"},
  {"grade":"D","min":40,"max":49,"label":"Pass"},
  {"grade":"F","min":0,"max":39,"label":"Fail"}
]')
ON CONFLICT (key) DO NOTHING;

-- 9. RLS POLICIES
ALTER TABLE academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_results ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public academic terms are viewable by everyone." ON academic_terms FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Aggregates viewable by authorized users." ON subject_aggregates FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Results viewable by authorized users." ON student_results FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 10. INDEXES
CREATE INDEX IF NOT EXISTS idx_subject_aggregates_student ON subject_aggregates(student_id);
CREATE INDEX IF NOT EXISTS idx_student_results_class_term ON student_results(class_id, term_id);

-- 11. SEED ACADEMIC TERMS FOR 2025/2026
-- school_id NULL = global / applies to all schools
INSERT INTO academic_terms (year, term_number, start_date, end_date, is_current)
VALUES
  ('2025/2026', 1, '2026-01-13', '2026-04-11', false),
  ('2025/2026', 2, '2026-05-04', '2026-08-14', true),
  ('2025/2026', 3, '2026-09-07', '2026-11-20', false)
ON CONFLICT DO NOTHING;
