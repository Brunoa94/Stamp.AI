#!/bin/bash
set -a
source .env.local
set +a
npx tsx scripts/test-server-components.ts
