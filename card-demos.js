const demoUrls = new Map([
  ['https://sunset-citrus-harbor.vercel.app', 'harbor'],
  ['https://sugarvei.github.io/koi-pond', 'pond'],
  ['https://little-earth-livid.vercel.app', 'earth'],
  ['https://sugarvei.github.io/jolly-muse-site', 'jolly'],
  ['https://sugarvei.github.io/sugar-particle-intro', 'neon'],
  ['https://sugarvei.github.io/sugar-particle-white', 'mono']
]);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const assets = new URL('./assets/', import.meta.url);
const asset = name => new URL(name, assets).href;
const clamp = (value, lower, upper) => Math.max(lower, Math.min(upper, value));

export function cardDemo(url) {
  try {
    const { origin, pathname } = new URL(url);
    return demoUrls.get(origin + pathname.replace(/\/+$/, ''));
  } catch {
    return undefined;
  }
}

export function demoHint(demo, language) {
  if (demo === 'earth') return language === 'zh' ? '拖动' : 'Drag';
  if (demo === 'harbor') return language === 'zh' ? '点击' : 'Click';
  const touch = !matchMedia('(hover: hover)').matches;
  if (language === 'zh') return touch ? '触碰' : '悬停';
  return touch ? 'Tap' : 'Hover';
}

function element(tag, className) {
  const node = document.createElement(tag);
  node.className = className;
  return node;
}

function button(className, label) {
  const node = element('button', className);
  node.type = 'button';
  if (label) node.setAttribute('aria-label', label);
  return node;
}

function image(name) {
  const node = new Image();
  node.decoding = 'async';
  node.alt = '';
  node.src = asset(name);
  return node;
}

function harbor(host, zh) {
  const scenes = ['harbor-1.jpg', 'harbor-3.jpg', 'harbor-2.jpg'];
  const labels = zh ? ['日落', '夜景', '集市'] : ['Sunset', 'Night', 'Market'];
  const view = element('div', 'demo-view');
  const frames = scenes.map((name, index) => {
    const frame = image(name);
    frame.classList.toggle('visible', index === 0);
    return frame;
  });
  const choices = element('div', 'harbor-scenes');
  choices.setAttribute('role', 'group');
  choices.setAttribute('aria-label', zh ? '切换柑橘港场景' : 'Change harbor scene');
  const controls = labels.map((label, index) => {
    const control = button('');
    control.textContent = label;
    control.setAttribute('aria-pressed', String(index === 0));
    control.addEventListener('click', () => {
      frames.forEach((frame, i) => frame.classList.toggle('visible', i === index));
      controls.forEach((choice, i) => choice.setAttribute('aria-pressed', String(i === index)));
    });
    return control;
  });
  view.append(...frames);
  choices.append(...controls);
  host.append(view, choices);
}

function pond(host, zh) {
  const view = button('demo-view pond-view', zh ? '触碰水面，产生涟漪' : 'Touch the pond to make a ripple');
  view.append(image('koi-1.jpg'));
  let previous = -Infinity;
  function ripple(x, y) {
    const ring = element('span', 'pond-ripple');
    ring.style.left = x + '%';
    ring.style.top = y + '%';
    view.append(ring);
    ring.addEventListener('animationend', () => ring.remove(), { once: true });
    setTimeout(() => ring.remove(), 1000);
  }
  function rippleAt(event) {
    const rect = view.getBoundingClientRect();
    ripple(100 * (event.clientX - rect.left) / rect.width, 100 * (event.clientY - rect.top) / rect.height);
  }
  view.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || reducedMotion.matches || performance.now() - previous < 140) return;
    previous = performance.now();
    rippleAt(event);
  });
  view.addEventListener('click', event => {
    if (event.detail === 0) ripple(50, 50);
    else rippleAt(event);
  });
  host.append(view);
}

let texture;
function globeTexture() {
  if (!texture) {
    const map = image('card-earth-map.webp');
    texture = map.decode().then(() => {
      const buffer = document.createElement('canvas');
      buffer.width = map.naturalWidth;
      buffer.height = map.naturalHeight;
      const context = buffer.getContext('2d');
      context.drawImage(map, 0, 0);
      return { width: buffer.width, height: buffer.height, pixels: context.getImageData(0, 0, buffer.width, buffer.height).data };
    }).catch(() => null);
  }
  return texture;
}

