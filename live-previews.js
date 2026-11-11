// Keep the child document large enough to render its own layout, then scale it
// into the card. Only the closest previews to the viewport stay mounted.
const FRAME_WIDTH = 800;
const FRAME_HEIGHT = 450;
const LOAD_TIMEOUT = 12000;

export function previewUrl(value, isFilm) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return '';
    if (!isFilm && url.origin === location.origin) {
      const pagePath = path => path.replace(/\/index\.html$/, '/').replace(/\/$/, '');
      if (pagePath(url.pathname) === pagePath(location.pathname)) return '';
    }
    return url.href;
  } catch {
    return '';
  }
}

export function bindFilm(host) {
  const button = host.querySelector('.video-start');
  button.addEventListener('click', () => {
    if (host.querySelector('video')) return;
    const video = document.createElement('video');
    const poster = host.querySelector('img');
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('aria-label', host.dataset.title);
    if (poster) video.poster = poster.src;
    button.hidden = true;
    host.append(video);
    video.addEventListener('error', () => {
      video.remove();
      button.hidden = false;
      host.dataset.previewState = 'unavailable';
    }, { once: true });
    video.src = host.dataset.previewUrl;
    host.dataset.previewState = 'ready';
    video.play().catch(() => { /* Native controls remain available after a blocked play. */ });
  });
}

export class LivePreviews {
  constructor() {
    this.sites = new Map();
    this.pending = 0;
    this.intersections = new IntersectionObserver(entries => {
      for (const { target, isIntersecting } of entries) {
        const site = this.sites.get(target);
        if (site) site.nearby = isIntersecting;
        else if (!isIntersecting) target.querySelector('video')?.pause();
      }
      this.schedule();
    }, { rootMargin: '0px 0px 96px', threshold: [0, .2, .5, .85, 1] });
    this.sizes = new ResizeObserver(entries => {
      for (const entry of entries) {
        const site = this.sites.get(entry.target);
        if (site?.frame && entry.contentRect.width) this.scale(site);
      }
      this.schedule();
    });
    window.addEventListener('resize', () => this.schedule());
  }

  reset(hosts) {
    this.intersections.disconnect();
    this.sizes.disconnect();
    this.sites.forEach(site => this.unmount(site));
    this.sites.clear();
    hosts.forEach(host => {
      if (host.dataset.kind === 'site') {
        const site = { host, frame: null, nearby: false, cover: false, timer: 0 };
        this.sites.set(host, site);
        const toggle = host.querySelector('.preview-toggle');
        toggle.addEventListener('click', () => {
          site.cover = !site.cover;
          toggle.setAttribute('aria-pressed', String(site.cover));
          if (site.cover) this.unmount(site);
          this.schedule();
        });
      } else {
        bindFilm(host);
      }
      this.intersections.observe(host);
    });
  }

  schedule() {
    if (!this.pending) this.pending = requestAnimationFrame(() => {
      this.pending = 0;
      this.reconcile();
    });
  }

  reconcile() {
    const eligible = [];
    this.sites.forEach(site => {
      if (!site.nearby || site.cover || site.host.closest('[hidden]')) return;
      const bounds = site.host.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const visible = Math.max(0, Math.min(innerHeight, bounds.bottom) - Math.max(60, bounds.top));
      eligible.push({ site, score: visible / bounds.height, top: bounds.top });
    });
    eligible.sort((a, b) => b.score - a.score || a.top - b.top);
    const limit = innerWidth > 760 ? 3 : innerWidth > 520 ? 2 : 1;
    const active = new Set(eligible.slice(0, limit).map(item => item.site));
    this.sites.forEach(site => {
      if (active.has(site)) {
        if (!site.frame && site.host.dataset.previewState !== 'unavailable') this.mount(site);
      } else {
        this.unmount(site);
      }
    });
  }

  scale(site) {
    const scale = site.host.clientWidth / FRAME_WIDTH;
    site.frame.style.transform = 'scale(' + scale + ')';
  }

  mount(site) {
    const { host } = site;
    const frame = document.createElement('iframe');
    frame.className = 'site-preview';
    frame.title = host.dataset.title;
    frame.width = FRAME_WIDTH;
    frame.height = FRAME_HEIGHT;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    const url = new URL(host.dataset.previewUrl);
    const ownerPage = url.origin === location.origin && location.hostname === 'sugarvei.github.io';
    // Published same-origin portfolio pages are owned by SugarV and use the
    // same web origin as the gallery. Other origins remain inside a sandbox.
    if (!ownerPage) {
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-pointer-lock');
    }
    const toggle = host.querySelector('.preview-toggle');
    site.frame = frame;
    host.dataset.previewState = 'loading';
    const showCover = () => {
      if (site.frame !== frame) return;
      this.unmount(site);
      host.dataset.previewState = 'unavailable';
      toggle.hidden = true;
    };
    frame.addEventListener('load', () => {
      if (site.frame !== frame) return;
      clearTimeout(site.timer);
      host.dataset.previewState = 'ready';
      toggle.hidden = false;
    }, { once: true });
    frame.addEventListener('error', showCover, { once: true });
    site.timer = setTimeout(showCover, LOAD_TIMEOUT);
    frame.src = url.href;
    host.append(frame);
    this.scale(site);
    this.sizes.observe(host);
  }

  unmount(site) {
    clearTimeout(site.timer);
    if (!site.frame) return;
    this.sizes.unobserve(site.host);
    site.frame.remove();
    site.frame = null;
    site.host.dataset.previewState = 'cover';
    site.host.querySelector('.preview-toggle').hidden = !site.cover;
  }
}
