import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about/' },
  { name: 'Projects', path: '/projects/' },
  { name: 'Project Detail', path: '/projects/ceramic-form-studies/' },
  { name: '404', path: '/404.html' },
];

for (const { name, path } of pages) {
  test(`Accessibility audit — ${name}`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    const violations = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');

    if (violations.length > 0) {
      console.log(`\n${name} — ${violations.length} critical/serious violations:`);
      for (const v of violations) {
        const nodes = v.nodes.map((n) => `  - ${n.target.join(', ')}: ${n.failureSummary}`).join('\n');
        console.log(`  [${v.impact}] ${v.id}: ${v.description}\n${nodes}`);
      }
    }

    expect(
      violations.length,
      `${name} has ${violations.length} critical/serious a11y violations`
    ).toBe(0);
  });
}
