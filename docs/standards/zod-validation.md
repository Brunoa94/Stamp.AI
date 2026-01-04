# Zod Integration Standards

## **Schema Naming Convention**
- Zod schemas should match their corresponding interface names with `Schema` suffix
- Example: `UserI` → `UserSchema`, `RegisterRequestI` → `RegisterRequestSchema`

## **Usage Patterns**
- Every new type coming from the API should have a corresponding Zod schema
- Use Zod schemas for runtime validation and type inference
- Place schemas in `/src/schemas/` for frontend, `/supabase/functions/_shared/schemas.ts` for backend
- Use `z.infer<typeof Schema>` to derive TypeScript types from Zod schemas

## **Example**
```typescript
// Define Zod schema
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  created_at: z.string(),
  user_metadata: z.record(z.any()).optional()
})

// Infer TypeScript type
export type UserI = z.infer<typeof UserSchema>

// Runtime validation
const validateUser = (data: unknown): UserI => {
  return UserSchema.parse(data)
}
```