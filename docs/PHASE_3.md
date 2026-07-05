# PHASE 3: Media Ingestion & 3D Embeds

> **CONTEXT RULE:** Stop and update `STATUS.md` after completing **each individual task**. 

**Goal:** Replace placeholders with real portfolio content. 3D models load and are interactive.

| ID   | Task |
| ---- | ---- |
| 3.1  | Download/ingest portfolio images into `src/assets/images/` |
| 3.2  | Update project `.md` files with real titles, descriptions, and metadata |
| 3.3  | Configure `astro:assets` image pipeline (WebP/AVIF, responsive `srcset`) |
| 3.4  | Build `ModelViewer.astro` island (`client:visible` wrapper for `<model-viewer>`) |
| 3.5  | Add 3D model files (`.glb`) to `public/models/`, create poster fallback images |
| 3.6  | Integrate `ModelViewer.astro` into `ProjectDetail` for 3D category projects |
| 3.7  | Build `MediaViewer.astro` lightbox component (keyboard nav, click-to-close) |
| 3.8  | Integrate `MediaViewer` into `ProjectDetail` image galleries |
| 3.9  | Build `ContactBlock.astro` with custom SVG social icons |
| 3.10 | Set `HeroSection` background to a real portfolio piece |
| 3.11 | Set `AboutSection` portrait and bio content to real data |
| 3.12 | **GATE:** Verify all images load (lazy-loaded), no CLS issues, 3D viewer functional |

**Success Criteria for Phase 3:** Real content injected. Images serve via Astro assets. 3D viewer works with poster fallback. Lightbox functions.
