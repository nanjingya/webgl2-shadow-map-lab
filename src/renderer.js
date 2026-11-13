import { createShadowMap } from './shadowMap.js';
import {
  lightViewProj,
  lookAt,
  multiply,
  perspective,
  resolveDepthBias,
  translation,
} from './math/shadowMath.js';
import { DEPTH_FRAG } from './shaders/depth.frag.js';
import { DEPTH_VERT } from './shaders/depth.vert.js';
import { MAIN_FRAG } from './shaders/main.frag.js';
import { MAIN_VERT } from './shaders/main.vert.js';

const FLOATS_PER_VERTEX = 6;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message || 'Shader compilation failed');
  }
  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(message || 'Program linking failed');
  }
  return program;
}

function getUniforms(gl, program, names) {
  return Object.fromEntries(names.map((name) => [
    name,
    gl.getUniformLocation(program, name),
  ]));
}

function createMesh(gl, vertices) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  return {
    buffer,
    vertexCount: vertices.length / FLOATS_PER_VERTEX,
  };
}

function createGroundMesh(gl) {
  return createMesh(gl, [
    -6, 0, -6, 0, 1, 0,
     6, 0, -6, 0, 1, 0,
    -6, 0,  6, 0, 1, 0,
    -6, 0,  6, 0, 1, 0,
     6, 0,  6, 0, 1, 0,
  ]);
}

function createCubeMesh(gl) {
  const faces = [
    { normal: [1, 0, 0], corners: [[1,-1,-1], [1, 1,-1], [1, 1, 1], [1,-1,-1], [1, 1, 1], [1,-1, 1]] },
    { normal: [-1, 0, 0], corners: [[-1,-1,1], [-1,1,1], [-1,1,-1], [-1,-1,1], [-1,1,-1], [-1,-1,-1]] },
    { normal: [0, 1, 0], corners: [[-1,1,-1], [-1,1,1], [1,1,1], [-1,1,-1], [1,1,1], [1,1,-1]] },
    { normal: [0,-1, 0], corners: [[-1,-1,1], [-1,-1,-1], [1,-1,-1], [-1,-1,1], [1,-1,-1], [1,-1,1]] },
    { normal: [0, 0, 1], corners: [[-1,-1,1], [1,-1,1], [1,1,1], [-1,-1,1], [1,1,1], [-1,1,1]] },
    { normal: [0, 0,-1], corners: [[1,-1,-1], [-1,-1,-1], [-1,1,-1], [1,-1,-1], [-1,1,-1], [1,1,-1]] },
  ];

  const vertices = faces.flatMap(({ normal, corners }) => corners.flatMap((position) => [
    position[0] * 0.75,
    position[1] * 0.75,
    position[2] * 0.75,
    ...normal,
  ]));
  return createMesh(gl, vertices);
}

function bindMesh(gl, mesh) {
  const stride = FLOATS_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT;
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
}

function drawDepthMesh(gl, mesh, model, uniforms, lightSpace) {
  bindMesh(gl, mesh);
  gl.uniformMatrix4fv(uniforms.uLightSpace, false, lightSpace);
  gl.uniformMatrix4fv(uniforms.uModel, false, model);
  gl.drawArrays(gl.TRIANGLES, 0, mesh.vertexCount);
}

function drawMainMesh(gl, mesh, model, uniforms, camera, light, shadowUnit) {
  bindMesh(gl, mesh);
  gl.uniformMatrix4fv(uniforms.uViewProj, false, camera.viewProj);
  gl.uniformMatrix4fv(uniforms.uModel, false, model);
  gl.uniformMatrix4fv(uniforms.uLightSpace, false, light.viewProj);
  gl.uniform1i(uniforms.uShadowMap, shadowUnit);
  gl.uniform3fv(uniforms.uLightDir, light.direction);
  gl.uniform3fv(uniforms.uBaseColor, mesh.color);
  gl.uniform1f(uniforms.uBias, camera.bias);
  gl.drawArrays(gl.TRIANGLES, 0, mesh.vertexCount);
}

export function init(canvas) {
  const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true });
  if (!gl) throw new Error('WebGL2 required');

  const depthProgram = createProgram(gl, DEPTH_VERT, DEPTH_FRAG);
  const mainProgram = createProgram(gl, MAIN_VERT, MAIN_FRAG);
  const shadow = createShadowMap(gl, 512);
  const ground = createGroundMesh(gl);
  const cube = createCubeMesh(gl);
  ground.color = new Float32Array([0.38, 0.48, 0.42]);
  cube.color = new Float32Array([0.78, 0.42, 0.24]);

  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);

  return {
    gl,
    shadow,
    depthProgram,
    mainProgram,
    depthUniforms: getUniforms(gl, depthProgram, ['uLightSpace', 'uModel']),
    mainUniforms: getUniforms(gl, mainProgram, [
      'uViewProj', 'uModel', 'uLightSpace', 'uShadowMap',
      'uLightDir', 'uBaseColor', 'uBias',
    ]),
    meshes: {
      ground,
      cube,
    },
    models: {
      ground: translation(0, 0, 0),
      cube: translation(0, 0.75, 0),
    },
    cameraPosition: [5, 4.5, 7],
    lightY: 8,
    bias: resolveDepthBias(10),
  };
}

export function render(state) {
  const {
    gl, shadow, depthProgram, mainProgram,
    depthUniforms, mainUniforms, meshes, models,
  } = state;
  const lightPosition = [5, state.lightY, 5];
  const target = [0, 0.5, 0];
  const lightViewProjMatrix = lightViewProj(lightPosition, target);
  const view = lookAt(state.cameraPosition, target);
  const projection = perspective(
    Math.PI / 4,
    gl.canvas.width / gl.canvas.height,
    0.1,
    50,
  );
  const light = {
    position: lightPosition,
    target,
    viewProj: lightViewProjMatrix,
    direction: normalize3([
      target[0] - lightPosition[0],
      target[1] - lightPosition[1],
      target[2] - lightPosition[2],
    ]),
  };
  const camera = {
    viewProj: multiply(projection, view),
    bias: state.bias,
  };

  gl.useProgram(depthProgram);
  shadow.bindForDepthPass();
  drawDepthMesh(gl, meshes.ground, models.ground, depthUniforms, light.viewProj);
  drawDepthMesh(gl, meshes.cube, models.cube, depthUniforms, light.viewProj);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.05, 0.06, 0.09, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);

  gl.useProgram(mainProgram);
  shadow.bindForSampling(0);
  drawMainMesh(gl, meshes.ground, models.ground, mainUniforms, camera, light, 0);
  drawMainMesh(gl, meshes.cube, models.cube, mainUniforms, camera, light, 0);
}

export function setBias(state, uiBias) {
  state.bias = resolveDepthBias(uiBias);
}

function normalize3(v) {
  const length = Math.hypot(v[0], v[1], v[2]) || 1;
  return new Float32Array([v[0] / length, v[1] / length, v[2] / length]);
}
