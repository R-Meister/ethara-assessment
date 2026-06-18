---
name: Inventory & Order Management System
description: A clean, efficient inventory and order management tool with refined slate-blue palette
colors:
  primary: "#2563eb"
  primary-dark: "#1d4ed8"
  success: "#16a34a"
  danger: "#dc2626"
  warning: "#f59e0b"
  bg: "#f8fafc"
  card-bg: "#ffffff"
  text: "#1e293b"
  text-light: "#64748b"
  border: "#e2e8f0"
  surface: "#f1f5f9"
typography:
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  heading:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.3
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.05em"
    textTransform: uppercase
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-secondary:
    backgroundColor: "{colors.border}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  card:
    backgroundColor: "{colors.card-bg}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  input:
    backgroundColor: "#ffffff"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  stat-card:
    backgroundColor: "{colors.card-bg}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  table-header:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-light}"
---

# Design System: Inventory & Order Management System

## 1. Overview

**Creative North Star: "The Workspace"**

A well-organized workspace where everything has its place. No decorative chrome, no visual noise — every pixel serves a functional purpose. The interface recedes so the data can speak. Confidence through restraint, not spectacle.

This system rejects the warm-cream SaaS default and the AI-generated card-grid cliché. It is cool-toned, data-dense, and structural. The palette is anchored in slate-blue neutrals with a single purposeful blue accent. Depth comes from subtle ambient layering, not shadows that perform.

**Key Characteristics:**
- Cool slate-blue neutrals carry 80% of the surface area
- Single blue accent reserved for interactive elements and status indicators
- Subtle ambient shadows on all surfaces — always slightly lifted
- System font stack prioritizes rendering speed and platform consistency
- Tables and data displays are the primary content pattern, not cards

## 2. Colors

The palette is restrained: tinted cool neutrals with one saturated blue accent used sparingly.

