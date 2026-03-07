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

## Accessibility Guidelines

### **WCAG 2.1 AA Compliance**

All components MUST follow WCAG 2.1 AA accessibility standards:

- **Minimum color contrast**: 4.5:1 for normal text, 3:1 for large text
- **Keyboard navigation**: All interactive elements must be keyboard accessible
- **Screen reader support**: Proper ARIA labels and semantic HTML
- **Focus management**: Visible focus indicators and logical tab order

### **Mandatory Accessibility Features**

```typescript
// ✅ Good: Accessible component with proper attributes
const AccessibleButton = ({
  children,
  onClick,
  disabled = false,
  ariaLabel,
  variant = "primary"
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      className={clsx(
        componentThemes.button[variant],
        "focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        "focus:outline-none",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {children}
    </Button>
  );
};

// ✅ Good: Form input with proper labeling
const AccessibleInput = ({ label, id, error, ...props }) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="space-y-1">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700"
      >
        {label} {props.required && <span aria-label="required">*</span>}
      </label>
      <Input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        {...props}
      />
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-sm text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
};
```

### **Required Accessibility Attributes**

**Interactive Elements:**
- `aria-label` or `aria-labelledby` for elements without visible text
- `aria-disabled` for disabled state
- `role` attribute when semantic HTML isn't sufficient
- `tabindex="0"` for custom interactive elements

**Form Elements:**
- `htmlFor` attribute linking labels to inputs
- `aria-invalid` for validation state
- `aria-describedby` for error messages and help text
- `required` attribute for mandatory fields

**Dynamic Content:**
- `aria-live` for content that updates
- `aria-expanded` for collapsible content
- `aria-hidden` for decorative elements
- `role="alert"` for error messages

### **Keyboard Navigation Requirements**

```typescript
// ✅ Good: Custom dropdown with keyboard support
const AccessibleDropdown = ({ options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          onSelect(options[focusedIndex]);
          setIsOpen(false);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev =>
          prev < options.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev =>
          prev > 0 ? prev - 1 : options.length - 1
        );
        break;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        Select option
      </button>
      {isOpen && (
        <ul
          role="listbox"
          className="absolute z-10 w-full bg-white border shadow-lg"
        >
          {options.map((option, index) => (
            <li
              key={option.id}
              role="option"
              aria-selected={focusedIndex === index}
              className={clsx(
                "px-3 py-2 cursor-pointer",
                focusedIndex === index && "bg-blue-100"
              )}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

### **Color and Contrast Guidelines**

```typescript
// Color contrast validation utility
export const validateContrast = (foreground: string, background: string) => {
  // Implementation to check WCAG contrast ratios
  // Return true if contrast ratio meets AA standards (4.5:1)
};

// ✅ Good: High contrast color combinations
const accessibleColors = {
  text: {
    primary: "text-gray-900",      // High contrast on white
    secondary: "text-gray-700",    // Good contrast on white
    error: "text-red-700",         // High contrast error text
    success: "text-green-700"      // High contrast success text
  },
  background: {
    error: "bg-red-50",            // Light background for error states
    success: "bg-green-50",        // Light background for success states
    warning: "bg-yellow-50"        // Light background for warnings
  }
};

// ❌ Avoid: Low contrast combinations
const poorColors = {
  "text-gray-400 bg-gray-200",     // Poor contrast
  "text-yellow-300 bg-white",      // Insufficient contrast
  "text-blue-300 bg-blue-100"      // Low contrast
};
```

### **Screen Reader Optimization**

```typescript
// ✅ Good: Image with proper alt text and descriptions
const AccessibleImage = ({ src, alt, description }) => {
  return (
    <figure>
      <img
        src={src}
        alt={alt}
        className="rounded-lg"
      />
      {description && (
        <figcaption className="sr-only">
          {description}
        </figcaption>
      )}
    </figure>
  );
};

// ✅ Good: Loading state with screen reader announcement
const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center"
    >
      <div
        className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
        aria-hidden="true"
      />
      <span className="sr-only">{message}</span>
    </div>
  );
};

