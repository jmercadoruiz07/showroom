# PHASE 1: Static Architecture & Routing

> **CONTEXT RULE:** Stop and update `STATUS.md` after completing **each individual task**. Do not combine multiple tasks in one generation.

**Goal:** Skeleton site that builds, routes correctly, and renders placeholder content.

| ID   | Task |
| ---- | ---- |
| 1.1  | Initialize Astro project (`npm create astro`) |
| 1.2  | Configure `astro.config.mjs` (static output, site URL, image optimization) |
| 1.3  | Create `src/styles/tokens.css`, `reset.css`, `global.css` using `DESIGN.md` |
| 1.4  | Set up self-hosted fonts (Playfair Display, Instrument Sans, JetBrains Mono) |
| 1.5  | Build `src/layouts/BaseLayout.astro` (HTML shell, `<head>`, font preloads) |
| 1.6  | Build `src/components/SiteHeader.astro` |
| 1.7  | Build `src/components/SiteFooter.astro` |
| 1.8  | Build `src/components/HeroSection.astro` |
| 1.9  | Create content collection schema (`src/content/config.ts` — refer to `COMPONENTS.md`) |
| 1.10 | Create 3–4 placeholder project markdown files in `src/content/projects/` |
| 1.11 | Build `src/components/ProjectGallery.astro` (placeholder cards) |
| 1.12 | Build `src/components/ProjectCard.astro` |
| 1.13 | Build `src/pages/projects/[...slug].astro` (split-screen layout) |
| 1.14 | Build `src/layouts/ProjectLayout.astro` |
| 1.15 | Build `src/components/AboutSection.astro` |
| 1.16 | Build `src/components/CategoryFilter.astro` |
| 1.17 | Set up page routing: `index.astro`, `about.astro`, `404.astro` |
| 1.18 | **GATE:** Verify `astro build` succeeds with zero errors |

**Success Criteria for Phase 1:** Site builds to `dist/`, all routes resolve, placeholder content renders, no console errors.
