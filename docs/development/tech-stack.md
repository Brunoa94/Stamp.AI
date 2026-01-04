# Tech Stack & Dependencies

## Current Tech Stack

- **Framework**: Next.js 16.1.1 with App Router
- **Authentication**: Supabase SSR (@supabase/ssr)
- **Database**: Supabase (@supabase/supabase-js)
- **Styling**: Tailwind CSS 4.0
- **Fonts**: Geist Sans & Geist Mono from next/font/google
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with Next.js configurations

## State Management Strategy

- **Zustand** for global state (projects, admins, alerts)
- **React hooks** for local component state
- **Server components** for initial data fetching
- **Client components** for interactive features
- **React Query** for server state management and caching

## Performance Optimizations

- **React.memo** for expensive components
- **useCallback** for stable function references
- **Next.js Image** component for optimized images
- **Static assets** served from Supabase bucket
- **React Query** for efficient data caching and background updates