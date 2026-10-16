# JMR Visuals — Portfolio

Portfolio site for José Mercado Ruiz (print, 3D, motion). Astro 7 static site, with React used for the hero image carousel and the project gallery islands. Dark theme only.

Figma source of truth: file `Vl3rEa0ebSFcwQGhqgbzNd` (PORTFOLIO).

- Hero: node `36:275` (1728px wide)
- Homepage with divider and masonry: node `32:230`
- Homepage FEATURED tab accordion (items below the tab selectors): node `198:32`
- Project page: node `1:2`
- About page: node `243:13` (1702px wide, the current design; `198:32` is the older one)

The built site has moved on from the early hero frames in places (full-window hero, three slideshow images, dark header). Where this file and Figma disagree, this file describes what ships.

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `astro dev --background` | Dev server at `localhost:4321` (`astro dev stop`, `status`, `logs`) |
| `npm run build` | Production build to `dist/` |
| `npx astro check` | Type check |
| `npm run fetch-portfolio` | Refresh `src/content/projects.json` from ArtStation (needs `npx playwright install chromium-headless-shell` once) |

## Design style (use this when prompting)

**Feel:** dark, editorial, poster-like. Oversized wordmark type, photographic and illustrated work shown edge to edge, layers that overlap and bleed off the canvas. Confident and sparse, never decorative.

**Rules**
- Dark only. No light mode, no theme toggle.
- No rounded corners, shadows, gradients, cards, borders around images or glassmorphism. (The one exception is the hover plate on project cards, which is a flat bar in the page colour.)
- Images are rectangles stacked with a small gutter so the page background shows as a hairline.
- Type does the decoration: very large, tight-tracked, uppercase display type next to small, plain body copy. Scale contrast is the main visual device.
- Elements may overlap (the hand illustration crosses the About heading) and be cropped by the page edge.
- Every page shares one horizontal gutter (`--grid-gutter`) so dividers, the filter bar, the gallery grid and the footer row line up.

### Color

| Token | Value | Use |
| :-- | :-- | :-- |
| `--color-bone` | `#191d1f` | Page background (cool charcoal), header and card bar |
| `--color-chalk` | `#ffffff` | Display type, outlines, dividers |
| `--color-ink` | `var(--color-chalk)` | Body text and headings (white) |
| `--color-soot` | `var(--color-chalk)` | Secondary text (also white) |
| `--color-stone` | `oklch(0.35 0.01 60)` | Borders, image placeholders |
| `--color-paper` | `oklch(0.28 0.008 225)` | Image placeholders, panels |
| `--color-accent` | `#789da0` | Muted teal for focus and the card FEATURED tag |

Secondary labels (card category, inactive filter tabs) are 58% white via `color-mix`.

### Typography

| Role | Site font (Adobe Fonts / Typekit) | Notes |
| :-- | :-- | :-- |
| Display (hero name, wordmarks, About heading) | `widescreen` via `--font-hero` | Uppercase; 700 for the hero name, 900 for outlined wordmarks |
| Body, nav, filter tabs, card labels, footer text | `adelle-mono` via `--font-hero-mono` | Nav, tabs and the footer copyright share one style: `--type-xs`, regular, `--tracking-wide`, uppercase |

Figma uses LEMON MILK and NB Akademie, which are not available, so `widescreen` and `adelle-mono` stand in. The Typekit stylesheet is loaded in `src/layouts/BaseLayout.astro`.

### Layout tokens (`src/styles/tokens.css`)

- `--grid-gutter`: side gutter of the gallery grid (`--space-xl`, `--space-md` at 768px and below). Used by the gallery root, filter bar, footer divider and footer row.
- `--wordmark-width`, `--wordmark-inset`, `--wordmark-gutter` (= width + inset): the vertical wordmark's column. Pages that show it reserve `--wordmark-gutter` on the right. All three are 0 or reduced below 768px, where the wordmark is hidden.
- `--header-height`: height of the fixed header.

## Components

### Header (`SiteHeader.astro`)
Fixed bar in the page colour with white links (Home, Works, About; Works goes to `/works` and stays current on project pages under `/works/<id>`). On pages that contain a `.hero` it is transparent at the top and fills with `--color-bone` as soon as the page scrolls; on every other page it is always filled. Hover draws a 1px underline growing from the left (background-size transition); the current page keeps the underline. A script keyed to `astro:page-load` toggles `data-hero` and `data-scrolled` because the router swaps the header on navigation.

### Hero (`HeroSection.astro`, `HeroCarousel/`)
- Full window (`100svh`; `70svh` below 768px).
- One background image, a random order of `public/hero/slideshow_1-3.png` shuffled in the browser, crossfading every 5s. Pauses on hover and while the tab is hidden; static with `prefers-reduced-motion`. Not clickable and hidden from assistive tech.
- Name "JO" over "SE": desktop is vertically centred at the left, `min(50vh, 40vw)`, tracking −0.124em, line-height 0.72 (the lines overlap slightly). Below 768px the same stack is `min(58vw, 38svh)` in the bottom-right corner with a 4vw margin to the visible letters.
- Scroll chevron, bottom centre, desktop only: appears 5s after load if the page has not been scrolled, fades out when the page leaves the top and returns when it is back at the top.

