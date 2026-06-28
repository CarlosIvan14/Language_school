-- =============================================
-- EspañolPro — Initial Database Schema
-- Migration: 0001_initial_schema
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE spanish_level AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
CREATE TYPE course_modality AS ENUM ('online', 'in_person', 'hybrid');
CREATE TYPE course_status AS ENUM ('draft', 'active', 'full', 'finished', 'cancelled');
CREATE TYPE enrollment_status AS ENUM ('active', 'waitlist', 'cancelled', 'completed');
CREATE TYPE session_status AS ENUM ('scheduled', 'live', 'completed', 'cancelled');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'excused', 'late');
CREATE TYPE material_type AS ENUM ('pdf', 'video', 'audio', 'exercise', 'link');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_type AS ENUM ('enrollment', 'monthly', 'exam', 'material');
CREATE TYPE notification_channel AS ENUM ('fcm', 'email', 'whatsapp', 'telegram', 'in_app');
CREATE TYPE prospect_stage AS ENUM ('lead', 'contacted', 'demo', 'converted', 'lost');
CREATE TYPE crm_activity_type AS ENUM ('call', 'email', 'whatsapp', 'meeting', 'note');
CREATE TYPE grade_component AS ENUM ('homework', 'exam', 'attendance', 'participation', 'final');
CREATE TYPE app_language AS ENUM ('es', 'en', 'uk');

-- =============================================
-- CORE TABLES
-- =============================================

-- Profiles: extends auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'student',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  phone TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  language app_language NOT NULL DEFAULT 'es',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Students: extends profiles
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  native_language TEXT NOT NULL DEFAULT 'en',
  spanish_level spanish_level NOT NULL DEFAULT 'A1',
  nationality TEXT,
  documents JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Teachers: extends profiles
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  specialties spanish_level[] NOT NULL DEFAULT '{}',
  bio TEXT,
  hourly_rate NUMERIC(10,2)
);

-- =============================================
-- ACADEMIC TABLES
-- =============================================

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  level spanish_level NOT NULL,
  teacher_id UUID NOT NULL REFERENCES teachers(id),
  modality course_modality NOT NULL DEFAULT 'online',
  capacity INTEGER NOT NULL DEFAULT 20,
  duration_weeks INTEGER NOT NULL DEFAULT 12,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status course_status NOT NULL DEFAULT 'draft',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE class_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_min INTEGER NOT NULL DEFAULT 60,
  zoom_link TEXT,
  recording_url TEXT,
  status session_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status enrollment_status NOT NULL DEFAULT 'active',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, course_id)
);

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status attendance_status NOT NULL DEFAULT 'absent',
  registered_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, student_id)
);

CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  type material_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  storage_path TEXT NOT NULL,
  file_size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE homework (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT,
  due_at TIMESTAMPTZ NOT NULL,
  max_score NUMERIC(5,2) NOT NULL DEFAULT 100,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE homework_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  homework_id UUID NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  storage_path TEXT,
  content_text TEXT,
  score NUMERIC(5,2),
  feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  graded_at TIMESTAMPTZ,
  UNIQUE (homework_id, student_id)
);

CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  time_limit_min INTEGER,
  pass_score NUMERIC(5,2) NOT NULL DEFAULT 60,
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score NUMERIC(5,2),
  passed BOOLEAN,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  component grade_component NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  weight NUMERIC(5,2) NOT NULL DEFAULT 1,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pdf_path TEXT NOT NULL,
  validation_hash TEXT NOT NULL UNIQUE,
  qr_url TEXT NOT NULL,
  level spanish_level NOT NULL,
  UNIQUE (student_id, course_id)
);

-- =============================================
-- COMMUNICATION TABLES
-- =============================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  course_id UUID REFERENCES courses(id),
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  channel notification_channel NOT NULL DEFAULT 'in_app',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  parent_id UUID REFERENCES forum_posts(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- PAYMENT TABLES
-- =============================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id),
  type payment_type NOT NULL DEFAULT 'monthly',
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  stripe_intent_id TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  invoice_url TEXT,
  due_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- CRM TABLES
-- =============================================

CREATE TABLE prospects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  source TEXT,
  stage prospect_stage NOT NULL DEFAULT 'lead',
  assigned_to UUID REFERENCES profiles(id),
  notes JSONB NOT NULL DEFAULT '{}'::jsonb,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE crm_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  type crm_activity_type NOT NULL,
  notes TEXT,
  performed_by UUID NOT NULL REFERENCES profiles(id),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- GAMIFICATION TABLES
-- =============================================

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT NOT NULL,
  trigger_rule JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, badge_id)
);

CREATE TABLE points_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- SUPPORT TABLES
-- =============================================

CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  course_id UUID REFERENCES courses(id),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  respondent_id UUID NOT NULL REFERENCES profiles(id),
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (survey_id, respondent_id)
);

CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL DEFAULT 'class',
  external_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES (performance)
-- =============================================

