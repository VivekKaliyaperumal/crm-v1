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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assignment_pointer: {
        Row: {
          last_assigned_user_id: string | null
          org_id: string
          updated_at: string
        }
        Insert: {
          last_assigned_user_id?: string | null
          org_id: string
          updated_at?: string
        }
        Update: {
          last_assigned_user_id?: string | null
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_pointer_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          at: string
          diff: Json
          entity: string
          entity_id: string | null
          id: string
          org_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          at?: string
          diff?: Json
          entity: string
          entity_id?: string | null
          id?: string
          org_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          at?: string
          diff?: Json
          entity?: string
          entity_id?: string | null
          id?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          agreement_date: string | null
          booking_amount: number
          booking_number: string
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          notes: string | null
          org_id: string
          plot_id: string
          project_id: string | null
          quotation_id: string | null
          status: Database["public"]["Enums"]["booking_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          agreement_date?: string | null
          booking_amount?: number
          booking_number: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          notes?: string | null
          org_id: string
          plot_id: string
          project_id?: string | null
          quotation_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number
          updated_at?: string
        }
        Update: {
          agreement_date?: string | null
          booking_amount?: number
          booking_number?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          notes?: string | null
          org_id?: string
          plot_id?: string
          project_id?: string | null
          quotation_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          budget: number
          channel: Database["public"]["Enums"]["campaign_channel"]
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          leads_count: number
          name: string
          notes: string | null
          org_id: string
          spent: number
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          updated_at: string
        }
        Insert: {
          budget?: number
          channel?: Database["public"]["Enums"]["campaign_channel"]
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          leads_count?: number
          name: string
          notes?: string | null
          org_id: string
          spent?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          updated_at?: string
        }
        Update: {
          budget?: number
          channel?: Database["public"]["Enums"]["campaign_channel"]
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          leads_count?: number
          name?: string
          notes?: string | null
          org_id?: string
          spent?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          lead_id: string | null
          notes: string | null
          org_id: string
          owner_id: string | null
          pan: string | null
          phone: string
          pincode: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          lead_id?: string | null
          notes?: string | null
          org_id: string
          owner_id?: string | null
          pan?: string | null
          phone: string
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          lead_id?: string | null
          notes?: string | null
          org_id?: string
          owner_id?: string | null
          pan?: string | null
          phone?: string
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          amount: number
          closed_at: string | null
          created_at: string
          customer_id: string | null
          id: string
          opportunity_id: string | null
          org_id: string
          owner_id: string | null
          plot_id: string | null
          status: Database["public"]["Enums"]["deal_status"]
          title: string
          updated_at: string
        }
        Insert: {
          amount?: number
          closed_at?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          opportunity_id?: string | null
          org_id: string
          owner_id?: string | null
          plot_id?: string | null
          status?: Database["public"]["Enums"]["deal_status"]
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          closed_at?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          opportunity_id?: string | null
          org_id?: string
          owner_id?: string | null
          plot_id?: string | null
          status?: Database["public"]["Enums"]["deal_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          mime_type: string | null
          name: string
          org_id: string
          size_bytes: number | null
          storage_path: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          mime_type?: string | null
          name: string
          org_id: string
          size_bytes?: number | null
          storage_path: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          mime_type?: string | null
          name?: string
          org_id?: string
          size_bytes?: number | null
          storage_path?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          due_at: string
          id: string
          lead_id: string
          notes: string | null
          org_id: string
          outcome: string | null
          priority: Database["public"]["Enums"]["followup_priority"]
          status: Database["public"]["Enums"]["followup_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          due_at: string
          id?: string
          lead_id: string
          notes?: string | null
          org_id: string
          outcome?: string | null
          priority?: Database["public"]["Enums"]["followup_priority"]
          status?: Database["public"]["Enums"]["followup_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          due_at?: string
          id?: string
          lead_id?: string
          notes?: string | null
          org_id?: string
          outcome?: string | null
          priority?: Database["public"]["Enums"]["followup_priority"]
          status?: Database["public"]["Enums"]["followup_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          lead_id: string
          occurred_at: string
          org_id: string
          payload: Json
          type: Database["public"]["Enums"]["activity_type"]
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          lead_id: string
          occurred_at?: string
          org_id: string
          payload?: Json
          type: Database["public"]["Enums"]["activity_type"]
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          occurred_at?: string
          org_id?: string
          payload?: Json
          type?: Database["public"]["Enums"]["activity_type"]
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          budget_max: number | null
          budget_min: number | null
          created_at: string
          created_by: string | null
          email: string | null
          full_name: string
          id: string
          last_activity_at: string
          notes: string | null
          org_id: string
          phone: string | null
          property_interest: string | null
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["lead_status"]
          timeline: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name: string
          id?: string
          last_activity_at?: string
          notes?: string | null
          org_id: string
          phone?: string | null
          property_interest?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name?: string
          id?: string
          last_activity_at?: string
          notes?: string | null
          org_id?: string
          phone?: string | null
          property_interest?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          timeline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          created_at: string
          customer_id: string | null
          expected_close: string | null
          id: string
          lead_id: string | null
          notes: string | null
          org_id: string
          owner_id: string | null
          plot_id: string | null
          probability: number
          project_id: string | null
          stage: Database["public"]["Enums"]["opportunity_stage"]
          title: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          expected_close?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          org_id: string
          owner_id?: string | null
          plot_id?: string | null
          probability?: number
          project_id?: string | null
          stage?: Database["public"]["Enums"]["opportunity_stage"]
          title: string
          updated_at?: string
          value?: number
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          expected_close?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          org_id?: string
          owner_id?: string | null
          plot_id?: string | null
          probability?: number
          project_id?: string | null
          stage?: Database["public"]["Enums"]["opportunity_stage"]
          title?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          branding: Json
          created_at: string
          id: string
          name: string
          settings: Json
          slug: string
          updated_at: string
        }
        Insert: {
          branding?: Json
          created_at?: string
          id?: string
          name: string
          settings?: Json
          slug: string
          updated_at?: string
        }
        Update: {
          branding?: Json
          created_at?: string
          id?: string
          name?: string
          settings?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          customer_id: string | null
          due_date: string | null
          id: string
          mode: Database["public"]["Enums"]["payment_mode"]
          notes: string | null
          org_id: string
          paid_at: string | null
          reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string
          customer_id?: string | null
          due_date?: string | null
          id?: string
          mode?: Database["public"]["Enums"]["payment_mode"]
          notes?: string | null
          org_id: string
          paid_at?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          customer_id?: string | null
          due_date?: string | null
          id?: string
          mode?: Database["public"]["Enums"]["payment_mode"]
          notes?: string | null
          org_id?: string
          paid_at?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      plots: {
        Row: {
          area_sqft: number
          block: string | null
          created_at: string
          facing: Database["public"]["Enums"]["plot_facing"] | null
          id: string
          notes: string | null
          org_id: string
          plot_number: string
          price_per_sqft: number | null
          project_id: string
          reserved_for: string | null
          status: Database["public"]["Enums"]["plot_status"]
          total_price: number
          updated_at: string
        }
        Insert: {
          area_sqft: number
          block?: string | null
          created_at?: string
          facing?: Database["public"]["Enums"]["plot_facing"] | null
          id?: string
          notes?: string | null
          org_id: string
          plot_number: string
          price_per_sqft?: number | null
          project_id: string
          reserved_for?: string | null
          status?: Database["public"]["Enums"]["plot_status"]
          total_price: number
          updated_at?: string
        }
        Update: {
          area_sqft?: number
          block?: string | null
          created_at?: string
          facing?: Database["public"]["Enums"]["plot_facing"] | null
          id?: string
          notes?: string | null
          org_id?: string
          plot_number?: string
          price_per_sqft?: number | null
          project_id?: string
          reserved_for?: string | null
          status?: Database["public"]["Enums"]["plot_status"]
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plots_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plots_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plots_reserved_for_fkey"
            columns: ["reserved_for"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          org_id: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          org_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          org_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          code: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          launch_date: string | null
          location: string | null
          name: string
          org_id: string
          status: Database["public"]["Enums"]["project_status"]
          total_area_sqft: number | null
          total_plots: number | null
          updated_at: string
        }
        Insert: {
          code?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          launch_date?: string | null
          location?: string | null
          name: string
          org_id: string
          status?: Database["public"]["Enums"]["project_status"]
          total_area_sqft?: number | null
          total_plots?: number | null
          updated_at?: string
        }
        Update: {
          code?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          launch_date?: string | null
          location?: string | null
          name?: string
          org_id?: string
          status?: Database["public"]["Enums"]["project_status"]
          total_area_sqft?: number | null
          total_plots?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          customer_id: string | null
          discount: number
          id: string
          lead_id: string | null
          notes: string | null
          org_id: string
          plot_id: string | null
          project_id: string | null
          quotation_number: string
          status: Database["public"]["Enums"]["quotation_status"]
          tax: number
          total: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          discount?: number
          id?: string
          lead_id?: string | null
          notes?: string | null
          org_id: string
          plot_id?: string | null
          project_id?: string | null
          quotation_number: string
          status?: Database["public"]["Enums"]["quotation_status"]
          tax?: number
          total?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          discount?: number
          id?: string
          lead_id?: string | null
          notes?: string | null
          org_id?: string
          plot_id?: string | null
          project_id?: string | null
          quotation_number?: string
          status?: Database["public"]["Enums"]["quotation_status"]
          tax?: number
          total?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          amount: number
          created_at: string
          customer_id: string | null
          id: string
          issued_at: string
          issued_by: string | null
          notes: string | null
          org_id: string
          payment_id: string | null
          receipt_number: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          notes?: string | null
          org_id: string
          payment_id?: string | null
          receipt_number: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          notes?: string | null
          org_id?: string
          payment_id?: string | null
          receipt_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      site_visits: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          id: string
          lead_id: string
          location: string
          notes: string | null
          org_id: string
          post_report: Json
          pre_checklist: Json
          scheduled_at: string
          status: Database["public"]["Enums"]["visit_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id: string
          location: string
          notes?: string | null
          org_id: string
          post_report?: Json
          pre_checklist?: Json
          scheduled_at: string
          status?: Database["public"]["Enums"]["visit_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id?: string
          location?: string
          notes?: string | null
          org_id?: string
          post_report?: Json
          pre_checklist?: Json
          scheduled_at?: string
          status?: Database["public"]["Enums"]["visit_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_visits_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_visits_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          id: string
          org_id: string
          priority: Database["public"]["Enums"]["task_priority"]
          related_customer_id: string | null
          related_lead_id: string | null
          related_opportunity_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          org_id: string
          priority?: Database["public"]["Enums"]["task_priority"]
          related_customer_id?: string | null
          related_lead_id?: string | null
          related_opportunity_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          org_id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          related_customer_id?: string | null
          related_lead_id?: string | null
          related_opportunity_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_customer_id_fkey"
            columns: ["related_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_lead_id_fkey"
            columns: ["related_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_opportunity_id_fkey"
            columns: ["related_opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_org_id: { Args: never; Returns: string }
      has_any_role: {
        Args: {
          _org_id: string
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _org_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_manager: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      activity_type:
        | "note"
        | "call"
        | "email"
        | "status_change"
        | "assignment"
        | "follow_up"
        | "site_visit"
      app_role: "admin" | "sales_manager" | "sales_executive" | "telecaller"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      campaign_channel:
        | "facebook"
        | "google"
        | "instagram"
        | "whatsapp"
        | "email"
        | "sms"
        | "referral"
        | "event"
        | "other"
      campaign_status: "draft" | "active" | "paused" | "completed"
      deal_status: "open" | "won" | "lost" | "on_hold"
      followup_priority: "low" | "medium" | "high"
      followup_status: "pending" | "completed" | "cancelled"
      kyc_status: "pending" | "verified" | "rejected"
      lead_source:
        | "manual"
        | "web_form"
        | "import"
        | "referral"
        | "walk_in"
        | "other"
      lead_status:
        | "new"
        | "contacted"
        | "interested"
        | "site_visit_scheduled"
        | "site_visit_completed"
        | "negotiation"
        | "booking"
        | "closed_won"
        | "closed_lost"
        | "not_interested"
        | "future_follow_up"
      opportunity_stage:
        | "qualification"
        | "proposal"
        | "negotiation"
        | "closed_won"
        | "closed_lost"
      payment_mode:
        | "cash"
        | "cheque"
        | "bank_transfer"
        | "upi"
        | "card"
        | "other"
      payment_status:
        | "scheduled"
        | "due"
        | "partial"
        | "paid"
        | "overdue"
        | "cancelled"
      plot_facing:
        | "north"
        | "south"
        | "east"
        | "west"
        | "north_east"
        | "north_west"
        | "south_east"
        | "south_west"
      plot_status: "available" | "blocked" | "booked" | "sold"
      project_status:
        | "planning"
        | "active"
        | "on_hold"
        | "completed"
        | "archived"
      quotation_status: "draft" | "sent" | "accepted" | "rejected" | "expired"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "open" | "in_progress" | "done" | "cancelled"
      visit_status: "scheduled" | "completed" | "cancelled" | "no_show"
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
  public: {
    Enums: {
      activity_type: [
        "note",
        "call",
        "email",
        "status_change",
        "assignment",
        "follow_up",
        "site_visit",
      ],
      app_role: ["admin", "sales_manager", "sales_executive", "telecaller"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      campaign_channel: [
        "facebook",
        "google",
        "instagram",
        "whatsapp",
        "email",
        "sms",
        "referral",
        "event",
        "other",
      ],
      campaign_status: ["draft", "active", "paused", "completed"],
      deal_status: ["open", "won", "lost", "on_hold"],
      followup_priority: ["low", "medium", "high"],
      followup_status: ["pending", "completed", "cancelled"],
      kyc_status: ["pending", "verified", "rejected"],
      lead_source: [
        "manual",
        "web_form",
        "import",
        "referral",
        "walk_in",
        "other",
      ],
      lead_status: [
        "new",
        "contacted",
        "interested",
        "site_visit_scheduled",
        "site_visit_completed",
        "negotiation",
        "booking",
        "closed_won",
        "closed_lost",
        "not_interested",
        "future_follow_up",
      ],
      opportunity_stage: [
        "qualification",
        "proposal",
        "negotiation",
        "closed_won",
        "closed_lost",
      ],
      payment_mode: ["cash", "cheque", "bank_transfer", "upi", "card", "other"],
      payment_status: [
        "scheduled",
        "due",
        "partial",
        "paid",
        "overdue",
        "cancelled",
      ],
      plot_facing: [
        "north",
        "south",
        "east",
        "west",
        "north_east",
        "north_west",
        "south_east",
        "south_west",
      ],
      plot_status: ["available", "blocked", "booked", "sold"],
      project_status: [
        "planning",
        "active",
        "on_hold",
        "completed",
        "archived",
      ],
      quotation_status: ["draft", "sent", "accepted", "rejected", "expired"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["open", "in_progress", "done", "cancelled"],
      visit_status: ["scheduled", "completed", "cancelled", "no_show"],
    },
  },
} as const
