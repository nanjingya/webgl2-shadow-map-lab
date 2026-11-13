const TEXTURE_MIN_FILTER = 0x2801;
const TEXTURE_MAG_FILTER = 0x2600;
const TEXTURE_WRAP_S = 0x2802;
const TEXTURE_WRAP_T = 0x2803;
const NEAREST = 0x2600;
const CLAMP_TO_EDGE = 0x812F;
const NONE = 0;

export function createShadowMap(gl, size) {
  const texture = gl.createTexture();
  const fbo = gl.createFramebuffer();

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.DEPTH_COMPONENT24,
    size,
    size,
    0,
    gl.DEPTH_COMPONENT,
    gl.UNSIGNED_INT,
    null,
  );
  gl.texParameteri(gl.TEXTURE_2D, TEXTURE_MIN_FILTER, gl.NEAREST ?? NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, TEXTURE_MAG_FILTER, gl.NEAREST ?? NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE ?? CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE ?? CLAMP_TO_EDGE);

  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.DEPTH_ATTACHMENT,
    gl.TEXTURE_2D,
    texture,
    0,
  );

  if (typeof gl.drawBuffers === 'function') {
    gl.drawBuffers([gl.NONE ?? NONE]);
  }
  if (typeof gl.checkFramebufferStatus === 'function') {
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== (gl.FRAMEBUFFER_COMPLETE ?? 0x8CD5)) {
      throw new Error(`Shadow framebuffer is incomplete: ${status}`);
    }
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);

  return {
    size,
    texture,
    fbo,
    bindForDepthPass() {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport?.(0, 0, size, size);
      gl.enable?.(gl.DEPTH_TEST ?? 0x0B71);
      gl.clear?.(gl.DEPTH_BUFFER_BIT ?? 0x00000100);
    },
    bindForSampling(unit = 0) {
      gl.activeTexture?.((gl.TEXTURE0 ?? 0x84C0) + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
    },
  };
}
