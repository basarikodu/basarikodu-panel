// Supabase tarafından üretildi (generate_typescript_types). Elle düzenlemeyin;
// şema değişince yeniden üretin.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      app_settings: {
        Row: {
          duration_coaching: number;
          duration_private: number;
          id: number;
          lesson_price_multi: number;
          lesson_price_single: number;
          tutor_rate_coaching: number;
          tutor_rate_private: number;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          duration_coaching?: number;
          duration_private?: number;
          id?: number;
          lesson_price_multi?: number;
          lesson_price_single?: number;
          tutor_rate_coaching?: number;
          tutor_rate_private?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          duration_coaching?: number;
          duration_private?: number;
          id?: number;
          lesson_price_multi?: number;
          lesson_price_single?: number;
          tutor_rate_coaching?: number;
          tutor_rate_private?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "app_settings_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_change_requests: {
        Row: {
          cancel_status: Database["public"]["Enums"]["lesson_status"] | null;
          created_at: string;
          id: string;
          lesson_id: string;
          new_ends_at: string | null;
          new_starts_at: string | null;
          reason: string;
          request_type: Database["public"]["Enums"]["change_request_type"];
          requested_by: string;
          review_note: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["approval_status"];
        };
        Insert: {
          cancel_status?: Database["public"]["Enums"]["lesson_status"] | null;
          created_at?: string;
          id?: string;
          lesson_id: string;
          new_ends_at?: string | null;
          new_starts_at?: string | null;
          reason?: string;
          request_type: Database["public"]["Enums"]["change_request_type"];
          requested_by?: string;
          review_note?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["approval_status"];
        };
        Update: {
          cancel_status?: Database["public"]["Enums"]["lesson_status"] | null;
          created_at?: string;
          id?: string;
          lesson_id?: string;
          new_ends_at?: string | null;
          new_starts_at?: string | null;
          reason?: string;
          request_type?: Database["public"]["Enums"]["change_request_type"];
          requested_by?: string;
          review_note?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["approval_status"];
        };
        Relationships: [
          {
            foreignKeyName: "lesson_change_requests_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_change_requests_requested_by_fkey";
            columns: ["requested_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_change_requests_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_series: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          lesson_type: Database["public"]["Enums"]["lesson_type"];
          student_id: string;
          subject_id: string;
          tutor_id: string;
          weeks: number;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          id?: string;
          lesson_type: Database["public"]["Enums"]["lesson_type"];
          student_id: string;
          subject_id: string;
          tutor_id: string;
          weeks: number;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          lesson_type?: Database["public"]["Enums"]["lesson_type"];
          student_id?: string;
          subject_id?: string;
          tutor_id?: string;
          weeks?: number;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_series_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_series_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_series_subject_id_fkey";
            columns: ["subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_series_tutor_id_fkey";
            columns: ["tutor_id"];
            isOneToOne: false;
            referencedRelation: "tutors";
            referencedColumns: ["id"];
          },
        ];
      };
      lessons: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"];
          approved_at: string | null;
          approved_by: string | null;
          completed_at: string | null;
          created_at: string;
          created_by: string | null;
          ends_at: string;
          id: string;
          is_free: boolean;
          lesson_type: Database["public"]["Enums"]["lesson_type"];
          meeting_url: string | null;
          payout_id: string | null;
          rejection_reason: string | null;
          series_id: string | null;
          starts_at: string;
          status: Database["public"]["Enums"]["lesson_status"];
          student_id: string;
          subject_id: string;
          topic: string | null;
          tutor_id: string;
          tutor_rate_snapshot: number;
          updated_at: string;
        };
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_status"];
          approved_at?: string | null;
          approved_by?: string | null;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          ends_at: string;
          id?: string;
          is_free?: boolean;
          lesson_type?: Database["public"]["Enums"]["lesson_type"];
          meeting_url?: string | null;
          payout_id?: string | null;
          rejection_reason?: string | null;
          series_id?: string | null;
          starts_at: string;
          status?: Database["public"]["Enums"]["lesson_status"];
          student_id: string;
          subject_id: string;
          topic?: string | null;
          tutor_id: string;
          tutor_rate_snapshot?: number;
          updated_at?: string;
        };
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_status"];
          approved_at?: string | null;
          approved_by?: string | null;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          ends_at?: string;
          id?: string;
          is_free?: boolean;
          lesson_type?: Database["public"]["Enums"]["lesson_type"];
          meeting_url?: string | null;
          payout_id?: string | null;
          rejection_reason?: string | null;
          series_id?: string | null;
          starts_at?: string;
          status?: Database["public"]["Enums"]["lesson_status"];
          student_id?: string;
          subject_id?: string;
          topic?: string | null;
          tutor_id?: string;
          tutor_rate_snapshot?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lessons_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lessons_series_id_fkey";
            columns: ["series_id"];
            isOneToOne: false;
            referencedRelation: "lesson_series";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lessons_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lessons_subject_id_fkey";
            columns: ["subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lessons_tutor_id_fkey";
            columns: ["tutor_id"];
            isOneToOne: false;
            referencedRelation: "tutors";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          created_at: string;
          id: string;
          method: Database["public"]["Enums"]["payment_method"];
          note: string | null;
          paid_at: string;
          recorded_by: string | null;
          student_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          id?: string;
          method?: Database["public"]["Enums"]["payment_method"];
          note?: string | null;
          paid_at?: string;
          recorded_by?: string | null;
          student_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          id?: string;
          method?: Database["public"]["Enums"]["payment_method"];
          note?: string | null;
          paid_at?: string;
          recorded_by?: string | null;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_recorded_by_fkey";
            columns: ["recorded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string;
          id: string;
          is_active: boolean;
          phone: string | null;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name: string;
          id: string;
          is_active?: boolean;
          phone?: string | null;
          role: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string;
          id?: string;
          is_active?: boolean;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      student_notes: {
        Row: {
          notes: string;
          student_id: string;
          updated_at: string;
        };
        Insert: {
          notes?: string;
          student_id: string;
          updated_at?: string;
        };
        Update: {
          notes?: string;
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_notes_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: true;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      student_packages: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          lesson_count: number;
          month: string;
          note: string | null;
          price_total: number;
          student_id: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          lesson_count: number;
          month: string;
          note?: string | null;
          price_total?: number;
          student_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          lesson_count?: number;
          month?: string;
          note?: string | null;
          price_total?: number;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_packages_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_packages_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      students: {
        Row: {
          goal: Database["public"]["Enums"]["student_goal"];
          grade: number | null;
          guardian_name: string | null;
          guardian_phone: string | null;
          id: string;
          school: string | null;
        };
        Insert: {
          goal?: Database["public"]["Enums"]["student_goal"];
          grade?: number | null;
          guardian_name?: string | null;
          guardian_phone?: string | null;
          id: string;
          school?: string | null;
        };
        Update: {
          goal?: Database["public"]["Enums"]["student_goal"];
          grade?: number | null;
          guardian_name?: string | null;
          guardian_phone?: string | null;
          id?: string;
          school?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "students_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      subjects: {
        Row: {
          color: string;
          id: string;
          is_active: boolean;
          name: string;
          sort_order: number;
        };
        Insert: {
          color?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          sort_order?: number;
        };
        Update: {
          color?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      tutor_payouts: {
        Row: {
          amount: number;
          created_at: string;
          id: string;
          lesson_count: number;
          note: string | null;
          paid_at: string;
          period_end: string;
          period_start: string;
          recorded_by: string | null;
          tutor_id: string;
        };
        Insert: {
          amount?: number;
          created_at?: string;
          id?: string;
          lesson_count?: number;
          note?: string | null;
          paid_at?: string;
          period_end: string;
          period_start: string;
          recorded_by?: string | null;
          tutor_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          id?: string;
          lesson_count?: number;
          note?: string | null;
          paid_at?: string;
          period_end?: string;
          period_start?: string;
          recorded_by?: string | null;
          tutor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tutor_payouts_recorded_by_fkey";
            columns: ["recorded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tutor_payouts_tutor_id_fkey";
            columns: ["tutor_id"];
            isOneToOne: false;
            referencedRelation: "tutors";
            referencedColumns: ["id"];
          },
        ];
      };
      tutor_students: {
        Row: {
          assigned_at: string;
          assigned_by: string | null;
          id: string;
          is_active: boolean;
          lesson_type: Database["public"]["Enums"]["lesson_type"];
          student_id: string;
          subject_id: string;
          tutor_id: string;
        };
        Insert: {
          assigned_at?: string;
          assigned_by?: string | null;
          id?: string;
          is_active?: boolean;
          lesson_type?: Database["public"]["Enums"]["lesson_type"];
          student_id: string;
          subject_id: string;
          tutor_id: string;
        };
        Update: {
          assigned_at?: string;
          assigned_by?: string | null;
          id?: string;
          is_active?: boolean;
          lesson_type?: Database["public"]["Enums"]["lesson_type"];
          student_id?: string;
          subject_id?: string;
          tutor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tutor_students_assigned_by_fkey";
            columns: ["assigned_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tutor_students_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tutor_students_subject_id_fkey";
            columns: ["subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tutor_students_tutor_id_fkey";
            columns: ["tutor_id"];
            isOneToOne: false;
            referencedRelation: "tutors";
            referencedColumns: ["id"];
          },
        ];
      };
      tutor_subjects: {
        Row: {
          subject_id: string;
          tutor_id: string;
        };
        Insert: {
          subject_id: string;
          tutor_id: string;
        };
        Update: {
          subject_id?: string;
          tutor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tutor_subjects_subject_id_fkey";
            columns: ["subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tutor_subjects_tutor_id_fkey";
            columns: ["tutor_id"];
            isOneToOne: false;
            referencedRelation: "tutors";
            referencedColumns: ["id"];
          },
        ];
      };
      tutors: {
        Row: {
          default_meeting_url: string | null;
          department: string | null;
          iban: string | null;
          id: string;
          payout_frequency: Database["public"]["Enums"]["payout_frequency"];
          university: string | null;
          yks_rank: number | null;
        };
        Insert: {
          default_meeting_url?: string | null;
          department?: string | null;
          iban?: string | null;
          id: string;
          payout_frequency?: Database["public"]["Enums"]["payout_frequency"];
          university?: string | null;
          yks_rank?: number | null;
        };
        Update: {
          default_meeting_url?: string | null;
          department?: string | null;
          iban?: string | null;
          id?: string;
          payout_frequency?: Database["public"]["Enums"]["payout_frequency"];
          university?: string | null;
          yks_rank?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "tutors_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      mark_tutor_paid: {
        Args: {
          p_end: string;
          p_note?: string;
          p_paid_at?: string;
          p_start: string;
          p_tutor: string;
        };
        Returns: string;
      };
      get_credit_balances: {
        Args: { p_month?: string };
        Returns: {
          carried_over: number;
          month_completed: number;
          month_package: number;
          remaining: number;
          student_id: string;
          total_credits: number;
          used_credits: number;
        }[];
      };
      review_change_request: {
        Args: { p_approve: boolean; p_note?: string; p_request_id: string };
        Returns: undefined;
      };
      review_lessons: {
        Args: { p_approve: boolean; p_lesson_ids: string[]; p_reason?: string };
        Returns: number;
      };
    };
    Enums: {
      approval_status: "pending" | "approved" | "rejected";
      change_request_type: "reschedule" | "cancel";
      lesson_status:
        | "planned"
        | "completed"
        | "no_show"
        | "cancelled_by_student"
        | "cancelled_by_tutor"
        | "postponed";
      lesson_type: "ozel_ders" | "kocluk";
      payment_method: "havale" | "nakit" | "kart" | "diger";
      payout_frequency: "weekly" | "monthly";
      student_goal: "yks" | "lgs" | "okul" | "genel";
      user_role: "founder" | "tutor" | "student";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
