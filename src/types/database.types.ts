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
          custom_image_hash: string | null
          custom_image_public_id: string | null
          custom_image_url: string | null
          id: string
          printify_blueprint_id: number | null
          printify_print_provider_id: number | null
          product_id: string | null
          product_name: string | null
          quantity: number | null
          selling_price: number | null
          unit_price: number | null
          updated_at: string | null
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          cart_id?: string | null
          created_at?: string | null
          custom_image_hash?: string | null
          custom_image_public_id?: string | null
          custom_image_url?: string | null
          id?: string
          printify_blueprint_id?: number | null
          printify_print_provider_id?: number | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number | null
          selling_price?: number | null
          unit_price?: number | null
          updated_at?: string | null
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          cart_id?: string | null
          created_at?: string | null
          custom_image_hash?: string | null
          custom_image_public_id?: string | null
          custom_image_url?: string | null
          id?: string
          printify_blueprint_id?: number | null
          printify_print_provider_id?: number | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number | null
          selling_price?: number | null
          unit_price?: number | null
          updated_at?: string | null
          variant_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string | null
          id: string
          session_id: string | null
          status: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      catalog_products: {
        Row: {
          base_image_url: string | null
          blueprint_id: number
          created_at: string | null
          discount_percent: number | null
          display_title: string
          is_active: boolean | null
          is_on_sale: boolean | null
          last_synced_at: string | null
          min_price_cents: number | null
          original_price_cents: number | null
          print_provider_id: number
          selling_price_cents: number | null
          shipping_cents: number | null
          updated_at: string | null
        }
        Insert: {
          base_image_url?: string | null
          blueprint_id: number
          created_at?: string | null
          discount_percent?: number | null
          display_title: string
          is_active?: boolean | null
          is_on_sale?: boolean | null
          last_synced_at?: string | null
          min_price_cents?: number | null
          original_price_cents?: number | null
          print_provider_id?: number
          selling_price_cents?: number | null
          shipping_cents?: number | null
          updated_at?: string | null
        }
        Update: {
          base_image_url?: string | null
          blueprint_id?: number
          created_at?: string | null
          discount_percent?: number | null
          display_title?: string
          is_active?: boolean | null
          is_on_sale?: boolean | null
          last_synced_at?: string | null
          min_price_cents?: number | null
          original_price_cents?: number | null
          print_provider_id?: number
          selling_price_cents?: number | null
          shipping_cents?: number | null
          updated_at?: string | null
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
      invoice_counters: {
        Row: {
          counter_key: string
          last_value: number
          updated_at: string | null
        }
        Insert: {
          counter_key: string
          last_value?: number
          updated_at?: string | null
        }
        Update: {
          counter_key?: string
          last_value?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          billing_address: Json | null
          created_at: string | null
          currency: string
          customer_email: string
          customer_name: string | null
          discount_amount: number
          emailed_at: string | null
          id: string
          invoice_number: string
          issued_at: string
          line_items: Json
          order_id: string
          order_number: string
          payment_method: string | null
          payment_provider: string | null
          pdf_bucket: string | null
          pdf_path: string | null
          related_invoice_id: string | null
          shipping_address: Json | null
          shipping_cost: number
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string | null
          currency?: string
          customer_email: string
          customer_name?: string | null
          discount_amount?: number
          emailed_at?: string | null
          id?: string
          invoice_number: string
          issued_at?: string
          line_items?: Json
          order_id: string
          order_number: string
          payment_method?: string | null
          payment_provider?: string | null
          pdf_bucket?: string | null
          pdf_path?: string | null
          related_invoice_id?: string | null
          shipping_address?: Json | null
          shipping_cost?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          created_at?: string | null
          currency?: string
          customer_email?: string
          customer_name?: string | null
          discount_amount?: number
          emailed_at?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string
          line_items?: Json
          order_id?: string
          order_number?: string
          payment_method?: string | null
          payment_provider?: string | null
          pdf_bucket?: string | null
          pdf_path?: string | null
          related_invoice_id?: string | null
          shipping_address?: Json | null
          shipping_cost?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_related_invoice_id_fkey"
            columns: ["related_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          custom_image_url: string
          design_config: Json | null
          fulfillment_status: string | null
          id: string
          order_id: string | null
          product_id: string | null
          product_name: string
          quantity: number
          total_price: number | null
          unit_price: number | null
          updated_at: string | null
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          created_at?: string | null
          custom_image_url: string
          design_config?: Json | null
          fulfillment_status?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_name: string
          quantity?: number
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string | null
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          created_at?: string | null
          custom_image_url?: string
          design_config?: Json | null
          fulfillment_status?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string | null
          variant_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_reconciliation: {
        Row: {
          actual_status: string | null
          created_at: string | null
          error_message: string | null
          expected_status: string
          id: string
          notes: string | null
          order_id: string | null
          printify_order_id: string | null
          printify_status: string | null
          reconciled_at: string | null
          reconciled_by: string | null
          reconciliation_status: string | null
          retry_count: number | null
          updated_at: string | null
        }
        Insert: {
          actual_status?: string | null
          created_at?: string | null
          error_message?: string | null
          expected_status: string
          id?: string
          notes?: string | null
          order_id?: string | null
          printify_order_id?: string | null
          printify_status?: string | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          reconciliation_status?: string | null
          retry_count?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_status?: string | null
          created_at?: string | null
          error_message?: string | null
          expected_status?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          printify_order_id?: string | null
          printify_status?: string | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          reconciliation_status?: string | null
          retry_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_reconciliation_order_id_fkey"
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
          created_at: string | null
          currency: string | null
          customer_email: string
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          discount_amount: number | null
          id: string
          idempotency_key: string | null
          order_number: string
          payment_method: string | null
          payment_provider: string | null
          payment_status: string | null
          printify_order_id: string | null
          product_id: string | null
          promo_code: string | null
          promo_value: number | null
          shipped_at: string | null
          shipping_address: Json | null
          shipping_cost: number | null
          status: string | null
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
          created_at?: string | null
          currency?: string | null
          customer_email: string
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          discount_amount?: number | null
          id?: string
          idempotency_key?: string | null
          order_number: string
          payment_method?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          printify_order_id?: string | null
          product_id?: string | null
          promo_code?: string | null
          promo_value?: number | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string | null
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
          created_at?: string | null
          currency?: string | null
          customer_email?: string
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          discount_amount?: number | null
          id?: string
          idempotency_key?: string | null
          order_number?: string
          payment_method?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          printify_order_id?: string | null
          product_id?: string | null
          promo_code?: string | null
          promo_value?: number | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string | null
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
      payment_recovery: {
        Row: {
          amount: number
          cart_snapshot: Json | null
          created_at: string | null
          currency: string
          id: string
          last_recovery_attempt: string | null
          line_items: Json | null
          metadata: Json | null
          order_id: string | null
          payment_intent_id: string
          payment_provider: string
          payment_status: string
          recovered_at: string | null
          recovery_attempts: number | null
          recovery_error: string | null
          recovery_status: string | null
          session_id: string | null
          shipping_address: Json | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          cart_snapshot?: Json | null
          created_at?: string | null
          currency?: string
          id?: string
          last_recovery_attempt?: string | null
          line_items?: Json | null
          metadata?: Json | null
          order_id?: string | null
          payment_intent_id: string
          payment_provider: string
          payment_status: string
          recovered_at?: string | null
          recovery_attempts?: number | null
          recovery_error?: string | null
          recovery_status?: string | null
          session_id?: string | null
          shipping_address?: Json | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          cart_snapshot?: Json | null
          created_at?: string | null
          currency?: string
          id?: string
          last_recovery_attempt?: string | null
          line_items?: Json | null
          metadata?: Json | null
          order_id?: string | null
          payment_intent_id?: string
          payment_provider?: string
          payment_status?: string
          recovered_at?: string | null
          recovery_attempts?: number | null
          recovery_error?: string | null
          recovery_status?: string | null
          session_id?: string | null
          shipping_address?: Json | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_recovery_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          captured_at: string | null
          created_at: string | null
          currency: string
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
          captured_at?: string | null
          created_at?: string | null
          currency?: string
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
          captured_at?: string | null
          created_at?: string | null
          currency?: string
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
            foreignKeyName: "fk_payment_transactions_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          blueprint_id: number
          color: string | null
          created_at: string | null
          is_available: boolean | null
          price_cents: number | null
          printify_variant_id: number
          size: string | null
          updated_at: string | null
        }
        Insert: {
          blueprint_id: number
          color?: string | null
          created_at?: string | null
          is_available?: boolean | null
          price_cents?: number | null
          printify_variant_id: number
          size?: string | null
          updated_at?: string | null
        }
        Update: {
          blueprint_id?: number
          color?: string | null
          created_at?: string | null
          is_available?: boolean | null
          price_cents?: number | null
          printify_variant_id?: number
          size?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_new_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["blueprint_id"]
          },
        ]
      }
      products: {
        Row: {
          blueprint_id: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          print_areas: Json | null
          print_provider_id: number | null
          printify_product_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          blueprint_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          print_areas?: Json | null
          print_provider_id?: number | null
          printify_product_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          blueprint_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          print_areas?: Json | null
          print_provider_id?: number | null
          printify_product_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      refund_failures: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          error_code: string | null
          error_message: string | null
          id: string
          manual_refund_id: string | null
          next_retry_at: string | null
          order_id: string | null
          payment_id: string
          payment_provider: string
          reason: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          retry_count: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          manual_refund_id?: string | null
          next_retry_at?: string | null
          order_id?: string | null
          payment_id: string
          payment_provider: string
          reason?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          retry_count?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          manual_refund_id?: string | null
          next_retry_at?: string | null
          order_id?: string | null
          payment_id?: string
          payment_provider?: string
          reason?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          retry_count?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      refunds: {
        Row: {
          id: string
          order_id: string
          payment_transaction_id: string | null
          invoice_id: string | null
          payment_provider: string
          provider_refund_id: string
          amount: number
          currency: string
          reason: string | null
          status: string
          metadata: Json | null
          refunded_at: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          payment_transaction_id?: string | null
          invoice_id?: string | null
          payment_provider: string
          provider_refund_id: string
          amount: number
          currency?: string
          reason?: string | null
          status?: string
          metadata?: Json | null
          refunded_at?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          payment_transaction_id?: string | null
          invoice_id?: string | null
          payment_provider?: string
          provider_refund_id?: string
          amount?: number
          currency?: string
          reason?: string | null
          status?: string
          metadata?: Json | null
          refunded_at?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          }
        ]
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
      webhook_events: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_id: string
          event_type: string
          id: string
          payload: Json | null
          processed_at: string | null
          processing_status: string | null
          provider: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_id: string
          event_type: string
          id?: string
          payload?: Json | null
          processed_at?: string | null
          processing_status?: string | null
          provider: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json | null
          processed_at?: string | null
          processing_status?: string | null
          provider?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      atomic_mollie_payment_capture: {
        Args: {
          p_amount: number
          p_captured_at?: string
          p_currency: string
          p_mollie_payment_id: string
        }
        Returns: Json
      }
      atomic_paypal_payment_capture: {
        Args: {
          p_amount: number
          p_captured_at?: string
          p_currency: string
          p_paypal_capture_id: string
          p_paypal_order_id: string
        }
        Returns: Json
      }
      atomic_stripe_payment_capture: {
        Args: {
          p_amount: number
          p_captured_at?: string
          p_currency: string
          p_stripe_payment_intent_id: string
        }
        Returns: Json
      }
      create_invoice_for_order: {
        Args: { p_order_id: string; p_type?: string }
        Returns: {
          billing_address: Json | null
          created_at: string | null
          currency: string
          customer_email: string
          customer_name: string | null
          discount_amount: number
          emailed_at: string | null
          id: string
          invoice_number: string
          issued_at: string
          line_items: Json
          order_id: string
          order_number: string
          payment_method: string | null
          payment_provider: string | null
          pdf_bucket: string | null
          pdf_path: string | null
          related_invoice_id: string | null
          shipping_address: Json | null
          shipping_cost: number
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          type: string
          updated_at: string | null
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      create_refund_failure_alert: {
        Args: {
          p_amount: number
          p_error_message: string
          p_order_id: string
          p_payment_id: string
          p_payment_provider: string
          p_retry_count?: number
        }
        Returns: string
      }
      deduct_coin: { Args: { user_id: string }; Returns: boolean }
      get_available_colors: {
        Args: { p_blueprint_id: number }
        Returns: string[]
      }
      get_available_sizes: {
        Args: { p_blueprint_id: number; p_color: string }
        Returns: string[]
      }
      get_order_by_idempotency_key: { Args: { key: string }; Returns: string }
      get_pending_payment_recoveries: {
        Args: { p_hours_ago?: number; p_user_id: string }
        Returns: {
          amount: number
          cart_snapshot: Json
          created_at: string
          currency: string
          id: string
          line_items: Json
          payment_intent_id: string
          payment_provider: string
          shipping_address: Json
        }[]
      }
      get_variant: {
        Args: { p_blueprint_id: number; p_color: string; p_size: string }
        Returns: {
          price_cents: number
          printify_variant_id: number
        }[]
      }
      has_size_available: {
        Args: { p_blueprint_id: number; p_size: string }
        Returns: boolean
      }
      increment_recovery_attempt: {
        Args: {
          p_error?: string
          p_payment_intent_id: string
          p_payment_provider: string
        }
        Returns: number
      }
      is_webhook_event_processed: {
        Args: { p_event_id: string; p_provider: string }
        Returns: boolean
      }
      is_webhook_processed: {
        Args: { p_event_id: string; p_provider: string }
        Returns: boolean
      }
      mark_payment_recovered: {
        Args: {
          p_order_id: string
          p_payment_intent_id: string
          p_payment_provider: string
        }
        Returns: boolean
      }
      process_refund_atomic: {
        Args: {
          p_order_id: string
          p_refund_id: string
          p_reason: string
          p_payment_provider: string
          p_amount?: number | null
          p_currency?: string
        }
        Returns: Json
      }
      record_payment_for_recovery: {
        Args: {
          p_amount: number
          p_cart_snapshot: Json
          p_currency: string
          p_line_items: Json
          p_metadata?: Json
          p_payment_intent_id: string
          p_payment_provider: string
          p_payment_status: string
          p_shipping_address: Json
          p_user_email: string
          p_user_id: string
        }
        Returns: string
      }
      record_webhook_event: {
        Args: {
          p_event_id: string
          p_event_type: string
          p_payload?: Json
          p_provider: string
        }
        Returns: string
      }
      record_webhook_event_atomic: {
        Args: {
          p_event_id: string
          p_event_type: string
          p_payload: Json
          p_processed_at?: string
          p_provider: string
        }
        Returns: {
          created_at: string | null
          error_message: string | null
          event_id: string
          event_type: string
          id: string
          payload: Json | null
          processed_at: string | null
          processing_status: string | null
          provider: string
        }
        SetofOptions: {
          from: "*"
          to: "webhook_events"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      trigger_catalog_sync: { Args: never; Returns: undefined }
      update_order_payment_status_atomic: {
        Args: {
          p_order_id: string
          p_order_status: string
          p_payment_method?: string
          p_payment_status: string
        }
        Returns: Json
      }
      upsert_cart_item: {
        Args: {
          p_cart_id: string
          p_custom_image_public_id?: string
          p_custom_image_url?: string
          p_product_id: string
          p_product_name?: string
          p_quantity: number
          p_unit_price?: number
          p_variant_id: string
        }
        Returns: {
          cart_id: string | null
          created_at: string | null
          custom_image_hash: string | null
          custom_image_public_id: string | null
          custom_image_url: string | null
          id: string
          printify_blueprint_id: number | null
          printify_print_provider_id: number | null
          product_id: string | null
          product_name: string | null
          quantity: number | null
          selling_price: number | null
          unit_price: number | null
          updated_at: string | null
          variant_id: string | null
          variant_name: string | null
        }
        SetofOptions: {
          from: "*"
          to: "cart_items"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_mollie_payment_transaction: {
        Args: {
          p_amount: number
          p_currency: string
          p_metadata?: Json
          p_mollie_payment_id: string
          p_order_id: string
          p_status: string
          p_user_id: string
        }
        Returns: {
          amount: number
          captured_at: string | null
          created_at: string | null
          currency: string
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
        SetofOptions: {
          from: "*"
          to: "payment_transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_paypal_payment_transaction: {
        Args: {
          p_amount: number
          p_currency: string
          p_metadata?: Json
          p_order_id: string
          p_paypal_capture_id?: string
          p_paypal_order_id: string
          p_paypal_payer_email?: string
          p_paypal_payer_id?: string
          p_status: string
          p_user_id: string
        }
        Returns: {
          amount: number
          captured_at: string | null
          created_at: string | null
          currency: string
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
        SetofOptions: {
          from: "*"
          to: "payment_transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_stripe_payment_transaction: {
        Args: {
          p_amount: number
          p_currency: string
          p_metadata?: Json
          p_order_id?: string
          p_payment_method_type: string
          p_status: string
          p_stripe_customer_id: string
          p_stripe_payment_intent_id: string
          p_user_id: string
        }
        Returns: {
          amount: number
          captured_at: string | null
          created_at: string | null
          currency: string
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
        SetofOptions: {
          from: "*"
          to: "payment_transactions"
          isOneToOne: true
          isSetofReturn: false
        }
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
    Enums: {},
  },
} as const
