// Generated with: npx supabase gen types --linked --lang typescript
// Linked project: bljhnelgmkulxwuhedbi. Do not edit by hand.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          ai_content_generation_enabled: boolean
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ai_content_generation_enabled?: boolean
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ai_content_generation_enabled?: boolean
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_payments: {
        Row: {
          amount_aud: number
          booking_id: string
          created_at: string
          due_date: string | null
          extension_quote_id: string | null
          external_payment_id: string | null
          id: string
          installment_no: number
          label: string | null
          paid_at: string | null
          payment_method: string | null
          receipt_invoice_number: string | null
          recorded_by_staff_id: string | null
          staff_note: string | null
          status: string | null
        }
        Insert: {
          amount_aud: number
          booking_id: string
          created_at?: string
          due_date?: string | null
          extension_quote_id?: string | null
          external_payment_id?: string | null
          id?: string
          installment_no: number
          label?: string | null
          paid_at?: string | null
          payment_method?: string | null
          receipt_invoice_number?: string | null
          recorded_by_staff_id?: string | null
          staff_note?: string | null
          status?: string | null
        }
        Update: {
          amount_aud?: number
          booking_id?: string
          created_at?: string
          due_date?: string | null
          extension_quote_id?: string | null
          external_payment_id?: string | null
          id?: string
          installment_no?: number
          label?: string | null
          paid_at?: string | null
          payment_method?: string | null
          receipt_invoice_number?: string | null
          recorded_by_staff_id?: string | null
          staff_note?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "tour_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_payments_extension_quote_id_fkey"
            columns: ["extension_quote_id"]
            isOneToOne: false
            referencedRelation: "trip_extension_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_payments_recorded_by_staff_id_fkey"
            columns: ["recorded_by_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_items: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          item_name: string
          notes: string | null
          status: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          item_name: string
          notes?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          item_name?: string
          notes?: string | null
          status?: string
        }
        Relationships: []
      }
      content_posts: {
        Row: {
          caption_fb: string | null
          caption_ig: string | null
          caption_line: string | null
          created_at: string
          error_message: string | null
          facebook_post_id: string | null
          facebook_post_url: string | null
          fb_post_id: string | null
          group_id: string | null
          headline_options: Json | null
          id: string
          page_id: string | null
          photo_urls: string[] | null
          post_type: string
          posted_at: string | null
          selected_headline: string | null
          status: string
          target_account: Database["public"]["Enums"]["content_target_account"]
          trip_id: string | null
          updated_at: string
        }
        Insert: {
          caption_fb?: string | null
          caption_ig?: string | null
          caption_line?: string | null
          created_at?: string
          error_message?: string | null
          facebook_post_id?: string | null
          facebook_post_url?: string | null
          fb_post_id?: string | null
          group_id?: string | null
          headline_options?: Json | null
          id?: string
          page_id?: string | null
          photo_urls?: string[] | null
          post_type?: string
          posted_at?: string | null
          selected_headline?: string | null
          status?: string
          target_account?: Database["public"]["Enums"]["content_target_account"]
          trip_id?: string | null
          updated_at?: string
        }
        Update: {
          caption_fb?: string | null
          caption_ig?: string | null
          caption_line?: string | null
          created_at?: string
          error_message?: string | null
          facebook_post_id?: string | null
          facebook_post_url?: string | null
          fb_post_id?: string | null
          group_id?: string | null
          headline_options?: Json | null
          id?: string
          page_id?: string | null
          photo_urls?: string[] | null
          post_type?: string
          posted_at?: string | null
          selected_headline?: string | null
          status?: string
          target_account?: Database["public"]["Enums"]["content_target_account"]
          trip_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_posts_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount_aud: number
          ato_category: string
          created_at: string
          created_by: string | null
          description: string
          ended_iso: string | null
          expense_date: string
          frequency: string
          gst_amount_aud: number
          id: string
          receipt_url: string | null
          trip_code: string | null
        }
        Insert: {
          amount_aud: number
          ato_category: string
          created_at?: string
          created_by?: string | null
          description: string
          ended_iso?: string | null
          expense_date: string
          frequency?: string
          gst_amount_aud?: number
          id?: string
          receipt_url?: string | null
          trip_code?: string | null
        }
        Update: {
          amount_aud?: number
          ato_category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          ended_iso?: string | null
          expense_date?: string
          frequency?: string
          gst_amount_aud?: number
          id?: string
          receipt_url?: string | null
          trip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_data_wipe_log: {
        Row: {
          booking_id: string | null
          booking_reference: string | null
          fields_wiped: string[]
          id: string
          trip_code: string
          trip_end_date: string
          wiped_at: string
        }
        Insert: {
          booking_id?: string | null
          booking_reference?: string | null
          fields_wiped: string[]
          id?: string
          trip_code: string
          trip_end_date: string
          wiped_at?: string
        }
        Update: {
          booking_id?: string | null
          booking_reference?: string | null
          fields_wiped?: string[]
          id?: string
          trip_code?: string
          trip_end_date?: string
          wiped_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_data_wipe_log_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "tour_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_alerts: {
        Row: {
          created_at: string
          expiry_date: string | null
          id: string
          is_active: boolean
          note: string | null
          title: string
        }
        Insert: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          note?: string | null
          title?: string
        }
        Update: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          note?: string | null
          title?: string
        }
        Relationships: []
      }
      payment_reconciliation_issues: {
        Row: {
          amount_cents: number | null
          booking_id: string | null
          booking_reference: string
          created_at: string
          detail: string | null
          external_payment_id: string
          id: string
          payment_method: string | null
          reason: string
          resolve_note: string | null
          resolved_at: string | null
          source: string | null
        }
        Insert: {
          amount_cents?: number | null
          booking_id?: string | null
          booking_reference: string
          created_at?: string
          detail?: string | null
          external_payment_id: string
          id?: string
          payment_method?: string | null
          reason: string
          resolve_note?: string | null
          resolved_at?: string | null
          source?: string | null
        }
        Update: {
          amount_cents?: number | null
          booking_id?: string | null
          booking_reference?: string
          created_at?: string
          detail?: string | null
          external_payment_id?: string
          id?: string
          payment_method?: string | null
          reason?: string
          resolve_note?: string | null
          resolved_at?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_reconciliation_issues_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "tour_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_spots: {
        Row: {
          access_private_car: string
          access_public_transport: string | null
          best_season: string | null
          best_time: string | null
          best_time_evening: string | null
          best_time_morning: string | null
          best_time_night: string | null
          camera_settings: Json
          categories: string[]
          created_at: string
          description_en: string | null
          description_th: string | null
          drive_time_from_sydney: string | null
          drone_allowed: string
          drone_notes: string | null
          gallery_image_urls: string[]
          gear_landscape: string | null
          gear_portrait: string | null
          google_maps_url: string | null
          hero_image_url: string | null
          id: string
          is_featured: boolean
          latitude: number | null
          linked_trip_code: string | null
          location_en: string
          location_th: string
          longitude: number | null
          photo_id: string | null
          rating: number
          related_trip_code: string | null
          review_notes: string | null
          slug: string
          sort_order: number
          thumbnail_url: string | null
          tips_en: string | null
          tips_th: string | null
          title_en: string
          title_th: string
          updated_at: string
          video_url: string | null
          warnings_en: string | null
          warnings_th: string | null
        }
        Insert: {
          access_private_car?: string
          access_public_transport?: string | null
          best_season?: string | null
          best_time?: string | null
          best_time_evening?: string | null
          best_time_morning?: string | null
          best_time_night?: string | null
          camera_settings?: Json
          categories?: string[]
          created_at?: string
          description_en?: string | null
          description_th?: string | null
          drive_time_from_sydney?: string | null
          drone_allowed?: string
          drone_notes?: string | null
          gallery_image_urls?: string[]
          gear_landscape?: string | null
          gear_portrait?: string | null
          google_maps_url?: string | null
          hero_image_url?: string | null
          id?: string
          is_featured?: boolean
          latitude?: number | null
          linked_trip_code?: string | null
          location_en: string
          location_th: string
          longitude?: number | null
          photo_id?: string | null
          rating?: number
          related_trip_code?: string | null
          review_notes?: string | null
          slug: string
          sort_order?: number
          thumbnail_url?: string | null
          tips_en?: string | null
          tips_th?: string | null
          title_en: string
          title_th: string
          updated_at?: string
          video_url?: string | null
          warnings_en?: string | null
          warnings_th?: string | null
        }
        Update: {
          access_private_car?: string
          access_public_transport?: string | null
          best_season?: string | null
          best_time?: string | null
          best_time_evening?: string | null
          best_time_morning?: string | null
          best_time_night?: string | null
          camera_settings?: Json
          categories?: string[]
          created_at?: string
          description_en?: string | null
          description_th?: string | null
          drive_time_from_sydney?: string | null
          drone_allowed?: string
          drone_notes?: string | null
          gallery_image_urls?: string[]
          gear_landscape?: string | null
          gear_portrait?: string | null
          google_maps_url?: string | null
          hero_image_url?: string | null
          id?: string
          is_featured?: boolean
          latitude?: number | null
          linked_trip_code?: string | null
          location_en?: string
          location_th?: string
          longitude?: number | null
          photo_id?: string | null
          rating?: number
          related_trip_code?: string | null
          review_notes?: string | null
          slug?: string
          sort_order?: number
          thumbnail_url?: string | null
          tips_en?: string | null
          tips_th?: string | null
          title_en?: string
          title_th?: string
          updated_at?: string
          video_url?: string | null
          warnings_en?: string | null
          warnings_th?: string | null
        }
        Relationships: []
      }
      staff_financial_audit: {
        Row: {
          action: string
          amount_aud: number | null
          booking_id: string | null
          created_at: string
          detail: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          installment_no: number | null
          receipt_invoice_number: string | null
          staff_id: string | null
          staff_name: string | null
          staff_role: string | null
        }
        Insert: {
          action: string
          amount_aud?: number | null
          booking_id?: string | null
          created_at?: string
          detail?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          installment_no?: number | null
          receipt_invoice_number?: string | null
          staff_id?: string | null
          staff_name?: string | null
          staff_role?: string | null
        }
        Update: {
          action?: string
          amount_aud?: number | null
          booking_id?: string | null
          created_at?: string
          detail?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          installment_no?: number | null
          receipt_invoice_number?: string | null
          staff_id?: string | null
          staff_name?: string | null
          staff_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_financial_audit_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "tour_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_financial_audit_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_outbound_queue: {
        Row: {
          body_en: string
          body_th: string | null
          booking_id: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          deep_link: string | null
          gmail_url: string | null
          id: string
          kind: string
          messenger_url: string | null
          status: string
          subject: string
          trip_code: string | null
          waitlist_id: string | null
        }
        Insert: {
          body_en: string
          body_th?: string | null
          booking_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          deep_link?: string | null
          gmail_url?: string | null
          id?: string
          kind: string
          messenger_url?: string | null
          status?: string
          subject: string
          trip_code?: string | null
          waitlist_id?: string | null
        }
        Update: {
          body_en?: string
          body_th?: string | null
          booking_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          deep_link?: string | null
          gmail_url?: string | null
          id?: string
          kind?: string
          messenger_url?: string | null
          status?: string
          subject?: string
          trip_code?: string | null
          waitlist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_outbound_queue_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "tour_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_outbound_queue_waitlist_id_fkey"
            columns: ["waitlist_id"]
            isOneToOne: false
            referencedRelation: "trip_waitlist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_outbound_queue_waitlist_id_fkey"
            columns: ["waitlist_id"]
            isOneToOne: false
            referencedRelation: "waitlist_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_profiles: {
        Row: {
          active: boolean
          created_at: string
          full_name: string
          id: string
          pin_hash: string
          role: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          full_name: string
          id?: string
          pin_hash: string
          role: string
        }
        Update: {
          active?: boolean
          created_at?: string
          full_name?: string
          id?: string
          pin_hash?: string
          role?: string
        }
        Relationships: []
      }
      staff_sessions: {
        Row: {
          created_at: string
          expires_at: string
          full_name: string
          ip_address: string | null
          role: string
          staff_id: string
          token: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          full_name: string
          ip_address?: string | null
          role: string
          staff_id: string
          token?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          full_name?: string
          ip_address?: string | null
          role?: string
          staff_id?: string
          token?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_sessions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_bookings: {
        Row: {
          allergies: string | null
          amount_paid_aud: number
          attended: boolean | null
          booked_at: string
          booking_reference: string | null
          booking_status: string
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          date_of_birth: string | null
          dietary_requirements: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          extra_days_paid: number
          first_name_en: string
          first_name_th: string
          flight_booking_requested: boolean
          flight_date_of_birth: string | null
          flight_frequent_flyer_number: string | null
          flight_legal_first_name: string | null
          flight_legal_last_name: string | null
          flight_nationality: string | null
          flight_passport_number: string | null
          full_photos_delivered: boolean
          full_photos_delivered_at: string | null
          gallery_link: string | null
          highlight_photos_delivered: boolean
          highlight_photos_delivered_at: string | null
          id: string
          insurance_policy_number: string | null
          insurance_provider: string | null
          insurance_type: string | null
          last_name_en: string
          last_name_th: string
          marketing_photo_opt_out: boolean
          marketing_photo_opt_out_at: string | null
          marketing_photo_opt_out_note: string | null
          medical_conditions: string | null
          medications: string | null
          oshc_expiry: string | null
          oshc_membership_number: string | null
          oshc_provider: string | null
          oshc_risk_acknowledged: boolean | null
          other_notes: string | null
          passport_number: string
          payment_method: string | null
          payment_plan_installments: number | null
          phone: string
          photos_delivered: boolean
          photos_delivered_at: string | null
          referred_by_booking_id: string | null
          reminder_1d_sent_at: string | null
          reminder_7d_sent_at: string | null
          review_requested_at: string | null
          safety_info_updated_at: string | null
          selected_tier: string | null
          slip_url: string | null
          source: string | null
          staff_follow_up_note: string | null
          tour_id: string
          travel_date: string | null
          travel_insurance_policy_number: string | null
          travel_insurance_provider: string | null
          trip_code: string
          waiver_signed: boolean
          waiver_signed_at: string | null
          waiver_token: string | null
        }
        Insert: {
          allergies?: string | null
          amount_paid_aud?: number
          attended?: boolean | null
          booked_at?: string
          booking_reference?: string | null
          booking_status?: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          date_of_birth?: string | null
          dietary_requirements?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          extra_days_paid?: number
          first_name_en: string
          first_name_th: string
          flight_booking_requested?: boolean
          flight_date_of_birth?: string | null
          flight_frequent_flyer_number?: string | null
          flight_legal_first_name?: string | null
          flight_legal_last_name?: string | null
          flight_nationality?: string | null
          flight_passport_number?: string | null
          full_photos_delivered?: boolean
          full_photos_delivered_at?: string | null
          gallery_link?: string | null
          highlight_photos_delivered?: boolean
          highlight_photos_delivered_at?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          insurance_type?: string | null
          last_name_en: string
          last_name_th: string
          marketing_photo_opt_out?: boolean
          marketing_photo_opt_out_at?: string | null
          marketing_photo_opt_out_note?: string | null
          medical_conditions?: string | null
          medications?: string | null
          oshc_expiry?: string | null
          oshc_membership_number?: string | null
          oshc_provider?: string | null
          oshc_risk_acknowledged?: boolean | null
          other_notes?: string | null
          passport_number: string
          payment_method?: string | null
          payment_plan_installments?: number | null
          phone: string
          photos_delivered?: boolean
          photos_delivered_at?: string | null
          referred_by_booking_id?: string | null
          reminder_1d_sent_at?: string | null
          reminder_7d_sent_at?: string | null
          review_requested_at?: string | null
          safety_info_updated_at?: string | null
          selected_tier?: string | null
          slip_url?: string | null
          source?: string | null
          staff_follow_up_note?: string | null
          tour_id: string
          travel_date?: string | null
          travel_insurance_policy_number?: string | null
          travel_insurance_provider?: string | null
          trip_code: string
          waiver_signed?: boolean
          waiver_signed_at?: string | null
          waiver_token?: string | null
        }
        Update: {
          allergies?: string | null
          amount_paid_aud?: number
          attended?: boolean | null
          booked_at?: string
          booking_reference?: string | null
          booking_status?: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          date_of_birth?: string | null
          dietary_requirements?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          extra_days_paid?: number
          first_name_en?: string
          first_name_th?: string
          flight_booking_requested?: boolean
          flight_date_of_birth?: string | null
          flight_frequent_flyer_number?: string | null
          flight_legal_first_name?: string | null
          flight_legal_last_name?: string | null
          flight_nationality?: string | null
          flight_passport_number?: string | null
          full_photos_delivered?: boolean
          full_photos_delivered_at?: string | null
          gallery_link?: string | null
          highlight_photos_delivered?: boolean
          highlight_photos_delivered_at?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          insurance_type?: string | null
          last_name_en?: string
          last_name_th?: string
          marketing_photo_opt_out?: boolean
          marketing_photo_opt_out_at?: string | null
          marketing_photo_opt_out_note?: string | null
          medical_conditions?: string | null
          medications?: string | null
          oshc_expiry?: string | null
          oshc_membership_number?: string | null
          oshc_provider?: string | null
          oshc_risk_acknowledged?: boolean | null
          other_notes?: string | null
          passport_number?: string
          payment_method?: string | null
          payment_plan_installments?: number | null
          phone?: string
          photos_delivered?: boolean
          photos_delivered_at?: string | null
          referred_by_booking_id?: string | null
          reminder_1d_sent_at?: string | null
          reminder_7d_sent_at?: string | null
          review_requested_at?: string | null
          safety_info_updated_at?: string | null
          selected_tier?: string | null
          slip_url?: string | null
          source?: string | null
          staff_follow_up_note?: string | null
          tour_id?: string
          travel_date?: string | null
          travel_insurance_policy_number?: string | null
          travel_insurance_provider?: string | null
          trip_code?: string
          waiver_signed?: boolean
          waiver_signed_at?: string | null
          waiver_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tour_bookings_referred_by_booking_id_fkey"
            columns: ["referred_by_booking_id"]
            isOneToOne: false
            referencedRelation: "tour_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_bookings_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      tours: {
        Row: {
          booked_seats: number
          cover_image_url: string | null
          created_at: string
          departure_date: string | null
          deposit_aud: number
          description_en: string | null
          description_th: string | null
          duration_days: number | null
          duration_nights: number | null
          id: string
          itinerary: Json | null
          luxury_price_aud: number | null
          max_seats: number
          name_en: string
          name_th: string
          price_aud: number
          price_luxury_aud: number | null
          status: string
          trip_code: string
          updated_at: string
        }
        Insert: {
          booked_seats?: number
          cover_image_url?: string | null
          created_at?: string
          departure_date?: string | null
          deposit_aud: number
          description_en?: string | null
          description_th?: string | null
          duration_days?: number | null
          duration_nights?: number | null
          id?: string
          itinerary?: Json | null
          luxury_price_aud?: number | null
          max_seats: number
          name_en: string
          name_th: string
          price_aud: number
          price_luxury_aud?: number | null
          status?: string
          trip_code: string
          updated_at?: string
        }
        Update: {
          booked_seats?: number
          cover_image_url?: string | null
          created_at?: string
          departure_date?: string | null
          deposit_aud?: number
          description_en?: string | null
          description_th?: string | null
          duration_days?: number | null
          duration_nights?: number | null
          id?: string
          itinerary?: Json | null
          luxury_price_aud?: number | null
          max_seats?: number
          name_en?: string
          name_th?: string
          price_aud?: number
          price_luxury_aud?: number | null
          status?: string
          trip_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      trip_capacity_changes: {
        Row: {
          changed_at: string
          changed_by: string | null
          changed_by_name: string | null
          changed_by_role: string | null
          id: string
          new_max_seats: number
          old_max_seats: number
          reason: string
          tour_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          changed_by_name?: string | null
          changed_by_role?: string | null
          id?: string
          new_max_seats: number
          old_max_seats: number
          reason: string
          tour_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          changed_by_name?: string | null
          changed_by_role?: string | null
          id?: string
          new_max_seats?: number
          old_max_seats?: number
          reason?: string
          tour_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_capacity_changes_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_capacity_changes_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_extension_quotes: {
        Row: {
          booking_id: string
          created_at: string
          created_by: string | null
          extra_days: number
          id: string
          paid_at: string | null
          payment_deadline: string
          payment_method: string | null
          price_difference_aud: number
          quote_note: string
          quote_token: string
          status: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          created_by?: string | null
          extra_days: number
          id?: string
          paid_at?: string | null
          payment_deadline: string
          payment_method?: string | null
          price_difference_aud: number
          quote_note: string
          quote_token: string
          status?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          created_by?: string | null
          extra_days?: number
          id?: string
          paid_at?: string | null
          payment_deadline?: string
          payment_method?: string | null
          price_difference_aud?: number
          quote_note?: string
          quote_token?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_extension_quotes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "tour_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_extension_quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_entries: {
        Row: {
          contacted: boolean
          created_at: string
          email: string | null
          id: string
          name: string
          note: string | null
          notified_at: string | null
          phone: string
          tour_id: string | null
          trip_code: string
        }
        Insert: {
          contacted?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name: string
          note?: string | null
          notified_at?: string | null
          phone: string
          tour_id?: string | null
          trip_code: string
        }
        Update: {
          contacted?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          note?: string | null
          notified_at?: string | null
          phone?: string
          tour_id?: string | null
          trip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_entries_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      waiver_detail_edits: {
        Row: {
          booking_id: string | null
          changes: Json
          edited_at: string
          edited_by_role: string | null
          edited_by_staff_id: string | null
          edited_by_staff_name: string | null
          id: string
          waiver_signature_id: string | null
        }
        Insert: {
          booking_id?: string | null
          changes?: Json
          edited_at?: string
          edited_by_role?: string | null
          edited_by_staff_id?: string | null
          edited_by_staff_name?: string | null
          id?: string
          waiver_signature_id?: string | null
        }
        Update: {
          booking_id?: string | null
          changes?: Json
          edited_at?: string
          edited_by_role?: string | null
          edited_by_staff_id?: string | null
          edited_by_staff_name?: string | null
          id?: string
          waiver_signature_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waiver_detail_edits_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "tour_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiver_detail_edits_edited_by_staff_id_fkey"
            columns: ["edited_by_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waiver_signature_archives: {
        Row: {
          booking_id: string | null
          clauses: Json | null
          created_at: string
          id: string
          locale: string | null
          original_signature_id: string | null
          reset_at: string
          reset_by_role: string | null
          reset_by_staff_id: string | null
          reset_by_staff_name: string | null
          reset_reason: string | null
          signed_at: string | null
          signed_name: string
          snapshot: Json
          trip_code: string
        }
        Insert: {
          booking_id?: string | null
          clauses?: Json | null
          created_at?: string
          id?: string
          locale?: string | null
          original_signature_id?: string | null
          reset_at?: string
          reset_by_role?: string | null
          reset_by_staff_id?: string | null
          reset_by_staff_name?: string | null
          reset_reason?: string | null
          signed_at?: string | null
          signed_name?: string
          snapshot?: Json
          trip_code?: string
        }
        Update: {
          booking_id?: string | null
          clauses?: Json | null
          created_at?: string
          id?: string
          locale?: string | null
          original_signature_id?: string | null
          reset_at?: string
          reset_by_role?: string | null
          reset_by_staff_id?: string | null
          reset_by_staff_name?: string | null
          reset_reason?: string | null
          signed_at?: string | null
          signed_name?: string
          snapshot?: Json
          trip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "waiver_signature_archives_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "tour_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiver_signature_archives_reset_by_staff_id_fkey"
            columns: ["reset_by_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waiver_signatures: {
        Row: {
          booking_id: string | null
          clauses: Json
          created_at: string
          filled_by_staff: boolean
          id: string
          locale: string
          signed_at: string
          signed_name: string
          staff_fill_authorization_note: string | null
          staff_fill_authorized_at: string | null
          staff_fill_evidence_url: string | null
          staff_fill_staff_id: string | null
          staff_fill_staff_name: string | null
          trip_code: string
        }
        Insert: {
          booking_id?: string | null
          clauses: Json
          created_at?: string
          filled_by_staff?: boolean
          id?: string
          locale?: string
          signed_at?: string
          signed_name: string
          staff_fill_authorization_note?: string | null
          staff_fill_authorized_at?: string | null
          staff_fill_evidence_url?: string | null
          staff_fill_staff_id?: string | null
          staff_fill_staff_name?: string | null
          trip_code: string
        }
        Update: {
          booking_id?: string | null
          clauses?: Json
          created_at?: string
          filled_by_staff?: boolean
          id?: string
          locale?: string
          signed_at?: string
          signed_name?: string
          staff_fill_authorization_note?: string | null
          staff_fill_authorized_at?: string | null
          staff_fill_evidence_url?: string | null
          staff_fill_staff_id?: string | null
          staff_fill_staff_name?: string | null
          trip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "waiver_signatures_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "tour_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiver_signatures_staff_fill_staff_id_fkey"
            columns: ["staff_fill_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      trip_waitlist: {
        Row: {
          contacted: boolean | null
          email: string | null
          id: string | null
          joined_at: string | null
          name: string | null
          note: string | null
          notified_at: string | null
          phone: string | null
          trip_code: string | null
          trip_id: string | null
        }
        Insert: {
          contacted?: boolean | null
          email?: string | null
          id?: string | null
          joined_at?: string | null
          name?: string | null
          note?: string | null
          notified_at?: string | null
          phone?: string | null
          trip_code?: string | null
          trip_id?: string | null
        }
        Update: {
          contacted?: boolean | null
          email?: string | null
          id?: string | null
          joined_at?: string | null
          name?: string | null
          note?: string | null
          notified_at?: string | null
          phone?: string | null
          trip_code?: string | null
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_entries_tour_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      apply_extension_quote_payment: {
        Args: {
          p_amount_cents: number
          p_payment_id: string
          p_payment_method?: string
          p_quote_id: string
        }
        Returns: Json
      }
      apply_health_data_wipe: {
        Args: { p_booking_id: string; p_trip_end_date: string }
        Returns: Json
      }
      apply_square_payment: {
        Args: {
          p_amount_cents: number
          p_booking_ref: string
          p_payment_id: string
          p_payment_method?: string
          p_recorded_by_staff_id?: string
          p_staff_note?: string
        }
        Returns: Json
      }
      book_seat: {
        Args: { p_seats_requested?: number; p_tour_id: string }
        Returns: Json
      }
      expire_pending_extension_quotes: { Args: never; Returns: Json }
      lookup_my_trip: {
        Args: { p_email?: string; p_phone?: string; p_reference: string }
        Returns: Json
      }
      purge_expired_staff_sessions: { Args: never; Returns: undefined }
      release_seat: {
        Args: { p_seats_to_release?: number; p_tour_id: string }
        Returns: Json
      }
      verify_staff_pin: {
        Args: { input_pin: string }
        Returns: {
          full_name: string
          role: string
          staff_id: string
        }[]
      }
    }
    Enums: {
      content_target_account:
        | "trip2talk_page"
        | "chapter99_page"
        | "group_thaiaus"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      content_target_account: [
        "trip2talk_page",
        "chapter99_page",
        "group_thaiaus",
      ],
    },
  },
} as const
