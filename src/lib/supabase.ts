// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types baseados no schema
export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          email: string
          password: string
          username: string
          name: string
          semester: number
          about: string | null
          profile_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password: string
          username: string
          name: string
          semester: number
          about?: string | null
          profile_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password?: string
          username?: string
          name?: string
          semester?: number
          about?: string | null
          profile_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          banner_url: string | null
          content: string | null
          published_year: number
          status: 'DRAFT' | 'PUBLISHED'
          semester: number
          allow_comments: boolean
          author_id: string
          subject_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          banner_url?: string | null
          content?: string | null
          published_year: number
          status?: 'DRAFT' | 'PUBLISHED'
          semester: number
          allow_comments?: boolean
          author_id: string
          subject_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          banner_url?: string | null
          content?: string | null
          published_year?: number
          status?: 'DRAFT' | 'PUBLISHED'
          semester?: number
          allow_comments?: boolean
          author_id?: string
          subject_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          author_id: string
          project_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          author_id: string
          project_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          author_id?: string
          project_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      trails: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      professors: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
    }
  }
}