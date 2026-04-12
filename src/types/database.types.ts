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
    PostgrestVersion: "14.1"
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
      ai_generations: {
        Row: {
          ai_model: string | null
          ai_settings: Json | null
          created_at: string | null
          error_message: string | null
          file_size: number | null
          generated_image_url: string | null
          generation_time: number | null
          height: number | null
          id: string
          negative_prompt: string | null
          prompt: string
          source_upload_id: string | null
          status: string | null
          storage_bucket: string | null
          storage_path: string | null
          updated_at: string | null
          user_id: string | null
          width: number | null
        }
        Insert: {
          ai_model?: string | null
          ai_settings?: Json | null
          created_at?: string | null
          error_message?: string | null
          file_size?: number | null
          generated_image_url?: string | null
          generation_time?: number | null
          height?: number | null
          id?: string
          negative_prompt?: string | null
          prompt: string
          source_upload_id?: string | null
          status?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          updated_at?: string | null
          user_id?: string | null
          width?: number | null
        }
        Update: {
          ai_model?: string | null
          ai_settings?: Json | null
          created_at?: string | null
          error_message?: string | null
          file_size?: number | null
          generated_image_url?: string | null
          generation_time?: number | null
          height?: number | null
          id?: string
          negative_prompt?: string | null
          prompt?: string
          source_upload_id?: string | null
          status?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          updated_at?: string | null
          user_id?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_generations_source_upload_id_fkey"
            columns: ["source_upload_id"]
            isOneToOne: false
            referencedRelation: "user_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cart_id: string | null
          created_at: string | null
          custom_image_url: string | null
          design_id: string | null
          id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          cart_id?: string | null
          created_at?: string | null
          custom_image_url?: string | null
          design_id?: string | null
          id?: string
          product_id?: string | null
          product_name: string
          quantity?: number
          unit_price: number
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          cart_id?: string | null
          created_at?: string | null
          custom_image_url?: string | null
          design_id?: string | null
          id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "user_designs"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string | null
          id: string
          session_id: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_jobs: {
        Row: {
          attempts: number
          created_at: string
          dedupe_key: string
          id: string
          last_error: string | null
          max_attempts: number
          next_attempt_at: string
          payload: Json
          recipient_email: string
          sent_at: string | null
          status: string
          subject: string
          template: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          dedupe_key: string
          id?: string
          last_error?: string | null
          max_attempts?: number
          next_attempt_at?: string
          payload?: Json
          recipient_email: string
          sent_at?: string | null
          status?: string
          subject: string
          template: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          dedupe_key?: string
          id?: string
          last_error?: string | null
          max_attempts?: number
          next_attempt_at?: string
          payload?: Json
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subject?: string
          template?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          custom_image_url: string
          design_config: Json | null
          design_id: string | null
          external_order_id: string | null
          fulfillment_status: string | null
          id: string
          order_id: string | null
          product_id: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
          updated_at: string | null
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          created_at?: string | null
          custom_image_url: string
          design_config?: Json | null
          design_id?: string | null
          external_order_id?: string | null
          fulfillment_status?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
          updated_at?: string | null
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          created_at?: string | null
          custom_image_url?: string
          design_config?: Json | null
          design_id?: string | null
          external_order_id?: string | null
          fulfillment_status?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          updated_at?: string | null
          variant_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "user_designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          cancellation_reason: string | null
          cancelled_at: string | null
          confirmed_at: string | null
          created_at: string | null
          currency: string | null
          customer_email: string
          customer_name: string | null
          customer_notes: string | null
          customer_phone: string | null
          delivered_at: string | null
          discount_amount: number | null
          expired_at: string | null
          expires_at: string | null
          fulfillment_status: string | null
          id: string
          internal_notes: string | null
          last_refund_error: string | null
          manual_review_required: boolean
          order_number: string
          paid_at: string | null
          payment_failure_reason: string | null
          payment_method: string | null
          payment_status: string | null
          printify_order_id: string | null
          product_id: string | null
          promo_code: string | null
          promo_value: number | null
          refund_attempts: number
          refund_failed: boolean
          shipped_at: string | null
          shipping_address: Json | null
          shipping_cost: number | null
          shipping_method: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          subtotal: number | null
          tax_amount: number | null
          total_amount: number | null
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email: string
          customer_name?: string | null
          customer_notes?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          discount_amount?: number | null
          expired_at?: string | null
          expires_at?: string | null
          fulfillment_status?: string | null
          id?: string
          internal_notes?: string | null
          last_refund_error?: string | null
          manual_review_required?: boolean
          order_number: string
          paid_at?: string | null
          payment_failure_reason?: string | null
          payment_method?: string | null
          payment_status?: string | null
          printify_order_id?: string | null
          product_id?: string | null
          promo_code?: string | null
          promo_value?: number | null
          refund_attempts?: number
          refund_failed?: boolean
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          shipping_method?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string
          customer_name?: string | null
          customer_notes?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          discount_amount?: number | null
          expired_at?: string | null
          expires_at?: string | null
          fulfillment_status?: string | null
          id?: string
          internal_notes?: string | null
          last_refund_error?: string | null
          manual_review_required?: boolean
          order_number?: string
          paid_at?: string | null
          payment_failure_reason?: string | null
          payment_method?: string | null
          payment_status?: string | null
          printify_order_id?: string | null
          product_id?: string | null
          promo_code?: string | null
          promo_value?: number | null
          refund_attempts?: number
          refund_failed?: boolean
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          shipping_method?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          mollie_payment_id: string | null
          mollie_status: string | null
          order_id: string | null
          payment_method_details: Json | null
          payment_method_type: string | null
          payment_provider: string
          paypal_capture_id: string | null
          paypal_order_id: string | null
          paypal_payer_email: string | null
          paypal_payer_id: string | null
          status: string
          stripe_charge_id: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          mollie_payment_id?: string | null
          mollie_status?: string | null
          order_id?: string | null
          payment_method_details?: Json | null
          payment_method_type?: string | null
          payment_provider?: string
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          paypal_payer_email?: string | null
          paypal_payer_id?: string | null
          status: string
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          mollie_payment_id?: string | null
          mollie_status?: string | null
          order_id?: string | null
          payment_method_details?: Json | null
          payment_method_type?: string | null
          payment_provider?: string
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          paypal_payer_email?: string | null
          paypal_payer_id?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_webhook_events: {
        Row: {
          created_at: string
          event_id: string
          id: string
          order_id: string | null
          payload: Json | null
          provider: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          order_id?: string | null
          payload?: Json | null
          provider: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          order_id?: string | null
          payload?: Json | null
          provider?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_webhook_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          is_primary: boolean | null
          position: number | null
          product_id: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          position?: number | null
          product_id?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          position?: number | null
          product_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          blueprint_id: number | null
          category_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          print_areas: Json | null
          print_provider_id: number | null
          printify_product_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          base_price: number
          blueprint_id?: number | null
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          print_areas?: Json | null
          print_provider_id?: number | null
          printify_product_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          blueprint_id?: number | null
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          print_areas?: Json | null
          print_provider_id?: number | null
          printify_product_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          coins: number
          coins_reset_at: string
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          stripe_customer_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          coins?: number
          coins_reset_at?: string
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          coins?: number
          coins_reset_at?: string
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      promocodes: {
        Row: {
          code: string
          created_at: string | null
          promocode_id: string
          type: string
          value: number
        }
        Insert: {
          code: string
          created_at?: string | null
          promocode_id?: string
          type: string
          value: number
        }
        Update: {
          code?: string
          created_at?: string | null
          promocode_id?: string
          type?: string
          value?: number
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          credits: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          credits?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          credits?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_designs: {
        Row: {
          ai_generation_id: string | null
          base_image_id: string | null
          created_at: string | null
          design_config: Json | null
          final_image_url: string
          id: string
          is_favorite: boolean | null
          mockup_image_url: string | null
          name: string | null
          product_id: string | null
          updated_at: string | null
          user_id: string | null
          variant_id: string | null
        }
        Insert: {
          ai_generation_id?: string | null
          base_image_id?: string | null
          created_at?: string | null
          design_config?: Json | null
          final_image_url: string
          id?: string
          is_favorite?: boolean | null
          mockup_image_url?: string | null
          name?: string | null
          product_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          variant_id?: string | null
        }
        Update: {
          ai_generation_id?: string | null
          base_image_id?: string | null
          created_at?: string | null
          design_config?: Json | null
          final_image_url?: string
          id?: string
          is_favorite?: boolean | null
          mockup_image_url?: string | null
          name?: string | null
          product_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_designs_ai_generation_id_fkey"
            columns: ["ai_generation_id"]
            isOneToOne: false
            referencedRelation: "ai_generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_designs_base_image_id_fkey"
            columns: ["base_image_id"]
            isOneToOne: false
            referencedRelation: "user_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_designs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_uploads: {
        Row: {
          created_at: string | null
          file_size: number | null
          height: number | null
          id: string
          mime_type: string | null
          original_filename: string | null
          original_image_url: string
          storage_bucket: string | null
          storage_path: string
          user_id: string | null
          width: number | null
        }
        Insert: {
          created_at?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          mime_type?: string | null
          original_filename?: string | null
          original_image_url: string
          storage_bucket?: string | null
          storage_path: string
          user_id?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          mime_type?: string | null
          original_filename?: string | null
          original_image_url?: string
          storage_bucket?: string | null
          storage_path?: string
          user_id?: string | null
          width?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deduct_coin: { Args: { user_id: string }; Returns: boolean }
      expire_waiting_payment_orders: { Args: never; Returns: number }
      generate_order_number: { Args: never; Returns: string }
      refill_min_3_coins_daily: { Args: never; Returns: undefined }
    }
    Enums: {
      PAYMENT_STATUS: "PENDING" | "FAILED" | "COMPLETED"
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
      PAYMENT_STATUS: ["PENDING", "FAILED", "COMPLETED"],
    },
  },
}