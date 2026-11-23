export function createMagnifiers(panel, getState) {
  const clamp = value => Math.max(-1, Math.min(1, value));
  let drag = null;

  function measure(lens) {
    const image = lens.querySelector('img');
    const zoom = getState().zoom[lens.dataset.lensPhoto] || 1;
    const width = lens.clientWidth, height = lens.clientHeight;
    const fit = image.naturalWidth ? Math.min(width / image.naturalWidth, height / image.naturalHeight) : 0;
    // Bound the actual photograph, excluding object-fit's empty margins.
    return {
      image, zoom,
      x: Math.max(0, (image.naturalWidth * fit * zoom - width) / 2),
      y: Math.max(0, (image.naturalHeight * fit * zoom - height) / 2)
    };
  }

  function paint(lens) {
    const bounds = measure(lens);
    const state = getState();
    const id = lens.dataset.lensPhoto;
    if (bounds.zoom === 1) state.pan[id] = { x: 0, y: 0 };
    const pan = state.pan[id] || { x: 0, y: 0 };
    bounds.image.style.transform = 'translate(' + (clamp(pan.x) * bounds.x) + 'px,' + (clamp(pan.y) * bounds.y) + 'px) scale(' + bounds.zoom + ')';
    lens.classList.toggle('is-zoomed', bounds.zoom > 1);
    lens.tabIndex = bounds.zoom > 1 ? 0 : -1;
  }

  function move(lens, dx, dy) {
    const bounds = measure(lens);
    const state = getState(), id = lens.dataset.lensPhoto;
    const pan = state.pan[id] || { x: 0, y: 0 };
    // Normalised positions survive resizing and switching between card tabs.
    state.pan[id] = {
      x: bounds.x ? clamp(pan.x + dx / bounds.x) : 0,
      y: bounds.y ? clamp(pan.y + dy / bounds.y) : 0
    };
    paint(lens);
  }

  function stop() {
    if (!drag) return;
    const { lens, pointerId } = drag;
    drag = null;
    lens.classList.remove('is-dragging');
    if (lens.hasPointerCapture(pointerId)) lens.releasePointerCapture(pointerId);
  }

  panel.addEventListener('pointerdown', event => {
    const lens = event.target.closest('[data-lens-photo]');
    if (!lens || drag || !event.isPrimary || event.button !== 0 || measure(lens).zoom <= 1) return;
    event.preventDefault();
    lens.focus({ preventScroll: true });
    lens.setPointerCapture(event.pointerId);
    lens.classList.add('is-dragging');
    drag = { lens, pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  });
  panel.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const { lens } = drag, rect = lens.getBoundingClientRect();
    // The live back of the card is scaled by the 3D renderer.
    const scaleX = rect.width / lens.clientWidth, scaleY = rect.height / lens.clientHeight;
    if (scaleX && scaleY) move(lens, (event.clientX - drag.x) / scaleX, (event.clientY - drag.y) / scaleY);
    drag.x = event.clientX;
    drag.y = event.clientY;
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    panel.addEventListener(type, event => {
      if (drag?.pointerId === event.pointerId) stop();
    });
  }
  window.addEventListener('blur', stop);
  panel.addEventListener('keydown', event => {
    const lens = event.target.closest('[data-lens-photo]');
    if (!lens || measure(lens).zoom <= 1) return;
    const steps = { ArrowLeft: [32, 0], ArrowRight: [-32, 0], ArrowUp: [0, 32], ArrowDown: [0, -32] };
    if (steps[event.key]) {
      event.preventDefault();
      move(lens, ...steps[event.key]);
    } else if (event.key === 'Home') {
      event.preventDefault();
      getState().pan[lens.dataset.lensPhoto] = { x: 0, y: 0 };
      paint(lens);
    }
  });
  panel.addEventListener('load', event => {
    const lens = event.target.closest('[data-lens-photo]');
    if (lens) paint(lens);
  }, true);

  const observer = new ResizeObserver(entries => entries.forEach(({ target }) => paint(target)));
  return {
    stop,
    refresh() {
      stop();
      observer.disconnect();
      panel.querySelectorAll('[data-lens-photo]').forEach(lens => { paint(lens); observer.observe(lens); });
    },
    update(id) {
      stop();
      const lens = panel.querySelector('[data-lens-photo="' + id + '"]');
      if (lens) paint(lens);
    }
  };
}
