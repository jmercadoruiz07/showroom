/**
 * Lighthouse Audit — JMR Visuals Portfolio
 *
 * Launches Chromium with CDP, runs Lighthouse against each page.
 * Usage: npx playwright test tests/lighthouse-audit.mjs
 * Or:    node tests/lighthouse-audit.mjs
 *
 * Requires: `npm run build` first, then server on port 3456
 */
import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import { spawn } from 'child_process';

const SCORE_THRESHOLD = 90;
const BASE_URL = 'http://localhost:3456';
const CDP_PORT = 9222;

const pages = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about/' },
  { name: 'Projects', path: '/projects/' },
  { name: 'Project Detail', path: '/projects/ceramic-form-studies/' },
];

async function runAudit() {
  console.log(`\nLighthouse Audit — JMR Visuals Portfolio\n${'─'.repeat(50)}\n`);

  // Launch Chromium with remote debugging enabled
  const browser = await chromium.launch({
    args: [
      `--remote-debugging-port=${CDP_PORT}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  let allPassed = true;

  for (const { name, path } of pages) {
    const url = `${BASE_URL}${path}`;
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Run Lighthouse via CDP port
      const result = await lighthouse(url, {
        port: CDP_PORT,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      });

      const report = JSON.parse(result.report);
      const scores = {
        performance: Math.round((report.categories.performance?.score ?? 0) * 100),
        accessibility: Math.round((report.categories.accessibility?.score ?? 0) * 100),
        'best-practices': Math.round((report.categories['best-practices']?.score ?? 0) * 100),
        seo: Math.round((report.categories.seo?.score ?? 0) * 100),
      };

      const criticalFailed =
        scores.accessibility < SCORE_THRESHOLD ||
        scores['best-practices'] < SCORE_THRESHOLD ||
        scores.seo < SCORE_THRESHOLD;

      if (criticalFailed) allPassed = false;

      const icon = criticalFailed ? '✗' : '✓';
      console.log(`${icon} ${name}`);
      console.log(`  Performance:    ${scores.performance}${scores.performance < SCORE_THRESHOLD ? ' ⚠ (expected with placeholders)' : ''}`);
      console.log(`  Accessibility:  ${scores.accessibility}${scores.accessibility < SCORE_THRESHOLD ? ' ✗ FAIL' : ''}`);
      console.log(`  Best Practices: ${scores['best-practices']}${scores['best-practices'] < SCORE_THRESHOLD ? ' ✗ FAIL' : ''}`);
      console.log(`  SEO:            ${scores.seo}${scores.seo < SCORE_THRESHOLD ? ' ✗ FAIL' : ''}`);

      // Log failing audits
      for (const [id, audit] of Object.entries(report.audits)) {
        if (audit.score !== null && audit.score < 0.9 && audit.scoreDisplayMode === 'binary') {
          console.log(`    → ${audit.title}`);
        }
      }
      console.log('');
    } catch (err) {
      console.log(`✗ ${name} — ${err.message}\n`);
      allPassed = false;
    } finally {
      await page.close();
    }
  }

  await browser.close();

  console.log('─'.repeat(50));
  if (allPassed) {
    console.log('All critical audits passed ✓\n');
  } else {
    console.log('Some audits failed — see above ✗\n');
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
