import { DissolveEffect } from './dissolve-effect.js?v=2';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const wrap = (value, count) => ((value % count) + count) % count;
const VISIBLE_DISTANCE = 1.48;

export class DissolveCarousel {
  constructor(host, actions) {
    this.host = host;
    this.actions = actions;
    this.items = [];
    this.cards = new Map();
    this.visibleCards = new Set();
    this.index = 0;
    this.position = 0;
    this.target = 0;
    this.frame = 0;
    this.active = false;
    this.drag = null;
    this.coverTap = null;
    this.clickBlockedUntil = 0;
    this.wheelOffset = 0;
    this.wheelTime = -Infinity;
    this.lastWheelStep = -Infinity;
    this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    host.classList.add('dissolve-gallery');
    host.innerHTML = `
      <div class="dissolve-stage" tabindex="0" role="region" aria-roledescription="carousel" aria-describedby="dissolve-help">
        <canvas class="dissolve-dust" width="1" height="1" aria-hidden="true"></canvas>
      </div>
      <div class="dissolve-footer">
        <div class="dissolve-caption">
          <button type="button" class="dissolve-title"></button>
          <p class="dissolve-subtitle"></p>
          <div class="dissolve-actions">
            <button type="button" class="dissolve-bookmark pill" aria-pressed="false"></button>
            <button type="button" class="dissolve-pin pill" aria-pressed="false"></button>
          </div>
        </div>
        <div class="dissolve-controls">
          <div class="dissolve-navigation">
            <button type="button" class="dissolve-previous"></button>
            <span class="dissolve-count" aria-hidden="true"></span>
            <button type="button" class="dissolve-next"></button>
          </div>
          <p id="dissolve-help"><span class="dissolve-desktop-help"></span><span class="dissolve-touch-help"></span></p>
        </div>
      </div>
      <span class="dissolve-announcement" role="status" aria-live="polite" aria-atomic="true"></span>`;
    this.stage = host.querySelector('.dissolve-stage');
    this.canvas = host.querySelector('.dissolve-dust');
    this.title = host.querySelector('.dissolve-title');
    this.subtitle = host.querySelector('.dissolve-subtitle');
    this.bookmark = host.querySelector('.dissolve-bookmark');
    this.pin = host.querySelector('.dissolve-pin');
    this.previous = host.querySelector('.dissolve-previous');
    this.next = host.querySelector('.dissolve-next');
    this.count = host.querySelector('.dissolve-count');
    this.announcement = host.querySelector('.dissolve-announcement');

    this.title.addEventListener('click', () => this.openCurrent(this.title));
    this.bookmark.addEventListener('click', () => this.actions.onBookmark(this.items[this.index].index));
    this.pin.addEventListener('click', () => this.actions.onPin(this.items[this.index].index));
    this.previous.addEventListener('click', () => this.step(-1));
    this.next.addEventListener('click', () => this.step(1));
    this.stage.addEventListener('click', event => this.clickCard(event));
    this.stage.addEventListener('keydown', event => this.keyDown(event));
    this.stage.addEventListener('wheel', event => this.wheel(event), { passive: false });
    this.stage.addEventListener('pointerdown', event => this.pointerDown(event));
    this.stage.addEventListener('pointermove', event => this.pointerMove(event));
    this.stage.addEventListener('pointerup', event => this.pointerEnd(event));
    this.stage.addEventListener('pointercancel', event => this.pointerEnd(event, true));
    this.stage.addEventListener('touchstart', event => {
      const button = event.target.closest('.carousel-card-cover');
      this.coverTap = button && event.touches.length === 1 ? { button, point: event.changedTouches[0] } : null;
    }, { passive: true });
    this.stage.addEventListener('touchcancel', () => { this.coverTap = null; });
    this.stage.addEventListener('touchend', event => this.finishCoverTap(event), { passive: false });
    this.stage.addEventListener('pointerleave', event => {
      if (this.drag?.id === event.pointerId && !this.drag.moved) this.releaseDrag();
    });
    this.stage.addEventListener('lostpointercapture', event => {
      if (event.target === this.stage && !this.stage.hasPointerCapture(event.pointerId)) this.pointerEnd(event, true);
    });
    this.stage.addEventListener('dragstart', event => {
      if (!event.target.closest('.carousel-preview')) event.preventDefault();
    });
    this.stage.addEventListener('load', event => {
      if (event.target.parentElement?.classList.contains('carousel-card-cover')) this.paint();
    }, true);
    this.reducedMotion.addEventListener('change', () => {
      if (!this.active) return;
      this.releaseDrag();
      this.stopAnimation();
      this.settle(this.position);
    });

    this.resizeObserver = new ResizeObserver(() => this.measure());
    this.resizeObserver.observe(this.stage);
    // Redraw the cover backgrounds when the shared theme changes.
    this.themeObserver = new MutationObserver(() => this.paint());
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  get looping() {
    return this.items.length > 2;
  }

  get inMotion() {
    return Boolean(this.frame || this.drag?.moved);
  }

  offsetFromCenter(index) {
    const offset = index - this.position;
    const half = this.items.length / 2;
    return this.looping ? wrap(offset + half, this.items.length) - half : offset;
  }

  setItems(items, labels) {
    const previousKey = this.items[this.index]?.key;
    const sameOrder = items.length === this.items.length && items.every((item, index) => item.key === this.items[index].key);
    this.items = items;
    this.labels = labels;
    this.stage.setAttribute('aria-label', labels.region);
    this.title.title = labels.details;
    this.previous.setAttribute('aria-label', labels.previous);
    this.previous.title = labels.previous;
    this.next.setAttribute('aria-label', labels.next);
    this.next.title = labels.next;
    this.host.querySelector('.dissolve-desktop-help').textContent = labels.desktopHelp;
    this.host.querySelector('.dissolve-touch-help').textContent = labels.touchHelp;

    if (!sameOrder) {
      this.releaseDrag();
      this.stopAnimation();
      this.index = Math.max(0, items.findIndex(item => item.key === previousKey));
      this.position = this.target = this.index;
      const keys = new Set(items.map(item => item.key));
      for (const [key, card] of this.cards) {
        if (keys.has(key)) continue;
        this.unfocus(card.element);
        card.element.remove();
        this.visibleCards.delete(card);
        this.cards.delete(key);
      }
    }
    if (this.active && items.length) {
      this.updateCaption();
      this.paint();
      this.updateCenter();
    }
  }

  setActive(active) {
    if (this.active === active) return;
    this.active = active;
    this.host.hidden = !active;
    if (active) {
      this.updateCaption();
      this.measure();
    } else {
      this.coverTap = null;
      this.releaseDrag();
      this.stopAnimation();
      this.position = this.target = this.index;
      this.effect?.resize(1, 1);
      this.effect?.clear();
    }
    this.updateCenter();
  }

  measure() {
    if (!this.active) return;
    const width = this.stage.clientWidth;
    const height = this.stage.clientHeight;
    if (!width || !height) return;
    this.compact = width < 600;
    this.cardWidth = this.compact ? width * .74 : Math.min(562, Math.max(320, width * .47));
    this.cardHeight = this.cardWidth * 9 / 16;
    this.pitch = this.cardWidth * (this.compact ? .85 : .89) + clamp(width * .018, 10, 26);
    this.width = width;
    this.height = height;
    this.stage.style.setProperty('--dissolve-card-width', `${this.cardWidth}px`);
    this.effect?.resize(width, height);
    this.paint();
  }

  coverCard(item) {
    let card = this.cards.get(item.key);
    if (!card) {
      const element = document.createElement('div');
      element.className = 'dissolve-card';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'carousel-card-cover';
      element.append(button);
      card = { element, button };
      this.cards.set(item.key, card);
      this.stage.append(element);
    }
    if (card.html !== item.coverHtml) {
      card.button.innerHTML = item.coverHtml;
      card.html = item.coverHtml;
      card.image = item.locked ? null : card.button.querySelector('img');
    }
    if (card.accent !== item.accent) {
      card.element.style.setProperty('--dissolve-accent', item.accent || 'var(--ink)');
      card.accent = item.accent;
    }
    return card;
  }

  paint() {
    if (!this.active || !this.width) return;
    const motionAllowed = !this.reducedMotion.matches;
    if (motionAllowed && this.items.length > 1 && !this.effect) {
      this.effect = new DissolveEffect(this.canvas);
      this.effect.resize(this.width, this.height);
    }
    this.effect?.clear();
    const dark = document.documentElement.dataset.theme === 'dark';
    const visible = new Set();
    const layers = [];
    for (const [index, item] of this.items.entries()) {
      const offset = this.offsetFromCenter(index);
      const distance = Math.abs(offset);
      if (distance >= VISIBLE_DISTANCE) continue;
      const card = this.coverCard(item);
      const { element, button, image } = card;
      const scale = 1 - .30 * distance;
      const opacity = clamp((VISIBLE_DISTANCE - distance) / .35, 0, 1);
      const x = offset * this.pitch;
      const y = distance * (this.compact ? 3 : 5);
      const erosion = Math.max(0, distance - .065) * (this.compact ? .90 : .87);
      const fragmented = motionAllowed && this.effect?.ready && image?.naturalWidth > 0 && erosion > 0;
      const selected = index === this.index && !this.inMotion;
      const label = `${selected ? this.labels.details : this.labels.show} · ${item.title}`;

      visible.add(card);
      element.hidden = false;
      element.dataset.index = String(index);
      element.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      element.style.zIndex = String(2 + Math.round((VISIBLE_DISTANCE - distance) * 20));
      element.style.opacity = opacity;
      element.classList.toggle('is-fragmented', Boolean(fragmented));
      element.classList.toggle('is-centered', selected);
      button.tabIndex = selected ? 0 : -1;
      if (button.getAttribute('aria-current') !== String(selected)) button.setAttribute('aria-current', String(selected));
      if (button.getAttribute('aria-label') !== label) button.setAttribute('aria-label', label);
      if (fragmented) {
        const width = this.cardWidth * scale;
        const height = this.cardHeight * scale;
        layers.push({
          image, width, height, distance, opacity, erosion, dark, accent: item.accent,
          left: (this.width - width) / 2 + x,
          top: (this.height - height) / 2 + y,
          direction: Math.sign(offset)
        });
      }
    }
    for (const card of this.visibleCards) {
      if (visible.has(card)) continue;
      this.unfocus(card.element);
      card.element.classList.remove('is-centered');
      card.button.setAttribute('aria-current', 'false');
      card.button.tabIndex = -1;
      card.element.hidden = true;
    }
    this.visibleCards = visible;
    layers.sort((a, b) => b.distance - a.distance);
    for (const layer of layers) this.effect.draw(layer);
  }

  updateCaption() {
    const item = this.items[this.index];
    this.title.textContent = item.title;
    this.subtitle.textContent = item.subtitle;
    this.host.style.setProperty('--dissolve-accent', item.accent || 'var(--ink)');
    const count = `${this.index + 1} / ${this.items.length}`;
    this.count.textContent = count;
    this.bookmark.textContent = item.bookmarked ? this.labels.unbookmark : this.labels.bookmark;
    this.bookmark.setAttribute('aria-pressed', String(item.bookmarked));
    this.pin.textContent = item.pinned ? this.labels.unpin : this.labels.pin;
    this.pin.setAttribute('aria-pressed', String(item.pinned));
    this.previous.disabled = !this.looping && this.index === 0;
    this.next.disabled = !this.looping && this.index === this.items.length - 1;
    const announcement = `${item.title}, ${count}`;
    if (this.announcement.textContent !== announcement) this.announcement.textContent = announcement;
  }

  updateCenter() {
    const item = this.active && !this.inMotion ? this.items[this.index] : null;
    this.actions.onCenter(this.host, item && this.cards.get(item.key)?.element, item?.index);
  }

  unfocus(element) {
    if (element.contains(document.activeElement)) this.stage.focus({ preventScroll: true });
  }

  openCurrent(trigger) {
    const item = this.items[this.index];
    if (this.active && item && !this.inMotion) this.actions.onOpen(item.index, trigger);
  }

  clickCard(event) {
    if (!this.active || event.target.closest('.carousel-preview') ||
        (event.detail && performance.now() < this.clickBlockedUntil)) return;
    const card = event.target.closest('.dissolve-card');
    if (card) this.activateCard(card);
  }

  finishCoverTap(event) {
    const tap = this.coverTap;
    this.coverTap = null;
    const end = event.changedTouches[0];
    if (!this.active || this.inMotion || !tap?.point || !end || event.touches.length ||
        tap.point.identifier !== end.identifier ||
        Math.hypot(end.clientX - tap.point.clientX, end.clientY - tap.point.clientY) > 10) return;
    const card = tap.button.parentElement;
    if (!card?.isConnected || card.hidden) return;
    // The browser may omit a native click on the first tap after a captured swipe.
    event.preventDefault();
    tap.button.focus({ preventScroll: true });
    this.activateCard(card);
  }

  activateCard(card) {
    const index = Number(card.dataset.index);
    if (index === this.index && !this.inMotion) {
      this.openCurrent(card.firstElementChild);
      return;
    }
    this.moveTo(Math.round(this.position + this.offsetFromCenter(index)));
  }

  keyDown(event) {
    if (!this.active || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('.carousel-preview')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      this.stage.focus({ preventScroll: true });
      if (event.key === 'Home' || event.key === 'End') {
        const index = event.key === 'Home' ? 0 : this.items.length - 1;
        this.moveTo(Math.round(this.position + this.offsetFromCenter(index)));
      } else {
        this.step(event.key === 'ArrowRight' ? 1 : -1);
      }
    } else if ((event.key === 'Enter' || event.key === ' ') && event.target === this.stage) {
      event.preventDefault();
      this.openCurrent(this.stage);
    }
  }

  wheel(event) {
    if (!this.active || this.drag || this.items.length < 2 || event.ctrlKey || event.target.closest('.carousel-preview')) return;
    const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
    // Preserve normal page scrolling until the visitor focuses the carousel or scrolls sideways.
    if (!horizontal && !event.shiftKey && !this.stage.contains(document.activeElement)) return;
    const delta = horizontal ? event.deltaX : event.deltaY;
    const multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? this.pitch : 1;
    if (!delta || !this.canStep(Math.sign(delta))) return;
    event.preventDefault();
    const now = performance.now();
    if (now - this.wheelTime > 140 || Math.sign(this.wheelOffset) !== Math.sign(delta)) this.wheelOffset = 0;
    this.wheelTime = now;
    this.wheelOffset += delta * multiplier;
    if (Math.abs(this.wheelOffset) < 28 || now - this.lastWheelStep < 220) return;
    this.lastWheelStep = now;
    this.wheelOffset = 0;
    this.step(Math.sign(delta));
  }

  canStep(direction) {
    const target = this.target + direction;
    return this.looping || (target >= 0 && target < this.items.length);
  }

  step(direction) {
    if (this.canStep(direction)) this.moveTo(this.target + direction);
  }

  moveTo(position) {
    if (!this.active || !this.items.length) return;
    this.releaseDrag();
    this.stopAnimation();
    const start = this.position;
    const target = this.looping ? position : clamp(position, 0, this.items.length - 1);
    this.target = target;
    if (this.reducedMotion.matches || Math.abs(target - start) < .001) {
      this.settle(target);
      return;
    }
    this.actions.onCenter(this.host, null);
    const duration = Math.min(560, 260 + 145 * Math.abs(target - start));
    const time = performance.now();
    const advance = now => {
      const progress = clamp((now - time) / duration, 0, 1);
      if (progress === 1) {
        this.frame = 0;
        this.settle(target);
        return;
      }
      this.position = start + (target - start) * (1 - (1 - progress) ** 3);
      this.paint();
      this.frame = requestAnimationFrame(advance);
    };
    this.frame = requestAnimationFrame(advance);
  }

  settle(position) {
    const index = Math.round(position);
    this.index = this.looping ? wrap(index, this.items.length) : clamp(index, 0, this.items.length - 1);
    this.position = this.target = this.index;
    this.updateCaption();
    this.paint();
    this.updateCenter();
  }

  stopAnimation() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  pointerDown(event) {
    if (!this.active || this.drag || !event.isPrimary || event.button !== 0 || this.items.length < 2 ||
        event.target.closest('.carousel-preview')) return;
    this.drag = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    if (event.pointerType === 'mouse') this.stage.focus({ preventScroll: true });
  }

  pointerMove(event) {
    const drag = this.drag;
    if (!drag || drag.id !== event.pointerId) return;
    const delta = drag.x - event.clientX;
    if (!drag.moved) {
      const vertical = Math.abs(drag.y - event.clientY);
      if (vertical > Math.abs(delta) && vertical > 8) {
        this.releaseDrag();
        return;
      }
      if (Math.abs(delta) < 8) return;
      this.stopAnimation();
      drag.start = this.position;
      drag.moved = true;
      this.stage.setPointerCapture(event.pointerId);
      this.stage.classList.add('is-dragging');
      this.updateCenter();
    }
    drag.travel = delta / this.pitch;
    if (this.reducedMotion.matches) return;
    const position = drag.start + drag.travel;
    this.position = this.looping ? position : clamp(position, 0, this.items.length - 1);
    this.paint();
  }

  pointerEnd(event, cancelled = false) {
    const drag = this.drag;
    if (!drag || drag.id !== event.pointerId) return;
    this.releaseDrag();
    if (!drag.moved) return;
    const origin = Math.round(drag.start);
    let target = Math.round(this.position);
    if (!cancelled && target === origin && Math.abs(drag.travel) > .17) target += Math.sign(drag.travel);
    this.moveTo(target);
  }

  releaseDrag() {
    const drag = this.drag;
    this.drag = null;
    if (!drag) return;
    this.stage.classList.remove('is-dragging');
    if (drag.moved) this.clickBlockedUntil = performance.now() + 360;
    if (this.stage.hasPointerCapture(drag.id)) this.stage.releasePointerCapture(drag.id);
  }
}
