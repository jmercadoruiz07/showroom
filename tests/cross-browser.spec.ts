import { test, expect } from '@playwright/test';

const pages = [
  { name: 'Home', path: '/', title: 'JMR Visuals' },
  { name: 'About', path: '/about/', title: 'About' },
  { name: 'Projects', path: '/projects/', title: 'Projects' },
  { name: 'Project Detail', path: '/projects/ceramic-form-studies/', title: 'Ceramic Form Studies' },
];

for (const { name, path, title } of pages) {
  test.describe(`${name} page`, () => {
    test('loads without console errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (err) => errors.push(err.message));

      await page.goto(path, { waitUntil: 'networkidle' });

      // Filter out 404s from missing placeholder assets and
      // Firefox headless font sanitizer rejections (known limitation)
      // Also filter model-viewer errors (missing GLB, not yet provided)
      const realErrors = errors.filter(
        (e) => !e.includes('404') && !e.includes('rejected by sanitizer') && !e.includes('model-viewer') && !/^Error$/.test(e)
      );

      if (realErrors.length > 0) {
        console.log(`  Console errors on ${name}:`, realErrors);
      }
      expect(realErrors, `${name} had unexpected console errors`).toHaveLength(0);
    });

    test('has correct title', async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await expect(page).toHaveTitle(new RegExp(title));
    });

    test('has no horizontal overflow', async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth, `${name} has horizontal overflow`).toBeLessThanOrEqual(clientWidth + 5);
    });

    test('skip link targets #main-content', async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      const skipLink = page.locator('.skip-link');
      await expect(skipLink).toHaveAttribute('href', '#main-content');
      const target = page.locator('#main-content');
      await expect(target).toBeAttached();
    });

    test('header is visible and fixed', async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      const header = page.locator('.site-header');
      await expect(header).toBeVisible();
      const position = await header.evaluate((el) => getComputedStyle(el).position);
      expect(position).toBe('fixed');
    });

    test('footer is visible', async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      const footer = page.locator('.site-footer');
      await expect(footer).toBeVisible();
    });

    test('images have alt text', async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      const images = page.locator('img');
      const count = await images.count();
      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt, `Image ${i} on ${name} missing alt`).not.toBeNull();
      }
    });

    test('no pure black or white backgrounds', async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      expect(bgColor).not.toBe('rgb(0, 0, 0)');
      expect(bgColor).not.toBe('rgb(255, 255, 255)');
    });

    test('uses correct font families', async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
      expect(fontFamily).toContain('Instrument Sans');
    });

    test('dark mode toggle works', async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      const toggle = page.locator('#theme-toggle');
      await expect(toggle).toBeVisible();

      const themeBefore = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      await toggle.click();
      const themeAfter = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(themeAfter).not.toBe(themeBefore);

      // Toggle back
      await toggle.click();
      const themeRestored = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(themeRestored).toBe(themeBefore);
    });
  });
}

test.describe('Navigation', () => {
  test('all nav links resolve to 200', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const links = page.locator('.nav-link');
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      if (!href || href.startsWith('mailto:')) continue;

      const response = await page.request.get(href);
      expect(
        response.status(),
        `Nav link ${href} returned ${response.status()}`
      ).toBe(200);
    }
  });

  test('back-to-top link appears on scroll', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const backToTop = page.locator('.back-to-top');
    // back-to-top is hidden by default, appears after scrolling
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(500);
    await expect(backToTop).toHaveClass(/visible/);
  });
});

test.describe('Responsive', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 812 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    test(`${vp.name} (${vp.width}px) — no horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/', { waitUntil: 'networkidle' });
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth, `${vp.name} has horizontal overflow`).toBeLessThanOrEqual(vp.width + 1);
    });
  }
});
