import { test, expect, type Page } from '@playwright/test';

/*
|-------------------------------------------------------------------------------
| Project card overlay contrast guarantees
|-------------------------------------------------------------------------------
|
| Overlay text floats over arbitrary artwork, so every label must sit on an
| opaque ink plate that meets WCAG AA against its own text color regardless of
| what the image behind it looks like. The overlay must stay anchored to its
| card even when reveal transforms are stripped, and the title plate must
| visually outrank the category tag.
|
*/

type Rgba = { r: number; g: number; b: number; a: number };

async function labelStyles(page: Page, selector: string) {
  return page
    .locator(selector)
    .first()
    .evaluate((el) => {
      // Engines serialize computed colors back in their specified color space
      // (e.g. oklch()), so resolve everything to sRGB channels ourselves.
      const gamma = (c: number) =>
        c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
      const clamp01 = (c: number) => Math.min(1, Math.max(0, c));

      const oklchToSrgb = (L: number, C: number, H: number): [number, number, number] => {
        const rad = (H * Math.PI) / 180;
        const a = C * Math.cos(rad);
        const b = C * Math.sin(rad);
        const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
        const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
        const s_ = L - 0.0894841775 * a - 1.291485548 * b;
        const l = l_ ** 3;
        const m = m_ ** 3;
        const s = s_ ** 3;
        return [
          gamma(clamp01(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)),
          gamma(clamp01(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)),
          gamma(clamp01(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)),
        ].map((v) => Math.round(v * 255)) as [number, number, number];
      };

      const normalize = (cssColor: string): Rgba => {
        const value = cssColor.trim();
        let m = value.match(/^oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.%]+))?\)$/);
        if (m) {
          const [r, g, b] = oklchToSrgb(+m[1], +m[2], +m[3]);
          const alpha = m[4]
            ? m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4])
            : 1;
          return { r, g, b, a: alpha };
        }
        m = value.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)$/);
        if (m) {
          return {
            r: Math.round(gamma(clamp01(+m[1])) * 255),
            g: Math.round(gamma(clamp01(+m[2])) * 255),
            b: Math.round(gamma(clamp01(+m[3])) * 255),
            a: m[4] === undefined ? 1 : +m[4],
          };
        }
        if (value.startsWith('#')) {
          const hex = value.length === 4
            ? value.slice(1).split('').map((c) => c + c).join('')
            : value.slice(1);
          const n = parseInt(hex.slice(0, 6), 16);
          return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: hex.length >= 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1 };
        }
        m = value.match(/^rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)$/);
        if (m) {
          return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
        }
        throw new Error(`Unparseable color: ${cssColor}`);
      };

      const luminance = ({ r, g, b }: Rgba) => {
        const channel = (c: number) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      };

      const style = getComputedStyle(el);
      const bg = normalize(style.backgroundColor);
      const fg = normalize(style.color);
      const [hi, lo] = luminance(fg) > luminance(bg)
        ? [luminance(fg), luminance(bg)]
        : [luminance(bg), luminance(fg)];

      return {
        alpha: bg.a,
        contrast: (hi + 0.05) / (lo + 0.05),
        fontSize: parseFloat(style.fontSize),
        fontFamily: style.fontFamily.toLowerCase(),
        box: el.getBoundingClientRect(),
      };
    });
}

test.describe('Project card overlay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('.project-card').first().scrollIntoViewIfNeeded();
    await expect(page.locator('.project-card').first()).toBeVisible();
  });

  test('every label sits on an opaque plate meeting WCAG AA contrast', async ({ page }) => {
    for (const selector of ['.card-category', '.card-title', '.card-featured']) {
      const styles = await labelStyles(page, selector);

      expect(styles.alpha, `${selector} plate must be opaque`).toBeGreaterThanOrEqual(0.999);
      expect(styles.contrast, `${selector} text vs its plate`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('overlay stays anchored to its card when transforms are stripped', async ({ page }) => {
    await page.addStyleTag({
      content: `
        .reveal-item, .reveal-stagger > * {
          transform: none !important;
          transition: none !important;
        }
      `,
    });
    await page.waitForTimeout(100);

    const cards = page.locator('.project-card');
    const count = Math.min(await cards.count(), 5);
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const cardBox = await cards.nth(i).boundingBox();
      const overlayBox = await cards.nth(i).locator('.card-overlay').boundingBox();
      expect(cardBox, `card ${i} geometry`).not.toBeNull();
      expect(overlayBox, `card ${i} overlay geometry`).not.toBeNull();
      if (!cardBox || !overlayBox) continue;

      const matches = (outer: number, inner: number) => Math.abs(outer - inner) <= 1;
      expect(matches(cardBox.x, overlayBox.x), `card ${i}: left edge`).toBe(true);
      expect(matches(cardBox.y, overlayBox.y), `card ${i}: top edge`).toBe(true);
      expect(
        matches(cardBox.x + cardBox.width, overlayBox.x + overlayBox.width),
        `card ${i}: right edge`
      ).toBe(true);
      expect(
        matches(cardBox.y + cardBox.height, overlayBox.y + overlayBox.height),
        `card ${i}: bottom edge`
      ).toBe(true);
    }
  });

  test('overlay stays anchored under reduced motion emulation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('.project-card').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const card = page.locator('.project-card').first();
    const cardBox = await card.boundingBox();
    const overlayBox = await card.locator('.card-overlay').boundingBox();
    expect(cardBox).not.toBeNull();
    expect(overlayBox).not.toBeNull();
    if (!cardBox || !overlayBox) return;

    expect(Math.abs(cardBox.y - overlayBox.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(cardBox.height - overlayBox.height)).toBeLessThanOrEqual(1);
  });

  test('title plate outranks the category tag', async ({ page }) => {
    const title = await labelStyles(page, '.card-title');
    const category = await labelStyles(page, '.card-category');

    expect(title.fontSize).toBeGreaterThan(category.fontSize);
    expect(title.box.height).toBeGreaterThan(category.box.height);
    expect(title.fontFamily).toContain('playfair');
    expect(category.fontFamily).toContain('jetbrains');
  });

  test('hovered category tag keeps AA contrast', async ({ page }) => {
    await page.locator('.card-link').first().hover();
    await page.waitForTimeout(300);

    const styles = await labelStyles(page, '.card-category');
    expect(styles.alpha).toBeGreaterThanOrEqual(0.999);
    expect(styles.contrast).toBeGreaterThanOrEqual(4.5);
  });
});
