# File Organization Patterns

## 1. **Component Organization (Feature-Based)**

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

## 2. **Service Layer Pattern**

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

### API Error Handling

```typescript
// types/api.ts
export interface ErrorI {
  message: string;
  status: number;
}
```

**Consistent error interface** across API and client

## 3. **Queries Layer Pattern**

React Query hooks are centralized in the `queries/` folder, organized by domain:

```typescript
// queries/orderQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderService } from "@/services/orderService";

/**
 * Fetch a single order by ID
 */
export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => {
      if (!orderId) throw new Error("Order ID is required");
      return OrderService.getOrder(orderId);
    },
    enabled: !!orderId,
  });
}

/**
 * Create a new order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderT) => OrderService.createOrder(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["orders", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
```

**Benefits:**

- Centralized server state management
- Consistent query keys across the app
- Reusable queries and mutations
- Easy cache invalidation
- Single source of truth for React Query logic

**Organization:**

```
queries/
├── orderQueries.ts         # All order-related queries & mutations
├── cartQueries.ts          # All cart-related queries & mutations
├── productQueries.ts       # All product-related queries & mutations
└── authQueries.ts          # All auth-related queries & mutations
```

**Key Principles:**

- One file per domain (matching service organization)
- Export query hooks with `use[Domain]` naming
- Export mutation hooks with `use[Action][Domain]` naming
- Always include proper query key patterns
- Handle cache invalidation in mutations

See [Queries Layer Documentation](./queries-layer.md) for detailed patterns.

## 4. **Testing Patterns**

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

## 5. **Naming Conventions**

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

## 6. **Provider Pattern**

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