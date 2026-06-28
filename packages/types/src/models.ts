import type {
  UserRole,
  SpanishLevel,
  CourseModality,
  CourseStatus,
  EnrollmentStatus,
  SessionStatus,
  AttendanceStatus,
  MaterialType,
  PaymentStatus,
  PaymentType,
  NotificationChannel,
  ProspectStage,
  CrmActivityType,
  GradeComponent,
  AppLanguage,
} from './enums'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  email: string
  avatar_url: string | null
  phone: string | null
  timezone: string
  language: AppLanguage
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  profile_id: string
  native_language: string
  spanish_level: SpanishLevel
  nationality: string | null
  documents: StudentDocuments
  profile?: Profile
}

export interface StudentDocuments {
  passport?: { path: string; uploaded_at: string }
  payment_receipt?: { path: string; uploaded_at: string }
  other?: Array<{ name: string; path: string; uploaded_at: string }>
}

export interface Teacher {
  id: string
  profile_id: string
  specialties: SpanishLevel[]
  bio: string | null
  hourly_rate: number | null
  profile?: Profile
}

export interface Course {
  id: string
  code: string
  title: string
  description: string | null
  level: SpanishLevel
  teacher_id: string
  modality: CourseModality
  capacity: number
  duration_weeks: number
  price_cents: number
  currency: string
  status: CourseStatus
  starts_at: string
  ends_at: string | null
  teacher?: Teacher
  _count?: { enrollments: number }
}

export interface ClassSession {
  id: string
  course_id: string
  title: string | null
  scheduled_at: string
  duration_min: number
  zoom_link: string | null
  recording_url: string | null
  status: SessionStatus
  notes: string | null
  course?: Course
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  status: EnrollmentStatus
  enrolled_at: string
  student?: Student
  course?: Course
}

export interface Attendance {
  id: string
  session_id: string
  student_id: string
  status: AttendanceStatus
  registered_by: string | null
  notes: string | null
  created_at: string
}

export interface Material {
  id: string
  course_id: string
  uploaded_by: string
  type: MaterialType
  title: string
  description: string | null
  storage_path: string
  file_size_bytes: number | null
  created_at: string
}

export interface Homework {
  id: string
  course_id: string
  title: string
  instructions: string | null
  due_at: string
  max_score: number
  created_by: string
  created_at: string
}

export interface HomeworkSubmission {
  id: string
  homework_id: string
  student_id: string
  storage_path: string | null
  content_text: string | null
  score: number | null
  feedback: string | null
  submitted_at: string
  graded_at: string | null
}

export interface ExamQuestion {
  id: string
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay'
  prompt: string
  options?: string[]
  correct_answer: string | string[]
  points: number
}

export interface Exam {
  id: string
  course_id: string
  title: string
  description: string | null
  questions: ExamQuestion[]
  time_limit_min: number | null
  pass_score: number
  available_from: string | null
  available_until: string | null
  created_by: string
}

export interface ExamAttempt {
  id: string
  exam_id: string
  student_id: string
  answers: Record<string, string | string[]>
  score: number | null
  passed: boolean | null
  started_at: string
  completed_at: string | null
}

export interface Grade {
  id: string
  student_id: string
  course_id: string
  component: GradeComponent
  score: number
  weight: number
  notes: string | null
  created_by: string
  created_at: string
}

export interface Certificate {
  id: string
  student_id: string
  course_id: string
  issued_at: string
  pdf_path: string
  validation_hash: string
  qr_url: string
  level: SpanishLevel
}

export interface Message {
  id: string
  sender_id: string
  recipient_id: string
  course_id: string | null
  body: string
  read_at: string | null
  created_at: string
  sender?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: string
  channel: NotificationChannel
  payload: Record<string, unknown>
  sent_at: string | null
  status: 'pending' | 'sent' | 'failed'
  created_at: string
}

export interface Payment {
  id: string
  student_id: string
  course_id: string | null
  type: PaymentType
  amount_cents: number
  currency: string
  stripe_intent_id: string | null
  status: PaymentStatus
  invoice_url: string | null
  due_at: string | null
  paid_at: string | null
  created_at: string
}

export interface Prospect {
  id: string
  name: string
  email: string
  phone: string | null
  source: string | null
  stage: ProspectStage
  assigned_to: string | null
  notes: Record<string, unknown>
  converted_at: string | null
  created_at: string
}

export interface CrmActivity {
  id: string
  prospect_id: string
  type: CrmActivityType
  notes: string | null
  performed_by: string
  performed_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon_url: string
  trigger_rule: Record<string, unknown>
}

export interface StudentBadge {
  id: string
  student_id: string
  badge_id: string
  earned_at: string
  badge?: Badge
}

export interface PointsEntry {
  id: string
  student_id: string
  points: number
  reason: string
  created_at: string
}

export interface ForumPost {
  id: string
  course_id: string
  author_id: string
  parent_id: string | null
  body: string
  created_at: string
  updated_at: string
  author?: Profile
  replies?: ForumPost[]
}
