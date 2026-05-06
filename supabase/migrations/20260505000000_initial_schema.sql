
-- Project Mayeso - Initial Schema Migration
-- Author: Genius
-- Date: 2026-05-05

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. GEOGRAPHIC HIERARCHY

CREATE TABLE districts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(district_id, name)
);

CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  code TEXT UNIQUE, -- e.g. "MPS"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "Upper Primary", "Lower Primary"
  UNIQUE(school_id, name)
);

CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "Standard 4A"
  academic_year TEXT NOT NULL, -- e.g. "2025"
  UNIQUE(section_id, name, academic_year)
);

-- 2. USERS & PROFILES

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('teacher','section_head','head_teacher','zone_manager','district_officer','parent','admin')),
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  failed_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. STUDENTS

CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male','female')),
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SUBJECTS & ASSIGNMENTS

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE teacher_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  assigned_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id, class_id, subject_id, academic_year)
);

-- 5. EXAMINATIONS & MARKS

CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  exam_type TEXT CHECK (exam_type IN ('midterm','endterm','mock','continuous_assessment')),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  exam_date DATE,
  max_score NUMERIC NOT NULL DEFAULT 100,
  is_locked BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE marks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL CHECK (score >= 0),
  grade TEXT, -- A, B, C, D, F
  remarks TEXT,
  entered_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  entered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, exam_id)
);

-- 6. ATTENDANCE

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present','absent','excused')),
  marked_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- 7. LESSON PLANS

CREATE TABLE lesson_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  week_number INTEGER,
  academic_year TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','submitted','reviewed','approved','rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. AUDIT LOGS

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. SYSTEM CONFIG

CREATE TABLE system_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. INDEXES

CREATE INDEX idx_marks_student ON marks(student_id);
CREATE INDEX idx_marks_exam ON marks(exam_id);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_lesson_plans_teacher_status ON lesson_plans(teacher_id, status);
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at);
CREATE INDEX idx_students_class_school ON students(class_id, school_id);

-- 11. ROW LEVEL SECURITY (RLS)

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;

-- Helper function for hierarchy (simplified for migration)
CREATE OR REPLACE FUNCTION role_in_hierarchy(user_id UUID, target_school_id UUID) RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  user_school_id UUID;
  user_zone_id UUID;
  user_district_id UUID;
BEGIN
  SELECT role, school_id, zone_id, district_id INTO user_role, user_school_id, user_zone_id, user_district_id FROM profiles WHERE id = user_id;
  
  IF user_role = 'admin' THEN RETURN TRUE; END IF;
  IF user_role = 'district_officer' THEN 
    RETURN EXISTS (SELECT 1 FROM schools s JOIN zones z ON s.zone_id = z.id WHERE s.id = target_school_id AND z.district_id = user_district_id);
  END IF;
  IF user_role = 'zone_manager' THEN
    RETURN EXISTS (SELECT 1 FROM schools s WHERE s.id = target_school_id AND s.zone_id = user_zone_id);
  END IF;
  IF user_role IN ('head_teacher', 'section_head') THEN
    RETURN user_school_id = target_school_id;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Students Policies
CREATE POLICY "Teachers can view students in their classes" ON students FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM teacher_assignments ta
    WHERE ta.teacher_id = auth.uid() AND ta.class_id = students.class_id
  ) OR role_in_hierarchy(auth.uid(), school_id)
);

CREATE POLICY "Parents can view their own child" ON students FOR SELECT USING (parent_id = auth.uid());

-- Marks Policies
CREATE POLICY "Teachers can enter marks for their assigned subjects" ON marks FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM exams e
    JOIN teacher_assignments ta ON e.class_id = ta.class_id AND e.subject_id = ta.subject_id
    WHERE e.id = exam_id AND ta.teacher_id = auth.uid()
  )
);


-- Analytics Functions
CREATE OR REPLACE FUNCTION get_class_subject_averages(class_uuid UUID)
RETURNS TABLE(subject_name TEXT, average_score NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT s.name as subject_name, AVG(m.score) as average_score
  FROM marks m
  JOIN exams e ON m.exam_id = e.id
  JOIN subjects s ON e.subject_id = s.id
  WHERE e.class_id = class_uuid
  GROUP BY s.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
