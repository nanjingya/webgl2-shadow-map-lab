import { render, setBias } from '../renderer.js';

export function bindControls({ state, els }) {
  const sync = () => {
    els.stats.textContent = `mapSize=${state.shadow.size} bias=${state.bias} lightY=${state.lightY}`;
    render(state);
  };

  els.bias.value = String(Math.round(state.bias * 10000));
  els.lightY.value = String(state.lightY);

  els.bias.addEventListener('input', () => {
    setBias(state, Number(els.bias.value));
    sync();
  });

  els.lightY.addEventListener('input', () => {
    state.lightY = Number(els.lightY.value);
    sync();
  });

  els.capture.addEventListener('click', () => {
    render(state);
    const url = els.canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shadow.png';
    link.click();
  });

  sync();
}
