# Design

> Maintained by frontend-god-mode.
> Source of truth for typography, color, motion, layout, and component tokens.
> Read this before changing the UI in a subsequent session.

## Aesthetic direction

Warm artisan storefront with refined, practical admin tools: cream paper surfaces, espresso typography, caramel-gold emphasis, and restrained craft details.

## Dials

- DESIGN_VARIANCE: 6 / 10
- MOTION_INTENSITY: 5 / 10
- VISUAL_DENSITY: 5 / 10

## Type stack

- Display: Playfair Display, loaded through `next/font/google`
- Body and controls: Montserrat, loaded through `next/font/google`
- Numeric controls: Montserrat with `tabular-nums`
- Use no more than these two families.

## Color tokens

```css
--brand-primary: #2b1e16;   /* espresso */
--brand-secondary: #1a130e; /* dark roast */
--brand-muted: #6b5443;     /* readable cocoa */
--brand-gold: #b07a35;      /* caramel gold */
--brand-gold-soft: #d6a861;
--brand-bg: #f5ecdf;        /* cream */
--brand-cream: #faf4ea;
--brand-surface: #fffdf9;   /* warm off-white */
--border: #d8cab5;
--destructive: #b91c1c;
```

- Gold is the only interactive accent.
- Prefer warm off-whites and espresso over pure black or white.
- Do not add purple-to-blue gradients.
- Shadows must be tinted toward espresso using the existing `shadow-craft` utilities.

## Motion

- Default CSS easing: `cubic-bezier(0.16, 1, 0.3, 1)`.
- Motion is reserved for state changes, reveals, and direct interaction feedback.
- Animate opacity and transforms, not layout dimensions.
- The global `prefers-reduced-motion` rule must continue to disable decorative animation.

## Layout

- Public sections use generous cream-paper spacing and a responsive centered container.
- Admin pages use a fixed espresso sidebar, sticky surface header, and compact operational content.
- Dense admin settings use divided rows and aligned numeric columns rather than grids of equal cards.
- Mobile layouts collapse to one column with at least 1rem horizontal padding and no horizontal scrolling outside intentional data-table wrappers.

## Component inventory

- `AdminShell`: fixed sidebar, sticky page header, and admin content frame.
- `SectionCard`: one-level grouping for admin setting sections.
- `AdminRegionalDeliveryFees`: three divided island-group rows with base, markup, and live effective-fee output.
- `Button`, `Card`, `Section`, and `Ornament`: shared public-site primitives.
- Lucide icons use the existing compact stroke treatment; no decorative emoji.

## Brand voice

- Direct, useful, and specific.
- Admin copy explains pricing precedence plainly.
- Use action labels such as “Save delivery settings,” not generic “Submit.”
- Avoid filler terms such as elevate, seamless, unleash, and next-gen.

## Accessibility floor

- WCAG 2.2 AA contrast for text and controls.
- Every input has a persistent label and server-side validation.
- Interactive controls have visible `:focus-visible` treatment.
- Numeric inputs use a minimum 44px control height on mobile.
- Live calculated values use polite status semantics without interrupting screen readers.

## Last updated

- 2026-08-09: Added regional delivery fee controls and documented the existing JavaCrafts visual system.
