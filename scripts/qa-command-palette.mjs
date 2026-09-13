#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const output = path.resolve(process.env.QA_SHOTS_DIR || 'output/experience-v2');
await fs.mkdir(output, { recursive: true });
const browser = await puppeteer.launch({
  headless: true,
  executablePath:
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    (process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : puppeteer.executablePath()),
  args:
    process.platform === 'darwin'
      ? ['--use-angle=metal', '--enable-gpu']
      : ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox'],
});
const checks = [];
const errors = [];
const check = (name, passed) => {
  checks.push({ name, passed });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
  assert.ok(passed, name);
};
try {
  const page = await browser.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(
    `${process.env.QA_BASE_URL || 'http://127.0.0.1:4173'}/?welcome=1`,
    { waitUntil: 'domcontentloaded' },
  );
  await page.waitForFunction(
    () =>
      window.__godsEyeView &&
      document.querySelector('#first-run-launcher.visible') &&
      getComputedStyle(document.querySelector('#first-run-launcher'))
        .opacity === '1',
  );
  check(
    'fresh sessions start at a full-Earth altitude',
    await page.evaluate(
      () =>
        window.__godsEyeView.viewer.camera.positionCartographic.height >
        18000000,
    ),
  );
  await page.keyboard.down('Control');
  await page.keyboard.press('k');
  await page.keyboard.up('Control');
  await page.waitForSelector('.command-palette[open]');
  check(
    'Ctrl+K opens focused search and dismisses welcome',
    await page.evaluate(
      () =>
        document.activeElement.id === 'command-palette-input' &&
        !document.querySelector('#first-run-launcher.visible'),
    ),
  );
  await page.screenshot({
    path: path.join(output, 'command-search-desktop.png'),
  });
  await page.type('#command-palette-input', 'ukraine');
  check(
    'matching SITREP is the first result',
    await page.$eval('[role="option"][aria-selected="true"]', (node) =>
      node.textContent.includes('Russia–Ukraine'),
    ),
  );
  await page.$eval('#command-palette-input', (node) =>
    node.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        isComposing: true,
        bubbles: true,
      }),
    ),
  );
  check(
    'IME Enter does not execute a command',
    await page.$eval('.command-palette', (node) => node.open),
  );
  await page.keyboard.press('Enter');
  await page.waitForFunction(
    () => window.__godsEyeView.conflictTracker.selectedId === 'ukraine',
  );
  check(
    'keyboard result opens the matching conflict report',
    await page.evaluate(
      () =>
        window.__godsEyeView.conflictTracker.isActive &&
        !document.querySelector('.command-palette').open,
    ),
  );
  await page.click('.experience-search-trigger');
  await page.type('#command-palette-input', 'data layers');
  await page.keyboard.press('Enter');
  await page.waitForFunction(
    () =>
      !window.__godsEyeView.conflictTracker.isActive &&
      !document.querySelector('#data-panel').classList.contains('collapsed'),
  );
  check('tool action restores Explore and opens existing data panel', true);
  await page.click('.experience-search-trigger');
  await page.keyboard.press('ArrowDown');
  check(
    'arrow keys move the active result',
    await page.$eval(
      '#command-palette-input',
      (node) =>
        node.getAttribute('aria-activedescendant') === 'command-result-1',
    ),
  );
  await page.keyboard.press('Escape');
  check(
    'Escape restores search-trigger focus',
    await page.evaluate(() =>
      document.activeElement.matches('.experience-search-trigger'),
    ),
  );
  await page.click('.experience-search-trigger');
  // Keep external geocoder availability separate from palette integration.
  await page.evaluate(() => {
    window.__paletteGeocodeQuery = null;
    window.__godsEyeView.styleManager.placeSearch = {
      async geocode(query) {
        window.__paletteGeocodeQuery = query;
        return {
          place: {
            lat: 48.8566,
            lng: 2.3522,
            label: 'Paris',
            types: ['locality'],
          },
          fallbackUsed: false,
        };
      },
    };
  });
  await page.type('#command-palette-input', 'Paris');
  await page.keyboard.press('Enter');
  await page.waitForFunction(
    () =>
      window.__paletteGeocodeQuery === 'Paris' &&
      !document.querySelector('.command-palette').open,
  );
  await page.waitForFunction(
    () => {
      const p = window.__godsEyeView.viewer.camera.positionCartographic;
      return Math.abs((p.latitude * 180) / Math.PI - 48.8566) < 0.5;
    },
    { timeout: 15000 },
  );
  check(
    'place results submit through existing camera navigation (geocoder fixture)',
    true,
  );
  // Exclusive modes retain their own keyboard ownership.
  for (const mode of ['ui-clean-view', 'cockpit-mode', 'recording-mode']) {
    await page.evaluate((name) => document.body.classList.add(name), mode);
    await page.keyboard.down('Control');
    await page.keyboard.press('k');
    await page.keyboard.up('Control');
    check(
      `search stays closed in ${mode}`,
      await page.$eval('.command-palette', (node) => !node.open),
    );
    await page.evaluate((name) => document.body.classList.remove(name), mode);
  }
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.click('.experience-search-trigger');
  await page.type('#command-palette-input', 'sudan');
  await page.screenshot({
    path: path.join(output, 'command-search-mobile.png'),
  });
  check(
    'mobile search fits the viewport',
    await page.evaluate(() => {
      const r = document
        .querySelector('.command-palette')
        .getBoundingClientRect();
      return r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight;
    }),
  );
  await page.keyboard.press('Tab');
  check(
    'native dialog keeps keyboard focus within search',
    await page.evaluate(() =>
      document
        .querySelector('.command-palette')
        .contains(document.activeElement),
    ),
  );
  const shared = await browser.newPage();
  await shared.goto(
    `${process.env.QA_BASE_URL || 'http://127.0.0.1:4173'}/#v=2&lat=30.2672&lon=-97.7431&alt=600&heading=15&pitch=-30&roll=0`,
    { waitUntil: 'domcontentloaded' },
  );
  await shared.waitForFunction(() => window.__godsEyeView);
  await shared.evaluate(
    () => window.__godsEyeView.styleManager.initialRestorePromise,
  );
  await shared.waitForFunction(
    () =>
      window.__godsEyeView.viewer.camera.positionCartographic.height < 10000,
    { timeout: 15000 },
  );
  check(
    'explicit shared camera bypasses the global default',
    await shared.evaluate(
      () =>
        window.__godsEyeView.styleManager.hasShareState &&
        window.__godsEyeView.viewer.camera.positionCartographic.height < 10000,
    ),
  );
  await shared.close();
  check('no browser runtime errors', errors.length === 0);
} finally {
  await fs.writeFile(
    path.join(output, 'command-verification.json'),
    JSON.stringify({ checks, errors }, null, 2),
  );
  await browser.close();
}
