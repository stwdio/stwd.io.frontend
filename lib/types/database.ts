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
      add_on_services: {
        Row: {
          created_at: string | null
          id: number
          name: string
          price: number
          studio_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          name: string
          price: number
          studio_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: never
          name?: string
          price?: number
          studio_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "add_on_services_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      amenities: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          name: string
        }
        Update: {
          created_at?: string | null
          id?: never
          name?: string
        }
        Relationships: []
      }
      booking_add_ons: {
        Row: {
          add_on_service_id: number
          booking_id: number
        }
        Insert: {
          add_on_service_id: number
          booking_id: number
        }
        Update: {
          add_on_service_id?: number
          booking_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_add_ons_add_on_service_id_fkey"
            columns: ["add_on_service_id"]
            isOneToOne: false
            referencedRelation: "add_on_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_add_ons_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string | null
          creator_id: number | null
          end_time: string
          id: number
          owner_payout: number | null
          platform_fee: number | null
          start_time: string
          status: string | null
          studio_id: number | null
          total_paid: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: number | null
          end_time: string
          id?: never
          owner_payout?: number | null
          platform_fee?: number | null
          start_time: string
          status?: string | null
          studio_id?: number | null
          total_paid?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: number | null
          end_time?: string
          id?: never
          owner_payout?: number | null
          platform_fee?: number | null
          start_time?: string
          status?: string | null
          studio_id?: number | null
          total_paid?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: number
          profile_id: number
        }
        Insert: {
          conversation_id: number
          profile_id: number
        }
        Update: {
          conversation_id?: number
          profile_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          customer_id: number | null
          id: number
          inquiry_id: number | null
          last_message_at: string | null
          status: string | null
          studio_id: number | null
          studio_owner_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: number | null
          id?: never
          inquiry_id?: number | null
          last_message_at?: string | null
          status?: string | null
          studio_id?: number | null
          studio_owner_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: number | null
          id?: never
          inquiry_id?: number | null
          last_message_at?: string | null
          status?: string | null
          studio_id?: number | null
          studio_owner_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_studio_owner_id_fkey"
            columns: ["studio_owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_messages: {
        Row: {
          content: string
          created_at: string | null
          dispute_id: number | null
          id: number
          sender_id: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          dispute_id?: number | null
          id?: never
          sender_id?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          dispute_id?: number | null
          id?: never
          sender_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dispute_messages_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispute_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          booking_id: number | null
          created_at: string | null
          description: string | null
          id: number
          initiated_by: number | null
          reason: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          booking_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: never
          initiated_by?: number | null
          reason: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          booking_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: never
          initiated_by?: number | null
          reason?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          budget_range: string | null
          created_at: string | null
          creator_id: number | null
          custom_message: string | null
          genre: string | null
          id: number
          location_preference: string | null
          preferred_dates: string | null
          project_type: string
          updated_at: string | null
        }
        Insert: {
          budget_range?: string | null
          created_at?: string | null
          creator_id?: number | null
          custom_message?: string | null
          genre?: string | null
          id?: never
          location_preference?: string | null
          preferred_dates?: string | null
          project_type: string
          updated_at?: string | null
        }
        Update: {
          budget_range?: string | null
          created_at?: string | null
          creator_id?: number | null
          custom_message?: string | null
          genre?: string | null
          id?: never
          location_preference?: string | null
          preferred_dates?: string | null
          project_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiry_recipients: {
        Row: {
          created_at: string | null
          inquiry_id: number
          quote_amount: number | null
          responded_at: string | null
          response_message: string | null
          status: string | null
          studio_id: number
        }
        Insert: {
          created_at?: string | null
          inquiry_id: number
          quote_amount?: number | null
          responded_at?: string | null
          response_message?: string | null
          status?: string | null
          studio_id: number
        }
        Update: {
          created_at?: string | null
          inquiry_id?: number
          quote_amount?: number | null
          responded_at?: string | null
          response_message?: string | null
          status?: string | null
          studio_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_recipients_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiry_recipients_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      list_items: {
        Row: {
          created_at: string | null
          list_id: number
          notes: string | null
          studio_id: number
        }
        Insert: {
          created_at?: string | null
          list_id: number
          notes?: string | null
          studio_id: number
        }
        Update: {
          created_at?: string | null
          list_id?: number
          notes?: string | null
          studio_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_items_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      lists: {
        Row: {
          created_at: string | null
          icon_emoji: string | null
          id: number
          is_public: boolean | null
          name: string
          owner_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icon_emoji?: string | null
          id?: never
          is_public?: boolean | null
          name: string
          owner_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icon_emoji?: string | null
          id?: never
          is_public?: boolean | null
          name?: string
          owner_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lists_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: number | null
          created_at: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: number
          message_type: string | null
          quote_amount: number | null
          read_at: string | null
          sender_id: number | null
          updated_at: string | null
        }
        Insert: {
          content: string
          conversation_id?: number | null
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: never
          message_type?: string | null
          quote_amount?: number | null
          read_at?: string | null
          sender_id?: number | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          conversation_id?: number | null
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: never
          message_type?: string | null
          quote_amount?: number | null
          read_at?: string | null
          sender_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: number
          is_read: boolean | null
          item_id: number
          item_type: string
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          item_id: number
          item_type: string
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          item_id?: number
          item_type?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          created_at: string | null
          full_day_rate: number | null
          half_day_rate: number | null
          hourly_rate: number | null
          id: number
          studio_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_day_rate?: number | null
          half_day_rate?: number | null
          hourly_rate?: number | null
          id?: never
          studio_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_day_rate?: number | null
          half_day_rate?: number | null
          hourly_rate?: number | null
          id?: never
          studio_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_roles: {
        Row: {
          created_at: string | null
          profile_id: number
          role_id: number
        }
        Insert: {
          created_at?: string | null
          profile_id: number
          role_id: number
        }
        Update: {
          created_at?: string | null
          profile_id?: number
          role_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "profile_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: number
          last_name: string | null
          middle_name: string | null
          stripe_customer_id: string | null
          system_role: string | null
          updated_at: string | null
          user_id: string | null
          username: string
          bio: string | null
          social_links: Record<string, string>
          portfolio_links: Record<string, string>
          website: string | null
          skills: string[]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: never
          last_name?: string | null
          middle_name?: string | null
          stripe_customer_id?: string | null
          system_role?: string | null
          updated_at?: string | null
          user_id?: string | null
          username: string
          bio?: string | null
          social_links?: Record<string, string>
          portfolio_links?: Record<string, string>
          website?: string | null
          skills?: string[]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: never
          last_name?: string | null
          middle_name?: string | null
          stripe_customer_id?: string | null
          system_role?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string
          bio?: string | null
          social_links?: Record<string, string>
          portfolio_links?: Record<string, string>
          website?: string | null
          skills?: string[]
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: never
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: never
          name?: string
          slug?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: number | null
          comment: string | null
          created_at: string | null
          id: number
          rating: number | null
          reviewer_id: number | null
          studio_id: number | null
          updated_at: string | null
        }
        Insert: {
          booking_id?: number | null
          comment?: string | null
          created_at?: string | null
          id?: never
          rating?: number | null
          reviewer_id?: number | null
          studio_id?: number | null
          updated_at?: string | null
        }
        Update: {
          booking_id?: number | null
          comment?: string | null
          created_at?: string | null
          id?: never
          rating?: number | null
          reviewer_id?: number | null
          studio_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_amenities: {
        Row: {
          amenity_id: number
          studio_id: number
        }
        Insert: {
          amenity_id: number
          studio_id: number
        }
        Update: {
          amenity_id?: number
          studio_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "studio_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_amenities_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studios: {
        Row: {
          claimed_by: number | null
          created_at: string | null
          currency: string
          daily_rate: number | null
          description: string | null
          gear: Json | null
          hourly_rate: number
          id: number
          location: string | null
          name: string
          owner_id: number | null
          photo_urls: string[] | null
          price_tier: number
          published: boolean | null
          slug: string
          updated_at: string | null
          verification_documents: Json | null
          verification_status: string | null
          verified: boolean | null
        }
        Insert: {
          claimed_by?: number | null
          created_at?: string | null
          currency?: string
          daily_rate?: number | null
          description?: string | null
          gear?: Json | null
          hourly_rate: number
          id?: never
          location?: string | null
          name: string
          owner_id?: number | null
          photo_urls?: string[] | null
          price_tier?: number
          published?: boolean | null
          slug?: string
          updated_at?: string | null
          verification_documents?: Json | null
          verification_status?: string | null
          verified?: boolean | null
        }
        Update: {
          claimed_by?: number | null
          created_at?: string | null
          currency?: string
          daily_rate?: number | null
          description?: string | null
          gear?: Json | null
          hourly_rate?: number
          id?: never
          location?: string | null
          name?: string
          owner_id?: number | null
          photo_urls?: string[] | null
          price_tier?: number
          published?: boolean | null
          slug?: string
          updated_at?: string | null
          verification_documents?: Json | null
          verification_status?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "studios_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studios_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          features: Json | null
          id: number
          name: string
          price: number
        }
        Insert: {
          created_at?: string | null
          features?: Json | null
          id?: never
          name: string
          price: number
        }
        Update: {
          created_at?: string | null
          features?: Json | null
          id?: never
          name?: string
          price?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          id: number
          profile_id: number | null
          renewal_date: string | null
          status: string
          subscription_plan_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          profile_id?: number | null
          renewal_date?: string | null
          status: string
          subscription_plan_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          profile_id?: number | null
          renewal_date?: string | null
          status?: string
          subscription_plan_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_studio_to_list: {
        Args: {
          list_id_param: number
          studio_id_param: number
          notes_param?: string
        }
        Returns: boolean
      }
      claim_studio: {
        Args: { studio_id_param: number; verification_docs: Json }
        Returns: undefined
      }
      create_conversation_from_inquiry: {
        Args: {
          inquiry_id_param: number
          studio_id_param: number
          initial_message?: string
        }
        Returns: number
      }
      delete_studio_safely: {
        Args: { studio_id_param: number }
        Returns: Json
      }
      get_batch_studio_list_memberships_optimized: {
        Args: { studio_ids: number[]; user_profile_id: number }
        Returns: {
          studio_id: number
          list_id: number
          list_name: string
          list_icon_emoji: string
        }[]
      }
      get_conversation_messages: {
        Args: { conversation_id_param: number }
        Returns: {
          id: number
          content: string
          message_type: string
          quote_amount: number
          created_at: string
          sender_profile: Json
        }[]
      }
      get_list_studios_for_quote: {
        Args: { list_id_param: number; user_profile_id: number }
        Returns: {
          studio_id: number
          studio_name: string
          studio_description: string
          studio_location: string
          hourly_rate: number
          verification_status: string
          has_existing_inquiry: boolean
        }[]
      }
      get_my_profile_id: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_studio_inquiries: {
        Args: { studio_ids: number[] }
        Returns: {
          inquiry_id: number
          studio_id: number
          status: string
          response_message: string
          quote_amount: number
          responded_at: string
          created_at: string
          inquiries: Json
          studios: Json
        }[]
      }
      get_studio_list_memberships: {
        Args: { studio_id_param: number; user_profile_id: number }
        Returns: {
          list_id: number
          list_name: string
          list_icon_emoji: string
        }[]
      }
      get_user_lists_with_counts: {
        Args: { user_profile_id: number }
        Returns: {
          id: number
          name: string
          icon_emoji: string
          is_public: boolean
          created_at: string
          updated_at: string
          studio_count: number
        }[]
      }
      handle_inquiry_response: {
        Args: {
          inquiry_id_param: number
          studio_id_param: number
          response_message_param: string
          quote_amount_param?: number
        }
        Returns: number
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      mark_messages_read: {
        Args: { conversation_id_param: number }
        Returns: undefined
      }
      remove_studio_from_list: {
        Args: { list_id_param: number; studio_id_param: number }
        Returns: boolean
      }
      send_message: {
        Args: {
          conversation_id_param: number
          content_param: string
          message_type_param?: string
          quote_amount_param?: number
          file_url_param?: string
          file_name_param?: string
          file_size_param?: number
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type Functions<T extends keyof Database['public']['Functions']> = Database['public']['Functions'][T]

// Common table types for easy access
export type Studio = Tables<'studios'>
export type Profile = Tables<'profiles'>
export type Booking = Tables<'bookings'>
export type Conversation = Tables<'conversations'>
export type Message = Tables<'messages'>
export type Review = Tables<'reviews'>
export type List = Tables<'lists'>
export type Inquiry = Tables<'inquiries'>
export type Notification = Tables<'notifications'>

// Enhanced studio type with relationships
export type StudioWithDetails = Studio & {
  amenities?: Tables<'amenities'>[]
  reviews?: Tables<'reviews'>[]
  pricing_rules?: Tables<'pricing_rules'>[]
  owner?: Profile
}

// Message with sender info
export type MessageWithSender = Message & {
  sender?: Profile
}

// Conversation with participants
export type ConversationWithDetails = Conversation & {
  customer?: Profile
  studio_owner?: Profile
  studio?: Studio
  messages?: MessageWithSender[]
}