// ✅ Good: Skip link for keyboard users
const SkipLink = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white px-4 py-2 z-50"
    >
      Skip to main content
    </a>
  );
};
```

### **Focus Management**

```typescript
// ✅ Good: Modal with proper focus management
const AccessibleModal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousFocus.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }

    // Trap focus within modal
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 focus:outline-none"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </div>
  );
};
```

### **Accessibility Testing Requirements**

**Manual Testing Checklist:**
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are clearly visible
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets WCAG AA standards
- [ ] Content is readable at 200% zoom
- [ ] Form validation errors are announced

**Automated Testing:**
```typescript
// Add to component test files
import { axe } from '@axe-core/react';

describe('Component Accessibility', () => {
  test('should not have accessibility violations', async () => {
    const { container } = render(<YourComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

**Required Tools:**
- **axe-core**: Automated accessibility testing
- **Screen readers**: Test with NVDA, JAWS, or VoiceOver
- **Keyboard navigation**: Test with Tab, Enter, Space, Arrow keys
- **Color contrast analyzers**: Verify WCAG compliance

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

3. **Barrel Exports (index.ts)**: **DO NOT create index.ts files**

   **IMPORTANT: Avoid creating barrel exports (index.ts files) in component folders.**

   **Why avoid index.ts files:**
   - Adds unnecessary complexity and indirection
   - Makes it harder to track where imports come from
   - Can cause circular dependency issues
   - Harder to maintain and refactor
   - IDE auto-imports work better with direct file imports
   - Explicit imports are more clear and maintainable

   **Default approach:**
   - Import components directly from their file paths
   - Use explicit imports: `import { Button } from '@/features/ui/button'`
   - Avoid barrel exports: `import { Button } from '@/features/ui'`

   ```typescript
   // ✅ Good: Direct imports from files
   import { Button } from '@/features/ui/button';
   import { Input } from '@/features/ui/input';
   import { PageHeader } from '@/features/ui/page-header';

   // ❌ Bad: Barrel exports with index.ts
   // src/features/ui/index.ts
   export { Button } from './button';
   export { Input } from './input';
   export { PageHeader } from './page-header';

   // Then importing from the barrel (DON'T DO THIS)
   import { Button, Input, PageHeader } from '@/features/ui';
   ```

   **Extremely rare exceptions (use sparingly):**
   Only create index.ts if ALL of these conditions are met:
   - Multiple files (2+) are ALWAYS imported together
   - They form a single, cohesive API
   - They are tightly coupled and interdependent
   - The folder represents a single logical unit

   ```typescript
   // Acceptable (but still discouraged): Tightly coupled feature unit
   // src/features/wizard/steps/upload/index.ts
   export { UploadStep } from './UploadStep';
   export { UploadForm } from './UploadForm';
   export { UploadPreview } from './UploadPreview';
   export { useUploadStep } from './useUploadStep';
   // These 4 files are ALWAYS used together as one feature
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

**IMPORTANT:** All React Query hooks must be centralized in the `queries/` folder, not in component files or the `hooks/` folder.

Use TanStack React Query for server state management, calling service methods:

```typescript
// queries/projectQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectT) => ProjectsService.createProject(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["projects", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
```

**Pattern:** React Query hooks centralized in `queries/` folder, organized by domain

**Benefits:**
- Single source of truth for all queries/mutations
- Consistent query keys across the application
- Reusable across multiple components
- Easy cache invalidation management

See [Queries Layer Documentation](../architecture/queries-layer.md) for detailed patterns and best practices.

## **Component State Patterns**

Components using fetched data must include loading and error states:

```typescript
// components/projects/projectList/ProjectList.tsx
import { useProjects } from "@/queries/projectQueries";
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

### Client Components ("use client")

**Only use "use client" when necessary:**

- Components that use browser-only features (useState, useEffect, event handlers)
- Components that need to interact with the DOM directly
- Interactive components with user events (onClick, onChange, etc.)
- Components using browser APIs (localStorage, window, etc.)

**Do NOT use "use client" for:**
- Pure presentational components without state or events
- Components that only display data passed via props
- Server components that can render on the server
- Static components without user interaction

```typescript
// ❌ Bad: Unnecessary "use client" for static component
"use client";

interface Props {
  title: string;
  description: string;
}

export default function StaticCard({ title, description }: Props) {
  return (
    <div className="p-4 border rounded">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

// ✅ Good: No "use client" needed for static component
interface Props {
  title: string;
  description: string;
}

export default function StaticCard({ title, description }: Props) {
  return (
    <div className="p-4 border rounded">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

// ✅ Good: "use client" needed for interactive component
"use client";

import { useState } from "react";

interface Props {
  onSelect: (value: string) => void;
}

export default function InteractiveSelect({ onSelect }: Props) {
  const [selected, setSelected] = useState("");

  const handleChange = (value: string) => {
    setSelected(value);
    onSelect(value);
  };

  return (
    <select value={selected} onChange={(e) => handleChange(e.target.value)}>
      <option value="">Select option</option>
    </select>
  );
}
```

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

**IMPORTANT: Avoid using `forwardRef` and `useImperativeHandle`. Prefer callback patterns instead.**

#### Why Avoid forwardRef?

- **Poor composition**: Breaks component encapsulation
- **Imperative API**: Goes against React's declarative nature
- **Hard to track**: Makes data flow harder to follow
- **Memory leaks**: Can cause issues if refs aren't cleaned up properly
- **Testing complexity**: Makes components harder to test

#### Prefer Callback Patterns

```typescript
// ❌ Bad: Using forwardRef and useImperativeHandle
export interface PaymentFormRef {
  submitPayment: () => void;
}

const PaymentForm = forwardRef<PaymentFormRef, Props>((props, ref) => {
  const handlePayment = async () => {
    // Payment logic
  };

  useImperativeHandle(ref, () => ({
    submitPayment: handlePayment,
  }));

  return <form>...</form>;
});

// Usage
const ref = useRef<PaymentFormRef>(null);
ref.current?.submitPayment(); // Imperative call

// ✅ Good: Using callback pattern with trigger prop
interface Props {
  triggerSubmit?: boolean;
  onSubmitComplete?: () => void;
  onSuccess?: (data: any) => void;
}

const PaymentForm = ({ triggerSubmit, onSubmitComplete, onSuccess }: Props) => {
  const handlePayment = async () => {
    // Payment logic
    const result = await processPayment();
    onSuccess?.(result);
  };

  useEffect(() => {
    if (triggerSubmit) {
      handlePayment().finally(() => {
        onSubmitComplete?.();
      });
    }
  }, [triggerSubmit]);

  return <form>...</form>;
};

// Usage
const [triggerPayment, setTriggerPayment] = useState(false);

const handleCompleteOrder = () => {
  setTriggerPayment(true); // Declarative trigger
};

const handlePaymentComplete = () => {
  setTriggerPayment(false); // Reset trigger
};

<PaymentForm
  triggerSubmit={triggerPayment}
  onSubmitComplete={handlePaymentComplete}
  onSuccess={handleSuccess}
/>
```

#### When forwardRef Is Acceptable

Only use `forwardRef` when building low-level UI components that need to expose native DOM elements:

```typescript
// ✅ Acceptable: Forwarding ref to native DOM element
const CustomInput = forwardRef<HTMLInputElement, Props>((props, ref) => {
  return <input ref={ref} {...props} />; // Direct DOM access needed
});

// ✅ Acceptable: UI library component exposing DOM element
const Button = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  return <button ref={ref} className="custom-button" {...props} />;
});
```

#### Direct Ref Usage

When a component needs a ref internally (not exposing it), pass it as a prop:

```typescript
// ✅ Good: Direct ref usage as prop
interface Props {
  isProcessing: boolean;
  sectionRef?: React.RefObject<HTMLElement>;
}

const ProcessingSection = ({ isProcessing, sectionRef }: Props) => {
  return <section ref={sectionRef}>Content</section>;
};
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

- **React Query hooks**: ALL queries and mutations MUST be in the `queries/` folder, organized by domain
- **Component-specific hooks**: Non-query hooks that are only used by one component should be placed in the same folder as that component
- **Shared utility hooks**: Non-query hooks used by multiple components should be placed in the global `hooks/` folder
- **Co-location principle**: Keep related files together for better maintainability

```
src/
├── queries/
│   ├── orderQueries.ts              # ✅ ALL order queries & mutations
│   ├── productQueries.ts            # ✅ ALL product queries & mutations
│   └── cartQueries.ts               # ✅ ALL cart queries & mutations
├── components/
│   └── dashboard/
│       └── UserProfile/
│           ├── UserProfile.tsx      # ✅ Component
│           └── useUserProfile.ts    # ✅ Component-specific NON-query hook
└── hooks/
    ├── useTheme.ts                  # ✅ Shared utility hook
    ├── useErrorHandler.ts           # ✅ Shared utility hook
    └── useLocalStorage.ts           # ✅ Shared utility hook
```

**Important:** The `hooks/` folder should NEVER contain React Query hooks (useQuery, useMutation). Those belong in `queries/`.

## **Form Handling Patterns**

Use TanStack React Query mutations for form submissions. **All mutations must be defined in the `queries/` folder:**

```typescript
// queries/projectQueries.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectsService } from "@/services/projects";

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectT) => ProjectsService.createProject(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["projects", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
```

**Usage in components:**

```typescript
// components/projects/CreateProjectForm.tsx
import { useCreateProject } from "@/queries/projectQueries";

function CreateProjectForm() {
  const createProject = useCreateProject();

  const handleSubmit = async (data: CreateProjectT) => {
    try {
      await createProject.mutateAsync(data);
      toast.success("Project created!");
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
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

## Icon Guidelines

### Use Theme Icons Instead of Inline SVGs

**Rule: Always use icon components from `@/theme/icons` instead of inline SVG elements**

- **Centralized icons**: All icons should be stored in `src/theme/icons/` folder
- **Reusable components**: Each icon should be a separate component with customizable className prop
- **Consistent styling**: Icons inherit color from parent using `currentColor` in stroke/fill
- **Type safety**: Icon components use TypeScript interfaces for props

### Icon Component Structure

```typescript
// ✅ Good: Icon component in src/theme/icons/CheckCircleIcon.tsx
interface CheckCircleIconProps {
  className?: string;
}

export const CheckCircleIcon = ({ className = "w-6 h-6" }: CheckCircleIconProps) => {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
};

// src/theme/icons/index.ts
export { CheckCircleIcon } from "./CheckCircleIcon";
export { CreditCardIcon } from "./CreditCardIcon";
export { ArrowRightIcon } from "./ArrowRightIcon";
```

### Using Icon Components

```typescript
// ✅ Good: Import and use icon components
import { CheckCircleIcon, CreditCardIcon } from "@/theme";

const SuccessMessage = () => (
  <div className="flex items-center gap-2">
    <CheckCircleIcon className="w-6 h-6 text-green-600" />
    <span>Success!</span>
  </div>
);

const PaymentButton = () => (
  <Button>
    <CreditCardIcon className="w-5 h-5 text-yellow-300" />
    Go to Payment
  </Button>
);

// ❌ Bad: Inline SVG elements
const BadExample = () => (
  <div>
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </div>
);
```

### Icon Best Practices

1. **Default Size**: Provide sensible default sizes (e.g., `w-6 h-6`) but allow customization via className
2. **Color Inheritance**: Use `currentColor` for stroke/fill to inherit text color from parent
3. **Accessibility**: Add `aria-hidden="true"` for decorative icons, or proper aria-labels for functional icons
4. **Naming**: Use descriptive names ending with "Icon" (e.g., `CheckCircleIcon`, `AlertTriangleIcon`)
5. **Export**: Always export icons from `src/theme/icons/index.ts` for clean imports

### Adding New Icons

When you need a new icon:

1. Create a new file in `src/theme/icons/` (e.g., `NewIcon.tsx`)
2. Follow the interface pattern with optional `className` prop
3. Use `currentColor` for colors that should inherit from parent
4. Export the icon from `src/theme/icons/index.ts`
5. Import from `@/theme` in components

```typescript
// Step 1: Create src/theme/icons/NewIcon.tsx
interface NewIconProps {
  className?: string;
}

export const NewIcon = ({ className = "w-6 h-6" }: NewIconProps) => {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {/* SVG path */}
    </svg>
  );
};

// Step 2: Export from src/theme/icons/index.ts
export { NewIcon } from "./NewIcon";

// Step 3: Use in components
import { NewIcon } from "@/theme";

<NewIcon className="w-8 h-8 text-blue-500" />
```

## Image Handling Guidelines

### Use Next.js Image Component

**Rule: Always use Next.js `Image` component instead of HTML `<img>` tags**

- **Automatic optimization**: Images are automatically optimized for performance
- **Responsive images**: Serves correctly sized images for different screen sizes
- **Lazy loading**: Images load as they enter the viewport
- **Priority loading**: Control loading priority for above-the-fold images
- **External image support**: Configure domains in `next.config.js` for external images

### Image Component Usage

```typescript
import Image from "next/image";

// ✅ Good: Using Next.js Image component
const ProductImage = ({ src, alt }: Props) => {
  return (
    <div className="relative w-full h-96">
      <Image
        src={src}
        alt={alt}
        width={800}
        height={800}
        className="w-full h-auto object-contain"
        priority={false} // Set to true for above-the-fold images
      />
    </div>
  );
};

// ✅ Good: Responsive image with fill
const HeroImage = () => (
  <div className="relative w-full h-[500px]">
    <Image
      src="/hero.jpg"
      alt="Hero banner"
      fill
      className="object-cover"
      priority // Load immediately for hero images
    />
  </div>
);

// ❌ Bad: Using HTML img tag
const BadExample = ({ src, alt }: Props) => (
  <img src={src} alt={alt} className="w-full" />
);
```

### Image Best Practices

1. **Always Specify Dimensions**: Provide `width` and `height` props to prevent layout shift
2. **Use Fill for Unknown Dimensions**: Use the `fill` prop with a relative parent container
3. **Object Fit**: Use `object-contain` or `object-cover` via className for sizing behavior
4. **Alt Text**: Always provide meaningful alt text for accessibility
5. **Priority**: Set `priority={true}` for above-the-fold images (hero images, logos)
6. **External Domains**: Configure `remotePatterns` in `next.config.js` for external images

### Next.js Image Configuration

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: 'https',
        hostname: '*.printify.com',
      },
    ],
  },
};
```

### Image Sizing Patterns

```typescript
// Fixed size image
<Image
  src="/logo.png"
  alt="Company logo"
  width={200}
  height={50}
  className="w-auto h-12"
/>

// Responsive image maintaining aspect ratio
<Image
  src="/product.jpg"
  alt="Product"
  width={800}
  height={600}
  className="w-full h-auto"
/>

// Fill container (requires relative parent)
<div className="relative w-full h-96">
  <Image
    src="/banner.jpg"
    alt="Banner"
    fill
    className="object-cover"
  />
</div>

// Circular avatar
<div className="relative w-20 h-20 rounded-full overflow-hidden">
  <Image
    src="/avatar.jpg"
    alt="User avatar"
    fill
    className="object-cover"
  />
</div>
```

### Image Loading States

```typescript
// ✅ Good: Image with loading states
const OptimizedImage = ({ src, alt }: Props) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        width={800}
        height={600}
        className="w-full h-auto"
        onLoadingComplete={() => setIsLoading(false)}
      />
    </div>
  );
};
```

### When to Use Standard img Tag

There are rare cases where HTML `<img>` is appropriate:

- **SVG images** that don't need optimization
- **Base64 encoded** data URLs
- **Dynamic blob URLs** from file uploads (before upload to server)

```typescript
// Acceptable: Preview of file upload before sending to server
const ImagePreview = ({ file }: { file: File }) => {
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return <img src={preview} alt="Preview" className="w-full" />;
};
```

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

---

## State Management with React Context

### When to Use Context

Use React Context for **feature-specific state** that needs to be shared across multiple components within a feature:

✅ **Good use cases:**
- Checkout flow (payment, shipping, order state)
- Multi-step forms with shared state
- Theme/settings within a feature
- Complex component trees with prop drilling

❌ **Don't use Context for:**
- Truly global app state (consider Zustand/Redux instead)
- Simple parent-child prop passing
- Single-component state
- Frequently changing values that cause many re-renders

### The Re-render Problem with React Context

**IMPORTANT:** React Context has a critical limitation - when you use `useContext()`, your component subscribes to ALL changes in the context value, regardless of which properties you use.

```typescript
// ❌ Problem: Both components re-render on ANY context change
const UserContext = createContext({ name: '', theme: '' });

function UserGreeting() {
  const { name } = useContext(UserContext);
  // Re-renders even when only theme changes!
  return <h1>Hello, {name}!</h1>;
}

function ThemeToggle() {
  const { theme } = useContext(UserContext);
  // Re-renders even when only name changes!
  return <button>Theme: {theme}</button>;
}
```

### Solution: use-context-selector Library

To prevent unnecessary re-renders, use the `use-context-selector` library which provides true selector functionality:

```bash
npm install use-context-selector
```

### Context Pattern Structure

```typescript
// src/features/[feature]/context/[Feature]Context.tsx
"use client";

import React, { ReactNode } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import { useFeatureData } from "../hooks/useFeatureData";
import { useFeatureHandlers } from "../hooks/useFeatureHandlers";

interface FeatureContextValue {
  // Data state
  data: SomeType | null;
  isLoading: boolean;
  error: string | null;

  // Handlers
  handleAction: () => void;

  // Computed values
  computedValue: number;
}

const FeatureContext = createContext<FeatureContextValue | undefined>(undefined);

interface FeatureProviderProps {
  children: ReactNode;
  // Any required initialization props
  id: string | null;
}

export function FeatureProvider({ children, id }: FeatureProviderProps) {
  // Combine existing hooks
  const { data, isLoading, error } = useFeatureData(id);
  const handlers = useFeatureHandlers();

  // Compute derived values once at provider level
  const computedValue = data?.value || 0;

  const value: FeatureContextValue = {
    data,
    isLoading,
    error,
    ...handlers,
    computedValue,
  };

  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  );
}

// Optimized selector hooks using use-context-selector
// Components using these hooks ONLY re-render when their selected data changes

/**
 * Select data state
 * Component only re-renders when data, isLoading, or error changes
 */
export function useFeatureData() {
  const data = useContextSelector(FeatureContext, (v) => v?.data);
  const isLoading = useContextSelector(FeatureContext, (v) => v?.isLoading);
  const error = useContextSelector(FeatureContext, (v) => v?.error);

  return { data, isLoading, error };
}

/**
 * Select action handlers
 * Component only re-renders when handlers change (usually never)
 */
export function useFeatureActions() {
  const handleAction = useContextSelector(FeatureContext, (v) => v?.handleAction);

  return { handleAction };
}

/**
 * Select computed value
 * Component only re-renders when computedValue changes
 */
export function useFeatureComputed() {
  return useContextSelector(FeatureContext, (v) => v?.computedValue);
}
```

### Using the Context in Components

```typescript
// src/app/feature/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { FeatureProvider, useFeature } from "@/features/feature/context";

function FeatureContent() {
  const { data, isLoading, handleAction } = useFeature();

  if (isLoading) return <Loading />;

  return (
    <div>
      <FeatureComponent />
      <button onClick={handleAction}>Do Action</button>
    </div>
  );
}

export default function FeaturePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <FeatureProvider id={id}>
      <FeatureContent />
    </FeatureProvider>
  );
}
```

### Context Best Practices

#### 1. **Separate Provider from Page Component**

```typescript
// ✅ Good: Provider wraps content component
export default function Page() {
  const params = useParams();

  return (
    <FeatureProvider id={params.id}>
      <FeatureContent />
    </FeatureProvider>
  );
}

