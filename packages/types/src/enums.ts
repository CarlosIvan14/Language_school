export type UserRole = 'student' | 'teacher' | 'admin'

export type SpanishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export type CourseModality = 'online' | 'in_person' | 'hybrid'

export type CourseStatus = 'draft' | 'active' | 'full' | 'finished' | 'cancelled'

export type EnrollmentStatus = 'active' | 'waitlist' | 'cancelled' | 'completed'

export type SessionStatus = 'scheduled' | 'live' | 'completed' | 'cancelled'

export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late'

export type MaterialType = 'pdf' | 'video' | 'audio' | 'exercise' | 'link'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type PaymentType = 'enrollment' | 'monthly' | 'exam' | 'material'

export type NotificationChannel = 'fcm' | 'email' | 'whatsapp' | 'telegram' | 'in_app'

export type ProspectStage = 'lead' | 'contacted' | 'demo' | 'converted' | 'lost'

export type CrmActivityType = 'call' | 'email' | 'whatsapp' | 'meeting' | 'note'

export type GradeComponent = 'homework' | 'exam' | 'attendance' | 'participation' | 'final'

export type AppLanguage = 'es' | 'en' | 'uk'
