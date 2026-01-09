# Component Guidelines

## UI Component Priority

**Always prioritize shadcn/ui components over custom implementations**

1. **First**: Check if a shadcn/ui component exists for your use case
2. **Second**: Install the shadcn component if not already available
3. **Third**: Extend shadcn components with custom variants if needed
4. **Last resort**: Create custom components only when shadcn doesn't provide the functionality

```bash
# Install new shadcn components as needed
npx shadcn@latest add textarea
npx shadcn@latest add form
npx shadcn@latest add select
```

### **Component Usage Priority Order**

1. **shadcn/ui components** - `@/components/ui/*`
2. **Extended shadcn variants** - Custom styling on top of shadcn base
3. **Custom components** - Only when shadcn doesn't meet requirements

### **Examples**

```typescript
// ✅ Good: Using shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// ✅ Good: Extending shadcn with custom variants
<Button variant="outline" className="bg-purple-500 hover:bg-purple-600">
  Custom styled shadcn button
</Button>;

// ❌ Avoid: Custom button when shadcn Button exists
const CustomButton = ({ children }) => (
  <button className="px-4 py-2 bg-blue-500 rounded">{children}</button>
);
```

## Components Creation Patterns

- Each file should just contain one component
- Each component follows the Single Responsibility principle
- Each component, styling and test files related to a component should be created in the same folder
- Follow the DRY principle: if something is sharable between components just be stored on a `common` folder
- Components that fetch data should contain a react query method for the request handling.
- If data is being fetched a loading and error state should be created.
- The loading state should be a shimmer created on a separate component.
- The error should be related to the action being made

## **Feature-Based Organization**

**Rule: Organize components by feature, not by type**

- **Feature folders**: Group related components together by their business purpose
- **Shared components**: Only place truly reusable components in global folders
- **Co-location**: Keep feature-specific components close to where they're used

### **Folder Structure Patterns**

```
src/components/
├── dashboard/
│   ├── createPromptInput/           # ✅ Feature-based
│   │   ├── PromptInput.tsx         # Main component
│   │   ├── PromptInputSection.tsx  # Section wrapper
│   │   ├── PromptInputField.tsx    # Input field
│   │   └── index.ts                # Barrel export
│   ├── imageUpload/                # ✅ Feature-based
│   │   ├── ImageUploader.tsx
│   │   ├── ImageUploadSection.tsx
│   │   ├── ImagePreview.tsx
│   │   └── index.ts
│   └── imageGeneration/            # ✅ Feature-based
│       ├── ImageGenerationForm.tsx
│       ├── ProcessingSection.tsx
│       ├── ResultsSection.tsx
│       └── index.ts
├── formFields/                     # ❌ Type-based (avoid)
│   ├── ImageUploadField.tsx
│   └── PromptInputField.tsx
├── ui/                             # ✅ Shared UI components
│   ├── button.tsx
│   ├── input.tsx
│   └── textarea.tsx
└── common/                         # ✅ Truly shared components
    ├── shimmer/
    └── errorBoundary/
```

### **Organization Guidelines**

1. **Feature Folders**: Name folders by what they do, not what they are
   - ✅ `createPromptInput/` - describes the feature
   - ❌ `promptInput/` - generic type name
   - ❌ `formFields/` - type-based organization

2. **Co-location**: Keep related files together
   - Main component, sub-components, hooks, and types in same folder
   - Only separate when components are used across multiple features

3. **Barrel Exports**: Use index.ts files to clean up imports
   ```typescript
   // ✅ Good: Direct named exports in barrel files
   // src/components/dashboard/createPromptInput/index.ts
   export { PromptInput } from './PromptInput';
   export { PromptInputSection } from './PromptInputSection';
   export type { PromptInputProps } from './PromptInput';

   // Component files can still use default exports
   // src/components/dashboard/createPromptInput/PromptInput.tsx
   const PromptInput = () => { /* component */ };
   export default PromptInput;

   // ❌ Bad: Re-exporting default as named
   export { default as PromptInput } from './PromptInput';
   ```

