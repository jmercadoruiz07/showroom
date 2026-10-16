## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Working in this repo

- Commit each finished change to `main` with a short message; no feature branches unless asked. Run `npx astro check` before committing.
- Look at the page after every visual change (browser tools) and measure rather than guess: `getBoundingClientRect`, computed styles, `Range` rects for text. Check desktop (1400+), tablet (768–1399) and mobile (below 768).
- When told not to touch a component (the header or `VerticalWordmark`, for example), leave it exactly as is.
- If a request is ambiguous ("evenly spaced", "fonts fixed at two sizes"), say how you read it, or say what breaks, rather than silently picking. Fixed type sizes inside a scaled layout need a layout strategy; the About page uses three tiers for this.
- Do not delete content or components without being told (`ContactBlock.astro` and two hero images are unused but kept).
- The README describes the shipped design, tokens and components; update it when those change.

## Astro notes

- A parent's scoped styles do not reach a child component's root element. Style a passed-in class with `:global(...)` (see `OutlinedWordmark`).
- Scripts that touch layout elements must run on `astro:page-load` (the client router swaps the header and page on navigation) and remove their listeners before re-adding them.
- `.astro` files are rewritten whole with `rm` then create when an edit tool refuses; keep the leading comment block in the project's boxed style.

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

- File `Vl3rEa0ebSFcwQGhqgbzNd`. Load the `figma-design-to-code` skill, create a session, then `get_design_context` with a screenshot. Asset URLs expire after 7 days: download them with `curl -L` into `public/` and never reference the temporary URLs.
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