function earth(host, zh) {
  const size = 248;
  const canvas = element('canvas', 'earth-globe');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  const showCover = () => host.replaceChildren(image('earth-0.jpg'));
  if (!context) {
    showCover();
    return;
  }
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'slider');
  canvas.setAttribute('aria-label', zh ? '拖动或使用左右方向键旋转地球' : 'Rotate Earth by dragging or using the arrow keys');
  canvas.setAttribute('aria-valuemin', '0');
  canvas.setAttribute('aria-valuemax', '359');
  canvas.setAttribute('aria-valuenow', '95');
  host.append(canvas);

  const sphere = context.createImageData(size, size);
  const samples = [];
  const center = (size - 1) / 2;
  const radius = center - 1;
  const tilt = Math.PI / 8;
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const x = (col - center) / radius;
      const y = (center - row) / radius;
      const distance = x * x + y * y;
      if (distance > 1) continue;
      const z = Math.sqrt(1 - distance);
      const longitude = Math.atan2(x, z * cos - y * sin) / (2 * Math.PI);
      const latitude = Math.asin(y * cos + z * sin) / Math.PI;
      const light = 0.63 + 0.4 * Math.max(0, -0.37 * x + 0.42 * y + 0.83 * z);
      const index = (row * size + col) * 4;
      sphere.data[index + 3] = clamp((1 - Math.sqrt(distance)) * radius * 255, 0, 255);
      samples.push({ index, longitude, latitude, light });
    }
  }

  let rotation = 95;
  let map;
  let request = 0;
  let drag;
  function paint() {
    request = 0;
    if (!map || !canvas.isConnected) return;
    const { width, height, pixels } = map;
    for (const { index, longitude, latitude, light } of samples) {
      const u = (longitude + rotation / 360 + 1.5) % 1;
      const v = clamp(0.5 - latitude, 0, 0.9999);
      const source = (Math.floor(v * height) * width + Math.floor(u * width)) * 4;
      for (let channel = 0; channel < 3; channel++) sphere.data[index + channel] = pixels[source + channel] * light;
    }
    context.putImageData(sphere, 0, 0);
  }
  function rotate(value) {
    rotation = ((value % 360) + 360) % 360;
    canvas.setAttribute('aria-valuenow', String(Math.floor(rotation)));
    if (!request) request = requestAnimationFrame(paint);
  }
  globeTexture().then(result => {
    if (!canvas.isConnected) return;
    if (!result) {
      showCover();
      return;
    }
    map = result;
    rotate(rotation);
  });
  canvas.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, rotation };
    canvas.dataset.dragging = 'true';
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (drag?.id === event.pointerId) rotate(drag.rotation - (event.clientX - drag.x) * 1.4);
  });
  canvas.addEventListener('lostpointercapture', () => {
    drag = undefined;
    delete canvas.dataset.dragging;
  });
  canvas.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    rotate(rotation + (event.key === 'ArrowRight' ? 15 : -15));
  });
}

function jolly(host, zh) {
  const view = button('jolly-gaze', zh ? '移动指针或轻触，让 Jolly 看向你' : 'Move the pointer or tap to make Jolly look');
  let pose = 4;
  function look(next) {
    pose = next;
    view.dataset.pose = String(next);
    view.style.backgroundPosition = (next % 3) * 50 + '% ' + Math.floor(next / 3) * 50 + '%';
  }
  look(4);
  view.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || reducedMotion.matches) return;
    const rect = view.getBoundingClientRect();
    const col = clamp(Math.floor((event.clientX - rect.left) / rect.width * 3), 0, 2);
    const row = clamp(Math.floor((event.clientY - rect.top) / rect.height * 3), 0, 2);
    if (pose !== row * 3 + col) look(row * 3 + col);
  });
  view.addEventListener('pointerleave', event => { if (event.pointerType !== 'touch') look(4); });
  view.addEventListener('click', event => {
    const rect = view.getBoundingClientRect();
    const col = event.detail ? ((event.clientX - rect.left) < rect.width / 2 ? 0 : 2) : 2;
    look(pose === 4 ? 3 + col : 4);
  });
  host.append(view);
}

