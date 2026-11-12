// An independent implementation of the observed Coverflow 49 panorama motion.
// Project data and detail/password handling stay with the portfolio application.
const mod = (value, length) => ((value % length) + length) % length;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const ANGLE = Math.PI / 11;

export class Panorama {
  constructor(host, actions) {
    this.host = host;
    host.classList.add('panorama');
    this.actions = actions;
    this.items = [];
    this.labels = {};
    this.position = 0;
    this.target = null;
    this.active = false;
    this.visible = false;
    this.hovered = false;
    this.focused = false;
    this.paused = false;
    this.resumeRequested = false;
    this.hoverKey = null;
    this.resumeAt = 0;
    this.resumeTimer = 0;
    this.raf = 0;
    this.lastTime = 0;
    this.captionKey = null;
    this.reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
    host.innerHTML = `
      <div class="panorama-stage" tabindex="0" role="region" aria-roledescription="carousel">
        <div class="panorama-ring"></div>
      </div>
      <div class="panorama-caption">
        <button type="button" class="panorama-title"></button>
        <p class="panorama-subtitle"></p>
        <div class="panorama-actions">
          <button type="button" class="panorama-bookmark pill" aria-pressed="false"></button>
          <button type="button" class="panorama-pin pill" aria-pressed="false"></button>
        </div>
      </div>
      <div class="panorama-navigation">
        <button type="button" class="panorama-previous icon-button"><span aria-hidden="true">←</span></button>
        <span class="panorama-count"></span>
        <button type="button" class="panorama-next icon-button"><span aria-hidden="true">→</span></button>
        <button type="button" class="panorama-pause" aria-pressed="false"></button>
      </div>
      <p class="panorama-hint"></p>
      <span class="panorama-announcement" role="status" aria-live="polite" aria-atomic="true"></span>`;
    this.stage = host.querySelector('.panorama-stage');
    this.ring = host.querySelector('.panorama-ring');
    this.title = host.querySelector('.panorama-title');
    this.subtitle = host.querySelector('.panorama-subtitle');
    this.count = host.querySelector('.panorama-count');
    this.bookmark = host.querySelector('.panorama-bookmark');
    this.pin = host.querySelector('.panorama-pin');
    this.pause = host.querySelector('.panorama-pause');
    this.announcement = host.querySelector('.panorama-announcement');
    this.cards = [];

    host.querySelector('.panorama-previous').addEventListener('click', () => this.step(-1));
    host.querySelector('.panorama-next').addEventListener('click', () => this.step(1));
    this.pause.addEventListener('click', () => {
      this.paused = !this.paused;
      // An explicit play action also works while its button retains focus.
      this.resumeRequested = !this.paused;
      if (this.paused) this.go(Math.round(this.position));
      else this.resumeAt = 0;
      this.updatePause();
      this.wake();
    });
    this.title.addEventListener('click', () => this.openCurrent(this.title));
    this.bookmark.addEventListener('click', () => {
      const item = this.captionItem();
      if (item) this.actions.onBookmark(item.index);
    });
    this.pin.addEventListener('click', () => {
      const item = this.captionItem();
      if (item) this.actions.onPin(item.index);
    });
    host.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return;
      this.hovered = true;
      this.resumeRequested = false;
      this.wake();
    });
    host.addEventListener('pointerleave', () => {
      this.hovered = false;
      this.hoverKey = null;
      this.paintCaption();
      this.wake();
    });
    host.addEventListener('focusin', () => {
      this.focused = true;
      this.resumeRequested = false;
      this.wake();
    });
    host.addEventListener('focusout', event => {
      if (!host.contains(event.relatedTarget)) {
        this.focused = false;
        this.resumeRequested = false;
        this.wake();
      }
    });
    this.stage.addEventListener('pointerdown', event => this.pointerDown(event));
    this.stage.addEventListener('pointermove', event => this.pointerMove(event));
    this.stage.addEventListener('pointerup', event => this.pointerEnd(event));
    this.stage.addEventListener('pointercancel', event => this.pointerEnd(event, true));
    this.stage.addEventListener('lostpointercapture', event => {
      // Touch starts with implicit capture on the card. Transferring that capture
      // to the stage bubbles the card's loss event; it must not cancel the drag.
      if (event.target === this.stage && this.drag?.id === event.pointerId && !this.stage.hasPointerCapture(event.pointerId)) this.pointerEnd(event, true);
    });
    this.stage.addEventListener('dragstart', event => event.preventDefault());
    this.stage.addEventListener('click', event => {
      const card = event.target.closest('.panorama-card');
      if (!card || performance.now() < (this.suppressClickUntil || 0)) return;
      const slot = Number(card.dataset.slot);
      this.hoverKey = null;
      if (Math.abs(slot - this.position) < .14) this.openCurrent(this.stage);
      else this.go(slot);
    });
    this.stage.addEventListener('wheel', event => {
      if (event.ctrlKey || this.items.length < 2) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(delta) < 2) return;
      event.preventDefault();
      const now = performance.now();
      const freshGesture = now - (this.lastWheel || 0) > 180;
      this.lastWheel = now;
      if (freshGesture) this.step(Math.sign(delta));
    }, { passive: false });
    this.stage.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const key = event.key;
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' '].includes(key)) return;
      event.preventDefault();
      this.hoverKey = null;
      if (key === 'ArrowLeft') this.step(-1);
      if (key === 'ArrowRight') this.step(1);
      if (key === 'Home') this.go(this.position + this.nearestOffset(0));
      if (key === 'End') this.go(this.position + this.nearestOffset(this.items.length - 1));
      if (key === 'Enter') this.openCurrent(this.stage);
      if (key === ' ') this.pause.click();
    });
    this.sizes = new ResizeObserver(() => { this.measure(); this.paint(); });
    this.sizes.observe(this.stage);
    this.intersections = new IntersectionObserver(entries => {
      this.visible = entries[0].isIntersecting;
      if (this.visible) this.wake();
      else this.sleep();
    });
    this.intersections.observe(host);
    document.addEventListener('visibilitychange', () => document.hidden ? this.sleep() : this.wake());
    this.dialogOpen = Boolean(document.querySelector('dialog[open]'));
    this.dialogObserver = new MutationObserver(() => {
      this.dialogOpen = Boolean(document.querySelector('dialog[open]'));
      this.wake();
    });
    document.querySelectorAll('dialog').forEach(dialog => {
      this.dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] });
    });
    this.reduceMotion.addEventListener('change', () => {
      this.target = null;
      this.position = Math.round(this.position);
      this.paint();
      this.updatePause();
      this.wake();
    });
  }

  setItems(items, labels) {
    const previousKey = this.items.length ? this.items[mod(Math.round(this.position), this.items.length)].key : null;
    const sameOrder = items.length === this.items.length && items.every((item, i) => item.key === this.items[i].key);
    this.items = items;
    this.labels = labels;
    if (!sameOrder) {
      this.position = Math.max(0, items.findIndex(item => item.key === previousKey));
      this.target = null;
      this.hoverKey = null;
      this.drag = null;
    }
    this.stage.setAttribute('aria-label', labels.region);
    this.title.title = labels.details;
    this.host.querySelector('.panorama-previous').setAttribute('aria-label', labels.previous);
    this.host.querySelector('.panorama-next').setAttribute('aria-label', labels.next);
    this.host.querySelector('.panorama-hint').textContent = labels.hint;
    this.host.querySelectorAll('.panorama-previous, .panorama-next').forEach(button => { button.disabled = items.length < 2; });
    this.updatePause();
    this.captionKey = null;
    this.measure();
    this.paint();
    this.wake();
  }

  setActive(active) {
    this.active = active;
    this.host.hidden = !active;
    if (active) {
      this.measure();
      this.paint();
      this.wake();
    } else {
      this.sleep();
      this.drag = null;
      this.hovered = false;
      this.focused = false;
      this.resumeRequested = false;
      this.hoverKey = null;
      this.stage.classList.remove('is-dragging');
    }
  }

  measure() {
    const width = this.stage.clientWidth;
    if (!width) return;
    this.cardWidth = clamp(width * .19, 150, 228);
    this.spacing = this.cardWidth * 1.12;
    this.radius = this.spacing / Math.sin(ANGLE);
    this.stage.style.perspective = `${this.radius * 1.05}px`;
    this.ring.style.setProperty('--panorama-card-width', `${this.cardWidth}px`);
  }

  nearestOffset(index) {
    if (this.items.length < 5) return index - this.position;
    const length = this.items.length;
    return mod(index - this.position + length / 2, length) - length / 2;
  }

  step(direction) {
    this.resumeRequested = false;
    this.hoverKey = null;
    const next = Math.round(this.target ?? this.position) + direction;
    this.go(this.items.length < 5 ? mod(next, this.items.length) : next);
  }

  go(position) {
    if (!this.items.length) return;
    this.resumeAt = performance.now() + 3500;
    this.hoverKey = null;
    this.target = this.items.length < 5 ? clamp(position, 0, this.items.length - 1) : position;
    if (this.reduceMotion.matches) {
      this.position = this.target;
      this.target = null;
    }
    this.announceAtRest = true;
    this.paint();
    this.wake();
  }

  pointerDown(event) {
    if (!event.isPrimary || event.button !== 0 || this.items.length < 2) return;
    this.target = null;
    this.resumeRequested = false;
    this.hoverKey = null;
    this.drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: event.clientX, time: performance.now(), velocity: 0, moved: false };
    this.sleep();
    if (event.pointerType === 'mouse') this.stage.focus({ preventScroll: true });
  }

  pointerMove(event) {
    const drag = this.drag;
    if (!drag || drag.id !== event.pointerId) return;
    if (!drag.moved) {
      const dx = Math.abs(event.clientX - drag.startX);
      const dy = Math.abs(event.clientY - drag.startY);
      if (dy > dx && dy > 8) { this.drag = null; this.wake(); return; }
      if (dx < 6) return;
      drag.moved = true;
      this.stage.setPointerCapture(event.pointerId);
      this.stage.classList.add('is-dragging');
    }
    const now = performance.now();
    const movement = -(event.clientX - drag.x) / this.spacing;
    drag.velocity = drag.velocity * .35 + movement / Math.max(8, now - drag.time) * .65;
    this.position += movement;
    if (this.items.length < 5) this.position = clamp(this.position, 0, this.items.length - 1);
    drag.x = event.clientX;
    drag.time = now;
    this.paint();
  }

  pointerEnd(event, cancelled = false) {
    const drag = this.drag;
    if (!drag || drag.id !== event.pointerId) return;
    this.drag = null;
    this.stage.classList.remove('is-dragging');
    if (this.stage.hasPointerCapture(event.pointerId)) this.stage.releasePointerCapture(event.pointerId);
    if (drag.moved) {
      this.suppressClickUntil = performance.now() + 400;
      const velocity = cancelled || performance.now() - drag.time > 100 ? 0 : drag.velocity;
      this.go(Math.round(this.position + clamp(velocity * 180, -2, 2)));
    } else this.wake();
  }

  captionItem() {
    return this.items.find(item => item.key === this.hoverKey) || this.items[mod(Math.round(this.position), this.items.length)];
  }

  openCurrent(trigger) {
    const item = this.captionItem();
    if (!item) return;
    this.resumeAt = performance.now() + 3500;
    this.actions.onOpen(item.index, trigger);
  }

  updatePause() {
    const paused = this.paused || this.reduceMotion.matches;
    this.pause.textContent = paused ? this.labels.resume || '' : this.labels.pause || '';
    this.pause.setAttribute('aria-pressed', String(paused));
    this.pause.disabled = this.reduceMotion.matches || this.items.length < 2;
  }

  paintCaption() {
    const item = this.captionItem();
    if (!item) return;
    const key = `${item.key}|${item.title}|${item.bookmarked}|${item.pinned}`;
    if (key === this.captionKey) return;
    this.captionKey = key;
    this.title.textContent = item.title;
    this.title.setAttribute('aria-label', `${this.labels.details}: ${item.title}`);
    this.subtitle.textContent = item.subtitle;
    this.count.textContent = `${String(this.items.indexOf(item) + 1).padStart(2, '0')} / ${String(this.items.length).padStart(2, '0')}`;
    this.bookmark.textContent = item.bookmarked ? this.labels.unbookmark : this.labels.bookmark;
    this.bookmark.setAttribute('aria-pressed', String(item.bookmarked));
    this.pin.textContent = item.pinned ? this.labels.unpin : this.labels.pin;
    this.pin.setAttribute('aria-pressed', String(item.pinned));
    if (!this.reduceMotion.matches) this.title.animate([{ opacity: .35, transform: 'translateY(3px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 180 });
  }

  paint() {
    const count = this.items.length;
    if (!count || !this.cardWidth) return;
    const slots = count < 5 ? Array.from({ length: count }, (_, i) => i) : Array.from({ length: 9 }, (_, i) => Math.floor(this.position) + i - 4);
    while (this.cards.length > slots.length) this.cards.pop().remove();
    while (this.cards.length < slots.length) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'panorama-card';
      card.tabIndex = -1;
      card.addEventListener('pointerenter', event => {
        if (event.pointerType === 'touch' || this.drag) return;
        this.hoverKey = card.dataset.key;
        this.paintCaption();
      });
      card.addEventListener('pointerleave', () => {
        this.hoverKey = null;
        this.paintCaption();
      });
      this.ring.append(card);
      this.cards.push(card);
    }
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const item = this.items[mod(slot, count)];
      const card = this.cards[i];
      const identity = `${item.key}|${item.title}|${item.coverHtml}`;
      if (card._identity !== identity) {
        card._identity = identity;
        card.innerHTML = item.coverHtml;
        card.querySelectorAll('img').forEach(img => { img.draggable = false; });
      }
      card.dataset.key = item.key;
      card.dataset.slot = String(slot);
      card.setAttribute('aria-label', `${this.labels.show}: ${item.title}`);
      const angle = (slot - this.position) * ANGLE;
      const visible = Math.abs(angle) < .88;
      card.style.visibility = visible ? 'visible' : 'hidden';
      card.setAttribute('aria-hidden', String(!visible));
      if (!visible) continue;
      const x = Math.sin(angle) * this.radius;
      const z = (1 - Math.cos(angle)) * this.radius;
      card.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(2)}px, 0, ${z.toFixed(2)}px) rotateY(${(-angle * 180 / Math.PI).toFixed(3)}deg)`;
      card.style.pointerEvents = Math.abs(angle) < .72 ? 'auto' : 'none';
    }
    this.stage.dataset.current = String(mod(Math.round(this.position), count));
    this.paintCaption();
    if (this.announceAtRest && this.target === null) {
      this.announcement.textContent = this.items[mod(Math.round(this.position), count)].title;
      this.announceAtRest = false;
    }
  }

  sleep() {
    cancelAnimationFrame(this.raf);
    clearTimeout(this.resumeTimer);
    this.resumeTimer = 0;
    this.raf = 0;
    this.lastTime = 0;
  }

  canAutoplay() {
    return this.items.length > 1 && !this.paused && !this.reduceMotion.matches &&
      (this.resumeRequested || (!this.hovered && !this.focused));
  }

  wake() {
    if (!this.active || !this.visible || document.hidden || this.drag || this.dialogOpen ||
        (this.target === null && !this.canAutoplay())) {
      this.sleep();
      return;
    }
    const remaining = this.resumeAt - performance.now();
    if (this.target === null && remaining > 0) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.lastTime = 0;
      if (!this.resumeTimer) this.resumeTimer = setTimeout(() => {
        this.resumeTimer = 0;
        this.wake();
      }, remaining);
      return;
    }
    clearTimeout(this.resumeTimer);
    this.resumeTimer = 0;
    if (!this.raf) this.raf = requestAnimationFrame(time => this.tick(time));
  }

  tick(time) {
    this.raf = 0;
    if (!this.active || !this.visible || document.hidden || this.drag || this.dialogOpen) {
      this.sleep();
      return;
    }
    const dt = Math.min(40, this.lastTime ? time - this.lastTime : 16);
    this.lastTime = time;
    if (!this.drag && !this.dialogOpen) {
      if (this.target !== null) {
        this.position += (this.target - this.position) * (1 - Math.exp(-dt / 105));
        if (Math.abs(this.target - this.position) < .0006) {
          this.position = this.target;
          this.target = null;
        }
        this.paint();
      } else if (this.canAutoplay() && time >= this.resumeAt) {
        if (this.items.length < 5) {
          this.go(mod(Math.round(this.position) + 1, this.items.length));
          this.announceAtRest = false;
        } else {
          this.position = mod(this.position + dt * .000075, this.items.length);
          this.paint();
        }
      }
    }
    this.wake();
  }
}