### Vertical wordmark (`VerticalWordmark.astro`)
`MERCADO RUIZ` fixed to the right edge below the header, reading bottom to top, desktop only. Built on `OutlinedWordmark` with neighbours filling on hover. On pages with a `.hero` the letters start filled and fade to outlines as the hero scrolls away, finishing when the hero's bottom edge reaches the top of the page (`--wordmark-fill` set by a scroll handler, applied as a zero-offset `text-shadow`).

### Outlined wordmark (`OutlinedWordmark.astro`)
Reusable outlined text used by the vertical wordmark, the footer "JOSE" and the About heading. Props: `text`, `fillNeighbours`, `kerns` (extra em after each letter), `class`. Hovering a letter fills it. Each letter is generated content (`::before { content: attr(data-char) }`), not real text, because transparent text with a stroke vanishes when the page selection (select all) repaints it. The root's class is styled from the parent with `:global(...)` because scoped styles do not reach a child component's root. Set `--wordmark-stroke-width` and `--wordmark-gap` on the parent.

### Footer (`SiteFooter.astro`)
A 1px divider and a copyright/social row inset by `--grid-gutter`, then the outlined `JOSE` spanning the footer width. The wordmark box is trimmed to cap height and baseline (`text-box: trim-both cap alphabetic`) so it sits flush with the bottom of the page; the round letters' overshoot is covered by padding. Only the hovered letter fills. `BaseLayout` takes `footer={false}`; the About page uses it.

### Gallery (`ProjectGallery*`, `ProjectCard/`)
Filter bar whose width equals the content; it sticks below the header on `/works` but scrolls away on the homepage (`stickyFilter={false}`). On the homepage the first tab is FEATURED: a `FeaturedAccordion` of four projects hard-coded in `pages/index.astro` (`featuredPicks`: project id plus the zero-based index of the image to show from the project's `images`; an out-of-range index falls back to the first image, an unknown id fails the build). On `/works` the first tab is ALL, a masonry of every project. Album tabs show a masonry of that album's thumbnails.

Masonry cards: on hover or keyboard focus a bar in the page colour slides down from the top edge of the card (like an eyelid): title bold on the left, category regular and dimmed on the right, both in the tab type. Where hover is unavailable the bar is always shown. The FEATURED tag appears at the bottom left on hover.

Accordion (`FeaturedAccordion/`): full-width strips that take the same props as `ProjectCard`. A strip is 241 Figma px tall and grows to 888 (60vh from 1400px up) on hover or keyboard focus (hover only where a fine pointer exists). The image keeps the expanded size and is centred, so growing the strip reveals more of it without scaling; text colour does not change on hover. Title and category sit at the bottom left over a white fade and a radial white glow; their bottom inset moves from 63 to 168 as the strip grows. `--u = 100cqw / 1509` (`/ 760` below 768px).

### About page (`pages/about.astro`, `AboutSection.astro`)
Contact (one `mailto:` link), a statement, the portrait and the "GET IN TOUCH" heading with a two-layer hand (`public/about/hand-behind.png` behind the heading, `hand-front.png` in front). No footer on this page. `--ink-width` (the heading's ink width in em, set inline on `.about`) ties everything together: `--u = --touch-font-size × --ink-width / 1394`, so the heading and the hands always scale as one picture. Heading letters fill on hover (neighbours too).

| Tier | Width | Layout | Text | Heading size |
| :-- | :-- | :-- | :-- | :-- |
| Desktop | 1400px and up | Collage at a fixed scale, left aligned (the hand bleeds off the left edge). Contact, statement and portrait are three equal columns from `--grid-gutter` to `--grid-gutter + --wordmark-gutter` from the right; the portrait has a fixed height and is cropped with `object-fit: cover` | 1.25rem | 10rem |
| Tablet | 768–1399px | Two-column grid: text left, portrait right spanning three rows. The heading row starts 12px under the statement so the hand never covers text; the hand is shifted left so its flat cut end is off screen | 1.25rem | `min(5.75rem, (90vw − gutter) / ink-width)` |
| Mobile | under 768px | Single column: contact, statement, heading and hand, then the portrait. `.about-touch` is a size container and the heading is `100cqw / ink-width`, so its ink matches the portrait's width exactly | 1rem | container-sized |

## Behavior

- Hero rotation, scroll chevron and header transparency are described above.
- Pages that use `.hero` get the filled vertical wordmark and the transparent header; any page without it gets the hollow wordmark and the filled header.
- Hero slideshow images live in `public/hero/`; About assets in `public/about/`. `public/hero/hand-painting.png` and `jmr-outline-logo.png` are no longer used; `ContactBlock.astro` is unused.

## Project structure

```text
src/
  components/   .astro components with scoped styles; React islands (HeroCarousel, ProjectGallery, ProjectCard, FeaturedAccordion, ProjectMedia) with .module.css
  content/      projects.json (Adobe Portfolio export)
  layouts/      BaseLayout.astro (footer prop), ProjectLayout.astro
  pages/        index, about, works, works/ (project detail pages), 404
  styles/       tokens.css (design tokens), base.css (reset and global utilities)
public/         hero/, about/, projects/images/
```
