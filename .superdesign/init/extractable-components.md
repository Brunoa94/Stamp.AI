# Extractable Components

Components that can be extracted as SuperDesign DraftComponents.

## Layout Components (appear on most pages)

### Navbar

- Source: `src/features/layout/navbar.tsx`
- Category: layout
- Description: Fixed top navigation with brand, nav links, cart, auth actions.
- Extractable props: activeItem (string, default: "dashboard"), showAuthenticated (boolean, default: true), cartCount (number, default: 0)
- Hardcoded: Logo SVG/brand, nav labels, icon choices, styling classes

### Footer

- Source: `src/features/layout/footer.tsx`
- Category: layout
- Description: Global footer with quick links and branding.
- Extractable props: none
- Hardcoded: Links, icon choices, styling classes

### WizardSidebar

- Source: `src/features/ui/wizard-sidebar.tsx`
- Category: layout
- Description: Wizard step sidebar with help box.
- Extractable props: currentStepId (string, default: "upload"), completedSteps (string[], default: [])
- Hardcoded: Step labels, icons, styling classes

## Basic Components (used across pages)

### Button

- Source: `src/features/ui/button.tsx`
- Category: basic
- Description: Base button with variants and sizes.
- Extractable props: variant (string, default: "default"), size (string, default: "default")
- Hardcoded: Base classnames

### Input

- Source: `src/features/ui/input.tsx`
- Category: basic
- Description: Base text input.
- Extractable props: placeholder (string, default: "")
- Hardcoded: Base classnames

### Select

- Source: `src/features/ui/select.tsx`
- Category: basic
- Description: Select dropdown primitives.
- Extractable props: value (string, default: ""), placeholder (string, default: "Select")
- Hardcoded: Base classnames, icons

### Dialog

- Source: `src/features/ui/dialog.tsx`
- Category: basic
- Description: Modal dialog primitives.
- Extractable props: open (boolean, default: false)
- Hardcoded: Base classnames, overlay styling

### WizardActionFooter

- Source: `src/features/ui/wizard-action-footer.tsx`
- Category: basic
- Description: Wizard footer with Continue/Back/Cancel actions.
- Extractable props: canContinue (boolean, default: true), continueText (string, default: "Continue")
- Hardcoded: styling classes, icon
