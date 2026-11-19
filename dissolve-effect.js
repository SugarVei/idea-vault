const MASK_WIDTH = 384;
const MASK_HEIGHT = 216;
const TEXTURE_WIDTH = 640;
const TEXTURE_HEIGHT = 360;
const DUST_WIDTH = 768;
const DUST_HEIGHT = 512;
const DUST_REACH = 1.62;
const DUST_SPAN = 1.85;
const DUST_HEADROOM = .55;
const EDGE_THRESHOLD_SLOPE = .59;
const AVERAGE_INNER_THRESHOLD = EDGE_THRESHOLD_SLOPE + (.28 + .095 + .16) / 2;

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
      // The outer edge erodes first. Fine grain breaks up the contours of the larger tears.
      field[y * MASK_WIDTH + x] = EDGE_THRESHOLD_SLOPE * x / MASK_WIDTH +
        .28 * noise(x / 39, y / 32) + .095 * noise(x / 13, y / 9) + .16 * grain(x, y);
    }
  }
  return field;
}

function makeSpecks(field) {
  const columns = 224;
  const rows = 148;
  const specks = [];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const index = row * columns + column;
      const u = (column + .08 + .84 * grain(index, 1)) / columns;
      const v = (row + .08 + .84 * grain(index, 2)) / rows;
      const fieldIndex = Math.floor(v * MASK_HEIGHT) * MASK_WIDTH + Math.floor((1 - u) * MASK_WIDTH);
      const curl = noise(9 * u + 23, 7 * v) - .5;
      specks.push({
        u, v, curl, threshold: field[fieldIndex],
        speed: .32 + .40 * grain(index, 3) + .13 * curl,
        lift: .09 + .44 * (1 - v) + .18 * grain(index, 4),
        opacity: .52 + .48 * grain(index, 5),
        retention: grain(index, 6)
      });
    }
  }
  return specks;
}

