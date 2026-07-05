# COMPONENTS & SCHEMA SPECIFICATION

> **CONTEXT RULE:** Read this file ONLY when you are actively tasked with building one of the components listed here. Do not hold this entire document in memory.

---

## 1. Content Collection Schema

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

## 2. Component Inventory

### `SiteHeader`
- **Layout:** Fixed position, transparent background gaining opacity on scroll. Full-width bar, asymmetric padding (more padding-left).
- **Content:** Left-aligned wordmark ("JMR VISUALS" in Mono/Detail font). Right-aligned nav (Home, Projects, About, Contact). Theme toggle.

### `HeroSection`
- **Layout:** Full-bleed background image (`100vw × 90vh`).
- **Content:** Display title overlaid bottom-left with generous padding. Subtitle/tagline in Body font, offset right.
- **Rules:** No rounded containers, no cards, no glassmorphism. Thin animated line for scroll down.

### `ProjectGallery`
- **Layout:** Masonry using `column-count` (2-col tablet, 3-col desktop) OR CSS Grid masonry. Varied aspect ratios per item.
- **Features:** Category filter bar sticky below header. Staggered entrance animation on scroll.

### `ProjectCard`
- **Layout:** Thumbnail fills container, **no border-radius, no default drop shadow**.
- **Interactions:** Title overlay on hover (slides up from bottom). Slow zoom (scale 1.03 over 500ms).
- **Typography:** Category tag in Mono font (top-right).

### `ProjectDetail`
- **Layout:** Split-screen (60% media / 40% text), alternating sides per project.
- **Media Pane:** Scrollable image gallery or embedded 3D viewer.
- **Text Pane:** Title (Display), description (Body), metadata (Mono - date, category, tools, dimensions).
- **Navigation:** "← All Projects" text link.

### `ModelViewer` (Astro Island)
- **Role:** Wraps Google's `<model-viewer>` web component. Loaded with `client:visible`.
- **Props:** `src` (GLB path), `alt`, `poster` (fallback image).
- **Features:** Auto-rotate, user-interactive drag/zoom.

### `MediaViewer`
- **Role:** Lightbox overlay for project images.
- **Layout:** Dark semi-transparent backdrop, image scales to fit viewport.
- **Interactions:** Keyboard navigation (Escape, arrows), touch swipe.

### `AboutSection`
- **Layout:** Two-column asymmetric (30% portrait / 70% bio text).
- **Visuals:** Portrait image with no frame, bleeds to edge on one side.
- **Typography:** Bio in Body font, pull quotes in Display italic. Contact CTA at bottom.

### `ContactBlock`
- **Layout:** Inline (email link + custom SVG social icons).
- **Interactions:** Icon color transitions to `--color-oxide` on hover.

### `SiteFooter`
- **Layout:** Full-width dark band (`--color-deep` background).
- **Content:** Copyright, back-to-top link, social icon row.

### `CategoryFilter`
- **Layout:** Horizontal scrollable row of text links (not pills/badges). Sticky below header on scroll.
- **Visuals:** Active category underlined in `--color-oxide`.

### `ScrollReveal`
- **Role:** Wrapper component using Intersection Observer.
- **Behavior:** Adds `.is-visible` class when element enters viewport. CSS handles transition (opacity, transform).
