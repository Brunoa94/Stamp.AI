# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

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

### Current Tech Stack

- **Framework**: Next.js 16.1.1 with App Router
- **Authentication**: Supabase SSR (@supabase/ssr)
- **Database**: Supabase (@supabase/supabase-js)
- **Styling**: Tailwind CSS 4.0
- **Fonts**: Geist Sans & Geist Mono from next/font/google
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with Next.js configurations

### Key Architectural Principles

#### 1. **Separation of Concerns**

- **Presentation**: Components handle UI rendering
- **Business Logic**: Services handle API communication
- **Authentication**: Middleware handles session management

#### 2. **Server/Client Component Strategy**

- Server components for data fetching (`app/*/page.tsx`)
- Client components with `"use client"` directive for interactivity
- Middleware for authentication handling at `/middleware.ts`

#### 3. **Supabase Integration**

- **Client-side**: `src/lib/supabase/client.ts` for browser operations
- **Server-side**: `src/lib/supabase/server.ts` for SSR operations
- **Middleware**: `src/lib/supabase/middleware.ts` for authentication
- **Edge Functions**: `supabase/functions/` for serverless operations

## File Organization Patterns

### 1. **Component Organization (Feature-Based)**

Components are organized by **feature/domain** rather than by type:

```
components/
├── aboutMe/               # About page specific components
├── admin/                 # Admin management components
├── adminDashboard/        # Dashboard components
├── adminLogin/            # Login components
├── common/                # Shared/reusable components
├── forms/                 # Form components
│   ├── admin/             # Admin-specific forms
│   └── project/           # Project-specific forms
├── globals/               # Global styled components
├── homepage/              # Homepage sections
├── inputs/                # Input components
├── layout/                # Layout components (Header, Footer, Navbar)
└── projects/              # Project-related components
```

### 2. **Service Layer Pattern**

Services are organized by domain with static class methods:

```typescript
// services/projects.ts
class ProjectsService {
  static async getProjects(): Promise<Project[]> {}
  static async createProject(data: CreateProjectI) {}
  static async updateProject(id: number, data: UpdateProjectI) {}
  static async deleteProject(id: number) {}
}
```

**Benefits:**
- Single responsibility per service
- Easy to test and mock
- Centralized API communication

#### API Error Handling

```typescript
// types/api.ts
export interface ErrorI {
  message: string;
  status: number;
}
```

**Consistent error interface** across API and client

### 3. **React Query Integration**

Use TanStack React Query for server state management, calling service methods:

```typescript
// hooks/useProjects.ts
import { useQuery } from '@tanstack/react-query';
import { ProjectsService } from '@/services/projects';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: ProjectsService.getProjects,
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => ProjectsService.getProject(id),
    enabled: !!id,
  });
}
```

**Pattern:** React Query hooks wrap service methods for data fetching

### 4. **Component State Patterns**

Components using fetched data must include loading and error states:

```typescript
// components/projects/projectList/ProjectList.tsx
import { ProjectListSkeleton } from './ProjectListSkeleton';
import { ProjectListError } from './ProjectListError';

const ProjectList = () => {
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) return <ProjectListSkeleton />;
  if (error) return <ProjectListError error={error} />;

  return (
    <div>
      {projects?.map(project => (
        <ProjectBox key={project.id} project={project} />
      ))}
    </div>
  );
};
```

**Required components in same folder:**
- Main component (`ProjectList.tsx`)
- Loading skeleton (`ProjectListSkeleton.tsx`) - with shimmer effect
- Error component (`ProjectListError.tsx`)

**Shimmer Effect Implementation:**
```typescript
// components/common/shimmer/Shimmer.tsx
export const Shimmer = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// components/projects/projectList/ProjectListSkeleton.tsx
import { Shimmer } from '@/components/common/shimmer/Shimmer';

export const ProjectListSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="p-4 border rounded">
        <Shimmer className="h-6 w-3/4 mb-2" />
        <Shimmer className="h-4 w-1/2" />
      </div>
    ))}
  </div>
);
```

### 5. **Component Patterns**

#### Functional Components with TypeScript