4. **Shared vs Feature-Specific**:
   - **Shared**: Used by 3+ unrelated features → `components/common/`
   - **Feature-specific**: Used within one feature → keep in feature folder
   - **UI Components**: From component libraries → `components/ui/`

### **Migration Example**

```typescript
// ❌ Bad: Type-based organization
src/components/
├── sections/
│   ├── PromptInputSection.tsx
│   └── ImageUploadSection.tsx
└── inputs/
    ├── PromptInput.tsx
    └── ImageUploader.tsx

// ✅ Good: Feature-based organization
src/components/dashboard/
├── createPromptInput/
│   ├── PromptInput.tsx
│   ├── PromptInputSection.tsx
│   └── index.ts
└── uploadImage/
    ├── ImageUploader.tsx
    ├── ImageUploadSection.tsx
    └── index.ts
```

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
// ✅ Good: Use "Props" for single-component interfaces
interface Props {
  fromAdmin?: boolean;
  project: Project;
}

const ProjectBox = ({ fromAdmin, project }: Props) => {
  // Component logic
};

// ✅ Good: Use descriptive names only when shared across components
interface ProjectBoxProps {
  fromAdmin?: boolean;
  project: Project;
}
// Export this interface if used by multiple components
export type { ProjectBoxProps };
```

**Pattern:** Interface-based props with `Props` for single use, descriptive names for shared interfaces

### Ref Handling Guidelines

- **Avoid unnecessary `forwardRef`**: Only use `forwardRef` when the ref actually needs to be forwarded to a child component or DOM element
- **Direct ref usage**: When a component only uses the ref internally, use it directly without `forwardRef`

```typescript
// ❌ Bad: Unnecessary forwardRef when ref is only used internally
const ProcessingSection = forwardRef<HTMLElement, Props>(
  ({ isProcessing }, ref) => {
    return <section ref={ref}>Content</section>;
  }
);

// ✅ Good: Direct ref usage when not forwarding to children
interface Props {
  isProcessing: boolean;
  sectionRef?: React.RefObject<HTMLElement>;
}

const ProcessingSection = ({ isProcessing, sectionRef }: Props) => {
  return <section ref={sectionRef}>Content</section>;
};

// ✅ Good: forwardRef only when actually forwarding to children
const CustomInput = forwardRef<HTMLInputElement, Props>((props, ref) => {
  return <input ref={ref} {...props} />; // Ref forwarded to actual input
});
```

### Custom Hooks Pattern

```typescript
// hooks/useUpdateForm.ts
export default function useUpdateForm({ project, handleClose }: Props) {
  const updateProject = useProjectStore((state) => state.updateProject);
  const updateAlert = useAlertStore((state) => state.updateAlert);

  const handleUpdate = async (e: FormEvent) => {
    // Handle form submission
  };

  return { handleUpdate, uploadImages };
}
```

**Pattern:** Extract complex logic into custom hooks

### Code Quality and Imports

- **Remove Unused Imports**: Always remove unused imports to keep code clean and improve bundle size
- **Import Organization**: Group and order imports logically (external libraries, internal modules, relative imports)
- **Automatic Cleanup**: Configure your IDE/linter to automatically remove unused imports on save

```typescript
// ❌ Bad: Unused imports left in code
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";

const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Button onClick={() => setIsOpen(true)}>
      Open
    </Button>
  );
};

// ✅ Good: Only necessary imports included
import { useState } from "react";
import { Button } from "@/components/ui/button";

