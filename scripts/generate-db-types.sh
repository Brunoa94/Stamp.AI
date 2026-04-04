#!/bin/bash

# =====================================================
# Generate TypeScript Types from Supabase Database
# =====================================================
# This script generates TypeScript type definitions
# from your Supabase database schema
# =====================================================

set -e

echo "🔄 Generating TypeScript types from Supabase database..."

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Generate types from remote database
if [ -n "$SUPABASE_PROJECT_ID" ]; then
    echo "📡 Generating from remote database (Project ID: $SUPABASE_PROJECT_ID)..."
    npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" > database.types.ts
else
    echo "⚠️  SUPABASE_PROJECT_ID not set. Please set it in your .env file or run:"
    echo "    SUPABASE_PROJECT_ID=your-project-id ./scripts/generate-db-types.sh"
    exit 1
fi

echo "✅ TypeScript types generated successfully!"
echo "📝 File: database.types.ts"