```typescript
interface ProjectBoxI {
  fromAdmin?: boolean;
  project: Project;
}

const ProjectBox = ({ fromAdmin, project }: ProjectBoxI) => {
  // Component logic
};

export default memo(ProjectBox);
```

**Pattern:** Interface-based props, memo for performance optimization

#### Custom Hooks Pattern

```typescript
// hooks/useUpdateForm.ts
export default function useUpdateForm({ project, handleClose }: Props) {
  const updateProject = useProjectStore((state) => state.updateProject);
  const updateAlert = useAlertStore((state) => state.updateAlert);

  const handleUpdate = useCallback(
    async (e: FormEvent) => {
      // Handle form submission
    },
    [dependencies]
  );

  return { handleUpdate, uploadImages };
}
```

**Pattern:** Extract complex logic into custom hooks with useCallback for optimization

### 6. **Form Handling Patterns**

Use TanStack React Query mutations for form submissions:

```typescript
// hooks/useCreateProject.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectsService } from '@/services/projects';

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ProjectsService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
```

### 7. **Testing Patterns**

```typescript
// Co-located test files
components/
└── projects/
    └── projectBox/
        ├── projectBox.tsx
        └── projectBox.test.tsx

services/
├── projects.ts
└── projects.test.ts
```

**Pattern:** Tests co-located with implementation files

### 8. **Naming Conventions**

| Type               | Convention                  | Example                          |
| ------------------ | --------------------------- | -------------------------------- |
| Components         | PascalCase                  | `ProjectBox`, `CreateAdminForm`  |
| Files (components) | camelCase                   | `projectBox.tsx`                 |
| Styled components  | PascalCase export           | `export const Title = styled.h1` |
| Hooks              | camelCase with `use` prefix | `useUpdateForm`, `useAlertStore` |
| Services           | PascalCase class            | `ProjectsService`                |
| Types/Interfaces   | PascalCase with `I` suffix  | `ProjectBoxI`, `CreateProjectI`  |
| API Routes         | lowercase                   | `route.ts`, `[id]/route.ts`      |
| Folders            | camelCase or kebab-case     | `aboutMe`, `admin-dashboard`     |

### 9. **Provider Pattern**

```typescript
// providers/globalProviders.tsx
const GlobalProviders: FC<PropsWithChildren> = async ({ children }) => {
  const session = await getServerSession(authOptions);

  return (
    <StyledComponentsRegistry>
      <AuthProvider session={session}>
        <AlertStoreProvider>{children}</AlertStoreProvider>
      </AuthProvider>
    </StyledComponentsRegistry>
  );
};
```

**Pattern:** Nested provider composition in root layout

## State Management Strategy

- **Zustand** for global state (projects, admins, alerts)
- **React hooks** for local component state
- **Server components** for initial data fetching
- **Client components** for interactive features
- **React Query** for server state management and caching

## Styling Strategy

- **Tailwind CSS** for component-scoped styles
- **CSS variables** for fonts (Geist Sans, Geist Mono)
- **Mobile-first** responsive design
- **Reusable Styling**: Styling that is shared between more than one component should be included in the `theme/` folder
- **Theme Folder**: Create a folder `theme/` that contains reusable component themes and styling utilities
- **Style Reusage**: Enforce reuse of common styling patterns through utility classes and theme components

## Performance Optimizations

- **React.memo** for expensive components
- **useCallback** for stable function references
- **Next.js Image** component for optimized images
- **Static assets** served from Supabase bucket
- **React Query** for efficient data caching and background updates

## TypeScript Guidelines

- Use interfaces to define props of components. If just for a certain component should be `Props`
- Interfaces end with `I` and types with `T`
- Object types that exist on the database are derived from the schemas
- Strict mode enabled in tsconfig.json
- Path mapping configured: `@/*` → `./src/*`

## Zod Integration

- Every new type coming from the API should have a corresponding Zod schema
- Use Zod schemas for runtime validation and type inference

## Environment Configuration

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Supabase Edge Functions

Located in `supabase/functions/`:
- `connect-supabase/` - Supabase connection handling
- `stripe-webhook/` - Stripe webhook processing
- `create-printify-order/` - Printify order creation

Each function has its own `deno.json` configuration file.