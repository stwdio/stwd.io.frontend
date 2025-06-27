# Theme System Documentation

## Overview
stwd.io uses a complete shadcn/ui theme system with CSS variables for consistent styling across light and dark modes.

## Core Principles
✅ **ALWAYS USE** shadcn component variants instead of hardcoded colors
✅ **LEVERAGE** CSS variables for custom styling when needed
✅ **MAINTAIN** accessibility with proper contrast ratios

## Component Variants Guide

### Buttons
```tsx
// Primary actions
<Button variant="default">Primary Action</Button>

// Secondary actions  
<Button variant="outline">Secondary Action</Button>
<Button variant="secondary">Tertiary Action</Button>

// Subtle actions
<Button variant="ghost">Ghost Button</Button>

// Dangerous actions
<Button variant="destructive">Delete</Button>
```

### Badges
```tsx
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Inactive</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Neutral</Badge>
```

### Cards
```tsx
<Card>
  <CardHeader>
    <CardTitle>Uses --card and --card-foreground</CardTitle>
  </CardHeader>
  <CardContent>
    Content automatically inherits theme colors
  </CardContent>
</Card>
```

## CSS Variables Reference

### Core Colors
- `--background` / `--foreground` - Main page background and text
- `--card` / `--card-foreground` - Card containers
- `--popover` / `--popover-foreground` - Dropdowns and overlays

### Interactive Elements
- `--primary` / `--primary-foreground` - Main action buttons
- `--secondary` / `--secondary-foreground` - Secondary elements
- `--accent` / `--accent-foreground` - Highlights and accents
- `--muted` / `--muted-foreground` - Subtle backgrounds and text

### States
- `--destructive` - Error/danger states
- `--border` - Element borders
- `--input` - Form input borders
- `--ring` - Focus rings

## Custom Styling with Theme
When shadcn variants aren't sufficient, use CSS variables:

```tsx
// Custom styling that respects theme
<div className="bg-muted text-muted-foreground border border-border">
  Themed custom element
</div>

// For complex custom colors
<div style={{ 
  backgroundColor: 'hsl(var(--accent))',
  color: 'hsl(var(--accent-foreground))'
}}>
  Advanced themed element
</div>
```

## Dark Mode Support
- **Automatic**: All components automatically adapt to dark mode
- **Variables**: CSS variables automatically switch values
- **No Additional Code**: Components work in both themes without modification

## Layout Utilities
- `--radius` - Consistent border radius across components
- `--sidebar-*` - Sidebar-specific theme variables
- `--chart-*` - Data visualization colors

## Best Practices

### ✅ DO
- Use shadcn component variants (`variant="outline"`)
- Reference CSS variables for custom elements (`bg-muted`)
- Test components in both light and dark modes
- Use semantic naming for theme-aware custom classes

### ❌ DON'T
- Hardcode colors (`bg-red-600`, `text-white`)
- Override theme variables without considering dark mode
- Create custom color schemes outside the theme system
- Use arbitrary color values that break accessibility

## Example: Theme-Compliant Component
```tsx
export function ThemedComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Themed Component</CardTitle>
        <p className="text-muted-foreground">Subtitle text</p>
      </CardHeader>
      <CardContent>
        <Button variant="default">Primary Action</Button>
        <Button variant="outline" className="ml-2">Secondary</Button>
        <Badge variant="secondary" className="ml-2">Status</Badge>
      </CardContent>
    </Card>
  )
}
```

This component will automatically work in both light and dark modes with proper contrast and accessibility. 