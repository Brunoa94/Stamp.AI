-- Database Triggers Export
-- Generated for migration to new Supabase instance

CREATE TRIGGER update_ai_generations_updated_at
  BEFORE UPDATE ON ai_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at
  BEFORE UPDATE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_status_reconciliation_updated_at
  BEFORE UPDATE ON order_status_reconciliation
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER order_status_alignment_check
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION check_order_status_alignment();

CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_recovery_updated_at
  BEFORE UPDATE ON payment_recovery
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_provider_updated_at
  BEFORE UPDATE ON products_provider
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_refund_failures_updated_at
  BEFORE UPDATE ON refund_failures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_designs_updated_at
  BEFORE UPDATE ON user_designs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
