import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDepthBias, isOccluded, lightViewProj } from '../src/math/shadowMath.js';
test('resolveDepthBias scales ui value', () => {
  assert.equal(resolveDepthBias(10), 0.001);
  assert.equal(resolveDepthBias(0), 0);
});
test('isOccluded uses bias', () => {
  assert.equal(isOccluded(0.40, 0.41, 0.02), false);
  assert.equal(isOccluded(0.40, 0.45, 0.02), true);
});
test('lightViewProj returns 16 numbers', () => {
  const m = lightViewProj([5,8,5], [0,0,0]);
  assert.equal(m.length, 16);
  assert.ok(m.some(v => v !== 0));
});
