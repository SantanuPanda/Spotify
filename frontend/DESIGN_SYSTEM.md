# Design System Documentation

This document describes the design system and CSS variables available in the Spotify Microservices frontend application.

## 📁 File Structure

- `theme.css` - Core design system with CSS variables
- `index.css` - Global styles and base element styling
- `App.css` - Application-specific layout and component styles

## 🎨 Design System Overview

### Color Palette

#### Primary Colors (Spotify-inspired)
```css
--color-primary: #1db954          /* Main brand color */
--color-primary-hover: #1ed760    /* Hover state */
--color-primary-dark: #169c46     /* Dark variant */
--color-primary-light: #1fdf64    /* Light variant */
```

#### Background Colors
```css
--color-bg-primary: #121212       /* Main background */
--color-bg-secondary: #181818     /* Secondary background */
--color-bg-tertiary: #282828      /* Tertiary background */
--color-bg-hover: #2a2a2a        /* Hover states */
```

#### Text Colors
```css
--color-text-primary: #ffffff     /* Primary text */
--color-text-secondary: #b3b3b3   /* Secondary text */
--color-text-tertiary: #888888    /* Tertiary text */
--color-text-muted: #737373       /* Muted text */
```

#### Status Colors
```css
--color-success: #1db954
--color-error: #e22134
--color-warning: #ffa726
--color-info: #3b82f6
```

### Typography

#### Font Families
```css
--font-primary: System fonts stack
--font-heading: 'Circular Std', sans-serif
--font-mono: 'Courier New', monospace
```

#### Font Sizes
```css
--font-size-xs: 0.75rem     /* 12px */
--font-size-sm: 0.875rem    /* 14px */
--font-size-base: 1rem      /* 16px */
--font-size-lg: 1.125rem    /* 18px */
--font-size-xl: 1.25rem     /* 20px */
--font-size-2xl: 1.5rem     /* 24px */
--font-size-3xl: 1.875rem   /* 30px */
--font-size-4xl: 2.25rem    /* 36px */
--font-size-5xl: 3rem       /* 48px */
```

#### Font Weights
```css
--font-weight-light: 300
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
--font-weight-black: 900
```

### Spacing

The spacing system follows a consistent scale:
```css
--space-xs: 0.25rem    /* 4px */
--space-sm: 0.5rem     /* 8px */
--space-md: 1rem       /* 16px */
--space-lg: 1.5rem     /* 24px */
--space-xl: 2rem       /* 32px */
--space-2xl: 2.5rem    /* 40px */
--space-3xl: 3rem      /* 48px */
--space-4xl: 4rem      /* 64px */
--space-5xl: 5rem      /* 80px */
```

### Border Radius
```css
--radius-none: 0
--radius-sm: 0.125rem   /* 2px */
--radius-base: 0.25rem  /* 4px */
--radius-md: 0.375rem   /* 6px */
--radius-lg: 0.5rem     /* 8px */
--radius-xl: 0.75rem    /* 12px */
--radius-2xl: 1rem      /* 16px */
--radius-3xl: 1.5rem    /* 24px */
--radius-full: 9999px   /* Fully rounded */
```

### Shadows
```css
--shadow-xs: Small shadow
--shadow-sm: Small shadow with blur
--shadow-base: Base shadow
--shadow-md: Medium shadow
--shadow-lg: Large shadow
--shadow-xl: Extra large shadow
--shadow-2xl: 2XL shadow
--shadow-inner: Inner shadow
```

### Transitions
```css
--transition-fast: 150ms ease-in-out
--transition-base: 250ms ease-in-out
--transition-slow: 350ms ease-in-out
--transition-slower: 500ms ease-in-out
```

### Z-Index Layers
```css
--z-index-dropdown: 1000
--z-index-sticky: 1020
--z-index-fixed: 1030
--z-index-modal-backdrop: 1040
--z-index-modal: 1050
--z-index-popover: 1060
--z-index-tooltip: 1070
```

## 🔧 Usage Examples

### Using Color Variables
```css
.my-component {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}
```

### Using Spacing
```css
.my-component {
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
  gap: var(--space-md);
}
```

### Using Typography
```css
.heading {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}
```

### Using Shadows and Transitions
```css
.card {
  box-shadow: var(--shadow-base);
  transition: all var(--transition-base);
  border-radius: var(--radius-lg);
}

.card:hover {
  box-shadow: var(--shadow-lg);
}
```

## 🎨 Theme Support

The design system supports both dark (default) and light themes:

```html
<!-- Dark theme (default) -->
<body data-theme="dark">

<!-- Light theme -->
<body data-theme="light">
```

## 📦 Utility Classes

The design system includes utility classes for common use cases:

### Typography Utilities
```css
.text-xs, .text-sm, .text-base, .text-lg, .text-xl, .text-2xl, .text-3xl
.font-light, .font-normal, .font-medium, .font-semibold, .font-bold
```

### Color Utilities
```css
.text-primary, .text-secondary, .text-muted
.bg-primary, .bg-secondary, .bg-tertiary
```

### Spacing Utilities
```css
.m-0, .p-0
.mt-sm, .mt-md, .mt-lg
.mb-sm, .mb-md, .mb-lg
.p-sm, .p-md, .p-lg
```

## 🎯 Component Classes

### Form Container
```jsx
<div className="form-container">
  <form>
    <div className="form-group">
      <label>Label</label>
      <input type="text" />
    </div>
  </form>
</div>
```

### Card Component
```jsx
<div className="card">
  Card content
</div>
```

### Page Header
```jsx
<div className="page-header">
  <h1>Page Title</h1>
  <p>Description</p>
</div>
```

## 📱 Responsive Breakpoints

```css
--breakpoint-xs: 0
--breakpoint-sm: 576px
--breakpoint-md: 768px
--breakpoint-lg: 992px
--breakpoint-xl: 1200px
--breakpoint-2xl: 1400px
```

## 🚀 Best Practices

1. **Always use CSS variables** instead of hardcoded values
2. **Use the spacing scale** for consistent margins and padding
3. **Follow the typography hierarchy** for better readability
4. **Leverage utility classes** for common patterns
5. **Use semantic color names** (e.g., `--color-primary` instead of `#1db954`)
6. **Apply transitions** for interactive elements
7. **Use the shadow scale** for depth and hierarchy
8. **Follow the z-index layering system** to avoid conflicts

## 🎨 Customization

To customize the design system, edit the CSS variables in `theme.css`:

```css
:root {
  --color-primary: #your-color;
  --font-size-base: 1.125rem;
  /* etc. */
}
```

Changes will automatically propagate throughout the application.