const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Button onClick={() => setIsOpen(true)}>
      Open
    </Button>
  );
};
```

**Import Best Practices:**
- Remove imports immediately when they're no longer needed
- Use TypeScript's strict mode to catch unused imports
- Configure ESLint rules for unused imports detection
- Use IDE auto-import features to prevent manual import errors

### Hook Organization Rules

- **Component-specific hooks**: Hooks that are only used by one component should be placed in the same folder as that component
- **Shared hooks**: Hooks used by multiple components should be placed in the global `hooks/` folder
- **Co-location principle**: Keep related files together for better maintainability

```
src/
├── components/
│   └── dashboard/
│       └── UserProfile/
│           ├── UserProfile.tsx          # ✅ Component
│           └── useUserProfile.ts        # ✅ Component-specific hook
└── hooks/
    ├── useAuth.ts                       # ✅ Shared across app
    ├── useApi.ts                        # ✅ Shared utility hook
    └── useLocalStorage.ts               # ✅ Shared utility hook
```

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

### **React Hook Form Integration**

Use React Hook Form with Zod validation for form management:

```typescript
// Form component pattern
const FormComponent = () => {
  const form = useForm<IFormSchema>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const {
    formState: { errors },
    handleSubmit,
    setError,
  } = form;

  const onSubmit = async (data) => {
    try {
      // API call
    } catch (error) {
      setError("root.serverError", {
        type: "server",
        message: error.message,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("field")} />
      {errors.field && <p className="text-red-500">{errors.field.message}</p>}
      {errors.root?.serverError && (
        <p className="text-red-500">{errors.root.serverError.message}</p>
      )}
    </form>
  );
};
```

### **Form Validation Utilities**

Create reusable form validation utilities:

```typescript
// utils/formUtils.ts
export const canSubmitForm = (
  hasUploadedFile: boolean,
  prompt: string | undefined,
  wordCount: number,
  isProcessing: boolean,
  limit: number = 150
): boolean => {
  if (!prompt) return false;
  const hasValidPrompt = prompt?.trim().length > 0;
  const isUnderLimit = !isWordCountOverLimit(wordCount, limit);

  return hasUploadedFile && hasValidPrompt && isUnderLimit && !isProcessing;
};

// Best practices:
// - Use guard clauses for early returns
// - Always validate required parameters first
// - Keep validation logic in separate utility functions
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

## Error Handling Guidelines

### Service Layer Error Handling

- **Mandatory Try-Catch**: ALL service methods with fetch operations MUST be wrapped in try-catch blocks
- **Comprehensive Error Handling**: Handle network errors, parsing errors, HTTP status errors, and unknown exceptions
- **Contextual Error Messages**: Provide meaningful error messages with context about what operation failed
- **Error Propagation**: Re-throw errors with additional context for upper layers to handle

```typescript
// ✅ Good: Comprehensive error handling in service methods
export class ApiService {
  static async fetchData(id: string): Promise<Data> {
    try {
      const response = await fetch(`/api/data/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Handle HTTP errors
      if (!response.ok) {
        let errorMessage = 'Failed to fetch data';

        try {
          const errorResult = await response.json();
          errorMessage = errorResult.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }

        throw new Error(`HTTP ${response.status}: ${errorMessage}`);
      }

      const result = await response.json();

      // Validate response structure
      if (!result.success || !result.data) {
        throw new Error('Invalid response format');
      }

      return result.data;
    } catch (error) {
      // Handle network errors, parsing errors, and other exceptions
      if (error instanceof Error) {
        // Re-throw known errors with context
        throw new Error(`Data fetch failed: ${error.message}`);
      }

      // Handle unknown errors
      throw new Error('Data fetch failed: Unknown error occurred');
    }
  }
}

// ❌ Bad: No error handling
export class BadApiService {
  static async fetchData(id: string): Promise<Data> {
    const response = await fetch(`/api/data/${id}`);
    const result = await response.json();
    return result.data; // What if network fails? What if parsing fails?
  }
}
```

### Hook Layer Error Handling

- **Error Handler Hook**: Create and use a dedicated error handler hook for consistent error handling across the application
- **User Feedback**: Show appropriate user feedback (toasts, error banners) for different error types
- **Error Codes**: Display error codes in user-friendly messages for debugging support

```typescript
// hooks/useErrorHandler.ts
export function useErrorHandler() {
  const handleError = useCallback((error: {
    message: string;
    error?: string;
    status?: number;
  }) => {
    // Log error for debugging
    console.error('Error occurred:', error);

    // Show user-friendly message
    toast.error(`Error ${error.error || 'UNKNOWN'}: ${error.message}`);

    // Could also trigger error reporting service here
    // errorReportingService.captureError(error);
  }, []);

  return { handleError };
}