// ❌ Bad: Mixing provider logic with page logic
export default function Page() {
  const data = useFeatureData(); // Can't use hook before provider!
  return <div>{data}</div>;
}
```

#### 2. **Use Selector Hooks for Performance**

Selector hooks prevent unnecessary re-renders by subscribing only to specific parts of the context:

```typescript
// ✅ Good: Component only re-renders when shipping data changes
// (Not affected by payment, cart, or other unrelated changes)
function ShippingForm() {
  const { address, handleSubmit } = useCheckoutShipping();
  return <form onSubmit={handleSubmit}>...</form>;
}

// ❌ Bad: Component re-renders on ANY context change
// (Re-renders when payment updates, cart changes, etc.)
function ShippingForm() {
  const { address, handleSubmit, paymentStatus, cart, ... } = useCheckout();
  return <form onSubmit={handleSubmit}>...</form>;
}
```

**How it works:**
```typescript
// With use-context-selector, each field is individually tracked
export function useCheckoutShipping() {
  const address = useContextSelector(CheckoutContext, (v) => v?.address);
  const handleSubmit = useContextSelector(CheckoutContext, (v) => v?.handleSubmit);

  // Component only re-renders if address or handleSubmit changes
  return { address, handleSubmit };
}
```

#### 3. **Compute Values at Provider Level**

```typescript
// ✅ Good: Computed once at provider level
export function CheckoutProvider({ children, orderId }: Props) {
  const { order } = useCheckoutData(orderId);
  const subtotal = order?.subtotal || 0; // Computed once

  return (
    <CheckoutContext.Provider value={{ order, subtotal }}>
      {children}
    </CheckoutContext.Provider>
  );
}

