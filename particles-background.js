/* Particles, adapted from the user-supplied Bencho component (MIT).
   Original source and licence: https://bencho.dev/licence
   The portfolio adapter keeps the original shape/spring behaviour, with a
   shared 60 fps paint gate and passive page-level input. */

/* ══ Particles ════════════════════════════════════════════
   A shape made of dots. Move over it and the dots are pushed
   away from the pointer and spring home behind it; press and a
   shockwave throws them out, and they gather again into the
   NEXT shape — circle, square, flower, round again.

   ── ONE SET OF DOTS, MANY SHAPES ────────────────────────
   The dots never change, only where home is. Every shape is
   sampled to the same number of points, and a change of shape
   pairs each dot with a new home by angle round the middle, so
   the swarm sweeps round into the new outline rather than
   crossing itself.

   ── STRETCHED BY SPEED ──────────────────────────────────
   A dot at rest is round; a moving one is drawn a little long
   along the way it is going, which is what makes a burst read
   as a splash rather than a scatter of points. */

const W = 480;
const H = 400;
const CX = W / 2;
const CY = H / 2;
/* how many dots every shape is sampled to */
const N = 720;
const SHAPES = ['Circle', 'Square', 'Flower'];
const FRAME = 1000 / 60;
const JITTER = 0.1;
const TAU = Math.PI * 2;
const REACH = 80;
const STRENGTH = 6.6;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const angle = (x, y) => Math.atan2(y - CY, x - CX);
const shapeCache = new Map();

function outline(shape) {
  const path = new Path2D();
  if (shape === 'Circle') path.arc(CX, CY, 150, 0, TAU);
  else if (shape === 'Square') path.roundRect(CX - 140, CY - 140, 280, 280, 36);
  else {
    /* five round petals round a smaller middle — circles drawn
       the same way round, so the fill is their union. Petals
       just touching their neighbours, so the notches between
       them read at the dots' own grain */
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * TAU) / 5;
      const x = CX + Math.cos(a) * 104;
      const y = CY + 8 + Math.sin(a) * 104;
      path.moveTo(x + 60, y);
      path.arc(x, y, 60, 0, TAU);
    }
    path.moveTo(CX + 58, CY + 8);
    path.arc(CX, CY + 8, 58, 0, TAU);
  }
  return path;
}

/* ── N points, spread evenly over the inside of a shape ──
   A hex grid spaced so the shape holds about N of them — its
   area over N, which is the spacing that fills it evenly — then
   trimmed or topped up to exactly N. It was a fixed fine grid
   thinned by a stride, and the stride beat against the grid:
   the circle came out in zigzag bands. */
function homes(shape) {
  if (shapeCache.has(shape)) return shapeCache.get(shape);
  const sample = document.createElement('canvas');
  sample.width = W;
  sample.height = H;
  const context = sample.getContext('2d');
  const path = outline(shape);
  let area = 0;
  for (let y = 1; y < H; y += 2) {
    for (let x = 1; x < W; x += 2) {
      if (context.isPointInPath(path, x, y)) area += 4;
    }
  }
  const spacing = Math.sqrt((area / N) * (2 / Math.sqrt(3)));
  const rowHeight = (spacing * Math.sqrt(3)) / 2;
  const points = [];
  for (let y = rowHeight / 2, row = 0; y < H; y += rowHeight, row++) {
    for (let x = spacing / 2 + (row % 2) * (spacing / 2); x < W; x += spacing) {
      if (context.isPointInPath(path, x, y)) points.push([x, y]);
    }
  }
  /* within a few of N either way; drop evenly or repeat evenly */
  const sampled = Array.from({ length: N }, (_, i) => points[Math.floor((i * points.length) / N)]);
  const cached = {
    points: sampled,
    ordered: [...sampled].sort((a, b) => angle(a[0], a[1]) - angle(b[0], b[1])),
  };
  shapeCache.set(shape, cached);
  return cached;
}

