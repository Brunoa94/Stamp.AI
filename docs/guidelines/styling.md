# Styling Guidelines

## Styling Strategy

- **Tailwind CSS** for component-scoped styles
- **CSS variables** for fonts (Geist Sans, Geist Mono)
- **Mobile-first** responsive design
- **Reusable Styling**: Styling that is shared between more than one component should be included in the `theme/` folder
- **Theme Folder**: Create a folder `theme/` that contains reusable component themes and styling utilities
- **Style Reusage**: Enforce reuse of common styling patterns through utility classes and theme components

## HTML Semantic Standards

### **Semantic Elements Usage**
- **Always use semantic HTML elements** instead of generic `<div>` and `<span>` elements
- Use proper document structure with semantic landmarks
- Implement ARIA attributes for enhanced accessibility

### **Document Structure Pattern**
```typescript
// Root Layout Structure
<html lang="en">
  <body>
    <header>
      <nav>
        {/* Navigation content */}
      </nav>
    </header>
    <main>
      {/* Page content */}
    </main>
  </body>
</html>
```

### **Semantic Element Guidelines**
| Element | Usage | Example |
|---------|-------|---------|
| `<header>` | Page/section headers | Navigation, page titles |
| `<main>` | Primary content area | Main page content (one per page) |
| `<nav>` | Navigation sections | Primary navigation, breadcrumbs |
| `<section>` | Distinct content sections | Feature sections, content blocks |
| `<article>` | Self-contained content | Blog posts, product cards, forms |
| `<aside>` | Sidebar content | Related content, advertisements |
| `<footer>` | Page/section footers | Copyright, links, contact info |

### **Component Semantic Patterns**
```typescript
// Dashboard Component Example
const DashboardContent = () => {
  return (
    <section className="dashboard-container" aria-label="AI Magic Studio">
      <header className="dashboard-header">
        <h1>AI Magic Studio</h1>
        <p>Transform your images with AI creativity</p>
      </header>

      <section className="content-grid" aria-label="Upload and prompt sections">
        <article className="upload-section">
          <h2>Upload Your Canvas</h2>
          {/* Upload component */}
        </article>

        <article className="prompt-section">
          <h2>Describe Your Vision</h2>
          {/* Prompt component */}
        </article>
      </section>
    </section>
  );
};
```

### **Accessibility Requirements**
- **ARIA Labels**: Use `aria-label` for sections without visible headings
- **ARIA Live Regions**: Use `aria-live="polite"` for dynamic content updates
- **Heading Hierarchy**: Maintain proper h1-h6 heading structure
- **Language Attribute**: Always include `lang` attribute on `<html>`

### **Semantic Validation Rules**
- **One `<main>` per page**: Each page should have exactly one main element
- **Proper nesting**: Don't nest interactive elements (buttons, links, form controls)
- **Meaningful structure**: Use semantic elements for their intended purpose, not styling
- **Progressive enhancement**: Ensure content is accessible without JavaScript

### **Anti-Patterns to Avoid**
```typescript
// ❌ Bad: Generic divs without semantic meaning
<div className="header">
  <div className="navigation">...</div>
</div>
<div className="content">...</div>

// ✅ Good: Semantic elements with proper structure
<header>
  <nav>...</nav>
</header>
<main>...</main>
```