function edgeTint(color, dark, direction) {
  const value = Number.parseInt(color.slice(1), 16);
  const channels = [value >> 16, (value >> 8) & 255, value & 255];
  const luma = .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
  if (dark) {
    const lift = unit((150 - luma) / Math.max(1, 255 - luma));
    return channels.map(channel => Math.round(channel + (255 - channel) * lift));
  }
  const shade = Math.min(1, (direction > 0 ? 90 : 102) / Math.max(1, luma));
  return channels.map(channel => Math.round(channel * shade));
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
    this.dust = buffer(DUST_WIDTH, DUST_HEIGHT);
    this.dustMask = buffer(DUST_WIDTH, DUST_HEIGHT);
    this.sourceContext = this.source.getContext('2d');
    this.cutoutContext = this.cutout.getContext('2d');
    this.maskContext = this.mask.getContext('2d');
    this.dustContext = this.dust.getContext('2d');
    this.dustMaskContext = this.dustMask.getContext('2d');
    this.ready = Boolean(this.sourceContext && this.cutoutContext && this.maskContext && this.dustContext && this.dustMaskContext);
    if (!this.ready) return;
    this.field = makeField();
    this.maskPixels = this.maskContext.createImageData(MASK_WIDTH, MASK_HEIGHT);
    this.dustPixels = this.dustMaskContext.createImageData(DUST_WIDTH, DUST_HEIGHT);
    this.specks = makeSpecks(this.field);
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
    this.drawDust(layer);
    context.drawImage(this.cutout, left, top, width, height);
    context.globalAlpha = 1;
  }

  drawDust({ left, top, width, height, erosion, direction, accent, dark }) {
    const innerEdge = direction < 0 ? left + width : left;
    const availableWidth = direction < 0 ? innerEdge : this.width - innerEdge;
    const trailWidth = width * DUST_REACH;
    const columns = Math.min(DUST_WIDTH, Math.ceil(availableWidth * DUST_WIDTH / trailWidth) + 1);
    if (columns <= 0) return;

    // Follow the approximate breakup line as it moves across the cover during a swipe.
    const pixelScale = DUST_WIDTH / DUST_REACH;
    const edge = unit((AVERAGE_INNER_THRESHOLD - erosion) / EDGE_THRESHOLD_SLOPE) * .92 * pixelScale;
    const falloffWidth = Math.max(.18 * DUST_WIDTH, columns - edge);
    const nearOpacity = direction > 0 ? 1.13 : 1.06;
    const pixels = this.dustPixels.data;
    pixels.fill(0);
    for (const speck of this.specks) {
      const age = (erosion - speck.threshold) * 1.32;
      if (age <= 0 || age >= 1) continue;
      const outward = speck.u * .92 + age * (speck.speed + .22 * age);
      const x = Math.floor(outward * pixelScale);
      if (x >= columns) continue;
      const progress = unit((x - edge) / falloffWidth);
      const falloff = progress * progress * (3 - 2 * progress);
      if (speck.retention < .64 * falloff) continue;

      const heightFromTop = DUST_HEADROOM + speck.v + age * ((speck.v - .5) * .46 + speck.curl * .32 - speck.lift - .15 * age);
      const y = Math.floor(heightFromTop * DUST_HEIGHT / DUST_SPAN);
      if (y < 0 || y >= DUST_HEIGHT) continue;
      const strength = nearOpacity - (nearOpacity - .46) * falloff;
      const alpha = 255 * speck.opacity * Math.min(1, age * 38) * (1 - .54 * age) * strength;
      const pixel = (y * DUST_WIDTH + x) * 4 + 3;
      if (alpha > pixels[pixel]) pixels[pixel] = alpha;
    }
    this.dustMaskContext.putImageData(this.dustPixels, 0, 0, 0, 0, columns, DUST_HEIGHT);
    this.colorDust({ columns, direction, erosion, accent, dark, edge, falloffWidth });

    this.context.save();
    this.context.translate(innerEdge, top - height * DUST_HEADROOM);
    this.context.scale(direction, 1);
    this.context.drawImage(this.dust, 0, 0, columns, DUST_HEIGHT,
      0, 0, columns * trailWidth / DUST_WIDTH, height * DUST_SPAN);
    this.context.restore();
  }

  colorDust({ columns, direction, erosion, accent, dark, edge, falloffWidth }) {
    const context = this.dustContext;
    const color = accent || (dark ? '#a4b8cf' : '#536b83');
    context.fillStyle = color;
    context.fillRect(0, 0, columns, DUST_HEIGHT);
    // Stretch cover colors outward in strips, then apply the fine alpha raster in one pass.
    // Rendering the colors by compositing also works with covers from other origins.
    const strips = 16;
    const stripWidth = TEXTURE_WIDTH / strips;
    const spread = (.92 + .67 * erosion) * DUST_WIDTH / DUST_REACH;
    for (let index = 0; index < strips; index++) {
      const u = index / strips;
      const age = u * erosion;
      const x = u * spread;
      if (x >= columns) break;
      const width = spread / strips + 1;
      const top = (DUST_HEADROOM - age * (.61 + .23 * age)) * DUST_HEIGHT / DUST_SPAN;
      const height = (1 + .54 * age) * DUST_HEIGHT / DUST_SPAN;
      if (direction < 0) {
        context.save();
        context.translate(x + width, 0);
        context.scale(-1, 1);
        context.drawImage(this.source, (strips - index - 1) * stripWidth, 0, stripWidth, TEXTURE_HEIGHT, 0, top, width, height);
        context.restore();
      } else {
        context.drawImage(this.source, index * stripWidth, 0, stripWidth, TEXTURE_HEIGHT, x, top, width, height);
      }
    }
    const channels = edgeTint(color, dark, direction).join(', ');
    const edgeOpacity = dark ? .55 : direction > 0 ? .74 : .66;
    const gradient = context.createLinearGradient(edge, 0, edge + falloffWidth, 0);
    gradient.addColorStop(0, `rgba(${channels}, ${edgeOpacity})`);
    gradient.addColorStop(.33, `rgba(${channels}, ${edgeOpacity * .83})`);
    gradient.addColorStop(.7, `rgba(${channels}, ${edgeOpacity * .42})`);
    gradient.addColorStop(1, `rgba(${channels}, .12)`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, columns, DUST_HEIGHT);
    context.globalCompositeOperation = 'destination-in';
    context.drawImage(this.dustMask, 0, 0, columns, DUST_HEIGHT, 0, 0, columns, DUST_HEIGHT);
    context.globalCompositeOperation = 'source-over';
  }
}
