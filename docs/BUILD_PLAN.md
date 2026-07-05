# BUILD PLAN — JMR Visuals Portfolio

## 1. Project Summary

Build a static portfolio website for a design student specializing in print projects and 3D designs. The site must feel editorial, asymmetric, and tactile — a digital monograph, not a SaaS landing page. Content is sourced from [ArtStation/jmr_visuals](https://www.artstation.com/jmr_visuals). The final output is purely static HTML/CSS/JS deployable to GitHub Pages or Netlify.

---

## 2. Tech Stack

| Layer            | Choice                      | Rationale                                                                                      |
| ---------------- | --------------------------- | ---------------------------------------------------------------------------------------------- |
| **SSG Framework**| **Astro 5.x**               | Zero-JS-by-default, islands architecture for selective hydration (3D viewer only), native static output, Markdown/MDX content collections, excellent image optimization pipeline (`astro:assets`) |
| **Styling**      | Vanilla CSS + CSS Custom Properties | Aligned with Impeccable's OKLCH token system. No Tailwind. No preprocessors needed.            |
| **Typography**   | Google Fonts (self-hosted subset) | Playfair Display, Instrument Sans, JetBrains Mono — subsetted and preloaded via `fontsource` or manual `@font-face` |
| **3D Embeds**    | `<model-viewer>` web component | Google's lightweight glTF/GLB viewer. Loaded as Astro island (`client:visible`) for lazy hydration |
| **Animations**   | Vanilla JS + Intersection Observer | No animation library. CSS transitions + IO-triggered class toggles. View Transitions API for page morphs |
| **Build Output** | Static HTML/CSS/JS          | `astro build` → `dist/` folder → deploy to Netlify/GitHub Pages                                |
| **Image Pipeline**| `astro:assets` + `sharp`   | Automatic WebP/AVIF generation, responsive `srcset`, lazy loading                               |
| **Linting**      | ESLint + Stylelint          | Catch issues before static build                                                                |

### Why Astro Over Alternatives

| Alternative  | Rejected Because                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------- |
| Next.js      | Overkill for a static portfolio — ships React runtime, requires Node server for ISR/SSR features   |
| 11ty         | Excellent SSG but lacks built-in image optimization and component islands for 3D viewer hydration   |
| Hugo         | Go templating is unfamiliar to most design-oriented teams; no JS component model                   |
| Vite (raw)   | No SSG routing, content collections, or image pipeline — would need to build everything from scratch|

---

## 3. Directory Structure

```
showroom/
├── astro.config.mjs           # Astro configuration
├── package.json
├── tsconfig.json
├── PRODUCT.md                 # ← Impeccable: brand identity
├── DESIGN.md                  # ← Impeccable: design tokens & rules
├── BUILD_PLAN.md              # ← This file
├── public/
│   ├── fonts/                 # Self-hosted font files
│   ├── models/                # glTF/GLB 3D model files
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── images/            # Portfolio images (processed by astro:assets)
│   ├── components/
│   │   ├── SiteHeader.astro
│   │   ├── SiteFooter.astro
│   │   ├── HeroSection.astro
│   │   ├── ProjectGallery.astro
│   │   ├── ProjectCard.astro
│   │   ├── ProjectDetail.astro
│   │   ├── MediaViewer.astro
│   │   ├── ModelViewer.astro  # Astro island wrapping <model-viewer>
│   │   ├── AboutSection.astro
│   │   ├── ContactBlock.astro
│   │   ├── CategoryFilter.astro
│   │   └── ScrollReveal.astro # IO-based reveal wrapper
│   ├── content/
│   │   ├── config.ts          # Content collection schema
│   │   └── projects/          # Markdown files per project
│   │       ├── project-01.md
│   │       ├── project-02.md
│   │       └── ...
│   ├── layouts/
│   │   ├── BaseLayout.astro   # HTML shell, meta, fonts, global styles
│   │   └── ProjectLayout.astro # Project detail page layout
│   ├── pages/
│   │   ├── index.astro        # Home: hero + gallery
│   │   ├── about.astro        # About page
│   │   ├── projects/
│   │   │   └── [...slug].astro # Dynamic project detail pages
│   │   └── 404.astro
│   └── styles/
│       ├── tokens.css         # OKLCH color tokens, type scale, spacing
│       ├── reset.css          # Modern CSS reset
│       ├── global.css         # Base typography, layout primitives
│       └── components/        # Per-component styles (co-located or here)
└── dist/                      # Static build output (git-ignored)
```

---

## 4. Component Breakdown

### 4.1 `SiteHeader`
- Fixed position, transparent background that gains opacity on scroll
- Left-aligned wordmark ("JMR VISUALS" in Mono/Detail font)
- Right-aligned nav: Home / Projects / About / Contact
- Theme toggle (light/dark) using `prefers-color-scheme` + manual override
- **Layout:** Full-width bar, asymmetric padding (more padding-left)

### 4.2 `HeroSection`
- Full-bleed background image (`100vw × 90vh`)
- Display title overlaid bottom-left with generous padding
- Subtitle/tagline in Body font, offset right of the title
- Scroll-down indicator (thin animated line, not a chevron)
- **No rounded containers, no cards, no glassmorphism**

### 4.3 `ProjectGallery`
- Masonry layout using `column-count` (2-col on tablet, 3-col on desktop)
- Or CSS Grid with `grid-auto-rows: 1px` + JS-calculated `grid-row-end` for true masonry
- Each item has a varied aspect ratio (no forced uniformity)
- Category filter bar sticky below header
- Staggered entrance animation on scroll

### 4.4 `ProjectCard`
- Image thumbnail fills container, no border-radius
- Title overlay on hover (slides up from bottom)
- Category tag in Mono font, top-right corner
- Hover: slow zoom (scale 1.03 over 500ms) + slight shadow increase
- **No rounded corners. No drop shadow by default. No card border.**

### 4.5 `ProjectDetail`
- Split-screen layout: 60% media / 40% text (alternating per project)
- Media pane: scrollable image gallery or embedded 3D viewer
- Text pane: project title (Display), description (Body), metadata (Mono)
- Metadata: date, category, tools used, dimensions/format
- Image gallery within media pane: vertical scroll, full-width images
- Back navigation: "← All Projects" link (not a button)

### 4.6 `ModelViewer` (Astro Island)
- Wraps Google's `<model-viewer>` web component
- Props: `src` (GLB path), `alt`, `poster` (static fallback image)
- `client:visible` directive for lazy hydration
- Auto-rotate enabled, user-interactive drag/zoom
- Fallback: poster image with "Interact with 3D model" overlay for no-JS

### 4.7 `MediaViewer`
- Lightbox overlay triggered by clicking any project image
- Dark semi-transparent backdrop
- Image scales to fit viewport with padding
- Keyboard navigation (Escape to close, arrows to cycle)
- Touch-friendly swipe support

### 4.8 `AboutSection`
- Two-column asymmetric layout (30% portrait / 70% bio text)
- Portrait image with no frame, bleeds to edge on one side
- Bio text in Body font with pull quotes in Display italic
- Contact CTA at bottom

### 4.9 `ContactBlock`
- Inline layout: email link + social icons (ArtStation, Instagram, LinkedIn)
- Icons: custom SVG, not Font Awesome
- Hover: icon color transitions to `--color-oxide`

### 4.10 `SiteFooter`
- Full-width dark band (`--color-deep` background)
- Copyright + "Built with obsessive attention to detail"
- Back-to-top link (smooth scroll)
- Social icon row (duplicated from ContactBlock for discoverability)

### 4.11 `CategoryFilter`
- Horizontal scrollable row of text links (not pills/badges)
- Active category: underline in `--color-oxide`
- Categories: All / Print / 3D / Motion (derived from content collection)
- Sticky below header on scroll

### 4.12 `ScrollReveal`
- Wrapper component using Intersection Observer
- Adds `.is-visible` class when element enters viewport
- CSS handles the transition (opacity, transform)
- Configurable: direction (up, left, right), delay, threshold

---

## 5. Content Collection Schema

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.date(),
    category: z.enum(['print', '3d', 'motion']),
    tags: z.array(z.string()).optional(),
    thumbnail: image(),
    images: z.array(image()).optional(),
    model: z.string().optional(),          // Path to GLB file
    modelPoster: image().optional(),       // Static fallback for 3D
    tools: z.array(z.string()).optional(), // e.g., ["Blender", "InDesign"]
    description: z.string(),
    featured: z.boolean().default(false),
    order: z.number().optional(),          // Manual sort override
  }),
});

