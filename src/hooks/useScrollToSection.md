# useScrollToSection Hook

A global hook for smooth scrolling functionality that can be used throughout the application.

## Usage

```typescript
import useScrollToSection from '@/hooks/useScrollToSection';
import { useRef } from 'react';

function MyComponent() {
  const { scrollToSection, smoothScrollToSection, scrollToElementById, scrollToTop } = useScrollToSection();
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleScrollToSection = () => {
    scrollToSection(sectionRef, {
      behavior: 'smooth',
      block: 'center',
      delay: 100
    });
  };

  const handleSmoothScroll = () => {
    smoothScrollToSection(sectionRef, {
      offset: -80, // Account for fixed header
      delay: 200
    });
  };

  return (
    <div>
      <button onClick={handleScrollToSection}>Scroll to Section</button>
      <button onClick={() => scrollToElementById('target-element')}>Scroll to Element</button>
      <button onClick={() => scrollToTop()}>Scroll to Top</button>

      <div ref={sectionRef} id="target-section">
        Target content
      </div>

      <div id="target-element">
        Another target
      </div>
    </div>
  );
}
```

## API

### `scrollToSection(ref, options?)`
Basic smooth scrolling using the native `scrollIntoView` API.

**Parameters:**
- `ref`: React ref object pointing to the target element
- `options`: Scroll configuration object

### `smoothScrollToSection(ref, options?)`
Enhanced smooth scrolling with custom positioning and offset support.

**Parameters:**
- `ref`: React ref object pointing to the target element
- `options`: Scroll configuration object with additional `offset` support

### `scrollToElementById(elementId, options?)`
Scroll to an element by its ID.

**Parameters:**
- `elementId`: String ID of the target element
- `options`: Scroll configuration object

### `scrollToTop(options?)`
Scroll to the top of the page.

**Parameters:**
- `options`: Configuration object with `behavior` and `delay` options

## Options

```typescript
interface IScrollOptions {
  behavior?: ScrollBehavior; // 'smooth' | 'instant' | 'auto'
  block?: ScrollLogicalPosition; // 'start' | 'center' | 'end' | 'nearest'
  inline?: ScrollLogicalPosition; // 'start' | 'center' | 'end' | 'nearest'
  delay?: number; // Delay in milliseconds before scrolling
  offset?: number; // Additional offset for positioning (smoothScrollToSection only)
}
```

## Examples

### Simple scroll to section
```typescript
const { scrollToSection } = useScrollToSection();
const targetRef = useRef<HTMLDivElement>(null);

// Scroll with default options
scrollToSection(targetRef);
```

### Scroll with custom offset (useful for fixed headers)
```typescript
const { smoothScrollToSection } = useScrollToSection();
const targetRef = useRef<HTMLDivElement>(null);

// Scroll with 80px offset to account for fixed header
smoothScrollToSection(targetRef, { offset: -80 });
```

### Delayed scroll
```typescript
const { scrollToSection } = useScrollToSection();
const targetRef = useRef<HTMLDivElement>(null);

// Scroll after 500ms delay
scrollToSection(targetRef, { delay: 500 });
```

### Scroll to element by ID
```typescript
const { scrollToElementById } = useScrollToSection();

// Scroll to element with ID 'my-section'
scrollToElementById('my-section', {
  behavior: 'smooth',
  block: 'start'
});
```