### Primary
- **Slate Blue** (#2563eb): Interactive elements — buttons, links, active nav states, focus rings. The single accent color; its rarity is the point.

### Secondary
- **Deep Slate Blue** (#1d4ed8): Hover/active state for primary elements. One step darker for state feedback.

### Neutral
- **Ink** (#1e293b): Primary text color. Dark enough for strong contrast against white and near-white surfaces.
- **Muted Slate** (#64748b): Secondary text, labels, table header text. Reduced emphasis without losing readability.
- **Cool Border** (#e2e8f0): Dividers, table borders, input borders. Structural separation.
- **Surface** (#f1f5f9): Table header backgrounds, subtle tonal layering. The lightest functional surface.
- **Paper** (#f8fafc): Page background. Cool-toned near-white, not warm cream.
- **White** (#ffffff): Card and modal backgrounds. Clean containers.

### Semantic
- **Success Green** (#16a34a): Positive indicators — in-stock badges, completed states.
- **Danger Red** (#dc2626): Destructive actions, delete buttons, critical alerts, low-stock warnings.
- **Warning Amber** (#f59e0b): Caution states, medium-stock indicators.

### Named Rules
**The Rarity Rule.** The primary blue accent appears on ≤15% of any given screen. Its restraint is its authority. When everything is blue, nothing is.

**The Cool-Tone Rule.** All neutrals skew cool (toward blue-gray, never toward warm beige/cream). Warmth is carried by accent and content, not by the background.

## 3. Typography

**Display Font:** System font stack (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)
**Body Font:** Same system stack
**Label/Mono Font:** Same system stack

**Character:** One family in multiple weights. The system font stack ensures fast rendering, platform-native feel, and zero FOUT. Hierarchy is achieved through weight and size, not font-family contrast.

### Hierarchy
- **Heading** (600, 24px, line-height 1.3): Page titles. Appears once per view in the page header.
- **Body** (400, 14px, line-height 1.6): All readable content — table cells, form labels, descriptions. Max line length 65–75ch where applicable.
- **Label** (600, 13px, letter-spacing 0.05em, uppercase): Table column headers, section labels. Structural text that frames data.
- **Stat Number** (700, 24px): Dashboard metric values. Bold for scanability.

### Named Rules
**The Single-Family Rule.** One font family across all surfaces. Hierarchy lives in weight (400/500/600/700) and size, never in family switching. The system font is the brand font.

## 4. Elevation

Surfaces are always slightly lifted. Every card, table, and panel carries a subtle ambient shadow at rest, reinforcing the Workspace metaphor — objects sit on a surface, they don't float. Shadows deepen on hover and active states for tactile feedback.

### Shadow Vocabulary
- **Ambient** (`0 1px 3px rgba(0, 0, 0, 0.1)`): Default state for cards, tables, stat panels. Establishes baseline lift.
- **Raised** (`0 4px 6px rgba(0, 0, 0, 0.1)`): Hover state on interactive elements, expanded panels. Signals interactivity.

### Named Rules
**The Always-Lifted Rule.** Every surface carries at minimum the ambient shadow. Flat surfaces feel unfinished. The shadow is not decorative — it communicates that this object exists in space and can be acted upon.

## 5. Components

### Buttons
- **Shape:** Gently curved (8px radius)
- **Primary:** Blue background (#2563eb), white text, 10px 20px padding. The default action button.
- **Hover / Focus:** Darkens to #1d4ed8. Focus ring: 3px blue glow at 10% opacity.
- **Danger:** Red background (#dc2626), white text. Reserved for destructive actions only.
- **Secondary:** Border-colored background (#e2e8f0), ink text. Neutral actions, cancel buttons.
- **Small variant:** Reduced padding (6px 12px), 12px font. For inline table actions.

### Cards / Containers
- **Corner Style:** 8px radius
- **Background:** White (#ffffff)
- **Shadow Strategy:** Always-lifted ambient shadow (0 1px 3px rgba(0,0,0,0.1))
- **Border:** None — shadow provides structural definition
- **Internal Padding:** 24px

### Stat Cards
- **Layout:** Horizontal flex — icon left, metric + label right
- **Icon container:** 48×48px, 12px radius, tinted background matching semantic color
- **Metric:** 24px bold, high contrast
- **Label:** 14px, muted slate, descriptive

### Tables
- **Header:** Surface background (#f1f5f9), uppercase 13px labels, muted text
- **Rows:** White background, 12px 16px cell padding
- **Borders:** Bottom border per row using cool border color
- **Hover:** Subtle background shift to #f8fafc
- **Responsive:** Horizontal scroll on mobile with fixed first column

### Inputs / Fields
- **Style:** 1px border (#e2e8f0), white background, 8px radius, 10px 12px padding
- **Focus:** Border shifts to primary blue, 3px glow ring at 10% opacity
- **Error:** Border shifts to danger red
- **Label:** 14px weight-500, positioned above input with 6px gap

### Modals
- **Overlay:** Fixed fullscreen, rgba(0,0,0,0.5) backdrop
- **Container:** White, 8px radius, 24px padding, max-width 500px, centered
- **Header:** 20px weight-600, 20px bottom margin
- **Actions:** Right-aligned flex with 10px gap

### Navigation (Sidebar)
- **Style:** Fixed left sidebar, 240px width, dark ink background
- **Typography:** 14px, white text at 70% opacity for inactive, full opacity for active/hover
- **Active state:** Background rgba(255,255,255,0.1), full white text
- **Border:** 1px rgba(255,255,255,0.1) separator below title
- **Mobile:** Hidden on screens <768px; main content goes full-width

### Badges / Tags
- **Shape:** 20px border-radius (pill)
- **Success:** Green tinted background (#dcfce7), dark green text (#166534)
- **Warning:** Amber tinted background (#fef3c7), dark amber text (#92400e)
- **Danger:** Red tinted background (#fee2e2), dark red text (#991b1b)

## 6. Do's and Don'ts

### Do:
- **Do** keep the primary blue accent rare — ≤15% of any screen's surface area
- **Do** use the system font stack everywhere; hierarchy through weight and size only
- **Do** maintain ambient shadows on all surfaces at rest
- **Do** use cool-toned neutrals (blue-gray family, never warm beige/cream)
- **Do** align table headers with uppercase 13px labels for structural clarity
- **Do** use semantic colors (green/red/amber) consistently for status indicators

### Don't:
- **Don't** use gradient text (`background-clip: text` with gradient) — decorative, never meaningful
- **Don't** use glassmorphism or backdrop-blur on cards or panels — purposeful only, or nothing
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe
- **Don't** put tiny uppercase tracked eyebrows ("ABOUT", "PROCESS", "PRICING") above every section
- **Don't** use numbered section markers (01 / 02 / 03) as default scaffolding
- **Don't** use warm-tinted backgrounds (cream, sand, beige, parchment) — the palette is cool
- **Don't** pair two similar font families; the single-family rule is absolute
- **Don't** use bounce or elastic easing on any transition
- **Don't** nest cards inside cards
- **Don't** animate layout properties unless truly needed