export const collections = { projects };
```

---

## 6. Impeccable Directives for Swarm Agents

> **IMPORTANT:**
> Every agent working on UI must read `PRODUCT.md` and `DESIGN.md` before writing any code.
> These files are the source of truth for all visual decisions.

### 6.1 `/impeccable craft` — Shape-Then-Build

**When:** Building any new component or page template for the first time.

| Target Component    | Phase | Agent    | Notes                                               |
| ------------------- | ----- | -------- | --------------------------------------------------- |
| `BaseLayout`        | 1     | Coder    | HTML shell, font loading, meta tags                 |
| `SiteHeader`        | 1     | Coder    | Craft the nav structure, transparent-on-scroll logic |
| `HeroSection`       | 1     | Coder    | Full-bleed hero, display title positioning           |
| `ProjectGallery`    | 1     | Coder    | Masonry grid implementation                          |
| `ProjectCard`       | 1     | Coder    | Thumbnail + hover overlay                            |
| `ProjectDetail`     | 1     | Coder    | Split-screen layout, media gallery                   |
| `AboutSection`      | 1     | Coder    | Asymmetric two-column bio                            |
| `SiteFooter`        | 1     | Coder    | Dark footer band                                     |

**Procedure:** For each component, the agent should:
1. Read DESIGN.md for token values and layout rules
2. Shape the component structure (HTML semantics, layout approach)
3. Build with CSS custom properties from `tokens.css`
4. Validate against PRODUCT.md anti-references before committing

### 6.2 `/impeccable typeset` — Typography Pass

**When:** Phase 2, after structural components exist.

**Agent:** Run on all `.astro` page files and layout files.

**Checklist:**
- [ ] Playfair Display loads for all Display-role text
- [ ] Instrument Sans loads for all Body-role text
- [ ] JetBrains Mono loads for all Mono/Detail-role text
- [ ] Fluid type scale (`clamp()`) applied via `--type-*` tokens
- [ ] No fallback to Inter, Arial, or system fonts
- [ ] Heading hierarchy: single `<h1>` per page, proper cascade
- [ ] Line-height: 1.1 for Display, 1.5 for Body, 1.4 for Mono
- [ ] Letter-spacing matches DESIGN.md specifications

### 6.3 `/impeccable delight` — Micro-Interactions

**When:** Phase 4, after all structure and media are in place.

**Targets:**
- `ProjectCard` hover states (zoom + title reveal)
- Page transitions (View Transitions API cross-fade + hero morph)
- `ScrollReveal` entrance animations (staggered, directional)
- `SiteHeader` scroll behavior (transparent → opaque transition)
- Loading state for 3D models (skeleton shimmer, not spinner)
- Custom cursor on media hover (optional — only if it enhances)
- Smooth scroll for in-page anchors

### 6.4 `/impeccable audit` — Quality Gate

**When:** Phase 4, before final build.

**Scope:** Entire site.

**Must pass:**
- Accessibility: color contrast (WCAG AA), focus management, alt text, landmark roles
- Performance: LCP < 2.5s, no layout shift from lazy images, font preload
- Responsive: test at 375px, 768px, 1024px, 1440px, 1920px
- Anti-pattern check: no flagged Impeccable anti-patterns (cards-in-cards, gray-on-color, etc.)

### 6.5 `/impeccable polish` — Final Pass

**When:** Phase 4, after audit fixes.

**Scope:** Entire site.

**Focus:** Design system alignment, consistent token usage, shipping readiness.

---

## 7. Phased Implementation

### Phase 1 — Static Architecture & Routing
**Goal:** Skeleton site that builds, routes correctly, and renders placeholder content.

| #   | Task                                           | Agent      | Dependency | Est. |
| --- | ---------------------------------------------- | ---------- | ---------- | ---- |
| 1.1 | Initialize Astro project (`npm create astro`)  | Coder      | —          | 5m   |
| 1.2 | Configure `astro.config.mjs` (static output, site URL, image optimization) | Coder | 1.1 | 10m |
| 1.3 | Create `tokens.css`, `reset.css`, `global.css` with all DESIGN.md tokens | Coder | 1.1 | 20m |
| 1.4 | Set up self-hosted fonts (Playfair Display, Instrument Sans, JetBrains Mono) | Coder | 1.1 | 15m |
| 1.5 | Build `BaseLayout.astro` (HTML shell, `<head>`, font preloads, global styles) | Coder | 1.3, 1.4 | 15m |
| 1.6 | Build `SiteHeader.astro` (nav structure, transparent positioning) | Coder | 1.5 | 15m |
| 1.7 | Build `SiteFooter.astro` (dark band, copyright, social links) | Coder | 1.5 | 10m |
| 1.8 | Build `HeroSection.astro` (full-bleed, overlaid title, placeholder image) | Coder | 1.5 | 15m |
| 1.9 | Create content collection schema (`src/content/config.ts`) | Coder | 1.1 | 10m |
| 1.10 | Create 3–4 placeholder project markdown files | Coder | 1.9 | 10m |
| 1.11 | Build `ProjectGallery.astro` (masonry grid with placeholder cards) | Coder | 1.3 | 20m |
| 1.12 | Build `ProjectCard.astro` (thumbnail + title overlay) | Coder | 1.3 | 15m |
| 1.13 | Build `ProjectDetail` page (`[...slug].astro`) with split-screen layout | Coder | 1.9 | 20m |
| 1.14 | Build `ProjectLayout.astro` (detail page layout wrapper) | Coder | 1.5 | 10m |
| 1.15 | Build `AboutSection.astro` (asymmetric two-column) | Coder | 1.5 | 15m |
| 1.16 | Build `CategoryFilter.astro` (horizontal filter bar) | Coder | 1.3 | 15m |
| 1.17 | Set up page routing: index, about, projects/[slug], 404 | Coder | 1.5 | 10m |
| 1.18 | Verify `astro build` succeeds with zero errors | Tester | 1.1–1.17 | 10m |

**Phase 1 Gate:** Site builds to `dist/`, all routes resolve, placeholder content renders, no console errors.

---

### Phase 2 — Impeccable Fluid Typography & Styling
**Goal:** Apply the full design system — the site looks intentional even with placeholder images.

| #   | Task                                           | Agent      | Dependency | Est. |
| --- | ---------------------------------------------- | ---------- | ---------- | ---- |
| 2.1 | Run `/impeccable typeset` on all pages — verify fluid type scale | Coder | Phase 1 | 20m |
| 2.2 | Apply OKLCH color tokens globally — light mode as default | Coder | Phase 1 | 15m |
| 2.3 | Implement dark mode toggle (CSS `[data-theme]` attribute + JS toggle) | Coder | 2.2 | 20m |
| 2.4 | Style `SiteHeader`: transparent → opaque on scroll, asymmetric padding | Coder | Phase 1 | 15m |
| 2.5 | Style `HeroSection`: display title positioning, scroll indicator | Coder | Phase 1 | 15m |
| 2.6 | Style `ProjectGallery`: masonry column widths, responsive breakpoints | Coder | Phase 1 | 20m |
| 2.7 | Style `ProjectCard`: hover state (zoom + title reveal), no border-radius | Coder | Phase 1 | 15m |
| 2.8 | Style `ProjectDetail`: split-screen proportions, metadata in Mono font | Coder | Phase 1 | 20m |
| 2.9 | Style `AboutSection`: portrait bleed, pull quotes, offset layout | Coder | Phase 1 | 15m |
| 2.10 | Style `SiteFooter`: dark band, link hover states, back-to-top | Coder | Phase 1 | 10m |
| 2.11 | Style `CategoryFilter`: active underline, horizontal scroll on mobile | Coder | Phase 1 | 10m |
| 2.12 | Responsive audit: verify all components at 375px, 768px, 1024px, 1440px | Tester | 2.1–2.11 | 20m |

**Phase 2 Gate:** All pages use DESIGN.md tokens exclusively. Dark mode works. Responsive at all breakpoints. No pixel-level styling outside the token system.

---

### Phase 3 — Media Ingestion & 3D Embeds
**Goal:** Replace placeholders with real portfolio content. 3D models load and are interactive.

| #   | Task                                           | Agent      | Dependency | Est. |
| --- | ---------------------------------------------- | ---------- | ---------- | ---- |
| 3.1 | Download and organize portfolio images from ArtStation into `src/assets/images/` | Coder | Phase 2 | 30m |
| 3.2 | Update project markdown files with real titles, descriptions, metadata | Coder | 3.1 | 20m |
| 3.3 | Configure `astro:assets` image pipeline (WebP/AVIF, responsive srcset) | Coder | 3.1 | 15m |
| 3.4 | Build `ModelViewer.astro` island (wraps `<model-viewer>`, `client:visible`) | Coder | Phase 2 | 20m |
| 3.5 | Add 3D model files to `public/models/`, create poster images | Coder | 3.4 | 15m |
| 3.6 | Integrate `ModelViewer` into `ProjectDetail` for 3D projects | Coder | 3.4, 3.5 | 15m |
| 3.7 | Build `MediaViewer.astro` lightbox (keyboard nav, click-outside-close) | Coder | Phase 2 | 25m |
| 3.8 | Integrate `MediaViewer` into `ProjectDetail` image galleries | Coder | 3.7 | 10m |
| 3.9 | Build `ContactBlock.astro` with custom SVG social icons | Coder | Phase 2 | 10m |
| 3.10 | Set hero image to a real portfolio piece | Coder | 3.1 | 5m |
| 3.11 | Set about page portrait and bio content | Coder | 3.1 | 10m |
| 3.12 | Verify all images load, lazy-load correctly, and no CLS issues | Tester | 3.1–3.11 | 15m |

**Phase 3 Gate:** All placeholder content replaced. Images serve WebP/AVIF. 3D viewer functional with fallback. Lightbox works with keyboard. No broken asset paths.

> **NOTE:** If ArtStation API access is blocked, the client will need to provide a folder of exported assets. The content collection schema and image pipeline are designed to accommodate either workflow — just drop files into `src/assets/images/` and reference them in the project frontmatter.

---

### Phase 4 — Micro-Interactions, Polish & Static Build Test
**Goal:** The site delights. It passes all quality gates. It deploys.

| #   | Task                                           | Agent      | Dependency | Est. |
| --- | ---------------------------------------------- | ---------- | ---------- | ---- |
| 4.1 | Build `ScrollReveal.astro` (Intersection Observer, staggered reveals) | Coder | Phase 3 | 20m |
| 4.2 | Apply `ScrollReveal` to: ProjectCards, AboutSection, HeroSection elements | Coder | 4.1 | 15m |
| 4.3 | Run `/impeccable delight` — add micro-interactions per Section 6.3 | Coder | Phase 3 | 30m |
| 4.4 | Implement View Transitions API for page navigation (cross-fade + hero morph) | Coder | Phase 3 | 20m |
| 4.5 | Add `SiteHeader` scroll behavior (transparent → solid transition) | Coder | Phase 2 | 10m |
| 4.6 | Add smooth scroll for back-to-top and in-page anchors | Coder | Phase 3 | 5m |
| 4.7 | Add loading state for 3D models (skeleton shimmer) | Coder | 3.4 | 10m |
| 4.8 | Run `/impeccable audit` — full site quality check | Tester | 4.1–4.7 | 20m |
| 4.9 | Fix all audit findings (a11y, performance, responsive, anti-patterns) | Coder | 4.8 | 30m |
| 4.10 | Run `/impeccable polish` — final design system alignment pass | Reviewer | 4.9 | 15m |
| 4.11 | Verify `astro build` produces clean `dist/` with no warnings | Tester | 4.10 | 10m |
| 4.12 | Test static deployment: serve `dist/` with `npx serve dist` | Tester | 4.11 | 10m |
| 4.13 | Lighthouse audit: target 90+ on Performance, A11y, Best Practices, SEO | Tester | 4.12 | 15m |
| 4.14 | Final browser testing: Chrome, Firefox, Safari (desktop + mobile) | Tester | 4.12 | 20m |

**Phase 4 Gate:** All Impeccable checks pass. Lighthouse 90+. Cross-browser verified. `dist/` folder is deployment-ready. Zero console errors.

---

## 8. Swarm Agent Assignments

| Agent        | Role                                              | Phases |
| ------------ | ------------------------------------------------- | ------ |
| **Architect**| Plan validation, design review, anti-pattern enforcement | All |
| **Coder**    | Build components, implement styles, integrate media | 1–4 |
| **Tester**   | Build verification, responsive audit, Lighthouse, cross-browser | 1, 2, 3, 4 |
| **Reviewer** | Code quality, design system compliance, Impeccable polish | 4 |

### Agent Ground Rules

1. **Read `PRODUCT.md` and `DESIGN.md` first.** Every time. No exceptions.
2. **Use tokens, not magic numbers.** All colors via `--color-*`, all sizes via `--type-*` and `--space-*`.
3. **No component libraries.** No Bootstrap, no Material UI, no component-in-a-box solutions.
4. **No Tailwind.** Vanilla CSS with custom properties only.
5. **No CDN dependencies at runtime.** Self-host fonts. Bundle everything.
6. **Test the static build.** `astro build` must succeed before any phase is declared complete.
7. **Validate against anti-references.** If it looks like a SaaS template, redo it.

---

## 9. SEO & Performance Requirements

### SEO

- Unique `<title>` and `<meta description>` per page
- Single `<h1>` per page with proper heading hierarchy
- Semantic HTML5 elements (`<header>`, `<main>`, `<article>`, `<footer>`, `<nav>`)
- OpenGraph and Twitter Card meta tags for social sharing
- `robots.txt` and `sitemap.xml` (Astro generates these with `@astrojs/sitemap`)
- Structured data (JSON-LD) for creative portfolio schema

### Performance

- Font preloading with `<link rel="preload">`
- Critical CSS inlined by Astro's build pipeline
- Images: WebP/AVIF with responsive `srcset` and `sizes`
- 3D models: lazy-loaded via `client:visible` island
- No render-blocking JavaScript (Astro ships zero JS by default)
- Target: LCP < 2.5s, CLS < 0.1, INP < 200ms

---

## 10. Deployment Checklist

- [ ] `astro build` exits cleanly
- [ ] `dist/` contains all routes as `.html` files
- [ ] All images have been processed (WebP/AVIF in `dist/_astro/`)
- [ ] `robots.txt` and `sitemap.xml` present in `dist/`
- [ ] No absolute `localhost` URLs in output
- [ ] 3D model files copied to `dist/models/`
- [ ] Font files present in `dist/fonts/`
- [ ] Lighthouse scores: Performance 90+, Accessibility 90+, SEO 90+
- [ ] Test with `npx serve dist` — all routes work with direct URL access
- [ ] 404 page renders for unknown routes
