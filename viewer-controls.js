window.attachViewerControls = function(stage, img, dialog) {
  let scale = 1, x = 0, y = 0, pointer = null, lastX = 0, lastY = 0;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  function paint() {
    const width = stage.clientWidth, height = stage.clientHeight;
    const ratio = Number(img.dataset.ratio) || 1;
    const fitWidth = Math.min(width, height * ratio), fitHeight = fitWidth / ratio;
    const limitX = Math.max(0, (fitWidth * scale - width) / 2);
    const limitY = Math.max(0, (fitHeight * scale - height) / 2);
    x = clamp(x, -limitX, limitX); y = clamp(y, -limitY, limitY);
    img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }
  function finish() {
    const id = pointer; pointer = null;
    stage.classList.remove('panning');
    if (id !== null && stage.hasPointerCapture(id)) stage.releasePointerCapture(id);
  }
  function reset() { finish(); scale = 1; x = y = 0; paint(); }
  stage.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = stage.getBoundingClientRect();
    const px = e.clientX - rect.left - rect.width / 2;
    const py = e.clientY - rect.top - rect.height / 2;
    const delta = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? rect.height : 1);
    const next = clamp(scale * Math.exp(-clamp(delta, -500, 500) * .002), 1, 6);
    x = px - (px - x) * next / scale;
    y = py - (py - y) * next / scale;
    scale = next; paint();
  }, { passive: false });
  stage.addEventListener('pointerdown', e => {
    if (e.button !== 0 || !e.isPrimary || pointer !== null) return;
    e.preventDefault(); pointer = e.pointerId; lastX = e.clientX; lastY = e.clientY;
    stage.setPointerCapture(pointer); stage.classList.add('panning');
  });
  stage.addEventListener('pointermove', e => {
    if (e.pointerId !== pointer) return;
    if (e.pointerType === 'mouse' && !(e.buttons & 1)) { finish(); return; }
    x += e.clientX - lastX; y += e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY; paint();
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    stage.addEventListener(type, e => { if (e.pointerId === pointer) finish(); });
  }
  img.draggable = false;
  stage.addEventListener('dragstart', e => e.preventDefault());
  stage.addEventListener('dblclick', reset);
  window.addEventListener('blur', finish);
  window.addEventListener('resize', () => { if (dialog.open) paint(); });
  dialog.addEventListener('close', reset);
  return { reset };
};
