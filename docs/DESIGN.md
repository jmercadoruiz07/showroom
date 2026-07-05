# Design System — JMR Visuals Portfolio

> **Impeccable Mode: Brand**
> This is an asymmetric, media-heavy creative portfolio utilizing Impeccable's Brand surface mode.
> All design decisions prioritize editorial art direction over conventional UI patterns.

---

## Color Tokens (OKLCH)

The palette is grounded in warm neutrals with a single accent hue. No gradients. No neon.
Print-inspired: think soot, bone, oxidized copper, and deep ink.

```css
:root {
  /* Ink — primary text, headings */
  --color-ink:          oklch(0.15 0.01 60);
  /* Soot — secondary text, captions */
  --color-soot:         oklch(0.35 0.01 60);
  /* Stone — borders, dividers */
  --color-stone:        oklch(0.70 0.01 60);
  /* Bone — page background */
  --color-bone:         oklch(0.96 0.005 80);
  /* Paper — card/section backgrounds */
  --color-paper:        oklch(0.93 0.008 75);
  /* Oxide — accent (warm copper) */
  --color-oxide:        oklch(0.55 0.14 45);
  /* Oxide muted — hover states */
  --color-oxide-muted:  oklch(0.48 0.10 45);
  /* Deep — dark sections, footers */
  --color-deep:         oklch(0.12 0.015 60);
  /* Deep text — text on dark backgrounds */
  --color-deep-text:    oklch(0.88 0.008 75);
}
```

### Dark Mode

Invert `--color-bone` ↔ `--color-deep`, `--color-ink` ↔ `--color-deep-text`.
Keep `--color-oxide` identical in both modes (copper reads well on both grounds).

---

## Typography

**No Inter. No Arial. No system defaults.**

| Role        | Family                          | Weight     | Tracking     | Notes                                          |
| ----------- | ------------------------------- | ---------- | ------------ | ---------------------------------------------- |
| Display     | `"Playfair Display", serif`     | 700–900    | -0.02em      | Project titles, hero text. Italics for emphasis |
| Body        | `"Instrument Sans", sans-serif` | 400        | 0            | Captions, descriptions, nav labels              |
| Mono/Detail | `"JetBrains Mono", monospace`   | 400        | 0.04em       | Dates, tags, metadata, project numbers          |

### Fluid Type Scale (clamp-based)

```css
--type-xs:     clamp(0.694rem, 0.65rem + 0.2vw, 0.8rem);
--type-sm:     clamp(0.833rem, 0.78rem + 0.25vw, 0.95rem);
--type-base:   clamp(1rem, 0.92rem + 0.35vw, 1.125rem);
--type-md:     clamp(1.2rem, 1.08rem + 0.5vw, 1.4rem);
--type-lg:     clamp(1.44rem, 1.25rem + 0.8vw, 1.85rem);
--type-xl:     clamp(1.728rem, 1.4rem + 1.3vw, 2.5rem);
--type-2xl:    clamp(2.074rem, 1.5rem + 2vw, 3.5rem);
--type-hero:   clamp(2.8rem, 1.8rem + 3.5vw, 5.5rem);
```

---

## Spacing System

8px base with deliberate generosity. Portfolio work needs room to breathe.

```css
--space-2xs:   clamp(0.25rem, 0.2rem + 0.15vw, 0.375rem);
--space-xs:    clamp(0.5rem, 0.45rem + 0.2vw, 0.625rem);
--space-sm:    clamp(0.75rem, 0.65rem + 0.35vw, 1rem);
--space-md:    clamp(1rem, 0.85rem + 0.5vw, 1.5rem);
--space-lg:    clamp(1.5rem, 1.2rem + 1vw, 2.5rem);
--space-xl:    clamp(2rem, 1.5rem + 1.8vw, 4rem);
--space-2xl:   clamp(3rem, 2rem + 3vw, 6rem);
--space-3xl:   clamp(4rem, 2.5rem + 5vw, 10rem);
```

---

## Layout Principles

### Asymmetric Grid

The site deliberately avoids symmetry. Use CSS Grid with named areas and irregular column definitions.

```
DO:   grid-template-columns: 2fr 1fr;
DO:   grid-template-columns: 1fr 2.5fr 0.5fr;
DO:   offset images from text blocks; let images bleed past column edges

DON'T: grid-template-columns: 1fr 1fr 1fr;
DON'T: equal-width card grids
DON'T: center everything
```

### Masonry & Staggered Layouts

For project gallery pages, use a CSS-only masonry approach (column-count or CSS Grid masonry where supported) with varied aspect ratios. Each thumbnail should feel intentionally placed, not auto-filled.

