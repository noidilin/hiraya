# Design System: Kinetic Logic
**Project:** Lazy CI/CD Component System  
**Stitch Project ID:** `10175805895701841360`  
**Source Design System Asset:** `assets/eb5693a535824a7299d0b3a8590cce4b`  
**Target Stack:** Vite, React, TypeScript, Tailwind CSS v4, shadcn/ui `radix-nova`, lucide-react

## 1. Visual Theme & Atmosphere

Kinetic Logic is a light, technical interface language for teaching CI/CD as a living system. It should feel precise, fast, and inspectable: a clean developer workstation with visible logic paths, live pipeline state, and enough motion to make cause and effect obvious.

The mood is modern corporate glassmorphism with high-density technical detail. The base canvas is near-white, panels are translucent white with fine borders, and the main energy comes from a vivid safety orange. The interface should communicate controlled power rather than decoration: flow lines, status dots, compact metadata, progress traces, and responsive panels are the core visual signatures.

Use the system for product UI, lab exercises, pipeline visualizations, and interactive explanations. Avoid marketing-page composition unless a route explicitly needs it. The first screen should feel like a usable CI/CD lab or dashboard, not a landing page.

## 2. Color Palette & Roles

- **Canvas White Smoke (`#f9f9f9`)**: App background and page-level canvas. Use for `--background`.
- **Panel White (`#ffffff`)**: Cards, popovers, command surfaces, table containers, and glass panels. Use for `--card` and `--popover`.
- **Ink Charcoal (`#1a1c1c`)**: Primary text, dense headings, active navigation text, and critical labels. Use for `--foreground`.
- **Kinetic Orange (`#FA5D19`)**: Primary actions, active pipeline steps, focus rings, progress indicators, selected nav markers, and key callouts. Use for `--primary`.
- **Orange Hover (`#ff7a3f`)**: Hover and active highlights for primary actions.
- **Orange Mist (`#fff1ea`)**: Low-emphasis orange background for selected states, tags, hover fills, and radial glow overlays.
- **Structural Border (`#e5e7eb`)**: Default borders, separators, table row dividers, card outlines, and shadcn `--border` / `--input`.
- **Soft Surface (`#eeeeee`)**: Muted backgrounds, inactive controls, zebra rows, and low-emphasis toolbar zones.
- **Cool Metadata Gray (`#6b7280`)**: Descriptions, timestamps, inactive icons, secondary table text, and graph axes.
- **Success Emerald (`#16a34a`)**: Passed checks, healthy services, successful deployments, and status dots.
- **Error Ruby (`#dc2626`)**: Failed jobs, blocked deployments, destructive actions, and validation errors.

Recommended shadcn CSS variable mapping for `src/index.css`:

```css
:root {
  --background: oklch(0.982 0.000 89.876);
  --foreground: oklch(0.224 0.003 196.939);
  --card: oklch(1.000 0.000 89.876);
  --card-foreground: oklch(0.224 0.003 196.939);
  --popover: oklch(1.000 0.000 89.876);
  --popover-foreground: oklch(0.224 0.003 196.939);
  --primary: oklch(0.678 0.204 39.679);
  --primary-foreground: oklch(1.000 0.000 89.876);
  --secondary: oklch(0.949 0.000 89.876);
  --secondary-foreground: oklch(0.269 0.000 89.876);
  --muted: oklch(0.949 0.000 89.876);
  --muted-foreground: oklch(0.551 0.023 264.364);
  --accent: oklch(0.967 0.018 48.531);
  --accent-foreground: oklch(0.269 0.000 89.876);
  --destructive: oklch(0.567 0.204 28.912);
  --destructive-foreground: oklch(1.000 0.000 89.876);
  --border: oklch(0.928 0.006 264.531);
  --input: oklch(0.928 0.006 264.531);
  --ring: oklch(0.678 0.204 39.679);
  --chart-1: oklch(0.678 0.204 39.679);
  --chart-2: oklch(0.627 0.170 149.214);
  --chart-3: oklch(0.551 0.023 264.364);
  --chart-4: oklch(0.726 0.178 42.717);
  --chart-5: oklch(0.567 0.204 28.912);
  --radius: 0.5rem;
}
```

## 3. Typography Rules

Use **Inter** for the Kinetic Logic UI voice. It should feel compact, neutral, and engineered. Use **JetBrains Mono** only for technical strings such as commit hashes, environment IDs, step numbers, versions, timestamps, ports, and terminal-like labels.

- **Display / Page Titles:** Inter, 30px, 600 weight, 36px line height, tight letter spacing. Use sparingly for page-level context.
- **Section Headlines:** Inter, 24px, 600 weight, 32px line height. Use for panels, modules, and major lab steps.
- **Card Titles:** Inter, 18px, 600 weight, 24px line height.
- **Body Text:** Inter, 14px, 400 weight, 20px line height. Keep body copy brief and functional inside UI surfaces.
- **Labels:** Inter, 12-14px, 500 weight. Use for toolbar labels, form labels, and status names.
- **Technical Metadata:** JetBrains Mono, 10-12px. Use inside tags or compact data regions.

