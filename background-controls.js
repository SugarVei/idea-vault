import { initParticleBackground } from './particles-background.js?v=20261109-glass';

const canvas = document.getElementById('particle-background');

if (canvas) {
  const background = initParticleBackground(canvas);
  window.addEventListener('pagehide', event => {
    if (!event.persisted) background.destroy();
  }, { once: true });
}
