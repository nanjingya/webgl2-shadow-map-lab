import { init, setBias } from './renderer.js';
import { bindControls } from './ui/controls.js';
const canvas = document.querySelector('#glcanvas');
const status = document.querySelector('#status');
try {
  const state = init(canvas);
  setBias(state, 10);
  bindControls({ state, els: {
    canvas, status,
    stats: document.querySelector('#stats'),
    bias: document.querySelector('#bias'),
    lightY: document.querySelector('#lightY'),
    capture: document.querySelector('#btn-capture'),
  }});
  status.textContent = 'ready';
} catch (e) { status.textContent = String(e.message || e); }
