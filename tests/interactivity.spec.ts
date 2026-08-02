import { test, expect } from '@playwright/test';

test.describe('Project gallery filter', () => {
  // The filter bar sits at the top of the page, so the fixed header can
  // intercept pointer events; use force clicks for the filter buttons.
  test('shows all projects initially', async ({ page }) => {
    await page.goto('/projects/', { waitUntil: 'networkidle' });
    await page.locator('#project-grid').scrollIntoViewIfNeeded();
    await expect(page.locator('.project-card').first()).toBeVisible();

    await expect(page.locator('.project-card')).toHaveCount(23);
    const hidden = await page
      .locator('.project-card')
      .evaluateAll((cards) => cards.filter((c) => (c as HTMLElement).offsetParent === null).length);
    expect(hidden).toBe(0);
  });

  test('filters to a single category', async ({ page }) => {
    await page.goto('/projects/', { waitUntil: 'networkidle' });
    const filterRenders = page.getByRole('button', { name: 'RENDERS' });
    await filterRenders.scrollIntoViewIfNeeded();
    await filterRenders.click({ force: true });
    await expect(page.locator('.filter-btn.active')).toHaveText('RENDERS');

    await expect(page.locator('.project-card[data-category="renders"]').first()).toBeVisible();
    await expect(page.locator('.project-card[data-category="renders"]')).toHaveCount(15);
    await expect(page.locator('.project-card[data-category="physicalMediums"]')).toHaveCount(8);

    const physicalDisplay = await page
      .locator('.project-card[data-category="physicalMediums"]')
      .first()
      .evaluate((c) => getComputedStyle(c).display);
    expect(physicalDisplay).toBe('none');
  });

  test('restores all projects when ALL is selected', async ({ page }) => {
    await page.goto('/projects/', { waitUntil: 'networkidle' });
    const filterRenders = page.getByRole('button', { name: 'RENDERS' });
    await filterRenders.scrollIntoViewIfNeeded();
    await filterRenders.click({ force: true });
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
    await page.goto('/projects/ancient-ruins/', { waitUntil: 'networkidle' });
  });

  test('opens viewer with correct image and counter', async ({ page }) => {
    await page.locator('.gallery-item').first().click();
    await expect(page.locator('.media-viewer')).toHaveClass(/is-open/);

    await expect(page.locator('.viewer-image')).toHaveAttribute(
      'src',
      'https://cdnb.artstation.com/p/assets/images/images/066/046/347/large/jose-mercado-ruiz-untitledddd.jpg?1691911544'
    );
    await expect(page.locator('.viewer-counter')).toHaveText(/1 \/ 3/);
  });

  test('navigates images with next and prev', async ({ page }) => {
    await page.locator('.gallery-item').first().click();

    await expect(page.locator('.viewer-image')).toHaveAttribute(
      'src',
      'https://cdnb.artstation.com/p/assets/images/images/066/046/347/large/jose-mercado-ruiz-untitledddd.jpg?1691911544'
    );
    await page.locator('.viewer-next').click();
    await expect(page.locator('.viewer-image')).toHaveAttribute(
      'src',
      'https://cdnb.artstation.com/p/assets/images/images/066/046/353/large/jose-mercado-ruiz-untitledddddd.jpg?1691911562'
    );
    await expect(page.locator('.viewer-counter')).toHaveText(/2 \/ 3/);

    await page.locator('.viewer-prev').click();
    await expect(page.locator('.viewer-counter')).toHaveText(/1 \/ 3/);
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

test.describe('Project video lightbox', () => {
  test('plays embedded video with poster', async ({ page }) => {
    await page.goto('/projects/the-aviator/', { waitUntil: 'networkidle' });

    const videoItem = page.locator('.gallery-item--video').first();
    await expect(videoItem).toBeVisible();
    await expect(videoItem.locator('img')).toHaveAttribute(
      'src',
      'https://cdna.artstation.com/p/assets/images/images/066/072/822/large/jose-mercado-ruiz-lego-plane-crash.jpg?1691988928'
    );

    await videoItem.click();
    await expect(page.locator('.media-viewer')).toHaveClass(/is-open/);

    await expect(page.locator('.viewer-video')).toHaveAttribute(
      'src',
      'https://player.vimeo.com/video/909448970'
    );
    await expect(page.locator('.viewer-counter')).toHaveText(/1 \/ 3/);

    await page.locator('.viewer-next').click();
    await expect(page.locator('.viewer-counter')).toHaveText(/2 \/ 3/);
    await expect(page.locator('.viewer-image')).toHaveAttribute(
      'src',
      'https://cdna.artstation.com/p/assets/images/images/066/072/822/large/jose-mercado-ruiz-lego-plane-crash.jpg?1691988928'
    );

    await page.locator('.viewer-next').click();
    await expect(page.locator('.viewer-image')).toHaveAttribute(
      'src',
      'https://cdna.artstation.com/p/assets/images/images/066/072/818/large/jose-mercado-ruiz-sheesh-comp-omg-copy.jpg?1691988910'
    );
    await expect(page.locator('.viewer-counter')).toHaveText(/3 \/ 3/);
  });
});