If `@fontsource-variable/inter` is not installed yet, either add it when implementing the theme or keep Geist only as a temporary fallback. Kinetic Logic should ultimately render with Inter.

## 4. Component Stylings

### shadcn/ui Contract

Keep shadcn components in `src/components/ui/` close to registry structure. Put Kinetic Logic compositions in domain components outside `ui`, for example `src/components/pipeline/`, `src/components/lab/`, or `src/components/dashboard/`.

All components should use existing shadcn tokens first: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`, `bg-accent`, and `ring-ring`. Use one-off arbitrary values only for motion effects, radial glow, and connector lines.

### Buttons

Primary buttons are solid Kinetic Orange with white text, 8px corners, lucide icons when an action has a familiar symbol, and a snappy 150ms transition. Hover should shift toward Orange Hover, not darken to brown. Secondary buttons are white or transparent with a Structural Border outline. Ghost buttons use Orange Mist on hover when they represent navigation or pipeline actions.

Button text should stay short and command-oriented: `Run`, `Retry`, `Deploy`, `Compare`, `Open logs`. Use icon-only buttons for toolbars when the icon is familiar, with accessible labels and tooltips for ambiguity.

### Cards and Panels

Cards are glass panels: white at about 85-90% opacity, 1px Structural Border, 8-16px radius depending on size, and `backdrop-blur-md`. Default cards should not use heavy shadows. Use a subtle ambient shadow only for floating elements such as popovers, dialogs, and command menus.

Interactive panels may use a radial mouse glow: a 400px orange radial gradient at roughly 8% opacity that follows pointer position. The effect should clarify focus without making the UI feel loud.

### Status Tokens

Status indicators are pill-shaped chips with a small solid dot. Use low-opacity semantic backgrounds and saturated text:

- Success: emerald dot and text for passed checks.
- Error: ruby dot and text for failed jobs.
- Active: orange dot, optional pulse animation, and Orange Mist background.
- Idle: gray dot and muted text.

### Inputs and Forms

Inputs use a white background, 1px Structural Border, 8px radius, and compact 14px text. Focus state uses Kinetic Orange border plus a 2-3px ring at low opacity. Do not remove visible focus styles from Radix or shadcn primitives.

### Tables and Lists

Data-heavy lists should be dense but calm. Use 1px row separators, optional subtle zebra striping with Soft Surface, and JetBrains Mono for hashes, IDs, durations, versions, and environment names. Keep actions aligned to the right with icon buttons when repeated across rows.

### Pipeline Nodes and React Flow

Pipeline nodes are modular blocks with rounded squares or compact circular icon containers. Use orange for active transitions, emerald for successful stages, ruby for failures, and gray for inactive stages. Connectors use 1px lines behind nodes. Active connectors should use marching-ants dashed motion to show transfer or dependency flow.

## 5. Layout Principles

Use a fluid grid based on 4px units. The standard page gutter is 24px on desktop and 16px on mobile. Major sections should align to a 12-column desktop rhythm, collapsing into a single column on mobile.

Top navigation is 64px high with a white glass background, blur, and a bottom border. Side navigation may use a compact docked state, expanding on hover or focus when the page benefits from more labels. On mobile, side navigation should become a bottom tab bar with icon and label pairs.

Prefer dense, organized work surfaces over oversized hero sections. For teaching flows, the app should make the current concept, pipeline state, and next action visible without requiring explanatory marketing copy. Leave whitespace around major panels, but keep controls and data close enough to support scanning and repeated action.

## 6. Motion and Interaction

Motion should explain system behavior. Use GSAP for complex explanatory sequences, Motion Primitives for small UI transitions, and CSS keyframes for simple continuous effects.

- **Default transition:** 150ms for hover, press, and focus feedback.
- **Panel expansion:** 250-300ms with a precise ease-out curve.
- **Pipeline flow:** dashed connector translation for active transfer.
- **Status pulse:** subtle scale to 1.05 and opacity shift only for active running services.
- **Progress:** segmented progress is preferred over smooth bars when representing CI/CD steps.

Respect reduced-motion preferences. When reduced motion is enabled, keep state changes visible through color, position, and text rather than continuous animation.

## 7. Implementation Notes

- This project is configured for shadcn/ui with `components.json`, `radix-nova`, Tailwind CSS v4, lucide icons, and CSS variables.
- Keep `src/index.css` as the source of runtime design tokens.
- Prefer shadcn registry components for primitives, then compose domain-specific CI/CD components around them.
- Use lucide icons in buttons and navigation whenever a recognizable icon exists.
- Avoid nested cards. Use full-width sections or direct panel layouts, with cards reserved for repeated items, tools, dialogs, and individual pipeline modules.
- Avoid dark-mode-first styling for Kinetic Logic. The selected Stitch system is a light design system.
