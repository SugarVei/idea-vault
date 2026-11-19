const MASK_WIDTH = 256;
const MASK_HEIGHT = 144;
const TEXTURE_WIDTH = MASK_WIDTH * 2;
const TEXTURE_HEIGHT = MASK_HEIGHT * 2;

const unit = value => Math.max(0, Math.min(1, value));

function grain(x, y) {
  const mixed = Math.imul(x + 47, 374761393) + Math.imul(y + 83, 668265263);
  return ((Math.imul(mixed ^ (mixed >>> 13), 1274126177) >>> 0) / 4294967296);
}

function noise(x, y) {
  const column = Math.floor(x);
  const row = Math.floor(y);
  const fx = x - column;
  const fy = y - row;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const top = grain(column, row) * (1 - sx) + grain(column + 1, row) * sx;
  const bottom = grain(column, row + 1) * (1 - sx) + grain(column + 1, row + 1) * sx;
  return top * (1 - sy) + bottom * sy;
}

function makeField() {
  const field = new Float32Array(MASK_WIDTH * MASK_HEIGHT);
  for (let y = 0; y < MASK_HEIGHT; y++) {
    for (let x = 0; x < MASK_WIDTH; x++) {
      // Low thresholds are erased first. Broad noise tears the edge while grain breaks up the hole boundaries.
      field[y * MASK_WIDTH + x] = .56 * x / MASK_WIDTH +
        .32 * noise(x / 25, y / 25) + .12 * noise(x / 7, y / 7) + .16 * grain(x, y);
    }
  }
  return field;
}

function buffer(width, height) {
  return Object.assign(document.createElement('canvas'), { width, height });
}

export class DissolveEffect {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    if (!this.context) return;
    this.source = buffer(TEXTURE_WIDTH, TEXTURE_HEIGHT);
    this.cutout = buffer(TEXTURE_WIDTH, TEXTURE_HEIGHT);
    this.mask = buffer(MASK_WIDTH, MASK_HEIGHT);
    this.sourceContext = this.source.getContext('2d');
    this.cutoutContext = this.cutout.getContext('2d');
    this.maskContext = this.mask.getContext('2d');
    this.ready = Boolean(this.sourceContext && this.cutoutContext && this.maskContext);
    if (!this.ready) return;
    this.field = makeField();
    this.maskPixels = this.maskContext.createImageData(MASK_WIDTH, MASK_HEIGHT);
    this.specks = Array.from({ length: 420 }, (_, index) => {
      const u = grain(index, 1);
      const v = grain(index, 2);
      const threshold = this.field[Math.floor(v * MASK_HEIGHT) * MASK_WIDTH + Math.floor(u * MASK_WIDTH)];
      return { u, v, threshold, size: grain(index, 3), spread: grain(index, 4), lift: grain(index, 5) - .58 };
    });
  }

  resize(width, height) {
    if (!this.ready) return;
    const density = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.ceil(width * density);
    const pixelHeight = Math.ceil(height * density);
    if (this.canvas.width !== pixelWidth || this.canvas.height !== pixelHeight) {
      this.canvas.width = pixelWidth;
      this.canvas.height = pixelHeight;
    }
    this.context.setTransform(density, 0, 0, density, 0, 0);
    this.width = width;
    this.height = height;
  }

  clear() {
    if (this.ready) this.context.clearRect(0, 0, this.width, this.height);
  }

  draw(layer) {
    const { image, left, top, width, height, erosion, direction, opacity, accent, dark } = layer;
    const { source, sourceContext, cutoutContext, maskContext, maskPixels, context } = this;
    const fit = Math.min(TEXTURE_WIDTH / image.naturalWidth, TEXTURE_HEIGHT / image.naturalHeight);
    const imageWidth = image.naturalWidth * fit;
    const imageHeight = image.naturalHeight * fit;
    sourceContext.clearRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
    sourceContext.save();
    sourceContext.beginPath();
    if (sourceContext.roundRect) sourceContext.roundRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT, 20);
    else sourceContext.rect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
    sourceContext.clip();
    sourceContext.fillStyle = dark ? '#242528' : '#eeeff0';
    sourceContext.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
    if (accent) {
      sourceContext.globalAlpha = .09;
      sourceContext.fillStyle = accent;
      sourceContext.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
      sourceContext.globalAlpha = 1;
    }
    // Drawing can display cross-origin covers without asking for pixel readback or new CORS headers.
    sourceContext.drawImage(image, (TEXTURE_WIDTH - imageWidth) / 2, (TEXTURE_HEIGHT - imageHeight) / 2, imageWidth, imageHeight);
    sourceContext.restore();

    const pixels = maskPixels.data;
    for (let y = 0; y < MASK_HEIGHT; y++) {
      const row = y * MASK_WIDTH;
      for (let x = 0; x < MASK_WIDTH; x++) {
        const fromEdge = direction < 0 ? x : MASK_WIDTH - 1 - x;
        pixels[(row + x) * 4 + 3] = 255 * unit(.5 + (this.field[row + fromEdge] - erosion) * 64);
      }
    }
    maskContext.putImageData(maskPixels, 0, 0);
    cutoutContext.clearRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
    cutoutContext.drawImage(source, 0, 0);
    cutoutContext.globalCompositeOperation = 'destination-in';
    cutoutContext.imageSmoothingEnabled = false;
    cutoutContext.drawImage(this.mask, 0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
    cutoutContext.globalCompositeOperation = 'source-over';

    context.globalAlpha = opacity;
    context.drawImage(this.cutout, left, top, width, height);
    this.drawDust(layer);
    context.globalAlpha = 1;
  }

  drawDust({ left, top, width, height, erosion, direction, opacity }) {
    for (const speck of this.specks) {
      const age = (erosion - speck.threshold) * 2.25;
      if (age <= 0 || age >= 1) continue;
      const x = direction < 0 ? speck.u : 1 - speck.u;
      const drift = width * age * (.08 + .28 * speck.spread);
      const lift = height * age * (.36 * speck.lift + .04 * Math.sin(17 * speck.v + 5 * age));
      const size = (.75 + 2.05 * speck.size) * (1 - .45 * age);
      this.context.globalAlpha = opacity * Math.min(1, age * 16) * (1 - age);
      this.context.drawImage(this.source, x * (TEXTURE_WIDTH - 3), speck.v * (TEXTURE_HEIGHT - 3), 3, 3,
        left + x * width + direction * drift, top + speck.v * height + lift, size, size);
    }
  }
}
