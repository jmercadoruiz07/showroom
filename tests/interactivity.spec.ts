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

test.describe('Hero featured carousel', () => {
  const featuredThumbnails = [
    'https://cdna.artstation.com/p/assets/images/images/066/072/581/large/jose-mercado-ruiz-kl-sheeesh.jpg?1691988051',
    'https://cdna.artstation.com/p/assets/images/images/066/072/182/large/jose-mercado-ruiz-dhedrtitled.jpg?1691986235',
    'https://cdnb.artstation.com/p/assets/images/images/066/071/709/large/jose-mercado-ruiz-clay-comparison-1.jpg?1691984501',
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('renders featured projects as slides with the first active', async ({ page }) => {
    await expect(page.locator('.hero-slide')).toHaveCount(3);

    for (const [index, thumbnail] of featuredThumbnails.entries()) {
      await expect(page.locator(`.hero-slide[data-index="${index}"]`)).toHaveAttribute(
        'src',
        thumbnail
      );
    }

    await expect(page.locator('.hero-slide.is-active')).toHaveCount(1);
    await expect(page.locator('.hero-slide[data-index="0"]')).toHaveClass(/is-active/);
    await expect(page.locator('.hero-slide-link')).toHaveText('Kamino Lost');
    await expect(page.locator('.hero-slide-link')).toHaveAttribute('href', '/projects/kamino-lost');
  });

  test('auto-rotates to the next slide', async ({ page }) => {
    await expect(page.locator('.hero-slide[data-index="1"]')).toHaveClass(
      /is-active/,
      { timeout: 12000 }
    );

    await expect(page.locator('.hero-slide-link')).toHaveText('Viking Mech');
    await expect(page.locator('.hero-slide-link')).toHaveAttribute('href', '/projects/viking-mech');
  });

  test('selects a slide from the indicator dots', async ({ page }) => {
    await page.getByRole('button', { name: 'Show Venator Loop' }).click();

    await expect(page.locator('.hero-slide[data-index="2"]')).toHaveClass(/is-active/);
    await expect(page.locator('.hero-slide-link')).toHaveText('Venator Loop');
    await expect(page.locator('.hero-slide-link')).toHaveAttribute('href', '/projects/venator-loop');
  });

  test('does not auto-rotate when reduced motion is preferred', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload({ waitUntil: 'networkidle' });

    await page.waitForTimeout(7000);

    await expect(page.locator('.hero-slide[data-index="0"]')).toHaveClass(/is-active/);
    await expect(page.locator('.hero-slide-link')).toHaveText('Kamino Lost');

    await page.getByRole('button', { name: 'Show Viking Mech' }).click();
    await expect(page.locator('.hero-slide[data-index="1"]')).toHaveClass(/is-active/);
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
