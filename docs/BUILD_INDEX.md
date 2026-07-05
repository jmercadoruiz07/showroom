# BUILD INDEX — JMR Visuals Portfolio

> **CONTEXT OPTIMIZATION (LOCAL LLM RULE):**
> You are operating with a limited token context window. **DO NOT** attempt to read all documentation files at once. 
> 
> **Standard Operating Procedure:**
> 1. Read `STATUS.md` to find your current active task.
> 2. Read `PRODUCT.md` and `DESIGN.md` ONLY if you are making visual or brand decisions.
> 3. Read ONLY the specific Phase document (`PHASE_X.md`) that contains your current task.
> 4. Read `COMPONENTS.md` ONLY when you are building a specific component mentioned in your task.
> 5. **STOP** and report to the user after completing a single atomic task (e.g., creating a single file). Do not attempt to complete multiple steps in a single response.
> 6. Update `STATUS.md` when a task is completed.

---

## 1. Project Summary

Build a static portfolio website for a design student specializing in print projects and 3D designs. The site must feel editorial, asymmetric, and tactile — a digital monograph. 

- **Primary Asset Source:** [ArtStation/jmr_visuals](https://www.artstation.com/jmr_visuals)
- **Output:** Purely static HTML/CSS/JS (deployable to GitHub Pages/Netlify).

---

## 2. Tech Stack

- **SSG Framework:** **Astro 5.x** (Zero-JS-by-default, islands architecture)
- **Styling:** Vanilla CSS + CSS Custom Properties (No Tailwind)
- **Typography:** Google Fonts (Playfair Display, Instrument Sans, JetBrains Mono)
- **3D Embeds:** `<model-viewer>` web component (Loaded as Astro island)
- **Animations:** Vanilla JS + Intersection Observer + View Transitions API
- **Image Pipeline:** `astro:assets` + `sharp`

---

## 3. Directory Structure Target

```
showroom/
├── astro.config.mjs           
├── package.json
├── docs/                      
│   ├── BUILD_INDEX.md         # ← You are here
│   ├── COMPONENTS.md          # Component specifications
│   ├── PHASE_1.md             # Architecture & Routing
│   ├── PHASE_2.md             # Typography & Styling
│   ├── PHASE_3.md             # Media & 3D Embeds
│   ├── PHASE_4.md             # Polish & Deployment
│   ├── STATUS.md              # Task tracking (UPDATE THIS REGULARLY)
│   ├── PRODUCT.md             # Brand identity, audience, and voice
│   └── DESIGN.md              # Design system tokens and rules
├── public/                    # Static assets (fonts, 3d models)
└── src/                       # Source code (components, layouts, pages, styles)
```

---

## 4. Documentation Index

To preserve context, the build plan has been modularized. Read these files strictly on a need-to-know basis:

* **[STATUS.md](file:///home/sergio/projects/showroom/docs/STATUS.md):** Current progress and next immediate task.
* **[COMPONENTS.md](file:///home/sergio/projects/showroom/docs/COMPONENTS.md):** Detailed breakdown of all 12 UI components.
* **[PHASE_1.md](file:///home/sergio/projects/showroom/docs/PHASE_1.md):** Static Architecture & Routing.
* **[PHASE_2.md](file:///home/sergio/projects/showroom/docs/PHASE_2.md):** Impeccable Fluid Typography & Styling.
* **[PHASE_3.md](file:///home/sergio/projects/showroom/docs/PHASE_3.md):** Media Ingestion & 3D Embeds.
* **[PHASE_4.md](file:///home/sergio/projects/showroom/docs/PHASE_4.md):** Micro-Interactions, Polish & Static Build Test.
* **[PRODUCT.md](file:///home/sergio/projects/showroom/docs/PRODUCT.md):** Brand identity, audience, and voice.
* **[DESIGN.md](file:///home/sergio/projects/showroom/docs/DESIGN.md):** Design system tokens (colors, typography scales, layout rules).

## 5. Swarm Agent Rules

1. **Tokens, not magic numbers:** Use `--color-*`, `--type-*`, and `--space-*` defined in `DESIGN.md`.
2. **No component libraries:** Write vanilla HTML/CSS.
3. **No Tailwind:** Use vanilla CSS custom properties.
4. **Test often:** Ensure `astro build` succeeds before declaring a phase complete.