// ❌ Bad: Every component recomputes the same value
function Component1() {
  const { order } = useCheckout();
  const subtotal = order?.subtotal || 0; // Computed in every component
}

function Component2() {
  const { order } = useCheckout();
  const subtotal = order?.subtotal || 0; // Duplicate computation
}
```

#### 4. **Throw Errors for Missing Provider**

```typescript
// ✅ Good: Clear error message
export function useFeature() {
  const context = useContext(FeatureContext);
  if (context === undefined) {
    throw new Error("useFeature must be used within a FeatureProvider");
  }
  return context;
}

// ❌ Bad: Silent failure or unclear error
export function useFeature() {
  const context = useContext(FeatureContext);
  return context || {}; // Runtime errors later
}
```

#### 5. **Export Hooks from Index File**

```typescript
// src/features/checkout/context/index.ts
export {
  CheckoutProvider,
  useCheckout,
  useCheckoutState,
  useCheckoutPayment,
  useCheckoutShipping,
  useCheckoutActions,
  useCheckoutAmounts,
} from "./CheckoutContext";
```

This allows clean imports:
```typescript
import { CheckoutProvider, useCheckoutPayment } from "@/features/checkout/context";
```

### Real-World Example: Checkout Context

```typescript
// src/features/checkout/context/CheckoutContext.tsx
"use client";

