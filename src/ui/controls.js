export function bindControls({ state, render, els }) {
  const sync = () => {
    els.stats.textContent = `mapSize=${state.shadow.size} bias=${state.bias} lightY=${state.lightY}`;
    render(state);
  };
  els.bias.oninput = () => { state.bias = Number(els.bias.value)/10000; sync(); };
  els.lightY.oninput = () => { state.lightY = Number(els.lightY.value); sync(); };
  els.capture.onclick = () => {
    const url = els.canvas.toDataURL('image/png');
    const a = document.createElement('a'); a.href=url; a.download='shadow.png'; a.click();
  };
  sync();
}
