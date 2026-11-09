/* Particles, adapted from the user-supplied Bencho component (MIT).
   Original source and licence: https://bencho.dev/licence
   This portfolio adapter distributes a field across the entire viewport.
   It preserves pointer repulsion, spring return and the click shockwave,
   without shape silhouettes or an artificial animation frame-rate limit. */

/* ── STRETCHED BY SPEED ──────────────────────────────────
   A dot at rest is round; a moving one is drawn a little long
   along the way it is going, which is what makes a burst read
   as a splash rather than a scatter of points. */

const TAU = Math.PI * 2;
const MAX_DOTS = 4800;
const MAX_PIXELS = 2500000;
const STRENGTH = 6.6;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function initParticleBackground(canvas) {
  const noop = { pulse() {}, setPaused() {}, destroy() {} };
  if (!canvas) return noop;
  const context = canvas.getContext('2d');
  if (!context) return noop;

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const colorScheme = matchMedia('(prefers-color-scheme: dark)');
  let still = motion.matches;
  let destroyed = false;
  let paused = false;
  let modalOpen = false;
  let pendingPaint = false;
  let raf = 0;
  let previousFrame = null;
  let rawHand = null;
  let gesture = null;
  let color = getComputedStyle(canvas).color || '#8aabac';
  let cssWidth = 0;
  let cssHeight = 0;
  let canvasLeft = 0;
  let canvasTop = 0;
  let reach = 120;
  let radius = 1.7;
  let dots = [];
  const cleanups = [];
  const hoverIgnored = 'input,select,textarea,[contenteditable],dialog,[role="dialog"]';
  const clickIgnored = 'a,button,input,select,textarea,label,[contenteditable],dialog,[role="dialog"],.card,[data-particle-ignore]';
  const blocked = (target, selector) => target instanceof Element && !!target.closest(selector);
  const isSuspended = () => destroyed || modalOpen || document.hidden;
  const isPaused = () => paused || isSuspended();

  function listen(target, name, callback, options) {
    target.addEventListener(name, callback, options);
    cleanups.push(() => target.removeEventListener(name, callback, options));
  }

  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
    previousFrame = null;
  }

  function buildField(width, height) {
    // A lightly jittered hex grid fills every viewport region, including a
    // two-row bleed outside its edges. Density is bounded on large displays.
    const bleed = 60;
    let spacing = width < 800 ? 26 : 30;
    const dimensions = () => ({
      rows: Math.ceil((height + bleed * 2) / (spacing * Math.sqrt(3) / 2)) + 1,
      columns: Math.ceil((width + bleed * 2) / spacing) + 1,
    });
    let grid = dimensions();
    while (grid.rows * grid.columns > MAX_DOTS) {
      spacing *= 1.04;
      grid = dimensions();
    }
    const rowHeight = spacing * Math.sqrt(3) / 2;
    dots = [];
    for (let row = 0; row < grid.rows; row++) {
      for (let column = 0; column < grid.columns; column++) {
        const seed = (Math.imul(row + 1, 374761393) ^ Math.imul(column + 1, 668265263)) >>> 0;
        const jitterX = ((seed & 255) / 255 - 0.5) * 3.4;
        const jitterY = (((seed >>> 8) & 255) / 255 - 0.5) * 3.4;
        const x = -bleed + column * spacing + (row % 2) * spacing / 2 + jitterX;
        const y = -bleed + row * rowHeight + jitterY;
        dots.push({ hx: x, hy: y, x, y, vx: 0, vy: 0 });
      }
    }
  }

  function draw() {
    context.setTransform(canvas.width / cssWidth, 0, 0, canvas.height / cssHeight, 0, 0);
    context.clearRect(0, 0, cssWidth, cssHeight);
    context.fillStyle = color;
    context.beginPath();
    for (const dot of dots) {
      if (dot.x < -8 || dot.x > cssWidth + 8 || dot.y < -8 || dot.y > cssHeight + 8) continue;
      const speedSquared = dot.vx * dot.vx + dot.vy * dot.vy;
      if (speedSquared < 0.09) {
        context.moveTo(dot.x + radius, dot.y);
        context.arc(dot.x, dot.y, radius, 0, TAU);
      } else {
        /* long along its path, a little thin across it */
        const speed = Math.sqrt(speedSquared);
        const stretch = Math.min(2.6, 1 + speed * 0.12);
        const rotation = Math.atan2(dot.vy, dot.vx);
        context.moveTo(dot.x + (dot.vx / speed) * radius * stretch, dot.y + (dot.vy / speed) * radius * stretch);
        context.ellipse(dot.x, dot.y, radius * stretch, radius / Math.sqrt(stretch), rotation, 0, TAU);
      }
    }
    context.fill();
  }

  function step(dt, hand) {
    const damping = Math.pow(0.84, dt);
    const reachSquared = reach * reach;
    let busy = false;
    for (const dot of dots) {
      let pushX = 0, pushY = 0;
      if (hand) {
        const dx = dot.x - hand.x;
        const dy = dot.y - hand.y;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < reachSquared && distanceSquared > 0.0001) {
          const distance = Math.sqrt(distanceSquared);
          const fraction = 1 - distance / reach;
          const force = fraction * fraction * STRENGTH;
          pushX = (dx / distance) * force;
          pushY = (dy / distance) * force;
        }
      }
      if (!pushX && !pushY && dot.vx === 0 && dot.vy === 0 && dot.x === dot.hx && dot.y === dot.hy) continue;
      const ax = pushX + (dot.hx - dot.x) * 0.05;
      const ay = pushY + (dot.hy - dot.y) * 0.05;
      dot.vx = (dot.vx + ax * dt) * damping;
      dot.vy = (dot.vy + ay * dt) * damping;
      dot.x += dot.vx * dt;
      dot.y += dot.vy * dt;
      if (!pushX && !pushY && Math.abs(dot.hx - dot.x) < 0.05 && Math.abs(dot.hy - dot.y) < 0.05 && Math.abs(dot.vx) < 0.02 && Math.abs(dot.vy) < 0.02) {
        dot.x = dot.hx; dot.y = dot.hy; dot.vx = 0; dot.vy = 0;
      } else if ((pushX || pushY) && Math.abs(dot.vx) < 0.02 && Math.abs(dot.vy) < 0.02 && Math.abs(ax) < 0.01 && Math.abs(ay) < 0.01) {
        // A stationary pointer can settle at a displaced equilibrium and sleep.
        dot.vx = 0; dot.vy = 0;
      } else busy = true;
    }
    return busy;
  }

  /* Frames, not milliseconds. Time is expressed in sixtieths of
     a second and the damping is RAISED to it rather than
     multiplied by it, so a dropped frame decays the same amount
     of energy as the two frames it replaced. Multiplying is the
     version that makes a spring behave differently on a busy
     page, which is the hardest kind of bug to see.

     The loop parks itself the moment the value has settled. */
  function tick(now) {
    raf = 0;
    if (isSuspended() || (paused && !pendingPaint)) return;
    // The 60Hz reference converts physics units only. Every native RAF paints;
    // there is no deadline, frame skipping, timeout or refresh-rate cap.
    const elapsed = previousFrame === null ? 1 : clamp((now - previousFrame) / (1000 / 60), 0, 2.5);
    previousFrame = now;
    const hand = rawHand ? { x: rawHand.x - canvasLeft, y: rawHand.y - canvasTop } : null;
    let busy = false;
    if (!still && !paused) {
      // Substeps prevent a delayed frame destabilising the spring without
      // performing extra paints or an unbounded catch-up loop.
      const steps = Math.max(1, Math.ceil(elapsed));
      const dt = elapsed / steps;
      for (let i = 0; i < steps; i++) busy = step(dt, hand);
    }
    pendingPaint = false;
    draw();
    if (busy) raf = requestAnimationFrame(tick);
  }

  function wake(redraw = false) {
    if (redraw) pendingPaint = true;
    if (raf || isSuspended() || (paused && !pendingPaint)) return;
    previousFrame = null;
    raf = requestAnimationFrame(tick);
  }

  function release() {
    if (!rawHand) return;
    rawHand = null;
    wake();
  }

  function pulse(point = { x: cssWidth / 2, y: cssHeight / 2 }) {
    if (still || isPaused()) return;
    /* the shockwave */
    const burstRadius = cssWidth < 800 ? 180 : 260;
    const burstSquared = burstRadius * burstRadius;
    for (const dot of dots) {
      const dx = dot.x - point.x;
      const dy = dot.y - point.y;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared > burstSquared || distanceSquared < 0.0001) continue;
      const distance = Math.sqrt(distanceSquared);
      const force = (1 - distance / burstRadius) * 30 * 1.12;
      dot.vx += (dx / distance) * force;
      dot.vy += (dy / distance) * force;
    }
    wake();
  }

  function resize() {
    if (destroyed) return;
    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(1, bounds.width || innerWidth);
    const height = Math.max(1, bounds.height || innerHeight);
    const dpr = Math.min(1.5, devicePixelRatio || 1, Math.sqrt(MAX_PIXELS / (width * height)));
    const backingWidth = Math.max(1, Math.round(width * dpr));
    const backingHeight = Math.max(1, Math.round(height * dpr));
    canvasLeft = bounds.left;
    canvasTop = bounds.top;
    if (width === cssWidth && height === cssHeight && canvas.width === backingWidth && canvas.height === backingHeight) return;
    const geometryChanged = width !== cssWidth || height !== cssHeight;
    cssWidth = width;
    cssHeight = height;
    reach = width < 800 ? 96 : 120;
    radius = width < 800 ? 1.55 : 1.7;
    canvas.width = backingWidth;
    canvas.height = backingHeight;
    if (geometryChanged) buildField(width, height);
    rawHand = null;
    wake(true);
  }

  function refreshColor() {
    color = getComputedStyle(canvas).color || '#8aabac';
    wake(true);
  }

  function syncModal() {
    modalOpen = !!document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]');
    if (modalOpen) { rawHand = null; gesture = null; stop(); }
    else wake();
  }

  listen(document, 'pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || blocked(event.target, clickIgnored) || isPaused()) { gesture = null; return; }
    gesture = { x: event.clientX, y: event.clientY, id: event.pointerId, at: performance.now(), moved: false };
    if (event.pointerType !== 'mouse' && !still) {
      rawHand = { x: event.clientX, y: event.clientY };
      wake();
    }
  }, { passive: true });

  listen(document, 'pointermove', event => {
    if (gesture && event.pointerId === gesture.id && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 8) gesture.moved = true;
    if (still || isPaused() || blocked(event.target, hoverIgnored)) { release(); return; }
    if (event.pointerType !== 'mouse' && (!gesture || event.buttons === 0)) return;
    // Coalesce events into the latest sample. Card and text hover intentionally
    // reaches the field; no listener captures or cancels foreground interaction.
    if (rawHand && rawHand.x === event.clientX && rawHand.y === event.clientY) return;
    rawHand = { x: event.clientX, y: event.clientY };
    wake();
  }, { passive: true });

  listen(document, 'pointerup', event => { if (event.pointerType !== 'mouse') release(); }, { passive: true });
  listen(document, 'pointercancel', () => { gesture = null; release(); }, { passive: true });
  listen(document, 'pointerout', event => { if (!event.relatedTarget) release(); }, { passive: true });
  listen(window, 'blur', () => { gesture = null; release(); });
  listen(window, 'scroll', () => { if (gesture) gesture.moved = true; release(); }, { passive: true });
  listen(document, 'click', event => {
    const tap = gesture;
    gesture = null;
    if (!tap || tap.moved || performance.now() - tap.at > 700 || event.button !== 0 || blocked(event.target, clickIgnored) || isPaused()) return;
    pulse({ x: event.clientX - canvasLeft, y: event.clientY - canvasTop });
  }, { passive: true });

  listen(document, 'visibilitychange', () => {
    if (document.hidden) { rawHand = null; gesture = null; stop(); }
    else { resize(); wake(); }
  });
  listen(window, 'resize', resize, { passive: true });
  listen(colorScheme, 'change', refreshColor);
  listen(motion, 'change', event => {
    still = event.matches;
    rawHand = null;
    if (still) {
      for (const dot of dots) { dot.x = dot.hx; dot.y = dot.hy; dot.vx = 0; dot.vy = 0; }
    }
    wake(true);
  });

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const modalObserver = new MutationObserver(syncModal);
  document.querySelectorAll('dialog, [role="dialog"]').forEach(dialog => {
    modalObserver.observe(dialog, { attributes: true, attributeFilter: ['open', 'aria-modal'] });
  });
  const themeObserver = new MutationObserver(refreshColor);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  themeObserver.observe(canvas, { attributes: true, attributeFilter: ['style', 'class'] });
  syncModal();
  resize();

  return {
    pulse() { pulse(); },
    setPaused(value) {
      paused = !!value;
      if (paused) { rawHand = null; gesture = null; stop(); }
      else wake();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stop();
      cleanups.forEach(cleanup => cleanup());
      resizeObserver.disconnect();
      modalObserver.disconnect();
      themeObserver.disconnect();
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}
