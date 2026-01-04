# Component Guidelines

## Components Creation Patterns

- Each file should just contain one component
- Each component follows the Single Responsibility principle
- Each component, styling and test files related to a component should be created in the same folder
- Follow the DRY principle: if something is sharable between components just be stored on a `common` folder
- Components that fetch data should contain a react query method for the request handling.
- If data is being fetched a loading and error state should be created.
- The loading state should be a shimmer created on a separate component.
- The error should be related to the action being made

## **React Query Integration**

Use TanStack React Query for server state management, calling service methods:

```typescript
// hooks/useProjects.ts
import { useQuery } from "@tanstack/react-query";
import { ProjectsService } from "@/services/projects";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: ProjectsService.getProjects,
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => ProjectsService.getProject(id),
    enabled: !!id,
  });
}
```

**Pattern:** React Query hooks wrap service methods for data fetching

## **Component State Patterns**

Components using fetched data must include loading and error states:

```typescript
// components/projects/projectList/ProjectList.tsx
import { ProjectListSkeleton } from "./ProjectListSkeleton";
import { ProjectListError } from "./ProjectListError";

const ProjectList = () => {
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) return <ProjectListSkeleton />;
  if (error) return <ProjectListError error={error} />;

  return (
    <div>
      {projects?.map((project) => (
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
import { Shimmer } from "@/components/common/shimmer/Shimmer";

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

## **Component Patterns**

### Functional Components with TypeScript

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

### Custom Hooks Pattern

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

## **Form Handling Patterns**

Use TanStack React Query mutations for form submissions:

```typescript
// hooks/useCreateProject.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectsService } from "@/services/projects";

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ProjectsService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
```

## Navigation Patterns

- **Always use Next.js Link component for navigation** instead of programmatic routing (`useRouter().push()`)
- Use the `asChild` prop when combining Link with Button components
- Pattern for button navigation:

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Correct usage
<Button asChild>
  <Link href="/path">Button Text</Link>
</Button>

// Avoid this
<Button onClick={() => router.push("/path")}>
  Button Text
</Button>
```

## Error handling

- A error handler hook should be created and called on each function with fetch methods.
- This hook should receive the error body and show a toast with the error.
- The ERROR_CODE should be displayed on the message with an error header