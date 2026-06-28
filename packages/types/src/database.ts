// Auto-generated Supabase database types
// Run: npx supabase gen types typescript --project-id <id> > packages/types/src/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'student' | 'teacher' | 'admin'
          full_name: string
          email: string
          avatar_url: string | null
          phone: string | null
          timezone: string
          language: 'es' | 'en' | 'uk'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'student' | 'teacher' | 'admin'
          full_name: string
          email: string
          avatar_url?: string | null
          phone?: string | null
          timezone?: string
          language?: 'es' | 'en' | 'uk'
          created_at?: string
          updated_at?: string
        }
        Update: {
          role?: 'student' | 'teacher' | 'admin'
          full_name?: string
          email?: string
          avatar_url?: string | null
          phone?: string | null
          timezone?: string
          language?: 'es' | 'en' | 'uk'
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          profile_id: string
          native_language: string
          spanish_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          nationality: string | null
          documents: Json
        }
        Insert: {
          id?: string
          profile_id: string
          native_language: string
          spanish_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          nationality?: string | null
          documents?: Json
        }
        Update: {
          native_language?: string
          spanish_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          nationality?: string | null
          documents?: Json
        }
      }
      courses: {
        Row: {
          id: string
          code: string
          title: string
          description: string | null
          level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          teacher_id: string
          modality: 'online' | 'in_person' | 'hybrid'
          capacity: number
          duration_weeks: number
          price_cents: number
          currency: string
          status: 'draft' | 'active' | 'full' | 'finished' | 'cancelled'
          starts_at: string
          ends_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          title: string
          description?: string | null
          level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          teacher_id: string
          modality?: 'online' | 'in_person' | 'hybrid'
          capacity?: number
          duration_weeks?: number
          price_cents: number
          currency?: string
          status?: 'draft' | 'active' | 'full' | 'finished' | 'cancelled'
          starts_at: string
          ends_at?: string | null
          created_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          teacher_id?: string
          modality?: 'online' | 'in_person' | 'hybrid'
          capacity?: number
          price_cents?: number
          status?: 'draft' | 'active' | 'full' | 'finished' | 'cancelled'
          ends_at?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: 'student' | 'teacher' | 'admin'
      spanish_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
      course_modality: 'online' | 'in_person' | 'hybrid'
      course_status: 'draft' | 'active' | 'full' | 'finished' | 'cancelled'
      enrollment_status: 'active' | 'waitlist' | 'cancelled' | 'completed'
      session_status: 'scheduled' | 'live' | 'completed' | 'cancelled'
      attendance_status: 'present' | 'absent' | 'excused' | 'late'
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
      notification_channel: 'fcm' | 'email' | 'whatsapp' | 'telegram' | 'in_app'
      prospect_stage: 'lead' | 'contacted' | 'demo' | 'converted' | 'lost'
      app_language: 'es' | 'en' | 'uk'
    }
  }
}
