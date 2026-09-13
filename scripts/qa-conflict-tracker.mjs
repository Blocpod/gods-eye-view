#!/usr/bin/env node
/** End-to-end proof of the additive conflict mode, with actual canvas picking. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const output = path.resolve(process.env.QA_SHOTS_DIR || 'output/experience');
await fs.mkdir(output, { recursive: true });
const browser = await puppeteer.launch({
  headless: true,
  executablePath:
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    (process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : await puppeteer.executablePath()),
  args:
    process.platform === 'darwin'
      ? ['--use-angle=metal', '--enable-gpu']
      : ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox'],
});
const results = [];
const errors = [];
const check = (name, value) => {
  results.push({ name, passed: Boolean(value) });
  console.log(`${value ? 'PASS' : 'FAIL'} ${name}`);
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
      window.__godsEyeView?.conflictTracker &&
      !document.querySelector('#first-run-launcher').hidden,
  );
  await page.screenshot({ path: path.join(output, 'onboarding-desktop.png') });
  await page.click('[data-experience-conflicts]');
  await page.waitForFunction(
    () => window.__godsEyeView.conflictTracker.isActive,
  );
  await new Promise((resolve) => setTimeout(resolve, 1800));
  check(
    'first-run entry opens conflict mode and dismisses launcher',
    await page.evaluate(
      () =>
        (!document.querySelector('#first-run-launcher') ||
          document.querySelector('#first-run-launcher').hidden) &&
        document
          .querySelector('[data-mode="conflicts"]')
          .getAttribute('aria-pressed') === 'true',
    ),
  );
  check(
    'catalog renders all 28 briefings',
    await page.$$eval('[data-conflict-id]', (items) => items.length === 28),
  );
  await page.screenshot({ path: path.join(output, 'conflicts-desktop.png') });
  // Pick a visible Sudan point through real mouse input into the Cesium canvas.
  const point = await page.evaluate(() => {
    const { viewer } = window.__godsEyeView;
    const source = Array.from(
      { length: viewer.dataSources.length },
      (_, index) => viewer.dataSources.get(index),
    ).find((entry) => entry.name.startsWith('conflict-tracker-'));
    const entity = source.entities.values.find((entry) =>
      entry.id.endsWith(':sudan'),
    );
    const pixel = viewer.scene.cartesianToCanvasCoordinates(
      entity.position.getValue(viewer.clock.currentTime),
    );
    const rect = viewer.scene.canvas.getBoundingClientRect();
    return { x: pixel.x + rect.left, y: pixel.y + rect.top };
  });
  await page.mouse.click(point.x, point.y);
  await page.waitForFunction(
    () => window.__godsEyeView.conflictTracker.selectedId === 'sudan',
  );
  check(
    'actual globe marker click opens matching Sudan SITREP',
    await page.$eval(
      '.conflict-sitrep h2',
      (element) => element.textContent === 'Sudan',
    ),
  );
  check(
    'report selection moves accessible focus to heading',
    await page.evaluate(
      () =>
        document.activeElement ===
        document.querySelector('.conflict-sitrep h2'),
    ),
  );
  check(
    'SITREP exposes dated sources and humanitarian context',
    await page.evaluate(
      () =>
        document.querySelectorAll('.conflict-sources a').length > 0 &&
        /Reviewed/.test(
          document.querySelector('.conflict-sitrep').textContent,
        ) &&
        /Humanitarian impact/.test(
          document.querySelector('.conflict-sitrep').textContent,
        ),
    ),
  );
  await new Promise((resolve) => setTimeout(resolve, 1600));
  await page.screenshot({ path: path.join(output, 'sitrep-desktop.png') });
  await page.keyboard.press('Escape');
  check(
    'Escape closes SITREP and restores directory focus',
    await page.evaluate(
      () =>
        !window.__godsEyeView.conflictTracker.selectedId &&
        document.activeElement.dataset.conflictId === 'sudan',
    ),
  );
  await page.type('.conflict-search input', 'no-such-zone-xyz');
  check(
    'empty search has an actionable reset',
    await page.$eval('.conflict-empty', (element) =>
      /No matching/.test(element.textContent),
    ),
  );
  await page.click('[data-reset-filters]');
  await page.select(
    'select[aria-label="Filter conflicts by region"]',
    'Americas',
  );
  check(
    'region filter changes directory and marker cohort',
    await page.evaluate(
      () =>
        window.__godsEyeView.conflictTracker.getState().filteredCount === 3 &&
        [...document.querySelectorAll('[data-conflict-id]')].every((element) =>
          /Americas/i.test(element.textContent),
        ),
    ),
  );
  await page.select('select[aria-label="Filter conflicts by region"]', 'all');
  await page.focus('.conflict-search input');
  await page.keyboard.type('Ukraine');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  check(
    'keyboard search → result → SITREP works',
    await page.evaluate(
      () => window.__godsEyeView.conflictTracker.selectedId === 'ukraine',
    ),
  );
  await page.click('.conflict-close');
  await page.$eval('.conflict-search input', (element) => {
    element.value = '';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const layout = () =>
    page.evaluate(() => {
      const bounds = (selector) => {
        const r = document.querySelector(selector).getBoundingClientRect();
        return {
          left: r.left,
          right: r.right,
          top: r.top,
          bottom: r.bottom,
          height: r.height,
        };
      };
      return {
        viewport: { width: innerWidth, height: innerHeight },
        directory: bounds('.conflict-directory'),
        footer: bounds('.conflict-directory__footer'),
        list: bounds('.conflict-list'),
        header: bounds('.experience-header'),
        scrollWidth: document.documentElement.scrollWidth,
      };
    });
  for (const [width, height] of [
    [1280, 633],
    [390, 844],
    [320, 568],
  ]) {
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.waitForFunction(
      () => document.documentElement.scrollWidth <= innerWidth,
    );
    const state = await layout();
    console.log('LAYOUT', JSON.stringify(state));
    check(
      `${width}×${height} directory and footer fit viewport`,
      state.directory.left >= 0 &&
        state.directory.right <= width &&
        state.footer.bottom <= state.directory.bottom + 1 &&
        state.directory.bottom <= height &&
        state.scrollWidth <= width,
    );
    check(
      `${width}×${height} directory remains scrollable and mode navigation visible`,
      state.list.height >= (width > 760 ? 145 : 65) &&
        state.header.bottom < state.directory.top + state.directory.height,
    );
    await page.screenshot({
      path: path.join(output, `conflicts-${width}.png`),
    });
    await page.click('[data-conflict-id="ukraine"]');
    await page.waitForFunction(
      () => window.__godsEyeView.conflictTracker.selectedId === 'ukraine',
    );
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector('.conflict-sitrep')).opacity ===
        '1',
    );
    check(
      `${width}×${height} report close button is accessible`,
      await page.$eval('.conflict-close', (element) => {
        const r = element.getBoundingClientRect();
        return (
          r.width > 0 &&
          r.height > 0 &&
          r.left >= 0 &&
          r.right <= innerWidth &&
          r.top >= 0 &&
          r.bottom <= innerHeight
        );
      }),
    );
    await page.screenshot({ path: path.join(output, `sitrep-${width}.png`) });
    await page.click('.conflict-close');
  }
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.click('[data-mode="explore"]');
  check(
    'Explore restores original control access',
    await page.evaluate(() =>
      [
        '#data-panel',
        '#scene-panel',
        '#pp-toggles',
        '#cctv-panel',
        '#control-panel',
        '#location-bar',
        '#global-context-panel',
      ].every((selector) => {
        const element = document.querySelector(selector);
        return element && getComputedStyle(element).display !== 'none';
      }),
    ),
  );
  await page.click('#control-panel-toggle');
  check(
    'original visual preset disclosure works',
    await page.$eval(
      '#control-panel-toggle',
      (element) => element.getAttribute('aria-expanded') === 'true',
    ),
  );
  await page.click('#control-panel-toggle');
  await new Promise((resolve) => setTimeout(resolve, 1300));
  const preferencesBefore = await page.evaluate(() =>
    JSON.stringify({ ...localStorage }),
  );
  const cameraBefore = await page.evaluate(() => {
    const p = window.__godsEyeView.viewer.camera.positionWC;
    return [p.x, p.y, p.z];
  });
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' },
  ]);
  await page.click('[data-mode="conflicts"]');
  await page.click('[data-conflict-id="ukraine"]');
  check(
    'reduced-motion report disables animation',
    await page.$eval(
      '.conflict-sitrep',
      (element) => getComputedStyle(element).animationName === 'none',
    ),
  );
  await page.click('[data-mode="explore"]');
  const cameraAfter = await page.evaluate(() => {
    const p = window.__godsEyeView.viewer.camera.positionWC;
    return [p.x, p.y, p.z];
  });
  check(
    'mode round trip restores camera',
    Math.hypot(
      ...cameraAfter.map((value, index) => value - cameraBefore[index]),
    ) < 1,
  );
  check(
    'mode round trip preserves persisted preferences',
    preferencesBefore ===
      (await page.evaluate(() => JSON.stringify({ ...localStorage }))),
  );
  await page.click('[data-mode="conflicts"]');
  await page.evaluate(() => window.__godsEyeView.styleManager.setOrbit(true));
  await page.click('[data-conflict-id="sudan"]');
  check(
    'SITREP navigation takes authority back from orbit',
    await page.evaluate(
      () => !window.__godsEyeView.styleManager.orbitController.active,
    ),
  );
  await page.evaluate(() => window.__godsEyeView.conflictTracker.destroy());
  check(
    'tracker teardown removes map data and panels',
    await page.evaluate(
      () =>
        !document.querySelector('.conflict-tracker') &&
        !window.__godsEyeView.conflictTracker.isActive &&
        !Array.from(
          { length: window.__godsEyeView.viewer.dataSources.length },
          (_, index) => window.__godsEyeView.viewer.dataSources.get(index),
        ).some((source) => source.name.startsWith('conflict-tracker-')),
    ),
  );
  const fallbackPage = await browser.newPage();
  fallbackPage.on('pageerror', (error) => errors.push(error.message));
  await fallbackPage.setViewport({ width: 1280, height: 800 });
  await fallbackPage.evaluateOnNewDocument(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/i.test(type) ? null : original.call(this, type, ...args);
    };
  });
  await fallbackPage.goto(process.env.QA_BASE_URL || 'http://127.0.0.1:4173', {
    waitUntil: 'domcontentloaded',
  });
  await fallbackPage.waitForSelector(
    '.conflict-tracker--mapless:not([hidden])',
  );
  check(
    'WebGL failure retains the complete briefing directory',
    await fallbackPage.$$eval(
      '[data-conflict-id]',
      (items) => items.length === 28,
    ),
  );
  await fallbackPage.click('[data-conflict-id="ukraine"]');
  await fallbackPage.waitForFunction(
    () =>
      getComputedStyle(document.querySelector('.conflict-sitrep')).opacity ===
      '1',
  );
  check(
    'WebGL failure still opens sourced SITREPs',
    await fallbackPage.$eval(
      '.conflict-sitrep',
      (element) =>
        !element.hidden &&
        /Russia–Ukraine/.test(element.textContent) &&
        element.querySelectorAll('.conflict-sources a').length > 0,
    ),
  );
  await fallbackPage.screenshot({
    path: path.join(output, 'webgl-fallback.png'),
  });
  check(
    'mapless view clearly identifies unavailable globe and offers retry',
    await fallbackPage.$eval(
      '.conflict-map-caption',
      (element) =>
        /globe unavailable/i.test(element.textContent) &&
        Boolean(element.querySelector('button')),
    ),
  );
  check('no uncaught browser errors', errors.length === 0);
  await fs.writeFile(
    path.join(output, 'verification.json'),
    JSON.stringify({ results, errors }, null, 2),
  );
  assert.ok(
    results.every((result) => result.passed),
    'One or more browser checks failed',
  );
} finally {
  await browser.close();
}
