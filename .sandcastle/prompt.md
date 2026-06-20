# Context

This is a Next.js application with a Supabase backend that integrates with Printify API for custom product printing.

**Sandcastle Database (USE THIS)**: https://tgccxydchvujhrqyzqao.supabase.co
**Production Database (DO NOT USE)**: https://timbqoxngnhoetbofdiq.supabase.co

The detailed implementation plan is at: `.claude/plans/stateless-napping-matsumoto.md`

## Project Patterns (from docs/README.md)

**CRITICAL**: Follow these patterns strictly:

1. **Types & Interfaces**:
   - All data must be typed
   - Types from database must infer from generated database types
   - All type names must have `Type` suffix (e.g., `UserType`, `ProductType`)
   - Component-specific props interface: name it `PropsI`

2. **Components**:
   - Follow Single Responsibility Principle
   - DRY - Don't Repeat Yourself
   - Atomic - small and focused
   - Use design system components
   - Avoid inline styles (use Tailwind classes)

3. **Architecture**:
   - Feature-Sliced Design pattern
   - Reference: `src/features/stamp-brutalist/` as example
   - Services go in `src/services/`
   - Types in `src/types/` (shared) or `src/features/[feature]/types/`

4. **Error Handling**:
   - Use `ErrorClient.handleError()` for all service errors
   - Provide service name and action context

5. **Performance**:
   - Only use useCallback/useMemo for proven bottlenecks
   - Avoid premature optimization

# Task

Implement the Custom Products Performance Refactoring as outlined in the plan:

## Phase 1: Create New Service Layer
1. Create `src/services/providerCatalogService.ts` with:
   - `getCachedCatalog(countryCode)` - Fetch from provider_catalog via Edge Function
   - `refreshCatalog()` - Manually trigger catalog refresh
   - `hasCachedCatalog()` - Check cache validity
   - Helper methods for country-specific pricing and data transformation
   - Use ErrorClient for error handling

## Phase 2: Update PrintifyService
2. Modify `src/services/printifyService.ts`:
   - Add `countryCode` parameter to `getTshirtProducts()`
   - Implement fallback waterfall: provider_catalog → products_provider → get-cheapest-blueprints
   - Preserve existing error handling

## Phase 3: Update React Query Hooks
3. Modify `src/queries/productQueries.ts`:
   - Add `countryCode` parameter to `useTshirtProducts()`
   - Update queryKey to include country code
   - Increase staleTime to 30 minutes

## Phase 4: Database Migration (Optional Enhancement)
4. Create migration `supabase/migrations/YYYYMMDDHHMMSS_add_blueprint_metadata.sql`:
   - Add blueprint metadata columns to provider_catalog table
   - Make columns nullable and backwards compatible

## Phase 5: Update Edge Function (Optional)
5. Enhance `supabase/functions/fetch-provider-catalog/index.ts`:
   - Fetch and store blueprint metadata (title, brand, model, images)
   - Maintain existing rate limiting

## Testing Requirements
- **CRITICAL**: Test against Sandcastle database ONLY (tgccxydchvujhrqyzqao)
- Verify fallback logic works
- Test multi-country pricing (NL, US, GB)
- Ensure no changes break existing functionality
- Verify types are properly inferred from database

# Done

When all phases are complete and tested against the Sandcastle database, output <promise>COMPLETE</promise>
