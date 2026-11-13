export function createShadowMap(gl, size) {
  return { size, texture: null, fbo: null, bindForDepthPass() {}, bindForSampling(unit=0) {} };
}
