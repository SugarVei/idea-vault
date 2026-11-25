import { compactArtwork } from './compact-artwork.js?v=1';

export class CompactGallery {
  constructor(host, actions, icon) {
    this.host = host;
    this.cards = new Map();
    this.template = document.createElement('template');
    this.template.innerHTML = `
      <article class="compact-card">
        <h2>
          <button type="button" class="compact-open">
            <span class="compact-fallback" aria-hidden="true"></span>
            <span class="compact-lock" aria-hidden="true">${icon('lock')}</span>
            <span class="compact-art" aria-hidden="true"><img alt="" decoding="async" draggable="false"></span>
            <span class="compact-caption"><span class="compact-title"></span><span class="compact-descriptor"></span></span>
          </button>
        </h2>
        <details class="compact-options" name="compact-project-actions">
          <summary><span aria-hidden="true"></span></summary>
          <div class="compact-menu">
            <button type="button" data-compact-action="bookmark">${icon('bookmark')}<span></span></button>
            <button type="button" data-compact-action="pin">${icon('pin')}<span></span></button>
          </div>
        </details>
      </article>`;
    host.classList.add('compact-gallery');
    host.setAttribute('role', 'region');
    host.addEventListener('load', event => {
      if (event.target.tagName === 'IMG') event.target.classList.add('is-ready');
    }, true);
    host.addEventListener('error', event => {
      if (event.target.tagName === 'IMG') event.target.hidden = true;
    }, true);
    host.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      const index = Number(button.closest('.compact-card').dataset.index);
      const action = button.dataset.compactAction;
      if (!action) {
        actions.onOpen(index, button);
        return;
      }
      const options = button.closest('details');
      options.open = false;
      options.querySelector('summary').focus({ preventScroll: true });
      if (action === 'bookmark') actions.onBookmark(index);
      else actions.onPin(index);
    });
    host.addEventListener('keydown', event => {
      const open = event.target.closest('details[open]');
      if (event.key === 'Escape' && open) {
        open.open = false;
        open.querySelector('summary').focus();
      }
    });
    host.addEventListener('focusout', event => {
      const open = event.target.closest('details[open]');
      if (open && !open.contains(event.relatedTarget)) open.open = false;
    });
    document.addEventListener('click', event => {
      const open = host.querySelector('details[open]');
      if (open && !open.contains(event.target)) open.open = false;
    });
  }

  setItems(items, labels) {
    this.host.setAttribute('aria-label', labels.region);
    const focused = this.host.contains(document.activeElement) ? document.activeElement : null;
    const indices = new Set(items.map(item => item.index));
    for (const [index, card] of this.cards) {
      if (indices.has(index)) continue;
      card.remove();
      this.cards.delete(index);
    }
    let next = this.host.firstElementChild;
    items.forEach((item, position) => {
      let card = this.cards.get(item.index);
      if (!card) {
        card = this.template.content.firstElementChild.cloneNode(true);
        card.dataset.index = item.index;
        this.cards.set(item.index, card);
      }
      this.updateCard(card, item, labels, position);
      if (card === next) next = next.nextElementSibling;
      else this.host.insertBefore(card, next);
    });
    if (focused && document.activeElement !== focused) {
      const target = focused.isConnected ? focused : this.host.querySelector('.compact-open');
      target?.focus({ preventScroll: true });
    }
  }

  updateCard(card, item, labels, position) {
    const artwork = item.locked ? {} : compactArtwork(item);
    card.dataset.treatment = artwork.treatment || 'full';
    card.dataset.locked = String(item.locked);
    card.style.setProperty('--compact-color', artwork.background || item.accent || '#585f6c');
    card.style.setProperty('--compact-position', artwork.position || '50% 42%');
    const img = card.querySelector('img');
    const src = item.locked ? '' : artwork.src || item.coverSrc;
    img.loading = position < 7 ? 'eager' : 'lazy';
    if (!src) {
      img.removeAttribute('src');
      img.classList.remove('is-ready');
      img.hidden = true;
    } else if (img.getAttribute('src') !== src) {
      img.classList.remove('is-ready');
      img.hidden = false;
      img.src = src;
    }

    const open = card.querySelector('.compact-open');
    const label = item.locked ? item.subtitle : labels.details;
    open.setAttribute('aria-label', label + ' · ' + item.title);
    open.title = item.title;
    const separator = item.title.indexOf('·');
    const hasDescriptor = separator > 0 && separator < item.title.length - 1;
    const primaryTitle = hasDescriptor ? item.title.slice(0, separator).trim() : item.title;
    const descriptor = card.querySelector('.compact-descriptor');
    card.querySelector('.compact-title').textContent = primaryTitle;
    descriptor.textContent = hasDescriptor ? item.title.slice(separator + 1).trim() : '';
    descriptor.hidden = !hasDescriptor;
    card.querySelector('.compact-fallback').textContent = Array.from(item.title.trim())[0] || '';
    const summary = card.querySelector('summary');
    summary.setAttribute('aria-label', labels.actions + ' · ' + item.title);
    summary.title = labels.actions;
    for (const [action, active, text] of [
      ['bookmark', item.bookmarked, item.bookmarked ? labels.unbookmark : labels.bookmark],
      ['pin', item.pinned, item.pinned ? labels.unpin : labels.pin]
    ]) {
      const button = card.querySelector('[data-compact-action="' + action + '"]');
      button.setAttribute('aria-pressed', String(active));
      button.querySelector('span').textContent = text;
    }
  }
}
