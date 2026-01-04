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

## 3. **Testing Patterns**

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

## 4. **Naming Conventions**

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

## 5. **Provider Pattern**

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