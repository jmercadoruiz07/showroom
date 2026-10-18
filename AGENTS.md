# AGENTS.md

Engineering notes for agents working on JMR Showroom: how the project is built, where things live, the design system as shipped, and the decisions and gotchas behind it. The README is the short human-facing overview; this file is the working reference. Where this file and Figma disagree, this file describes what ships.

## Overview

Portfolio site for José Mercado Ruiz (print, 3D, motion). Astro 7 static site (`output: 'static'`), with React 19 islands for the hero carousel and the project gallery. Dark theme only. Deployed to GitHub Pages at `https://jmercadoruiz07.github.io/showroom`, so `base` is `/showroom` (see `astro.config.mjs`). Node 22.12 or newer.

All project data comes from one generated file, `src/content/projects.json`, written by `bin/fetchPortfolio.js` from ArtStation. Do not edit it by hand; change the script and re-run it.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

| Command | Action |
| :-- | :-- |
| `npm install` / `npm ci` | Install dependencies |
| `astro dev --background` | Dev server at `localhost:4321` (the site is served under `/showroom`) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npx astro check` | Type check (run before committing) |
| `npm run fetch-portfolio` | Refresh `src/content/projects.json` from ArtStation (needs `npx playwright install chromium-headless-shell` once locally) |

## Working in this repo

- Commit each finished change to `main` with a short message; no feature branches unless asked. Run `npx astro check` before committing.
- Look at the page after every visual change (browser tools) and measure rather than guess: `getBoundingClientRect`, computed styles, `Range` rects for text. Check desktop (1400+), tablet (768–1399) and mobile (below 768).
- When told not to touch a component (the header or `VerticalWordmark`, for example), leave it exactly as is.
- If a request is ambiguous ("evenly spaced", "fonts fixed at two sizes"), say how you read it, or say what breaks, rather than silently picking. Fixed type sizes inside a scaled layout need a layout strategy; the About page uses three tiers for this.
- Do not delete content or components without being told. Unused but kept: `src/components/ContactBlock.astro`, `public/assets/hero/hand-painting.png`, `public/assets/hero/jmr-outline-logo.png` and the sample images in `public/assets/projects/images/`.
- This file describes the shipped design, tokens, components and pipeline; update it when those change. Keep `README.md` high level and update it only when the overview itself changes.

## Folder structure

```text
.
├── .github/
│   └── workflows/
│       ├── deploy.yml              Build and publish to GitHub Pages
│       └── fetch-portfolio.yml     Manual ArtStation refresh of projects.json, then triggers deploy
├── .agents/skills/impeccable/      Installed agent skill (locked by skills-lock.json)
├── .opencode/                      Local agent tooling (git-ignored)
├── bin/
│   └── fetchPortfolio.js           ArtStation scraper (Playwright) that writes src/content/projects.json
├── public/
│   └── assets/                     Every static file; reference through assetUrl()
│       ├── favicon.ico, logo.svg
│       ├── hero/                   slideshow_1-3.png (used); hand-painting.png, jmr-outline-logo.png (unused)
│       ├── about/                  hand-behind.png, hand-front.png, temple-portrait.jpg
│       └── projects/images/        Sample project images (unused; real media is hosted by ArtStation)
├── src/
│   ├── content.config.ts           `projects` collection: file() loader over projects.json plus a zod schema
│   ├── content/
│   │   └── projects.json           Generated; never hand-edit
│   ├── layouts/
│   │   ├── BaseLayout.astro        HTML shell, head/meta, Typekit fonts, header, footer (`footer` prop), ClientRouter
│   │   └── ProjectLayout.astro     Wrapper over BaseLayout for project pages (passes the canonical URL)
│   ├── pages/
│   │   ├── index.astro             Hero plus gallery; holds `featuredPicks`
│   │   ├── works.astro             Full gallery with a sticky filter bar
│   │   ├── works/[...slug].astro   One static page per project id
│   │   ├── about.astro             About page (no footer)
│   │   └── 404.astro
│   ├── components/
│   │   ├── SiteHeader.astro, SiteFooter.astro, SocialLinks.astro
│   │   ├── HeroSection.astro, AboutSection.astro
│   │   ├── OutlinedWordmark.astro, VerticalWordmark.astro
│   │   ├── ProjectGallery.astro    Server side: loads, sorts and groups projects, hydrates the React gallery
│   │   ├── ContactBlock.astro      Unused, kept
│   │   ├── HeroCarousel/           React island + module CSS (hero crossfade)
│   │   ├── ProjectGallery/         React island + module CSS (filter bar, masonry, accordion switch)
│   │   ├── ProjectCard/            React masonry card
│   │   ├── FeaturedAccordion/      React accordion (FeaturedAccordion + FeaturedAccordionItem)
│   │   └── ProjectMedia/           React project-page media column and lightbox
│   ├── styles/
│   │   ├── tokens.css              Design tokens (color, type, space, layout)
│   │   └── base.css                Reset and global utilities (e.g. smooth scrolling)
│   └── utils/
│       ├── asset-url.ts            assetUrl(), pageUrl(): add the site base to paths
│       ├── site.ts                 SITE_NAME, BIO, PROFILE_IMAGE (home title, default description and og:image)
│       ├── sort-projects.ts        sortProjectsByOrder(): by `order`, then newest first
│       └── project-media.ts        imageAssets(), firstImage(): pick images out of a project's media
├── astro.config.mjs                site, base, sharp image service, React integration
├── tsconfig.json
├── package.json, package-lock.json
└── skills-lock.json                Lockfile for agent skills
```

Convention: `.astro` components use scoped styles; React islands use a co-located `.module.css`. Each component with a style sheet lives in its own folder named after it.

## Architecture

- **Content pipeline.** `bin/fetchPortfolio.js` → `src/content/projects.json` → the `projects` content collection (`src/content.config.ts`) → `getCollection('projects')` in `ProjectGallery.astro`, `pages/works/[...slug].astro` and `pages/index.astro`. The schema makes `description`, `sourceUrl`, `order` and `stats` optional; `albums`, `categories`, `tags`, `tools`, `media` and `featured` default to empty or false.
- **Base path.** The site lives under `/showroom`. Static files go in `public/assets/` and are referenced with `assetUrl()`; internal page links use `pageUrl()`. Never hard-code `/assets/...` or `/works`.
- **Islands.** Interactivity is limited to React islands hydrated with `client:load` (`HeroCarousel`, `ProjectGallery` which renders `ProjectCard` and `FeaturedAccordion`, and `ProjectMedia`). Everything else is server-rendered Astro. Navigation uses the Astro client router (`ClientRouter` in `BaseLayout`), which swaps the header and page on navigation.
- **Ordering.** Projects are sorted by `order` (the position in the ArtStation index), then newest first. Featured projects (`featured` true, from ArtStation's editor pick) are merged in front before sorting.
- **Page behavior.** Pages that use `.hero` get the filled vertical wordmark and the transparent header; any page without it gets the hollow wordmark and the filled header.

## ArtStation fetch script (`bin/fetchPortfolio.js`)

Runs headless Chromium through Playwright against ArtStation's public JSON endpoints for the user `jmr_visuals` (a plain `fetch` is blocked, a real browser context is not). Steps:

1. `users/<name>/quick.json`: the album list. Only `album_type === 'custom'` albums are kept; the default "All" album is ignored.
2. For each album, page through `projects.json?album_id=<id>&page=<n>` until a page is empty, building a `hash_id → [album titles]` map. Requests are spaced 300ms apart.
3. `users/<name>/projects.json`: the main index. An empty index throws; a `total_count` that differs from the number returned is reported as a problem.
4. For each project, `projects/<hash_id>.json` for the full detail, with a 500ms delay between projects.
5. Map each project to the output schema (see below).
6. Write `src/content/projects.json`, only if no problem was recorded.

Details worth knowing:

- **Retries.** `fetchJsonFromPage` tries each URL up to 4 times with a growing delay (2s, 4s, 6s). It checks for a 2xx status and a JSON content type, and waits for `domcontentloaded`, not network idle.
- **All or nothing.** Anything that would leave the portfolio incomplete (failed album page, failed project, missing thumbnail, video without an embed URL, short index) goes through `reportProblem`. If any problem exists the script prints them, sets a non-zero exit code and does not write the file, so a partial scrape never overwrites good data.
- **Media.** Assets are sorted by `position`. `image` assets become `{ type: 'image', url, width, height }`. `video` assets become `{ type: 'video', url, poster }`, where `url` is the iframe `src` pulled out of `player_embedded` (HTML entities decoded) and `poster` is Vimeo's oEmbed thumbnail (requested at width 1920; Vimeo returns about 1280px), falling back to ArtStation's 295px one. Covers and ArtStation-hosted `video_clip` assets are skipped.
- **Thumbnail.** `cover_url` (falling back to the index's `large_image_url`); if width or height is missing the script measures the image in the browser.
- **Date.** `published_at` as `YYYY-MM-DD`.
- **Year prefix.** A description that starts with `YYYY | ` (the regex is `^(<p>\s*)?(\d{4})\s*\|\s*`; descriptions are HTML, so an opening `<p>` may precede it) overrides the year of `date` (month and day are kept) and the prefix is removed from the description.
- **Empty description.** If what remains is only `<p></p>`, `description` is left `undefined`, so the key is omitted from the JSON. The schema treats it as optional and `works/[...slug].astro` renders the description block only when it is defined.
- **Output shape.** `id` (hash id), `title`, `date`, `albums`, `categories`, `tags`, `thumbnail`, `media`, `sourceUrl`, `tools`, `description`, `featured`, `order` (index position, 1-based), `stats` (`views`, `likes`, `comments`).

## GitHub Actions

Both workflows live in `.github/workflows/` and run on Node 22 with `npm ci`.

**`deploy.yml` (Deploy to GitHub Pages)**
- Triggers: push to `main` and manual `workflow_dispatch`.
- Permissions: `contents: read`, `pages: write`, `id-token: write`.
- Job `build`: checkout, setup Node 22 with npm cache, `npm ci`, `npm run build`, upload `./dist` with `actions/upload-pages-artifact`.
- Job `deploy` (needs `build`): `actions/deploy-pages` into the `github-pages` environment.

**`fetch-portfolio.yml` (Fetch and Update Portfolio)**
- Trigger: manual `workflow_dispatch` only (there is no schedule). Concurrency group `fetch-portfolio`, never cancelled mid-run. 20 minute timeout.
- Permissions: `contents: write` (push `projects.json`) and `actions: write` (dispatch the deploy).
- Steps: checkout, setup Node 22, `npm ci`, `npx playwright install --with-deps chromium`, `npm run fetch-portfolio`, then stage only `src/content/projects.json`. If it changed, commit as `github-actions[bot]` with the message `chore: auto-update projects.json`, push, and set the step output `pushed=true`.
- A push made with `GITHUB_TOKEN` does not trigger other workflows, so when `pushed` is true the last step runs `gh workflow run deploy.yml --ref <branch>` to deploy explicitly.
- If the script fails (see "All or nothing" above) the job fails and nothing is committed.

## Astro notes

- A parent's scoped styles do not reach a child component's root element. Style a passed-in class with `:global(...)` (see `OutlinedWordmark`).
- Scripts that touch layout elements must run on `astro:page-load` (the client router swaps the header and page on navigation) and remove their listeners before re-adding them.
- `.astro` files are rewritten whole with `rm` then create when an edit tool refuses; keep the file's layout: a short JSDoc, then imports, then `type Props`, then the `Astro.props` destructuring, then everything else. Comments are simple JSDoc (`/** ... */`); CSS files have no header comment.

## Design system

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

Secondary labels (card category) are 58% white via `color-mix`. Filter tabs are white; the selected tab is a white box with dark text and a hovered tab is a light grey box (75% white) with dark text.

### Typography

| Role | Site font (Adobe Fonts / Typekit) | Notes |
| :-- | :-- | :-- |
| Display (hero name, wordmarks, About heading) | `widescreen` via `--font-hero` | Uppercase; 700 for the hero name, 900 for outlined wordmarks |
| About bio and project descriptions | `swiss-721-bt` (Swiss 721 BT Medium) via `--font-text` | Only the 500 weight is in the Adobe Fonts kit, so use `--font-weight-medium` |
| Body, nav, filter tabs, card labels, footer text | `adelle-mono` via `--font-hero-mono` | Nav, tabs and the footer copyright share one style: `--type-xs`, regular, `--tracking-wide`, uppercase |

Figma uses LEMON MILK and NB Akademie, which are not available, so `widescreen` and `adelle-mono` stand in. The Typekit stylesheet is loaded in `src/layouts/BaseLayout.astro`.

### Layout tokens (`src/styles/tokens.css`)

- `--grid-gutter`: side gutter of the gallery grid (`--space-xl`, `--space-md` at 768px and below). Used by the gallery root, filter bar, footer divider and footer row.
- `--wordmark-width`, `--wordmark-inset`, `--wordmark-gutter` (= width + inset): the vertical wordmark's column. Pages that show it reserve `--wordmark-gutter` on the right. All three are 0 or reduced below 768px, where the wordmark is hidden.
- `--header-height`: height of the fixed header.

## Components

### Header (`SiteHeader.astro`)
Fixed bar in the page colour with white links (Home, Works, About; Works goes to `/works` and stays current on project pages under `/works/<id>`). On pages that contain a `.hero` it is transparent at the top and fills with `--color-bone` as soon as the page scrolls; on every other page it is always filled. Hover draws a 1px underline growing from the left (background-size transition); the current page keeps the underline. The home page has an intro state: the server-rendered `data-intro` (set only there) plus no `data-scrolled` sets `--intro: 1` on the header, and both effects read it. From 768px up the links shift right (`transform` on `.nav-list`) so the H of HOME lines up with the stem of the J in JOSE (nudged 4px right; derived from `--hero-name-size`), and a plain `JMR` label (`.nav-label`, not a link, rendered only when `data-intro` is set) shows at the right end of the bar from 768px up, its right edge in line with the vertical wordmark. As soon as the page scrolls the links ease back to the usual left edge and the label fades out over `--duration-slow`. A script keyed to `astro:page-load` toggles `data-hero` and `data-scrolled` because the router swaps the header on navigation.

### Hero (`HeroSection.astro`, `HeroCarousel/`)
- Full window (`100svh`; `70svh` below 768px).
- One background image, a random order of `public/assets/hero/slideshow_1-3.png` shuffled in the browser, crossfading every 4s. Pauses on hover and while the tab is hidden; static with `prefers-reduced-motion`. Not clickable and hidden from assistive tech.
- Name "JO" over "SE": desktop is vertically centred at the left, `min(50vh, 40vw)`, tracking −0.124em, line-height 0.72 (the lines overlap slightly). Below 768px the same stack is `min(58vw, 38svh)` in the bottom-right corner with a 4vw margin to the visible letters.
- Scroll chevron, bottom centre, desktop only: appears 5s after load if the page has not been scrolled, fades out when the page leaves the top and returns when it is back at the top.

### Vertical wordmark (`VerticalWordmark.astro`)
`MERCADO RUIZ` fixed to the right edge below the header, reading bottom to top, desktop only. Built on `OutlinedWordmark` with neighbours filling on hover. On pages with a `.hero` the letters start filled and fade to outlines as the hero scrolls away, finishing when the hero's bottom edge reaches the top of the page (`--wordmark-fill` set by a scroll handler, applied as a zero-offset `text-shadow`).

### Outlined wordmark (`OutlinedWordmark.astro`)
Reusable outlined text used by the vertical wordmark, the footer "JOSE" and the About heading. Props: `text`, `fillNeighbours`, `kerns` (extra em after each letter), `class`. Hovering a letter fills it. Each letter is generated content (`::before { content: attr(data-char) }`), not real text, because transparent text with a stroke vanishes when the page selection (select all) repaints it. The root's class is styled from the parent with `:global(...)` because scoped styles do not reach a child component's root. Set `--wordmark-stroke-width` and `--wordmark-gap` on the parent.

### Footer (`SiteFooter.astro`)
A 1px divider and a copyright/social row inset by `--grid-gutter` (the icons are `SocialLinks.astro`: Instagram and ArtStation, shared with the About page), then the outlined `JOSE` spanning the footer width. The wordmark box is trimmed to cap height and baseline (`text-box: trim-both cap alphabetic`) so it sits flush with the bottom of the page; the round letters' overshoot is covered by padding. Only the hovered letter fills. `BaseLayout` takes `footer={false}`; the About page uses it.

### Gallery (`ProjectGallery*`, `ProjectCard/`)
Filter bar whose width equals the content. When the tabs do not all fit the bar scrolls sideways: an arrow with a fade (flat bone fading to transparent) appears at each end that has more tabs, and clicking one scrolls by 60% of the bar. Clicking a tab scrolls it to the middle of the bar (as near as the list allows at either end; instant under `prefers-reduced-motion`), so there is no scroll snapping; it sticks below the header on `/works` but scrolls away on the homepage (`stickyFilter={false}`). On the homepage the first tab is FEATURED: a `FeaturedAccordion` of four projects hard-coded in `pages/index.astro` (`featuredPicks`: project id plus the zero-based index of the image to show among the project's image assets (videos not counted); an out-of-range index falls back to the first image, an unknown id fails the build). On `/works` the first tab is ALL, a masonry of every project. After the first tab the album tabs follow the `albumTabOrder` prop of `ProjectGallery.astro`: `'projectCount'` (default; most projects first), `'recent'` (album with the newest project first) or `'alphabetical'`; ties keep the order in which each album first appears. The homepage uses `'projectCount'` and `/works` uses `'recent'`. Album tabs show a masonry of that album's thumbnails. Each card shows the project's first `image` asset (the ArtStation cover is only a fallback for projects with no images).

Project pages (`ProjectMedia/`) show the project's `media` list as one column in ArtStation's order, images and Vimeo videos mixed. A video is a poster with a play button that opens the player in the lightbox, in a frame with the video's own aspect ratio (from the poster's size, 16:9 if unknown) so the player has no bars. In the lightbox, desktop has the arrows at the screen sides; at 768px and below the arrows sit in a row just under the media (left and right of the screen) and the media spans exactly from the left edge of the left arrow to the right edge of the right one and a touch swipe of at least 50px, mostly horizontal, moves to the previous or next item (swipes on a video's player itself are taken by the player, so use the arrows there). `projects.json` stores `media` as `{ type: 'image', url, width, height }` or `{ type: 'video', url, poster }` entries (`url` is the player's iframe src, `poster` is Vimeo's 1280px thumbnail). The fetch script keeps `image` and `video` assets and skips covers and ArtStation-hosted `video_clip` assets.

Masonry cards: on hover or keyboard focus a bar in the page colour slides down from the top edge of the card (like an eyelid): title bold on the left, category regular and dimmed on the right, both in the tab type. Where hover is unavailable the bar is always shown. The FEATURED tag appears at the bottom left on hover.

Accordion (`FeaturedAccordion/`): full-width strips that take the same props as `ProjectCard`. A strip is 241 Figma px tall and grows to 60vh on hover or keyboard focus (from 768px up). The split is by width, not by input device: from 768px up a strip is closed until hovered or focused and only rotates its images while open; below 768px every strip is always open at 70svh and only rotates while more than half of it is in view. The image keeps the expanded size and is centred, so growing the strip reveals more of it without scaling; text colour does not change on hover. Title and category sit at the bottom left over a white left-to-right fade (node `252:117`); when the strip opens they move to the top left (54 from the corner) and the fade crossfades to a radial white glow from that corner. `--u = 100cqw / 1509` (`/ 760` below 768px). While a strip is open (hover, keyboard focus, or the touch auto-open) it steps through all of the project's image assets every 1.2s with a 500ms crossfade, starting from the picked image, and returns to the picked image after it closes; nothing rotates under `prefers-reduced-motion`.

### Project page (`pages/works/[...slug].astro`)
Media on one side and the title, description and tools on the other, alternating per project by the parity of `order`. The description block renders only when the project has a description. Date, album (first one), tags, tools and a FEATURED badge fill the rest of the header and text column.

### About page (`pages/about.astro`, `AboutSection.astro`)
Contact (one `mailto:` link under the CONTACT label, with the `SocialLinks` icons on the label's row at the right, and one line of space between label and email), a statement, the portrait and the "GET IN TOUCH" heading with a two-layer hand (`public/assets/about/hand-behind.png` behind the heading, `hand-front.png` in front). No footer on this page. `--ink-width` (the heading's ink width in em, set inline on `.about`) ties everything together: `--u = --touch-font-size × --ink-width / 1394`, so the heading and the hands always scale as one picture. Heading letters fill on hover (neighbours too).

| Tier | Width | Layout | Text | Heading size |
| :-- | :-- | :-- | :-- | :-- |
| Desktop | 1400px and up | Collage at a fixed scale, left aligned (the hand bleeds off the left edge). Contact, statement and portrait sit in three columns from `--grid-gutter` to `--grid-gutter + --wordmark-gutter` from the right; the portrait and the statement are a third and 1.2 thirds of the width and the contact column takes the remaining 0.8 third; the portrait has a fixed height and is cropped with `object-fit: cover` | 1.25rem | 10rem |
| Tablet | 768–1399px | Two-column grid: text left, portrait right spanning three rows. The heading row starts 12px under the statement so the hand never covers text; the hand is shifted left so its flat cut end is off screen | 1.25rem | `min(5.75rem, (90vw − gutter) / ink-width)` |
| Mobile | under 768px | Single column: contact, statement, heading and hand, then the portrait. `.about-touch` is a size container and the heading is `100cqw / ink-width`, so its ink matches the portrait's width exactly | 1rem | container-sized |

## CSS and browser gotchas

- Outlined text (`color: transparent` plus `-webkit-text-stroke`) vanishes when the page selection repaints it; draw it as generated content (`::before { content: attr(data-char) }`). `user-select: none` does not prevent this.
- A zero-offset `text-shadow` fills transparent text without touching `color`, so a scroll-driven fill does not fight the hover colour transition. Never drive an inherited, transitioned property from a scroll handler.
- Vertical writing mode: the line box is centred on the font's ascent and descent, not on the letters, so round letters overshoot the baseline side by about 0.016em; use `overflow-y: clip` with `overflow-x: visible` instead of `hidden`.
- `text-box: trim-both cap alphabetic` trims a block to cap height and baseline (Chrome and Safari only). Overflow from the font's descender area still extends scroll height unless the box clips.
- Container query units inside a custom property resolve where the property is used, not where it is declared, and an element cannot use its own container's units. Margin percentages are relative to the containing block's width, which gives a container-relative offset on the container itself.
- A fixed-size composition that must scale together (heading plus hand) should derive one length (`--u`) from one font size.
- `100vw` includes the scrollbar; use a measured container when exact alignment to a box matters.

## Browser testing notes

- `base.css` sets `scroll-behavior: smooth`, so `window.scrollTo` is delayed; pass `behavior: 'instant'`.
- A browser tab that is not visible does not fire scroll events; dispatch `new Event('scroll')` after `scrollTo` when testing scroll handlers.
- `page.goto` keeps the previous scroll position; scroll to 0 first. Resize with `setViewportSize`, wait, then navigate before measuring, and note that `clientWidth` is about 8px less than the viewport when a scrollbar shows.
- Screenshots from the page tool show the current viewport; take them after the last mouse move or scroll.

## Figma

- File `Vl3rEa0ebSFcwQGhqgbzNd` (PORTFOLIO). Load the `figma-design-to-code` skill, create a session, then `get_design_context` with a screenshot. Asset URLs expire after 7 days: download them with `curl -L` into `public/` and never reference the temporary URLs.
- Nodes: hero `36:275` (1728px wide); homepage with divider and masonry `32:230`; homepage FEATURED accordion `198:32`; project page `1:2`; About page `243:13` (1702px wide, the current design; `198:32` is the older one).
- The built site has moved on from the early hero frames in places (full-window hero, three slideshow images, dark header).
- Figma exports `rotate` and `-scale-y-100` on one element, which composes as `rotate() scaleY(-1)` in that order; use the same order in CSS.
- Convert Figma pixel values into `--u`-relative lengths (`calc(N * var(--u))`) and note the frame width they came from.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
