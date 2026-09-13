import test from 'node:test';
import assert from 'node:assert/strict';
import { installSolarRefresh } from './solarRefresh.js';

test('solar refresh is bounded while idle, pauses hidden, catches up on resume and disposes', (t) => {
  t.mock.timers.enable({ apis: ['setInterval'] });
  const documentRef = new EventTarget();
  documentRef.hidden = false;
  let frames = 0;
  let viewerDestroyed = false;
  const stop = installSolarRefresh({
    viewer: {
      isDestroyed: () => viewerDestroyed,
      scene: { requestRender: () => frames++ },
    },
    documentRef,
  });
  assert.equal(frames, 1);
  t.mock.timers.tick(9999);
  assert.equal(frames, 1);
  t.mock.timers.tick(1);
  assert.equal(frames, 2);
  documentRef.hidden = true;
  documentRef.dispatchEvent(new Event('visibilitychange'));
  t.mock.timers.tick(30000);
  assert.equal(frames, 2);
  documentRef.hidden = false;
  documentRef.dispatchEvent(new Event('visibilitychange'));
  assert.equal(frames, 3);
  viewerDestroyed = true;
  t.mock.timers.tick(10000);
  assert.equal(frames, 3);
  viewerDestroyed = false;
  stop();
  stop();
  t.mock.timers.tick(30000);
  documentRef.dispatchEvent(new Event('visibilitychange'));
  assert.equal(frames, 3);
});
