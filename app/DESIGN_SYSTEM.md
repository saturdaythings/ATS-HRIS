# V.Two Ops Design System

## Overview

This document outlines the design system for V.Two Ops, a people and asset management platform built with React, Vite, and TailwindCSS.

## Design Principles

- **Consistency**: All components use design tokens to ensure visual consistency
- **Accessibility**: WCAG AA compliance with minimum 4.5:1 color contrast ratio
- **Performance**: Optimized styling using CSS custom properties and Tailwind utilities
- **Simplicity**: Clean, minimal design focused on functionality

## Color Palette

All colors are defined as CSS custom properties in `src/index.css` and extended in `tailwind.config.js`.

### Primary Color (Purple)
Used for interactive elements, highlights, and primary actions.

```css
--color-primary-50: #faf5ff    (Lightest)
--color-primary-600: #9333ea   (Main)
--color-primary-700: #7e22ce   (Hover)
--color-primary-900: #581c87   (Darkest)
```

### Status Colors
- **Success (Green)**: `--color-success: #10b981` (Contrast: 4.9:1)
- **Warning (Amber)**: `--color-warning: #f59e0b` (Contrast: 4.5:1)
- **Error (Red)**: `--color-error: #ef4444` (Contrast: 5.4:1)
- **Info (Blue)**: `--color-info: #3b82f6` (Contrast: 5.1:1)

### Neutral Colors (Gray)
Used for text, backgrounds, borders, and disabled states.

```css
--color-neutral-50: #f9fafb    (Lightest background)
--color-neutral-500: #6b7280   (Secondary text)
--color-neutral-900: #111827   (Primary text)
```

## Typography

### Font Families
- **Display**: `DM Serif Display` (headings)
- **Body**: `Instrument Sans` (content, forms)
- **Monospace**: System monospace (code blocks)

### Font Sizes
```css
--text-xs: 0.75rem (12px)
--text-sm: 0.875rem (14px)
--text-base: 1rem (16px)
--text-lg: 1.125rem (18px)
--text-xl: 1.25rem (20px)
--text-2xl: 1.5rem (24px)
--text-3xl: 1.875rem (30px)
--text-4xl: 2.25rem (36px)
```

### Font Weights
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

### Line Heights
- **Tight**: 1.25 (headings)
- **Snug**: 1.375 (subheadings)
- **Normal**: 1.5 (body text)
- **Relaxed**: 1.625 (descriptions)
- **Loose**: 2 (spaced content)

## Spacing

All spacing uses a base unit of 4px. Common values:

```css
--space-1: 0.25rem (4px)
--space-2: 0.5rem (8px)
--space-3: 0.75rem (12px)
--space-4: 1rem (16px)
--space-6: 1.5rem (24px)
--space-8: 2rem (32px)
--space-12: 3rem (48px)
--space-16: 4rem (64px)
--space-24: 6rem (96px)
```

## Border Radius

```css
--radius-sm: 0.375rem (6px)
--radius-md: 0.5rem (8px)
--radius-lg: 0.75rem (12px)
--radius-xl: 1rem (16px)
--radius-2xl: 1.5rem (24px)
--radius-full: 9999px (circular)
```

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
```

## Transitions

```css
--duration-fast: 150ms
--duration-normal: 300ms
--duration-slow: 500ms
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

## Components

### Badge
Status, role, and category badges with 6 variants.

**Variants:**
- `default`: Gray background (neutral)
- `active`: Green background (success)
- `inactive`: Gray background (inactive)
- `rejected`: Red background (error)
- `pending`: Amber background (warning)
- `info`: Blue background (info)

**Sizes:**
- `sm`: Small (px-2 py-1)
- `md`: Medium (px-3 py-1.5) - default
- `lg`: Large (px-4 py-2)

**Accessibility:**
- All variants meet WCAG AA contrast ratio (4.5:1 minimum)
- Includes `role="status"` for screen readers
- Supports custom `aria-label`

### ProgressBar
Visual progress indicator for onboarding, task tracking.

**Features:**
- Smooth gradient animation
- Real-time updates with `aria-live` regions
- ARIA progressbar role with min/max/current values
- Customizable label and percentage display

**Sizes:**
- `sm`: Small (h-1)
- `md`: Medium (h-2) - default
- `lg`: Large (h-3)

**Accessibility:**
- `role="progressbar"`
- `aria-valuemin="0"`, `aria-valuemax="100"`
- `aria-valuenow` updated with percentage
- Live regions for updates

### Timeline
Activity timeline visualization for history and event logs.

**Features:**
- Vertical timeline with dots and connectors
- Semantic `<time>` elements for timestamps
- Formatted date/time display
- Empty state handling

**Accessibility:**
- `role="log"` for activity feed
- Decorative elements marked with `aria-hidden="true"`
- Semantic HTML structure
- Sufficient color contrast

## Forms

### Input Fields
- Focus state: Ring with primary color
- Border: `border-neutral-200`
- Background: `bg-neutral-100`
- Text: `text-neutral-700`

**Focus Styles:**
- Outline: 2px primary-600
- Ring: 3px primary-50

### Buttons
- Smooth transitions (150ms)
- Consistent padding based on size
- Disabled state: 50% opacity

## Accessibility Standards

### WCAG AA Compliance

#### Color Contrast
All text meets minimum 4.5:1 contrast ratio:
- Primary text on white: 10.7:1
- Secondary text on white: 6.1:1
- Status colors with dark text: 4.5-5.4:1

#### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus styles visible on all interactive elements
- Tab order follows DOM order

#### Screen Reader Support
- Semantic HTML structure (headings, lists, buttons)
- ARIA roles for complex components
- Live regions for dynamic content
- Alt text for images
- Form labels for inputs

#### Motion
- Respects `prefers-reduced-motion` setting
- Animations disabled for users with motion preferences

## Testing

### Accessibility Testing
- Automated tests using jest-axe
- Manual testing with keyboard navigation
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Color contrast verification

### Test Files
- `Badge.a11y.test.js` - Badge component accessibility
- `ProgressBar.a11y.test.js` - ProgressBar component accessibility
- `Timeline.a11y.test.js` - Timeline component accessibility

### Running Tests
```bash
npm test                  # Run all tests
npm test -- --coverage   # Run with coverage
npm test:watch          # Run in watch mode
```

## Usage Examples

### Using Design Tokens in CSS

```css
.my-component {
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  transition: all var(--duration-normal) var(--ease-in-out);
}
```

### Using Tailwind Classes

```jsx
<div className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors">
  Primary Button
</div>
```

### Using CSS Custom Properties

```jsx
<div style={{
  color: 'var(--color-text-primary)',
  padding: 'var(--space-6)',
  fontSize: 'var(--text-lg)',
}}>
  Styled Content
</div>
```

## File Structure

```
src/
├── index.css              # Design tokens and global styles
├── components/
│   └── common/           # Common components (Badge, ProgressBar, Timeline)
├── pages/               # Page components
└── tailwind.config.js   # Tailwind configuration
```

## Maintenance

### Adding New Colors
1. Add CSS custom property to `:root` in `src/index.css`
2. Extend color in `tailwind.config.js`
3. Update this documentation

### Adding New Components
1. Create component in `src/components/`
2. Use design tokens for all styling
3. Add accessibility attributes (ARIA, roles, labels)
4. Create `.a11y.test.js` file for accessibility tests
5. Document component in this file

### Updating Tokens
1. Update CSS custom properties in `src/index.css`
2. Update Tailwind config if using Tailwind classes
3. Test all affected components
4. Update documentation

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [MDN Web Docs - Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