// Usage in components/hooks
const { handleError } = useErrorHandler();

try {
  await ApiService.fetchData(id);
} catch (error) {
  handleError({
    message: error.message,
    error: 'DATA_FETCH_FAILED',
  });
}
```

### Error Handling Best Practices

1. **Always Use Try-Catch**: Wrap all async operations in try-catch blocks
2. **Specific Error Messages**: Provide context about what operation failed and why
3. **HTTP Status Handling**: Check response.ok and handle different status codes appropriately
4. **JSON Parsing Protection**: Wrap response.json() in try-catch in case response is not valid JSON
5. **Error Context**: Add context when re-throwing errors to help with debugging
6. **User Experience**: Show user-friendly error messages while logging technical details
7. **Error Boundaries**: Use React Error Boundaries for component-level error handling
8. **Retry Logic**: Consider implementing retry logic for transient failures

### Error Types to Handle

- **Network Errors**: No internet connection, server unreachable
- **HTTP Errors**: 400, 401, 403, 404, 500, etc.
- **Parsing Errors**: Invalid JSON responses
- **Validation Errors**: Missing or invalid response data
- **Timeout Errors**: Request takes too long
- **Unknown Errors**: Unexpected exceptions

## End-to-End Testing Requirements

- **Mandatory E2E Tests**: Every new user action or functionality added to the application MUST have corresponding end-to-end tests
- **Co-location Pattern**: E2E tests should be placed in the same folder as the feature component they're testing
- **Comprehensive Scenarios**: Include both success paths (happy path) and failure scenarios (error handling, edge cases)
- **Test Documentation**: Document test scenarios and expected behaviors for each new feature

### E2E Testing File Organization

```
src/features/dashboard/createImage/
├── ImageGenerationForm/
│   ├── ImageGenerationForm.tsx
│   ├── ImageGenerationForm.e2e.spec.ts     # ✅ Co-located E2E tests
│   ├── useImageGeneration.ts
│   └── useImageGenerationForm.ts
├── ProcessingSection/
│   ├── ProcessingSection.tsx
│   └── ProcessingSection.e2e.spec.ts       # ✅ Co-located E2E tests
```

### E2E Testing Guidelines

```typescript
// src/features/dashboard/createImage/ImageGenerationForm/ImageGenerationForm.e2e.spec.ts
import { test, expect } from '@playwright/test';

