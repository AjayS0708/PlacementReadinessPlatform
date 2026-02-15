# KodNest Premium Build System

A calm, intentional, and coherent design system for serious B2C products. No flashy effects, no animation noise—just professional, confident design.

## Design Philosophy

**Core Principles:**
- Calm, Intentional, Coherent, Confident
- Not flashy, not loud, not playful, not hackathon-style
- No gradients, no glassmorphism, no neon colors, no animation noise
- Everything must feel like one mind designed it

## Tech Stack

### Core Technologies

#### React 18 + TypeScript
**Why:** React is the industry standard for component-based UI development. TypeScript adds type safety, catching errors at compile-time rather than runtime. This combination ensures:
- Robust, maintainable codebase
- Auto-completion and IntelliSense in editors
- Self-documenting code through type definitions
- Easier refactoring and scaling

#### Vite
**Why:** Modern build tool that offers:
- Lightning-fast hot module replacement (HMR)
- Optimized production builds with code splitting
- Native ES modules support
- Superior developer experience compared to Webpack
- Fast startup time (critical for developer productivity)

#### CSS with CSS Custom Properties
**Why:** Instead of CSS-in-JS or utility frameworks like Tailwind:
- Full control over styling with no abstraction overhead
- CSS Custom Properties (CSS variables) for design tokens
- Better performance (no runtime CSS generation)
- Proper separation of concerns
- Easier for designers to understand and modify
- Consistent with design system philosophy of intentional, predictable styling

### Project Structure

```
src/
├── tokens/              # Design tokens (colors, spacing, typography)
│   └── index.ts
├── styles/              # Global styles and CSS resets
│   └── globals.css
├── components/
│   ├── base/           # Primitive components (Button, Card, Input, etc.)
│   │   ├── Button.tsx
│   │   ├── Button.css
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   └── Checkbox.tsx
│   └── layout/         # Layout components (TopBar, ContextHeader, etc.)
│       ├── TopBar.tsx
│       ├── ContextHeader.tsx
│       ├── PrimaryWorkspace.tsx
│       ├── SecondaryPanel.tsx
│       ├── ProofFooter.tsx
│       └── WorkspaceLayout.tsx
├── App.tsx
└── main.tsx
```

## Color System

Maximum 4 colors across entire system:

```css
--color-background: #F7F6F3    /* Off-white background */
--color-text-primary: #111111  /* Primary text */
--color-accent: #8B0000        /* Deep red accent */
--color-success: #3A5A40       /* Muted green */
--color-warning: #B8860B       /* Muted amber */
```

## Typography

### Fonts
- **Headings:** Serif font (Playfair Display, Georgia)
- **Body:** Sans-serif (-apple-system, Inter, Helvetica Neue)

### Sizes
- Body: 16–18px
- Line height: 1.6–1.8
- Max width for text blocks: 720px

### Rules
- No decorative fonts
- No random sizes
- Generous spacing around headings
- Confident, large serif headlines

## Spacing System

Consistent scale based on 8px:

```css
--space-xs: 8px
--space-sm: 16px
--space-md: 24px
--space-lg: 40px
--space-xl: 64px
```

**Never use random spacing like 13px, 27px, etc.** Whitespace is part of design.

## Layout Structure

Every page follows this structure:

```
[Top Bar]
    ↓
[Context Header]
    ↓
[Primary Workspace (70%) | Secondary Panel (30%)]
    ↓
[Proof Footer]
```

### Top Bar
- Left: Project name
- Center: Progress indicator (Step X / Y)
- Right: Status badge (Not Started / In Progress / Shipped)

### Context Header
- Large serif headline
- 1-line subtext
- Clear purpose, no hype language

### Primary Workspace (70% width)
- Main product interaction area
- Clean cards, predictable components
- No crowding

### Secondary Panel (30% width)
- Step explanation (short)
- Copyable prompt box
- Action buttons: Copy, Build in Lovable, It Worked, Error, Add Screenshot
- Calm styling

### Proof Footer (persistent bottom)
Checklist style:
- □ UI Built
- □ Logic Working
- □ Test Passed
- □ Deployed

Each checkbox requires user proof input.

## Component Rules

### Buttons
- Primary: Solid deep red background
- Secondary: Outlined with border
- Same hover effect and border radius everywhere
- Transitions: 150–200ms, ease-in-out

### Inputs
- Clean borders, no heavy shadows
- Clear focus state with accent color outline
- Consistent padding and sizing

### Cards
- Subtle border (no drop shadows)
- Balanced padding using spacing system
- White background

## Interaction Rules

- Transitions: 150–200ms, ease-in-out
- No bounce effects, no parallax
- Focus states: 2px solid accent color outline

## Error & Empty States

### Errors
- Explain what went wrong
- Provide how to fix
- Never blame the user

### Empty States
- Provide next action
- Never feel dead
- Show clear call-to-action

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the design system demo.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Using the Design System

### Import Components

```typescript
import { Button, Card, Input, Badge, Checkbox } from './components/base';
import {
  TopBar,
  ContextHeader,
  WorkspaceLayout,
  PrimaryWorkspace,
  SecondaryPanel,
  ProofFooter
} from './components/layout';
```

### Example Usage

```typescript
function MyPage() {
  return (
    <>
      <TopBar
        projectName="My Project"
        currentStep={2}
        totalSteps={5}
        status="In Progress"
      />
      
      <ContextHeader
        headline="Build Your Feature"
        subtext="Follow the steps to complete your implementation."
      />
      
      <WorkspaceLayout>
        <PrimaryWorkspace>
          <Card padding="md">
            <h3>Step Content</h3>
            <p>Your main content goes here.</p>
            <Button variant="primary">Continue</Button>
          </Card>
        </PrimaryWorkspace>

        <SecondaryPanel
          title="Instructions"
          explanation="This is step 2 of your build process."
          prompt="npm run build"
          onCopy={() => console.log('Copied')}
        />
      </WorkspaceLayout>

      <ProofFooter />
    </>
  );
}
```

## Design Tokens

Import design tokens programmatically:

```typescript
import { colors, spacing, typography, layout, effects } from './tokens';

// Use in your components
const myStyle = {
  color: colors.accent,
  padding: spacing.md,
  fontFamily: typography.fontSerif,
};
```

## Best Practices

1. **Always use spacing scale** — No arbitrary values
2. **Follow color system** — No additional colors without approval
3. **Maintain typography hierarchy** — Use defined font sizes
4. **Keep interactions subtle** — 150-200ms transitions only
5. **Test accessibility** — All components should be keyboard navigable
6. **Maintain consistency** — One design mind across all pages

## Visual Consistency Checklist

- [ ] Using only approved colors from color system
- [ ] Using spacing scale (no random pixel values)
- [ ] Typography follows heading/body rules
- [ ] Transitions are 150-200ms ease-in-out
- [ ] No gradients, no glassmorphism
- [ ] Cards use subtle borders, no shadows
- [ ] Buttons follow primary/secondary patterns
- [ ] Layout follows standard structure
- [ ] No animation noise

---

**Remember:** This is not a student project. This is a serious B2C product company design system. Every pixel, every spacing decision, every interaction is intentional.
