import { test, expect } from '@playwright/test';

test.describe('Project gallery filter', () => {
  // The filter bar sits at the top of the page, so the fixed header can
  // intercept pointer events; use force clicks for the filter buttons.
  test('shows all projects initially', async ({ page }) => {
    await page.goto('/projects/', { waitUntil: 'networkidle' });
    await page.locator('#project-grid').scrollIntoViewIfNeeded();
    await expect(page.locator('.project-card').first()).toBeVisible();

    await expect(page.locator('.project-card')).toHaveCount(4);
    const hidden = await page
      .locator('.project-card')
      .evaluateAll((cards) => cards.filter((c) => (c as HTMLElement).offsetParent === null).length);
    expect(hidden).toBe(0);
  });

  test('filters to a single category', async ({ page }) => {
    await page.goto('/projects/', { waitUntil: 'networkidle' });
    const filter3D = page.getByRole('button', { name: '3D' });
    await filter3D.scrollIntoViewIfNeeded();
    await filter3D.click({ force: true });
    await expect(page.locator('.filter-btn.active')).toHaveText('3D');

    await expect(page.locator('.project-card[data-category="3d"]')).toBeVisible();
    await expect(page.locator('.project-card[data-category="print"]')).toHaveCount(2);
    await expect(page.locator('.project-card[data-category="motion"]')).toHaveCount(1);

    const printDisplay = await page
      .locator('.project-card[data-category="print"]')
      .first()
      .evaluate((c) => getComputedStyle(c).display);
    expect(printDisplay).toBe('none');
  });

  test('restores all projects when ALL is selected', async ({ page }) => {
    await page.goto('/projects/', { waitUntil: 'networkidle' });
    const filter3D = page.getByRole('button', { name: '3D' });
    await filter3D.scrollIntoViewIfNeeded();
    await filter3D.click({ force: true });
    const filterAll = page.getByRole('button', { name: 'ALL' });
    await filterAll.scrollIntoViewIfNeeded();
    await filterAll.click({ force: true });

    const hidden = await page
      .locator('.project-card')
      .evaluateAll((cards) => cards.filter((c) => getComputedStyle(c).display === 'none').length);
    expect(hidden).toBe(0);
  });
});

test.describe('Project media lightbox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects/editorial-layout-system/', { waitUntil: 'networkidle' });
  });

  test('opens viewer with correct image and counter', async ({ page }) => {
    await page.locator('.gallery-item').first().click();
    await expect(page.locator('.media-viewer')).toHaveClass(/is-open/);

    await expect(page.locator('.viewer-image')).toHaveAttribute(
      'src',
      '/projects/images/editorial-layout-1.jpg'
    );
    await expect(page.locator('.viewer-counter')).toHaveText(/1 \/ 2/);
  });

  test('navigates images with next and prev', async ({ page }) => {
    await page.locator('.gallery-item').first().click();

    await expect(page.locator('.viewer-image')).toHaveAttribute(
      'src',
      '/projects/images/editorial-layout-1.jpg'
    );
    await page.locator('.viewer-next').click();
    await expect(page.locator('.viewer-image')).toHaveAttribute(
      'src',
      '/projects/images/editorial-layout-2.jpg'
    );
    await expect(page.locator('.viewer-counter')).toHaveText(/2 \/ 2/);

    await page.locator('.viewer-prev').click();
    await expect(page.locator('.viewer-counter')).toHaveText(/1 \/ 2/);
  });

  test('closes on Escape and returns focus to trigger', async ({ page }) => {
    const trigger = page.locator('.gallery-item').first();
    await trigger.click();
    await expect(page.locator('.media-viewer')).toHaveClass(/is-open/);

    await page.keyboard.press('Escape');
    await expect(page.locator('.media-viewer')).not.toHaveClass(/is-open/);
    await expect(trigger).toBeFocused();
  });
});