function particles(host, zh, mono) {
  const view = button('demo-view particle-preview', zh ? '移动指针或轻触拨开粒子' : 'Move the pointer or tap to scatter the particles');
  const canvas = document.createElement('canvas');
  const width = canvas.width = 560;
  const height = canvas.height = 268;
  const context = canvas.getContext('2d');
  if (!context) {
    host.append(image(mono ? 'sugar-mono-1.jpg' : 'sugar-neon-1.jpg'));
    return;
  }
  view.append(canvas);
  host.append(view);
  context.font = '800 126px Geist, Arial, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('SUGAR', width / 2, height / 2, width - 52);
  const glyph = context.getImageData(0, 0, width, height).data;
  const palette = mono ? ['#181717', '#424241', '#6a6a67'] : ['#deff77', '#71f6cd', '#8bedff', '#e8ffc6'];
  const dots = [];
  for (let y = 30; y < height - 25; y += 4) {
    for (let x = 20; x < width - 20; x += 4) {
      if (glyph[(y * width + x) * 4 + 3] < 120) continue;
      dots.push({ x, y, dx: 0, dy: 0, color: palette[(Math.floor(x / 4) * 3 + Math.floor(y / 4)) % palette.length] });
    }
  }
  let pointer;
  let animation = 0;
  let timer;
  function draw() {
    animation = 0;
    if (!canvas.isConnected) return;
    context.clearRect(0, 0, width, height);
    let moving = false;
    const ease = reducedMotion.matches ? 1 : 0.17;
    for (const dot of dots) {
      const x = pointer ? dot.x - pointer.x : 0;
      const y = pointer ? dot.y - pointer.y : 0;
      const distance = Math.hypot(x, y);
      const force = distance > 0 && distance < 80 ? (80 - distance) / distance * 0.67 : 0;
      const targetX = x * force;
      const targetY = y * force;
      dot.dx += (targetX - dot.dx) * ease;
      dot.dy += (targetY - dot.dy) * ease;
      moving ||= Math.abs(targetX - dot.dx) + Math.abs(targetY - dot.dy) > 0.12;
      context.fillStyle = dot.color;
      context.fillRect(dot.x + dot.dx, dot.y + dot.dy, 2, 2);
    }
    if (moving) wake();
  }
  function wake() {
    if (!animation) animation = requestAnimationFrame(draw);
  }
  function touch(event) {
    const rect = view.getBoundingClientRect();
    pointer = {
      x: event ? (event.clientX - rect.left) * width / rect.width : width / 2,
      y: event ? (event.clientY - rect.top) * height / rect.height : height / 2
    };
    clearTimeout(timer);
    wake();
  }
  function settle() {
    pointer = undefined;
    wake();
  }
  view.addEventListener('pointermove', event => {
    if (event.pointerType !== 'touch' && !reducedMotion.matches) touch(event);
  });
  view.addEventListener('pointerleave', settle);
  view.addEventListener('click', event => {
    touch(event.detail === 0 ? null : event);
    timer = setTimeout(settle, 520);
  });
  draw();
}

export function mountCardDemo(host, language) {
  const zh = language === 'zh';
  switch (host.dataset.demo) {
    case 'harbor': harbor(host, zh); break;
    case 'pond': pond(host, zh); break;
    case 'earth': earth(host, zh); break;
    case 'jolly': jolly(host, zh); break;
    case 'neon': particles(host, zh, false); break;
    case 'mono': particles(host, zh, true); break;
  }
}

export function mountCoverPreview(host, photos, language) {
  if (photos.length < 2) return;
  const image = host.querySelector('img');
  if (!image) return;
  const next = button('preview-next', language === 'zh' ? '下一张预览图' : 'Next preview image');
  const count = element('span', 'preview-count');
  count.setAttribute('aria-hidden', 'true');
  let current = 0;
  count.textContent = '1 / ' + photos.length;
  next.append(count);
  next.addEventListener('click', () => {
    current = (current + 1) % photos.length;
    image.src = photos[current];
    count.textContent = (current + 1) + ' / ' + photos.length;
  });
  host.append(next);
}