import { createContext, useContextSelector } from "use-context-selector";

export function CheckoutProvider({ children, orderId }: CheckoutProviderProps) {
  // Combine three separate hooks into one context
  const { order, orderItems, customProduct, isLoading, error } = useCheckoutData(orderId);
  const customization = useCustomization({ order, orderItems, customProduct, isLoading });
  const handlers = useCheckoutHandlers();

  // Compute derived values once
  const subtotal = order?.subtotal || customization.price * customization.quantity;
  const shippingCost = order?.shipping_cost || 5.99;
  const orderAmount = subtotal + shippingCost;

  const value = {
    order, orderItems, customProduct, isLoading, error,
    customization, ...handlers,
    subtotal, shippingCost, orderAmount,
  };

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

// Selector hooks using use-context-selector for optimized performance
export function useCheckoutPayment() {
  const paymentStatus = useContextSelector(CheckoutContext, (v) => v?.paymentStatus);
  const testMode = useContextSelector(CheckoutContext, (v) => v?.testMode);
  const triggerPayment = useContextSelector(CheckoutContext, (v) => v?.triggerPayment);
  const handlePaymentSuccess = useContextSelector(CheckoutContext, (v) => v?.handlePaymentSuccess);
  const handlePaymentError = useContextSelector(CheckoutContext, (v) => v?.handlePaymentError);

  // This component only re-renders when these specific values change
  return { paymentStatus, testMode, triggerPayment, handlePaymentSuccess, handlePaymentError };
}

export function useCheckoutAmounts() {
  const subtotal = useContextSelector(CheckoutContext, (v) => v?.subtotal);
  const shippingCost = useContextSelector(CheckoutContext, (v) => v?.shippingCost);
  const orderAmount = useContextSelector(CheckoutContext, (v) => v?.orderAmount);

  // This component only re-renders when amounts change
  // Not affected by payment status changes, shipping updates, etc.
  return { subtotal, shippingCost, orderAmount };
}
```

### Migration from Hooks to Context

If you find yourself with multiple related hooks creating prop drilling issues:

**Before (Multiple hooks in component):**
```typescript
function Page() {
  const { data } = useFeatureData(id);
  const { handlers } = useFeatureHandlers();
  const computed = computeValue(data);

  return (
    <>
      <ComponentA data={data} computed={computed} />
      <ComponentB handlers={handlers} computed={computed} />
      <ComponentC data={data} handlers={handlers} />
    </>
  );
}
```

**After (Context eliminates prop drilling):**
```typescript
function Page() {
  return (
    <FeatureProvider id={id}>
      <ComponentA /> {/* Uses useFeatureData() internally */}
      <ComponentB /> {/* Uses useFeatureActions() internally */}
      <ComponentC /> {/* Uses useFeature() internally */}
    </FeatureProvider>
  );
}
```

### When to Move Beyond Context

Consider **Zustand** or **Redux Toolkit** if you need:
- State shared across completely different features/pages
- DevTools for debugging state changes
- Middleware for logging, persistence, etc.
- Very fine-grained performance optimizations

Context is perfect for feature-scoped state. For app-wide state, use a proper state management library.