describe('Image Generation Form', () => {
  // ✅ Success Scenarios (Happy Path)
  describe('Success Flows', () => {
    test('should complete full image generation workflow', async ({ page }) => {
      await page.goto('/dashboard');

      // Test image upload
      await page.setInputFiles('input[type="file"]', 'fixtures/test-image.jpg');
      await expect(page.locator('[data-testid="uploaded-image"]')).toBeVisible();

      // Test prompt input
      await page.fill('textarea[id="prompt"]', 'A magical fantasy scene with dragons');
      await expect(page.locator('[data-testid="word-count"]')).toContainText('7 words');

      // Test form submission
      await page.click('button[type="submit"]');

      // Verify processing state
      await expect(page.locator('[aria-label="Processing status"]')).toBeVisible();
      await expect(page.locator('text=Creating magic')).toBeVisible();

      // Verify results (with timeout for API call)
      await expect(page.locator('[data-testid="generated-image"]')).toBeVisible({ timeout: 30000 });
      await expect(page.locator('[data-testid="download-button"]')).toBeEnabled();
    });

    test('should allow image replacement', async ({ page }) => {
      await page.goto('/dashboard');

      // Upload first image
      await page.setInputFiles('input[type="file"]', 'fixtures/image1.jpg');
      await expect(page.locator('[data-testid="remove-image-button"]')).toBeVisible();

      // Replace with second image
      await page.click('[data-testid="remove-image-button"]');
      await page.setInputFiles('input[type="file"]', 'fixtures/image2.jpg');

      // Verify new image is displayed
      await expect(page.locator('[data-testid="uploaded-image"]')).toBeVisible();
    });
  });

  // ✅ Failure Scenarios (Error Handling)
  describe('Error Scenarios', () => {
    test('should show error when submitting without image', async ({ page }) => {
      await page.goto('/dashboard');

      // Try to submit without image
      await page.fill('textarea[id="prompt"]', 'A magical scene');
      await page.click('button[type="submit"]');

      // Verify error handling
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Image is required');
      await expect(page.locator('button[type="submit"]')).toBeDisabled();
    });

    test('should show error when prompt exceeds word limit', async ({ page }) => {
      await page.goto('/dashboard');

      // Upload image
      await page.setInputFiles('input[type="file"]', 'fixtures/test-image.jpg');

      // Enter prompt that exceeds limit
      const longPrompt = 'word '.repeat(200); // Exceeds 150 word limit
      await page.fill('textarea[id="prompt"]', longPrompt);

      // Verify error state
      await expect(page.locator('[data-testid="word-count"]')).toContainText('200 words');
      await expect(page.locator('[data-testid="word-count-error"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeDisabled();
    });

    test('should handle API failure gracefully', async ({ page }) => {
      // Mock API failure
      await page.route('**/api/generate-image', route =>
        route.fulfill({ status: 500, body: 'Server Error' })
      );

      await page.goto('/dashboard');
      await page.setInputFiles('input[type="file"]', 'fixtures/test-image.jpg');
      await page.fill('textarea[id="prompt"]', 'A magical scene');
      await page.click('button[type="submit"]');

      // Verify error handling
      await expect(page.locator('[data-testid="error-banner"]')).toContainText('Failed to generate image');
      await expect(page.locator('button[type="submit"]')).toBeEnabled(); // Should allow retry
    });

    test('should handle unsupported file formats', async ({ page }) => {
      await page.goto('/dashboard');

      // Try to upload unsupported format
      await page.setInputFiles('input[type="file"]', 'fixtures/document.pdf');

      // Verify error handling
      await expect(page.locator('[data-testid="file-error"]')).toContainText('Only image files are supported');
      await expect(page.locator('[data-testid="uploaded-image"]')).not.toBeVisible();
    });
  });

  // ✅ Edge Cases
  describe('Edge Cases', () => {
    test('should handle network interruption during upload', async ({ page }) => {
      // Test offline scenario
      await page.context().setOffline(true);

      await page.goto('/dashboard');
      await page.setInputFiles('input[type="file"]', 'fixtures/test-image.jpg');
      await page.fill('textarea[id="prompt"]', 'A magical scene');
      await page.click('button[type="submit"]');

      // Verify offline handling
      await expect(page.locator('[data-testid="offline-error"]')).toBeVisible();
    });
  });
});
```

**Testing Checklist for New Features:**
- [ ] **Success Path**: User can complete the intended action successfully
- [ ] **Form Validation**: Invalid inputs show proper error messages
- [ ] **API Failures**: Network errors are handled gracefully with user feedback
- [ ] **Loading States**: Processing indicators are displayed correctly
- [ ] **Edge Cases**: Boundary conditions and unusual inputs are tested
- [ ] **Error Recovery**: Users can retry after errors
- [ ] **Accessibility**: Screen readers and keyboard navigation work
- [ ] **Responsive**: Feature works across different screen sizes
- [ ] **File Location**: Test file is co-located with the component being tested
