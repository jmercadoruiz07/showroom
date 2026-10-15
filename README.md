# JMR Visuals — Portfolio

Portfolio site for José Mercado Ruiz (print, 3D, motion). Astro 7 static site, with React used only for the hero image column. Dark theme only.

Figma source of truth: file `Vl3rEa0ebSFcwQGhqgbzNd` (PORTFOLIO), desktop frames are 1728px wide.

- Hero: node `36:275`
- Homepage with divider and masonry: node `32:230`
- Project page: node `1:2`

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `astro dev --background` | Dev server at `localhost:4321` (`astro dev stop`, `status`, `logs`) |
| `npm run build` | Production build to `dist/` |
| `npx astro check` | Type check |
| `npm run fetch-portfolio` | Refresh `src/content/projects.json` from Adobe Portfolio |

## Design style (use this when prompting)

**Feel:** dark, editorial, poster-like. Oversized wordmark type, photographic and illustrated work shown edge to edge, layers that overlap and bleed off the canvas. Confident and sparse, never decorative.

**Rules**
- Dark only. No light mode, no theme toggle.
- No rounded corners, shadows, gradients, cards, borders around images or glassmorphism.
- Images are rectangles with their original aspect ratio, stacked with a tiny gutter (about 4px at 1728px) so the page background shows as a hairline.
- Type does the decoration: very large, tight-tracked, uppercase display type next to small, plain body copy. Scale contrast is the main visual device.
- Elements are allowed to overlap (the hand illustration crosses the title and the image column) and to be cropped by the page edge.
- Content hangs from a left column; the right edge is held by the vertical title.

### Color

| Token | Value | Use |
| :-- | :-- | :-- |
| `--color-bone` | `#191d1f` | Page background (cool charcoal) |
| `--color-chalk` | `#ffffff` | Display type, nav bar, divider |
| `--color-ink` | `oklch(0.88 0.008 75)` | Body text |
| `--color-soot` | `oklch(0.65 0.01 75)` | Secondary text |
| `--color-stone` | `oklch(0.35 0.01 60)` | Borders |
| `--color-paper` | `oklch(0.28 0.008 225)` | Image placeholders, panels |
| `--color-accent` | `#789da0` | Muted teal for hover, active and focus states (sampled from the Figma nav, not a Figma variable) |

Figma also shows secondary labels at 58% white. The old copper accent is gone.

### Typography

| Role | Figma font | Site font (Adobe Fonts / Typekit) | Notes |
| :-- | :-- | :-- | :-- |
| Display (name, vertical title, nav) | LEMON MILK Bold | `widescreen` via `--font-hero` | Uppercase, weight 700 (name, nav) and 900 (vertical title) |
| Body copy | NB Akademie Std Medium | `adelle-mono` via `--font-hero-mono` | 22px at 1728px, line-height about 1.43 |
| Labels | NB Akademie Mono Std Medium | `adelle-mono` | 28px, uppercase, white or 58% white |

The Typekit stylesheet `https://use.typekit.net/ysa2ssy.css` is loaded in `src/layouts/BaseLayout.astro`. `--font-display` is `widescreen` and `--font-body` and `--font-mono` are `adelle-mono` on every page, so utilities like `.text-display` and plain headings (uppercase) follow the hero. Interactive states are inverted blocks (white plate, dark text) or teal text. The self-hosted fonts in `public/fonts/` and `src/styles/fonts.css` are no longer used.

Display sizes at 1728px:
- Name "JO / SE": 644px, tracking −0.1em, line-height 0.8, two lines, second line indented one space.
- Vertical "MERCADO RUIZ": 130px, line-height 0.78, rotated so it reads bottom to top.
- Nav links: about 30px, uppercase.

### Layout system

The home hero is a collage measured on the 1728px Figma frame. Every position and size is written as `calc(N * var(--u))`, where `--u: calc(100vw / 1728)`. Copy numbers straight from Figma and keep the same units.

Hero coordinates (relative to the frame, 1728px wide):

| Element | x | y | Size |
| :-- | :-- | :-- | :-- |
| Nav bar (white) | 0 | 0 | 1471 wide, about 51 visible height; second white block from about x 1600 to the right edge |
| Name "JO SE" | 46 | 41 | font-size 644 |
| Image column (4 stacked) | 900 | −123, 225, 550, 923 | 571 wide; heights 345, 321, 369, 321 |
| Vertical title | 1471 | −9 | 106 × 1113 |
| Hand illustration | −43 | 938 | 1917 × 812, `rotate(171.61deg) scaleY(-1)`, above the name and images |
| JMR outline logo | 308 | 1568 | 285 × 285 |
| Quote | 625 | 1744 | 799 wide, 4 lines max |

Hero height is 1960 × `--u`.

Homepage frame (`32:230`) below the hero:
- Divider: 1px white line, 1164 wide, from x 174 to 1338, directly under the logo and quote row.
- Masonry: two columns starting 87px below the divider. Left column x 257, 560 wide. Right column x 821, 517 wide. About 4px between tiles and columns. Tiles keep their image's aspect ratio.
- Section label row: `‘WE ARE HERE’` left in white at 28px, `PRINT` right-aligned at 58% white.

Project page frame (`1:2`): blue grain background, very large uppercase section labels (PHOTOGRAPHY, MURAL, PUBLICATION, MOTION GRAPHIC) at about 88px, with short body paragraphs about 415px wide beside full-bleed images.

### Navigation

Fixed white bar across the top, links in dark `--color-bone` on white, uppercase `widescreen`. A gap in the bar at x 1471 to about 1600 keeps the vertical title clear. Links are spread wide across the bar. The Figma frames order them differently (HOME, ABOUT, PROJECTS in the homepage frame); the site uses Home, Projects, About.

### Responsive behavior

- 768px and up: the scaled collage above.
- Below 768px: same pieces, stacked in one column. The image column is dropped (not rendered, no image requests). Name at 42vw, hand 150vw wide and overlapping the name slightly, vertical title pinned to the right edge above the hand, logo and quote stacked with the full quote (no line clamp). The nav bar becomes one full-width bar.
- Mobile layout for the masonry and project pages is not designed in Figma yet.

### Behavior

- The four hero images are a random pick from all projects on every page load (shuffled in the browser). One slot at a time crossfades to the next project every 1.8s. Rotation pauses on hover and focus, while the tab is hidden, and with `prefers-reduced-motion`.
- Hero hand and logo images live in `public/hero/`.

## Project structure

```text
src/
  components/   HeroSection.astro, HeroCarousel.tsx/.css, SiteHeader.astro, ProjectGallery, ...
  content/      projects.json (Adobe Portfolio export)
  layouts/      BaseLayout.astro, ProjectLayout.astro
  pages/        index, about, 404, projects/
  styles/       tokens.css (design tokens), global.css, fonts.css, reset.css
public/         fonts/, hero/, projects/images/
```
