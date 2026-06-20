#!/bin/bash

# Test Catalog Sync Script
# Invokes the sync-catalog Edge Function on the TEST database

# 🚨 CRITICAL: This script targets the TEST database only!
# TEST DATABASE: https://tgccxydchvujhrqyzqao.supabase.co
# DO NOT run against production!

TEST_SUPABASE_URL="https://tgccxydchvujhrqyzqao.supabase.co"
TEST_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnY2N4eWRjaHZ1amhycXl6cWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyOTQ0ODMsImV4cCI6MjA5Njg3MDQ4M30.52GltDCy4oO6DH9Rw4MmqM_e_Z5tfmnyC9bgRGjbQMY"

echo "🚀 Starting catalog sync on TEST database..."
echo "Database: $TEST_SUPABASE_URL"
echo ""

# Sync specific blueprints for testing (Heavy Cotton Tee)
# Blueprint ID 12 = Bella+Canvas 3001
echo "Syncing blueprint 12 (Bella+Canvas 3001)..."

curl -X POST \
  "${TEST_SUPABASE_URL}/functions/v1/sync-catalog" \
  -H "Authorization: Bearer ${TEST_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "countries": ["US", "GB", "FR", "DE"],
    "blueprintIds": [12],
    "forceUpdate": true
  }' \
  | jq .

echo ""
echo "✅ Sync request completed!"
echo ""
echo "To verify sync results, run these queries in Supabase SQL Editor:"
echo ""
echo "-- Check products:"
echo "SELECT * FROM catalog_products;"
echo ""
echo "-- Check variants:"
echo "SELECT * FROM product_variants LIMIT 10;"
echo ""
echo "-- Check provider availability:"
echo "SELECT * FROM product_provider_availability LIMIT 10;"
echo ""
echo "-- Check variant pricing:"
echo "SELECT * FROM variant_pricing LIMIT 10;"
