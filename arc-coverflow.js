// Independent implementation of the publicly visible Coverflow 5 arc layout.
// The application owns project data, saved state and protected project access.
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const ANGLE = 8;
const DRAG_STEP = 90;

export class ArcCoverflow {
  constructor(host, actions) {
    this.host = host;
    this.actions = actions;
    this.items = [];
    this.cards = new Map();
    this.labels = {};
    this.index = 0;
    this.active = false;
    this.drag = null;
    this.captionKey = null;
    this.suppressClickUntil = 0;
    this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    host.classList.add('arc-coverflow');
    host.innerHTML = `
      <div class="arc-stage" tabindex="0" role="region"></div>
      <div class="arc-caption">
        <button type="button" class="arc-title"></button>
        <p class="arc-subtitle"></p>
        <div class="arc-actions">
          <button type="button" class="arc-bookmark pill" aria-pressed="false"></button>
          <span class="arc-count"></span>
          <button type="button" class="arc-pin pill" aria-pressed="false"></button>
        </div>
      </div>
      <span class="arc-announcement" role="status" aria-live="polite" aria-atomic="true"></span>`;
    this.stage = host.querySelector('.arc-stage');
    this.title = host.querySelector('.arc-title');
    this.subtitle = host.querySelector('.arc-subtitle');
    this.count = host.querySelector('.arc-count');
    this.bookmark = host.querySelector('.arc-bookmark');
    this.pin = host.querySelector('.arc-pin');
    this.announcement = host.querySelector('.arc-announcement');

    this.title.addEventListener('click', () => this.openCurrent(this.title));
    this.bookmark.addEventListener('click', () => {
      const item = this.items[this.index];
      if (item) this.actions.onBookmark(item.index);
    });
    this.pin.addEventListener('click', () => {
      const item = this.items[this.index];
      if (item) this.actions.onPin(item.index);
    });
    this.stage.addEventListener('click', event => {
      if (event.target.closest('.carousel-preview')) return;
      const card = event.target.closest('.arc-card');
      if (!this.active || !card || performance.now() < this.suppressClickUntil) return;
      const index = this.items.findIndex(item => item.key === card.dataset.key);
      if (index === this.index) this.openCurrent(card.coverButton);
      else this.go(index);
    });
    this.stage.addEventListener('keydown', event => {
      if (!this.active || event.target.closest('.carousel-preview') || event.altKey || event.ctrlKey || event.metaKey) return;
      const { key } = event;
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) {
        event.preventDefault();
        const fromCard = Boolean(event.target.closest('.arc-card'));
        if (fromCard) this.stage.focus({ preventScroll: true });
        this.resetDrag();
        this.go(key === 'Home' ? 0 : key === 'End' ? this.items.length - 1 : this.index + (key === 'ArrowRight' ? 1 : -1));
        if (fromCard) this.cards.get(this.items[this.index]?.key)?.coverButton.focus({ preventScroll: true });
      } else if ((key === 'Enter' || key === ' ') && event.target === this.stage) {
        // Native card buttons handle their own Enter/Space activation.
        event.preventDefault();
        this.openCurrent(this.stage);
      }
    });
    this.stage.addEventListener('pointerdown', event => this.pointerDown(event));
    this.stage.addEventListener('pointermove', event => this.pointerMove(event));
    this.stage.addEventListener('pointerup', event => this.pointerEnd(event));
    this.stage.addEventListener('pointercancel', event => this.pointerEnd(event));
    this.stage.addEventListener('pointerleave', event => {
      if (this.drag?.id === event.pointerId && !this.drag.moved) this.resetDrag();
    });
    this.stage.addEventListener('lostpointercapture', event => {
      // Transferring a touch's implicit capture from a card bubbles its own loss.
      if (event.target === this.stage && this.drag?.id === event.pointerId && !this.stage.hasPointerCapture(event.pointerId)) this.pointerEnd(event);
    });
    this.stage.addEventListener('dragstart', event => {
      if (!event.target.closest('.carousel-preview')) event.preventDefault();
    });
    this.reducedMotion.addEventListener('change', () => {
      if (this.reducedMotion.matches) this.titleAnimation?.cancel();
    });
  }

  setItems(items, labels) {
    const previousKey = this.items[this.index]?.key;
    const sameOrder = items.length === this.items.length && items.every((item, index) => item.key === this.items[index].key);
    if (!sameOrder) this.resetDrag();
    this.items = items;
    this.labels = labels;
    const previousIndex = items.findIndex(item => item.key === previousKey);
    this.index = previousIndex >= 0 ? previousIndex : Math.min(4, Math.floor(Math.max(0, items.length - 1) / 2));
    this.stage.setAttribute('aria-label', labels.region);
    this.stage.setAttribute('aria-roledescription', labels.carouselRole);
    this.title.title = labels.details;

    const keys = new Set(items.map(item => item.key));
    for (const [key, card] of this.cards) {
      if (keys.has(key)) continue;
      if (card.contains(document.activeElement)) this.stage.focus({ preventScroll: true });
      card.remove();
      this.cards.delete(key);
    }
    for (const item of items) {
      let card = this.cards.get(item.key);
      if (!card) {
        card = document.createElement('div');
        card.className = 'arc-card';
        const coverButton = document.createElement('button');
        coverButton.type = 'button';
        coverButton.className = 'carousel-card-cover';
        card.coverButton = coverButton;
        card.append(coverButton);
        card.dataset.key = item.key;
        this.cards.set(item.key, card);
        this.stage.append(card);
      }
      card.dataset.index = item.index;
      if (card.coverHtml !== item.coverHtml) {
        card.coverButton.innerHTML = item.coverHtml;
        card.coverHtml = item.coverHtml;
      }
    }
    this.paint();
  }

  setActive(active) {
    this.active = active;
    this.host.hidden = !active;
    if (!active) {
      this.resetDrag();
      this.titleAnimation?.cancel();
    }
    this.updateCenter();
  }

  go(index) {
    if (!this.items.length) return;
    const next = clamp(index, 0, this.items.length - 1);
    if (next === this.index) return;
    this.index = next;
    this.paint();
  }

  updateCenter() {
    const current = this.items[this.index];
    const card = this.active && !this.drag?.moved && current ? this.cards.get(current.key) : null;
    const item = card ? current : undefined;
    if (this.centerCard === card && this.centerItem === item) return;
    this.centerCard = card;
    this.centerItem = item;
    this.actions.onCenter(this.host, card, item?.index);
  }

  paint() {
    const current = this.items[this.index];
    for (let index = 0; index < this.items.length; index++) {
      const item = this.items[index];
      const card = this.cards.get(item.key);
      const offset = index - this.index;
      const selected = offset === 0;
      const visible = Math.abs(offset) <= 2;
      card.style.transform = `rotate(${clamp(offset, -7, 7) * ANGLE}deg)`;
      card.style.zIndex = String(20 - Math.min(19, Math.abs(offset)));
      card.style.visibility = visible ? 'visible' : 'hidden';
      card.style.pointerEvents = visible ? '' : 'none';
      card.style.opacity = visible ? '1' : '0';
      card.classList.toggle('is-outside', !visible);
      card.inert = !visible;
      card.coverButton.tabIndex = selected ? 0 : -1;
      card.setAttribute('aria-current', String(selected));
      card.setAttribute('aria-hidden', String(!visible));
      card.coverButton.setAttribute('aria-current', String(selected));
      card.coverButton.setAttribute('aria-label', `${selected ? this.labels.details : this.labels.show}: ${item.title}`);
    }
    this.updateCenter();
    if (!current) {
      this.title.textContent = '';
      this.subtitle.textContent = '';
      this.count.textContent = '';
      this.captionKey = null;
      this.announcement.textContent = '';
      return;
    }
    const changed = this.captionKey !== current.key;
    this.title.textContent = current.title;
    this.subtitle.textContent = current.subtitle || '';
    this.count.textContent = `${this.index + 1} / ${this.items.length}`;
    this.bookmark.textContent = current.bookmarked ? this.labels.unbookmark : this.labels.bookmark;
    this.bookmark.setAttribute('aria-pressed', String(current.bookmarked));
    this.pin.textContent = current.pinned ? this.labels.unpin : this.labels.pin;
    this.pin.setAttribute('aria-pressed', String(current.pinned));
    if (changed) {
      this.captionKey = current.key;
      this.titleAnimation?.cancel();
      if (this.active && !this.reducedMotion.matches) {
        this.titleAnimation = this.title.animate(
          [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' }
        );
      }
    }
    this.announcement.textContent = `${current.title}, ${this.index + 1} / ${this.items.length}`;
  }

  openCurrent(trigger) {
    const item = this.items[this.index];
    if (this.active && item) this.actions.onOpen(item.index, trigger);
  }

  pointerDown(event) {
    if (!this.active || event.target.closest('.carousel-preview') || !event.isPrimary || event.button !== 0 || this.items.length < 2) return;
    this.drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, stepX: event.clientX, moved: false };
    if (event.pointerType === 'mouse') this.stage.focus({ preventScroll: true });
  }

  pointerMove(event) {
    const drag = this.drag;
    if (!drag || drag.id !== event.pointerId) return;
    if (!drag.moved) {
      const dx = Math.abs(event.clientX - drag.startX);
      const dy = Math.abs(event.clientY - drag.startY);
      if (dy > dx && dy > 8) { this.resetDrag(); return; }
      if (dx < 8) return;
      drag.moved = true;
      this.stage.setPointerCapture(event.pointerId);
      this.stage.classList.add('is-dragging');
      this.updateCenter();
    }
    const delta = drag.stepX - event.clientX;
    if (Math.abs(delta) >= DRAG_STEP) {
      this.go(this.index + Math.sign(delta));
      drag.stepX = event.clientX;
    }
  }

  pointerEnd(event) {
    if (this.drag?.id !== event.pointerId) return;
    this.resetDrag();
    this.updateCenter();
  }

  resetDrag() {
    const drag = this.drag;
    this.drag = null;
    this.stage.classList.remove('is-dragging');
    if (!drag) return;
    if (drag.moved) this.suppressClickUntil = performance.now() + 400;
    if (this.stage.hasPointerCapture(drag.id)) this.stage.releasePointerCapture(drag.id);
  }
}
