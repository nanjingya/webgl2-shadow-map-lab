import { createShadowMap } from './shadowMap.js';
import { resolveDepthBias } from './math/shadowMath.js';
export function init(canvas) {
  const gl = canvas.getContext('webgl2');
  if (!gl) throw new Error('WebGL2 required');
  const shadow = createShadowMap(gl, 512);
  return { gl, shadow, bias: 0.001, lightY: 8 };
}
export function render(state) {
  const { gl } = state;
  gl.viewport(0,0,gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.05,0.06,0.09,1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
export function setBias(state, uiBias) { state.bias = resolveDepthBias(uiBias); }
