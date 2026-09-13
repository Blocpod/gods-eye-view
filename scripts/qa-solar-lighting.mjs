#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import sharp from 'sharp';

const output = path.resolve(process.env.QA_SHOTS_DIR || 'output/solar');
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
const check = (name, passed, detail) => {
  checks.push({ name, passed, detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
  assert.ok(passed, name);
};
try {
  const page = await browser.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(
    `${process.env.QA_BASE_URL || 'http://127.0.0.1:4173'}/?welcome=0`,
    { waitUntil: 'domcontentloaded' },
  );
  await page.waitForFunction(() => window.__godsEyeView);
  const setup = await page.evaluate(async () => {
    const cesiumUrl = performance
      .getEntriesByType('resource')
      .find((entry) => /\/cesium\.js\?/.test(entry.name))?.name;
    if (!cesiumUrl) throw new Error('Loaded Cesium module URL not found');
    const C = await import(cesiumUrl);
    window.__solarCesium = C;
    const { viewer } = window.__godsEyeView;
    return {
      offset: Math.abs(
        C.JulianDate.toDate(viewer.clock.currentTime).getTime() - Date.now(),
      ),
      systemClock: viewer.clock.clockStep === C.ClockStep.SYSTEM_CLOCK,
      live:
        viewer.clock.shouldAnimate &&
        !viewer.allowDataSourcesToSuspendAnimation,
      globe:
        viewer.scene.globe.enableLighting &&
        viewer.scene.globe.dynamicAtmosphereLightingFromSun,
      atmosphere:
        viewer.scene.atmosphere.dynamicLighting ===
        C.DynamicAtmosphereLightingType.SUNLIGHT,
      sun: viewer.scene.light instanceof C.SunLight,
    };
  });
  check(
    'lighting follows current UTC within two seconds',
    setup.offset < 2000 && setup.systemClock,
    setup,
  );
  check(
    'Sun drives both surface and atmosphere without data-loading clock suspension',
    setup.live && setup.globe && setup.atmosphere && setup.sun,
  );
  await page.evaluate(() => {
    document.body.classList.add('ui-clean-view');
    const C = window.__solarCesium;
    const { viewer } = window.__godsEyeView;
    viewer.camera.setView({
      destination: C.Cartesian3.fromDegrees(0, 5, 19000000),
      orientation: { heading: 0, pitch: -Math.PI / 2, roll: 0 },
    });
  });
  await page
    .waitForFunction(
      () => window.__godsEyeView.viewer.scene.globe.tilesLoaded,
      { timeout: 15000 },
    )
    .catch(() => {});
  const frame = async (iso) =>
    page.evaluate(async (value) => {
      const C = window.__solarCesium;
      const { viewer } = window.__godsEyeView;
      viewer.clock.currentTime = C.JulianDate.fromIso8601(value);
      viewer.clock.shouldAnimate = false;
      await new Promise((resolve) => {
        const off = viewer.scene.postRender.addEventListener(() => {
          off();
          resolve();
        });
        viewer.scene.requestRender();
      });
      const p = viewer.scene.context.uniformState.sunDirectionWC;
      return {
        lat: (Math.asin(p.z) * 180) / Math.PI,
        lon: (Math.atan2(p.y, p.x) * 180) / Math.PI,
      };
    }, iso);
  const noon = await frame('2026-03-20T12:00:00Z');
  check(
    'equinox noon Sun is over the equator near Greenwich',
    Math.abs(noon.lat) < 1 && Math.abs(noon.lon) < 3,
    noon,
  );
  const noonImage = await page.screenshot({
    path: path.join(output, 'equinox-noon.png'),
  });
  const midnight = await frame('2026-03-21T00:00:00Z');
  check(
    'twelve hours later the Sun moves to the opposite hemisphere',
    Math.abs(midnight.lat) < 1 && Math.abs(midnight.lon) > 177,
    midnight,
  );
  const nightImage = await page.screenshot({
    path: path.join(output, 'equinox-midnight.png'),
  });
  const luminance = async (buffer) => {
    const pixels = await sharp(buffer)
      .extract({ left: 700, top: 430, width: 40, height: 40 })
      .removeAlpha()
      .raw()
      .toBuffer();
    let value = 0;
    for (let index = 0; index < pixels.length; index += 3)
      value +=
        pixels[index] * 0.2126 +
        pixels[index + 1] * 0.7152 +
        pixels[index + 2] * 0.0722;
    return value / (pixels.length / 3);
  };
  const day = await luminance(noonImage),
    night = await luminance(nightImage);
  check(
    'rendered terrain becomes substantially darker at night',
    day > 30 && night < day * 0.55,
    { day, night },
  );
  const june = await frame('2026-06-21T12:00:00Z');
  const december = await frame('2026-12-21T12:00:00Z');
  check(
    'seasonal Sun latitude follows Earth axial tilt',
    Math.abs(june.lat - 23.44) < 0.5 && Math.abs(december.lat + 23.44) < 0.5,
    { june, december },
  );
  const restored = await page.evaluate(async () => {
    const C = window.__solarCesium;
    const { viewer } = window.__godsEyeView;
    viewer.clock.clockStep = C.ClockStep.SYSTEM_CLOCK;
    viewer.camera.setView({
      destination: C.Cartesian3.fromDegrees(18, 18, 19000000),
      orientation: { heading: 0, pitch: -Math.PI / 2, roll: 0 },
    });
    await new Promise((resolve) => {
      const off = viewer.scene.postRender.addEventListener(() => {
        off();
        resolve();
      });
      viewer.scene.requestRender();
    });
    return {
      offset: Math.abs(
        C.JulianDate.toDate(viewer.clock.currentTime).getTime() - Date.now(),
      ),
      maxDelta: viewer.scene.maximumRenderTimeChange === Infinity,
      holds: window.__godsEyeView.getRenderGovernorDiagnostics().holds,
    };
  });
  check(
    'live time resumes immediately and lighting does not acquire a continuous render hold',
    restored.offset < 2000 &&
      restored.maxDelta &&
      !restored.holds.some((hold) => /solar|lighting|sun/.test(hold)),
    restored,
  );
  await page.screenshot({ path: path.join(output, 'current-earth.png') });
  await page.evaluate(() => document.body.classList.remove('ui-clean-view'));
  await page.click('[data-mode="conflicts"]');
  await page.waitForFunction(
    () => window.__godsEyeView.conflictTracker.isActive,
  );
  check(
    'Conflict Tracker retains real-time lighting',
    await page.evaluate(
      () =>
        window.__godsEyeView.viewer.scene.globe.enableLighting &&
        window.__godsEyeView.viewer.clock.shouldAnimate,
    ),
  );
  check('no browser runtime errors', errors.length === 0, errors);
} finally {
  await fs.writeFile(
    path.join(output, 'verification.json'),
    JSON.stringify({ checks, errors }, null, 2),
  );
  await browser.close();
}
