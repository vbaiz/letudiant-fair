export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'student' | 'teacher' | 'exhibitor' | 'admin' | 'parent'
          dob: string | null
          education_level: string | null
          bac_series: string | null
          postal_code: string | null
          education_branches: string[]
          study_wishes: string[]
          wishlist: string[]
          optin_letudiant: boolean
          optin_commercial: boolean
          optin_wax: boolean
          consent_date: string | null
          parent_approved: boolean
          is_minor: boolean
          guardian_id: string | null
          group_id: string | null
          orientation_score: number
          orientation_stage: 'exploring' | 'comparing' | 'deciding'
          client_id_btoc: string | null
          eventmaker_ids: string[]
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['users']['Row']> & { id: string; email: string }
        Update: Partial<Database['public']['Tables']['users']['Row']>
      }
      events: {
        Row: {
          id: string
          name: string
          city: string
          event_date: string
          venue_map: string | null
          address: string | null
          description: string | null
          is_virtual: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['events']['Row']>
      }
      schools: {
        Row: {
          id: string
          name: string
          type: string
          city: string
          website: string | null
          cover_image_url: string | null
          reel_url: string | null
          description: string | null
          target_levels: string[]
          target_fields: string[]
          target_regions: string[]
          nb_accepted_bac_g: number | null
          nb_accepted_bac_t: number | null
          nb_accepted_bac_p: number | null
          rate_professional_insertion: number | null
          tuition_fee: number | null
          apprenticeship: boolean
          parcoursup: boolean
          scholarship_allowed: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['schools']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['schools']['Row']>
      }
      formations: {
        Row: {
          id: string
          school_id: string
          name: string
          duration: string
          level: string
          fields: string[]
          admission_requirements: string | null
          rncp_code: string | null
          study_modality: string | null
          cost: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['formations']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['formations']['Row']>
      }
      stands: {
        Row: {
          id: string
          event_id: string
          school_id: string
          location_x: number
          location_y: number
          category: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['stands']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['stands']['Row']>
      }
      sessions: {
        Row: {
          id: string
          event_id: string
          title: string
          speaker_school_id: string | null
          room: string
          start_time: string
          end_time: string
          description: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['sessions']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['sessions']['Row']>
      }
      scans: {
        Row: {
          id: string
          user_id: string
          event_id: string
          stand_id: string | null
          session_id: string | null
          channel: 'entry' | 'stand' | 'conference' | 'exit'
          dwell_estimate: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['scans']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['scans']['Row']>
      }
      leads: {
        Row: {
          id: string
          student_id: string
          school_id: string
          event_id: string
          education_level: string
          education_branches: string[]
          study_wishes: string[]
          stands_visited: string[]
          confs_attended: string[]
          dwell_minutes: number
          swipe_result: boolean
          score_value: number
          score_tier: 'exploring' | 'comparing' | 'deciding'
          score_computed_at: string
          exported_by: string | null
          exported_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['leads']['Row']>
      }
      matches: {
        Row: {
          id: string
          student_id: string
          school_id: string
          student_swipe: 'right' | 'left' | null
          school_interest: boolean
          appointment_booked: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['matches']['Row']>
      }
      groups: {
        Row: {
          id: string
          teacher_id: string
          school_name: string
          fair_id: string
          invite_link: string
          invite_link_expiry: string
          member_uids: string[]
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['groups']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['groups']['Row']>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

// Convenience row types
export type UserRow = Database['public']['Tables']['users']['Row']
export type EventRow = Database['public']['Tables']['events']['Row']
export type SchoolRow = Database['public']['Tables']['schools']['Row']
export type FormationRow = Database['public']['Tables']['formations']['Row']
export type StandRow = Database['public']['Tables']['stands']['Row']
export type SessionRow = Database['public']['Tables']['sessions']['Row']
export type ScanRow = Database['public']['Tables']['scans']['Row']
export type LeadRow = Database['public']['Tables']['leads']['Row']
export type MatchRow = Database['public']['Tables']['matches']['Row']
export type GroupRow = Database['public']['Tables']['groups']['Row']
