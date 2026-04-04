# Page Dependency Trees

Dependency trees for key pages (UI-focused). Local imports only.

---

## /dashboard/create-product

Entry: `src/app/dashboard/create-product/page.tsx`
Dependencies:

- `src/features/dashboard/createProduct/WizardProductForm.tsx`
  - `src/features/dashboard/createProduct/WizardUploadArea.tsx`
  - `src/features/dashboard/createProduct/WizardPromptInput.tsx`
  - `src/features/dashboard/createProduct/ProcessingSection/ProcessingSection.tsx`
  - `src/features/dashboard/createProduct/ProductCustomizer/ResultsSection.tsx`
  - `src/features/dashboard/createProduct/ProductCustomizer/ProductCustomizerSection.tsx`
    - `src/features/dashboard/createProduct/ProductCustomizer/ProductCustomizerHeader.tsx`
    - `src/features/dashboard/createProduct/ProductCustomizer/ProductCustomization.tsx`
      - `src/features/dashboard/createProduct/ProductCustomizer/ProductCustomizationShimmer.tsx`
      - `src/features/dashboard/createProduct/ProductCustomizer/ColorSelector.tsx`
        - `src/features/dashboard/createProduct/ProductCustomizer/MoreColors.tsx`
        - `src/features/dashboard/createProduct/ProductCustomizer/utils/prioritizeAvailableColors.ts`
      - `src/features/dashboard/createProduct/ProductCustomizer/SizeSelector.tsx`
    - `src/features/dashboard/createProduct/ProductCustomizer/hooks/useProductCustomizerSection.ts`
    - `src/features/dashboard/createProduct/components/StampItButton.tsx`
  - `src/features/dashboard/createProduct/components/CreatedProductDisplay.tsx`
  - `src/features/ui/wizard-step-header.tsx`
  - `src/features/ui/wizard-action-footer.tsx`
- `src/features/dashboard/createProduct/context/CreateProductContextSubscriber/CreateProductContextSubscriber.tsx`
- `src/features/ui/wizard-sidebar.tsx`
  - `src/features/ui/wizard-step.tsx`

---

## /stamp

Entry: `src/app/stamp/page.tsx`
Dependencies:

- `src/features/dashboard/createProduct/WizardProductForm.tsx`
  - `src/features/dashboard/createProduct/WizardUploadArea.tsx`
  - `src/features/dashboard/createProduct/WizardPromptInput.tsx`
  - `src/features/dashboard/createProduct/ProcessingSection/ProcessingSection.tsx`
  - `src/features/dashboard/createProduct/ProductCustomizer/ResultsSection.tsx`
  - `src/features/dashboard/createProduct/ProductCustomizer/ProductCustomizerSection.tsx`
    - `src/features/dashboard/createProduct/ProductCustomizer/ProductCustomizerHeader.tsx`
    - `src/features/dashboard/createProduct/ProductCustomizer/ProductCustomization.tsx`
      - `src/features/dashboard/createProduct/ProductCustomizer/ProductCustomizationShimmer.tsx`
      - `src/features/dashboard/createProduct/ProductCustomizer/ColorSelector.tsx`
      - `src/features/dashboard/createProduct/ProductCustomizer/SizeSelector.tsx`
    - `src/features/dashboard/createProduct/ProductCustomizer/hooks/useProductCustomizerSection.ts`
    - `src/features/dashboard/createProduct/components/StampItButton.tsx`
  - `src/features/dashboard/createProduct/components/CreatedProductDisplay.tsx`
  - `src/features/ui/wizard-step-header.tsx`
  - `src/features/ui/wizard-action-footer.tsx`
- `src/features/dashboard/createProduct/context/CreateProductContextSubscriber/CreateProductContextSubscriber.tsx`
- `src/features/ui/wizard-sidebar.tsx`
  - `src/features/ui/wizard-step.tsx`

---

## /dashboard

Entry: `src/app/dashboard/page.tsx`
Dependencies:

- `src/features/auth/ProtectedRoute.tsx`
- `src/features/dashboard/quickActions/index.ts`
  - `src/features/dashboard/quickActions/CreateDesignCard.tsx`
  - `src/features/dashboard/quickActions/ViewOrdersCard.tsx`
  - `src/features/dashboard/quickActions/ProfileCard.tsx`
- `src/features/dashboard/SettingsPopup.tsx`
- `src/features/ui/button.tsx`
- `src/features/ui/page-header.tsx`

---

## /orders

Entry: `src/app/orders/page.tsx`
Dependencies:

- `src/features/auth/ProtectedRoute.tsx`
- `src/features/orders/ordersContent/OrdersContent.tsx`
- `src/features/orders/orderList/index.ts`

---

## /reset-password

Entry: `src/app/reset-password/page.tsx`
Dependencies:

- `src/features/auth/passwordReset/passwordResetConfirm/PasswordResetConfirmForm.tsx`
- `src/features/auth/passwordReset/passwordResetConfirm/PasswordResetConfirmSkeleton.tsx`

---

## /auth/auth-code-error

Entry: `src/app/auth/auth-code-error/page.tsx`
Dependencies:

- `src/features/ui/button.tsx`
