function installMatchMouseControls(canvas, actions) {
  let pointerType = 'mouse';
  let leftHeld = false;

  function endPunch(cancel) {
    if (!leftHeld) return;
    leftHeld = false;
    actions.punchEnd(cancel);
  }

  // Mouse events report both buttons independently, including presses during a charge.
  canvas.addEventListener('pointerdown', event => {
    pointerType = event.pointerType;
  });
  canvas.addEventListener('mousedown', event => {
    if (pointerType !== 'mouse' || event.sourceCapabilities?.firesTouchEvents || !actions.isPlaying()) return;
    if (event.button === 0 && !leftHeld) {
      event.preventDefault();
      leftHeld = true;
      actions.punchStart();
    } else if (event.button === 2) {
      event.preventDefault();
      actions.item();
    }
  });
  window.addEventListener('mouseup', event => {
    if (event.button !== 0) return;
    endPunch(!actions.isPlaying());
  }, { capture: true });
  canvas.addEventListener('pointercancel', () => endPunch(true));
  canvas.addEventListener('contextmenu', event => {
    if (actions.isPlaying()) event.preventDefault();
  });
  window.addEventListener('blur', () => endPunch(true));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) endPunch(true);
  });
  return () => endPunch(true);
}