export function initParticleBackground(canvas) {
  const noop = { nextShape() {}, setPaused() {}, destroy() {} };
  if (!canvas || typeof Path2D === 'undefined') return noop;
  const context = canvas.getContext('2d');
  if (!context) return noop;

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let still = motion.matches;
  let destroyed = false;
  let paused = false;
  let pendingPaint = false;
  let modalOpen = false;
  let raf = 0;
  let nextFrame = null;
  let previousFrame = null;
  let shapeIndex = 0;
  let hand = null;
  let gesture = null;
  let color = getComputedStyle(canvas).color || '#8aabac';
  let cssWidth = 1;
  let cssHeight = 1;
  let scale = 1;
  let originX = 0;
  let originY = 0;
  let oldBounds = null;
  let idleHandle = 0;
  const idleSupported = typeof window.requestIdleCallback === 'function';
  const dots = homes('Circle').points.map(([x, y]) => ({ hx: x, hy: y, x, y, vx: 0, vy: 0 }));
  const cleanups = [];
  const ignored = 'a,button,input,select,textarea,label,[contenteditable],dialog,[role="dialog"],.card,[data-particle-ignore]';
  const blockedTarget = target => target instanceof Element && !!target.closest(ignored);
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

  /* ── give every dot a home in a shape ────────────────── */
  function become(shape) {
    const ordered = homes(shape).ordered;
    /* pair by angle round the middle, so the swarm sweeps */
    const order = dots.map((dot, i) => [angle(dot.x, dot.y), i]).sort((a, b) => a[0] - b[0]);
    order.forEach(([, index], i) => {
      const dot = dots[index];
      [dot.hx, dot.hy] = ordered[i];
      if (still || paused) {
        dot.x = dot.hx;
        dot.y = dot.hy;
        dot.vx = dot.vy = 0;
      }
    });
  }

  function draw() {
    const dx = canvas.width / cssWidth;
    const dy = canvas.height / cssHeight;
    context.setTransform(dx * scale, 0, 0, dy * scale, dx * originX, dy * originY);
    // Clear only the previous swarm bounds, not the entire screen at every frame.
    if (oldBounds) context.clearRect(oldBounds.x, oldBounds.y, oldBounds.w, oldBounds.h);
    context.fillStyle = color;
    context.beginPath();
    const radius = 1.9;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const dot of dots) {
      minX = Math.min(minX, dot.x);
      minY = Math.min(minY, dot.y);
      maxX = Math.max(maxX, dot.x);
      maxY = Math.max(maxY, dot.y);
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
    // The 8px pad includes stretched radii and antialiasing at every supported DPR.
    oldBounds = { x: minX - 8, y: minY - 8, w: maxX - minX + 16, h: maxY - minY + 16 };
  }

  function step(dt) {
    const damping = Math.pow(0.84, dt);
    let busy = false;
    for (const dot of dots) {
      let pushX = 0, pushY = 0;
      if (hand) {
        const dx = dot.x - hand.x;
        const dy = dot.y - hand.y;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < REACH * REACH && distanceSquared > 0.0001) {
          const distance = Math.sqrt(distanceSquared);
          const fraction = 1 - distance / REACH;
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

  /* Frames, not milliseconds. `dt` is expressed in sixtieths of
     a second and the damping is RAISED to it rather than
     multiplied by it, so a dropped frame decays the same amount
     of energy as the two frames it replaced. Multiplying is the
     version that makes a spring behave differently on a busy
     page, which is the hardest kind of bug to see.

     The loop parks itself the moment the value has settled. */
  function tick(now) {
    raf = 0;
    if (isSuspended() || (paused && !pendingPaint)) return;
    if (nextFrame !== null && now + JITTER < nextFrame) {
      raf = requestAnimationFrame(tick);
      return;
    }
    const dt = previousFrame === null ? 1 : clamp((now - previousFrame) / FRAME, 0, 2.5);
    previousFrame = now;
    if (nextFrame === null || now - nextFrame > FRAME * 2.5) nextFrame = now + FRAME;
    else nextFrame += (Math.floor((now - nextFrame + JITTER) / FRAME) + 1) * FRAME;
    const busy = still || paused ? false : step(dt);
    pendingPaint = false;
    draw();
    if (busy) raf = requestAnimationFrame(tick);
  }

  function wake(redraw = false) {
    if (redraw) pendingPaint = true;
    if (raf || isSuspended() || (paused && !pendingPaint)) return;
    // Keep the paint deadline across wakeups: input cannot bypass the 60 fps cap.
    previousFrame = null;
    raf = requestAnimationFrame(tick);
  }

  function release() {
    if (!hand) return;
    hand = null;
    wake();
  }

  function position(clientX, clientY) {
    return { x: (clientX - originX) / scale, y: (clientY - originY) / scale };
  }

  function nextShape(point = { x: CX, y: CY }) {
    if (destroyed) return;
    /* the shockwave, then the next shape */
    if (!still && !paused) {
      const strength = 0.4 + 0.6 * 1.2;
      for (const dot of dots) {
        const dx = dot.x - point.x;
        const dy = dot.y - point.y;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared > 40000 || distanceSquared < 0.0001) continue;
        const distance = Math.sqrt(distanceSquared);
        const force = (1 - distance / 200) * 30 * strength;
        dot.vx += (dx / distance) * force;
        dot.vy += (dy / distance) * force;
      }
    }
    shapeIndex = (shapeIndex + 1) % SHAPES.length;
    become(SHAPES[shapeIndex]);
    wake(true);
  }

  function resize() {
    if (destroyed) return;
    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(1, bounds.width || innerWidth);
    const height = Math.max(1, bounds.height || innerHeight);
    const dpr = Math.min(1.5, devicePixelRatio || 1, Math.sqrt(2500000 / (width * height)));
    const backingWidth = Math.max(1, Math.round(width * dpr));
    const backingHeight = Math.max(1, Math.round(height * dpr));
    if (width === cssWidth && height === cssHeight && canvas.width === backingWidth && canvas.height === backingHeight) return;
    cssWidth = width;
    cssHeight = height;
    const desktop = width >= 800;
    scale = desktop ? Math.min(1.25, (width * 0.48) / 320, (height * 0.62) / 340) : Math.min(0.85, (width * 0.74) / 320, (height * 0.54) / 340);
    const centerX = width * (desktop ? 0.72 : 0.68);
    const centerY = Math.min(height * (desktop ? 0.34 : 0.3), desktop ? 280 : 270);
    originX = centerX - CX * scale;
    originY = centerY - CY * scale;
    canvas.width = backingWidth;
    canvas.height = backingHeight;
    oldBounds = null;
    hand = null;
    wake(true);
  }

  function refreshColor() {
    color = getComputedStyle(canvas).color || '#8aabac';
    wake(true);
  }

  function syncModal() {
    modalOpen = !!document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]');
    if (modalOpen) { hand = null; gesture = null; stop(); }
    else wake();
  }

  listen(document, 'pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || blockedTarget(event.target) || isPaused()) { gesture = null; return; }
    gesture = { x: event.clientX, y: event.clientY, id: event.pointerId, at: performance.now(), moved: false };
    if (event.pointerType !== 'mouse' && !still) {
      hand = position(event.clientX, event.clientY);
      wake();
    }
  }, { passive: true });

  listen(document, 'pointermove', event => {
    if (gesture && event.pointerId === gesture.id && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 8) gesture.moved = true;
    if (still || isPaused() || blockedTarget(event.target)) { release(); return; }
    if (event.pointerType !== 'mouse' && (!gesture || event.buttons === 0)) return;
    const next = position(event.clientX, event.clientY);
    if (hand && Math.abs(next.x - hand.x) < 0.01 && Math.abs(next.y - hand.y) < 0.01) return;
    hand = next;
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
    if (!tap || tap.moved || performance.now() - tap.at > 700 || event.button !== 0 || blockedTarget(event.target) || isPaused()) return;
    nextShape(position(event.clientX, event.clientY));
  }, { passive: true });

  listen(document, 'visibilitychange', () => {
    if (document.hidden) { hand = null; gesture = null; stop(); }
    else { resize(); wake(); }
  });
  listen(window, 'resize', resize, { passive: true });
  listen(motion, 'change', event => {
    still = event.matches;
    hand = null;
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
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  themeObserver.observe(canvas, { attributes: true, attributeFilter: ['style', 'class'] });
  syncModal();
  resize();

  // Warm the other outlines off the first click's critical path.
  const pending = SHAPES.filter(shape => !shapeCache.has(shape));
  const warm = () => {
    if (destroyed) return;
    const shape = pending.shift();
    if (shape) homes(shape);
    if (pending.length) scheduleWarm();
  };
  const scheduleWarm = () => {
    idleHandle = idleSupported ? window.requestIdleCallback(warm, { timeout: 1500 }) : window.setTimeout(warm, 200);
  };
  if (pending.length) scheduleWarm();

  return {
    nextShape() { nextShape(); },
    setPaused(value) {
      paused = !!value;
      if (paused) { hand = null; gesture = null; stop(); }
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
      if (idleSupported) window.cancelIdleCallback(idleHandle);
      else clearTimeout(idleHandle);
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}