### Split-Screen Compositions

Use 60/40 or 70/30 splits for project detail pages:
- Large media pane (left or right, alternating per project)
- Narrow metadata/description pane on the opposite side
- Allow the media pane to extend to viewport edge (no gutter on the bleed side)

### Viewport-Aware Sections

Full-bleed media sections should span 100vw. Text sections should respect a max-width of ~70ch for readability, positioned asymmetrically within the viewport (not centered).

---

## Motion & Animation

### Principles

- **Purposeful, not decorative.** Motion should reveal, orient, or delight — never distract.
- **Ease: cubic-bezier(0.22, 1, 0.36, 1)** — quick in, slow out. Feels physical.
- **No bounce/elastic easing.** (Impeccable anti-pattern)
- **Duration:** 200–400ms for micro-interactions, 600–1000ms for scroll reveals.

### Scroll-Triggered Reveals

Use Intersection Observer for staggered entrance animations:
- Images: fade up + slight scale (1.02 → 1.0)
- Text: fade in from left or right (asymmetric direction)
- Metadata: delay 100–200ms after parent

### Hover Effects

- Project thumbnails: subtle parallax shift or slow zoom (transform: scale(1.03) over 500ms)
- Navigation links: underline wipe from left
- Accent elements: color transition to `--color-oxide-muted`

### Page Transitions

If using View Transitions API or framework equivalents:
- Cross-fade with 300ms duration
- Hero image morphing between gallery → detail view

---

## Media Handling

### Image Strategy

- Serve WebP/AVIF with `<picture>` fallbacks
- Use `loading="lazy"` for below-fold images
- Provide `srcset` at 640w, 1024w, 1440w, 2048w breakpoints
- Aspect ratios: preserve original. Do NOT force uniform aspect ratios.
- Use `object-fit: cover` only for background/hero images, `contain` for portfolio pieces

### 3D Embeds

- Support `<model-viewer>` web component for glTF/GLB models
- Fallback: high-res static render with "View in 3D" overlay
- Allow inline turntable interaction (auto-rotate + drag)
- Lazy-load 3D models — they are heavy

### Video/Motion

- Autoplay muted loop for short process videos
- Use `<video>` with poster frame, not embedded YouTube/Vimeo players
- IntersectionObserver to play/pause based on visibility

---

## Component Inventory

| Component            | Purpose                                           | Layout Pattern          |
| -------------------- | ------------------------------------------------- | ----------------------- |
| `SiteHeader`         | Minimal nav: wordmark + 3–4 links + theme toggle  | Fixed, transparent bg   |
| `HeroSection`        | Full-bleed statement image with overlaid title     | 100vw × 90vh            |
| `ProjectGallery`     | Masonry/staggered grid of project thumbnails       | Asymmetric columns      |
| `ProjectCard`        | Single project thumbnail with title + category     | Varied aspect ratios    |
| `ProjectDetail`      | Split-screen: large media + metadata pane          | 60/40 or 70/30 split    |
| `MediaViewer`        | Lightbox/full-screen image or 3D model viewer      | Modal overlay           |
| `AboutSection`       | Bio text + portrait, editorial two-column layout   | Offset grid             |
| `ContactBlock`       | Minimal contact info: email + social links         | Inline, footer-adjacent |
| `SiteFooter`         | Copyright + social icons + back-to-top             | Full-width dark band    |
| `CategoryFilter`     | Horizontal pill/tag filter for project types       | Sticky below header     |

---

## Impeccable Command Directives for Swarm Agents

### When to use `/impeccable craft`
- **Phase 1:** When building any new page template or component from scratch
- Run `craft` for: `SiteHeader`, `HeroSection`, `ProjectGallery`, `ProjectDetail`, `AboutSection`
- `craft` triggers the shape-then-build flow: wireframe → visual design → code

### When to use `/impeccable delight`
- **Phase 4:** After all structural components are built and functional
- Run `delight` on: `ProjectCard` hover states, page transitions, scroll reveals, loading states
- `delight` adds moments of joy: micro-animations, Easter eggs, satisfying interactions

### When to use `/impeccable typeset`
- **Phase 2:** After initial component structure, before media integration
- Run on: all pages to ensure fluid type scale is correctly applied
- Validates font choices, hierarchy, and sizing against DESIGN.md tokens

### When to use `/impeccable audit`
- **Phase 4:** Before final static build
- Run on: entire site for a11y, performance, responsive checks
- Fix any flagged issues before shipping

### When to use `/impeccable polish`
- **Phase 4:** Final pass before declaring build-ready
- Run on: entire site for design system alignment and shipping readiness