CREATE INDEX idx_enrollments_course_status ON enrollments(course_id, status);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_sessions_course_date ON class_sessions(course_id, scheduled_at);
CREATE INDEX idx_sessions_status ON class_sessions(status);
CREATE INDEX idx_attendance_session ON attendance(session_id);
CREATE INDEX idx_attendance_student_course ON attendance(student_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id, read_at);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_payments_student ON payments(student_id, status);
CREATE INDEX idx_payments_due ON payments(due_at) WHERE status = 'pending';
CREATE INDEX idx_grades_student_course ON grades(student_id, course_id);
CREATE INDEX idx_homework_course ON homework(course_id, due_at);
CREATE INDEX idx_forum_posts_course ON forum_posts(course_id, created_at);
CREATE INDEX idx_prospects_stage ON prospects(stage);
CREATE INDEX idx_points_student ON points_ledger(student_id);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER forum_posts_updated_at
  BEFORE UPDATE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Profiles: users see their own profile, admins see all
CREATE POLICY "profiles_self_read" ON profiles FOR SELECT
  USING (id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Students: students see own record; teachers see enrolled students; admins see all
CREATE POLICY "students_self" ON students FOR SELECT
  USING (profile_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'teacher')
  ));

CREATE POLICY "students_self_update" ON students FOR UPDATE
  USING (profile_id = auth.uid());

-- Teachers: all authenticated users can view teacher profiles
CREATE POLICY "teachers_public_read" ON teachers FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "teachers_self_update" ON teachers FOR UPDATE
  USING (profile_id = auth.uid());

-- Courses: all authenticated users can view active courses
CREATE POLICY "courses_public_read" ON courses FOR SELECT
  USING (auth.uid() IS NOT NULL AND status IN ('active', 'full'));

CREATE POLICY "courses_admin_all" ON courses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

CREATE POLICY "courses_teacher_own" ON courses FOR UPDATE
  USING (teacher_id IN (
    SELECT t.id FROM teachers t WHERE t.profile_id = auth.uid()
  ));

-- Class sessions: enrolled students and course teacher can view
CREATE POLICY "sessions_enrolled_read" ON class_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
        JOIN students s ON s.id = e.student_id
        WHERE e.course_id = class_sessions.course_id
          AND s.profile_id = auth.uid()
          AND e.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM courses c
        JOIN teachers t ON t.id = c.teacher_id
        WHERE c.id = class_sessions.course_id AND t.profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Enrollments: students see own; teachers see their course enrollments; admins see all
CREATE POLICY "enrollments_student_own" ON enrollments FOR SELECT
  USING (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM courses c
        JOIN teachers t ON t.id = c.teacher_id
        WHERE c.id = enrollments.course_id AND t.profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "enrollments_student_insert" ON enrollments FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()));

-- Messages: sender or recipient can read
CREATE POLICY "messages_participants" ON messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "messages_sender_insert" ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- Notifications: users see own
CREATE POLICY "notifications_own" ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Payments: students see own; admins see all
CREATE POLICY "payments_own" ON payments FOR SELECT
  USING (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Certificates: public read by hash (for QR validation), students see own
CREATE POLICY "certificates_own" ON certificates FOR SELECT
  USING (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Badges: all can read
CREATE POLICY "badges_public" ON badges FOR SELECT USING (true);

-- Student badges: students see own; all can see others' badges (leaderboard)
CREATE POLICY "student_badges_read" ON student_badges FOR SELECT USING (true);

-- Points: students see own
CREATE POLICY "points_own" ON points_ledger FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()));

-- Forum posts: enrolled students and teacher can read
CREATE POLICY "forum_enrolled_read" ON forum_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
        JOIN students s ON s.id = e.student_id
        WHERE e.course_id = forum_posts.course_id
          AND s.profile_id = auth.uid()
          AND e.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM courses c
        JOIN teachers t ON t.id = c.teacher_id
        WHERE c.id = forum_posts.course_id AND t.profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "forum_enrolled_insert" ON forum_posts FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM enrollments e
        JOIN students s ON s.id = e.student_id
        WHERE e.course_id = forum_posts.course_id
          AND s.profile_id = auth.uid()
          AND e.status = 'active'
    )
  );

-- CRM: admins and assigned users only
CREATE POLICY "prospects_admin" ON prospects FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

CREATE POLICY "prospects_assigned" ON prospects FOR SELECT
  USING (assigned_to = auth.uid());

-- Calendar events: own
CREATE POLICY "calendar_own" ON calendar_events FOR ALL
  USING (user_id = auth.uid());

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- SEED: Default badges
-- =============================================

INSERT INTO badges (name, description, icon_url, trigger_rule) VALUES
  ('Racha 7', 'Asiste 7 días consecutivos', '/badges/streak7.svg', '{"type":"streak","days":7}'),
  ('Racha 30', 'Asiste 30 días consecutivos', '/badges/streak30.svg', '{"type":"streak","days":30}'),
  ('Estudiante perfecto', '100% de asistencia en un mes', '/badges/perfect.svg', '{"type":"attendance","percentage":100,"period":"month"}'),
  ('Primera entrega', 'Entrega tu primera tarea', '/badges/first_homework.svg', '{"type":"homework","count":1}'),
  ('Maratón', 'Entrega 10 tareas', '/badges/marathon.svg', '{"type":"homework","count":10}'),
  ('Primer examen', 'Aprueba tu primer examen', '/badges/first_exam.svg', '{"type":"exam","count":1}'),
  ('Chat activo', 'Envía 50 mensajes', '/badges/chat.svg', '{"type":"messages","count":50}'),
  ('Certificado', 'Obtén tu primer certificado', '/badges/certificate.svg', '{"type":"certificate","count":1}');
