import test from 'node:test';
import assert from 'node:assert/strict';
import { createShadowMap } from '../src/shadowMap.js';
test('createShadowMap records size and binders', () => {
  const calls = [];
  const gl = {
    createTexture: () => ({ id: 'tex' }),
    createFramebuffer: () => ({ id: 'fbo' }),
    bindTexture: (...a) => calls.push(['bindTexture', ...a]),
    bindFramebuffer: (...a) => calls.push(['bindFramebuffer', ...a]),
    texImage2D() {}, texParameteri() {}, framebufferTexture2D() {},
    TEXTURE_2D: 1, FRAMEBUFFER: 2, DEPTH_COMPONENT24: 3, UNSIGNED_INT: 4,
    TEXTURE0: 10, COLOR_ATTACHMENT0: 20, DEPTH_ATTACHMENT: 30,
  };
  const sm = createShadowMap(gl, 256);
  assert.equal(sm.size, 256);
  assert.ok(sm.texture);
  assert.ok(sm.fbo);
  sm.bindForDepthPass();
  sm.bindForSampling(0);
  assert.ok(calls.length >= 2);
});
