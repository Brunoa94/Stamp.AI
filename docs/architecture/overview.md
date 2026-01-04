# Architecture Overview

## Architecture Pattern: Feature-Based with Layer Separation

The project follows a **hybrid architecture** combining:

1. **Feature-based organization** (for components)
2. **Layer-based separation** (for core functionalities)
3. **Next.js App Router conventions**

```
imaginary-builderai/
├── src/
│   ├── app/                    # Next.js App Router (Routes & API)
│   ├── components/             # React Components (Feature-based)
│   ├── store/                  # Zustand State Management
│   ├── services/               # API Client Services
│   ├── hooks/                  # Custom React Hooks
│   ├── lib/                    # Core Libraries & Utilities
│   │   └── supabase/           # Supabase client configurations
│   ├── types/                  # TypeScript Definitions
│   ├── providers/              # Context Providers
│   ├── theme/                  # Design System
│   ├── utils/                  # Helper Functions
│   └── core/                   # Framework Configuration
├── supabase/                   # Supabase Edge Functions & Config
│   ├── functions/              # Edge Functions
│   └── config.toml             # Supabase configuration
├── public/                     # Static Assets
└── tests/                      # Test Files (co-located)
```

## Key Architectural Principles

### **1. Separation of Concerns**

- **Presentation**: Components handle UI rendering
- **Business Logic**: Services handle API communication
- **Authentication**: Middleware handles session management

### **2. Server/Client Component Strategy**

- Server components for data fetching (`app/*/page.tsx`)
- Client components with `"use client"` directive for interactivity
- Middleware for authentication handling at `/middleware.ts`

### **3. Supabase Integration**

- **Client-side**: `src/lib/supabase/client.ts` for browser operations
- **Server-side**: `src/lib/supabase/server.ts` for SSR operations
- **Middleware**: `src/lib/supabase/middleware.ts` for authentication
- **Edge Functions**: `supabase/functions/` for serverless operations