# Routes Map

Framework: Next.js App Router (src/app).

## Layout

- Root layout: `src/app/layout.tsx` (wraps all routes)

## Route Files

- `/` → `src/app/page.tsx`
- `/dashboard` → `src/app/dashboard/page.tsx`
- `/dashboard/create-product` → `src/app/dashboard/create-product/page.tsx`
- `/stamp` → `src/app/stamp/page.tsx`
- `/orders` → `src/app/orders/page.tsx`
- `/cart` → `src/app/cart/page.tsx`
- `/checkout` → `src/app/checkout/page.tsx`
- `/profile` → `src/app/profile/page.tsx`
- `/reset-password` → `src/app/reset-password/page.tsx`
- `/auth/auth-code-error` → `src/app/auth/auth-code-error/page.tsx`

## Notes

- Navigation and global layout are handled by `src/features/layout/navbar.tsx` and `src/features/layout/footer.tsx`.
- The create-product flow is part of the dashboard and uses the wizard UI components.
