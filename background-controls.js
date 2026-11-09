import { initParticleBackground } from './particles-background.js?v=20261109-particles-60';

const canvas = document.getElementById('particle-background');
const controls = document.querySelector('.background-tools');
const next = document.getElementById('background-next');
const toggle = document.getElementById('background-pause');
const hint = document.getElementById('background-hint');
const motion = matchMedia('(prefers-reduced-motion: reduce)');

if (canvas && controls && next && toggle && hint) {
  const background = initParticleBackground(canvas);
  let paused = false;
  const syncLabels = () => {
    const english = document.documentElement.lang.startsWith('en');
    hint.textContent = motion.matches
      ? (english ? 'Reduced motion is on' : '已跟随系统减少动态效果')
      : (english ? 'Move to play · Click to morph' : '移动拨动 · 点击变形');
    next.textContent = english ? 'Change shape' : '变换背景';
    toggle.textContent = motion.matches ? (english ? 'Motion reduced' : '动态效果已减少')
      : paused ? (english ? 'Resume motion' : '继续动效') : (english ? 'Pause motion' : '暂停动效');
    toggle.setAttribute('aria-pressed', String(paused || motion.matches));
    toggle.disabled = motion.matches;
  };
  next.addEventListener('click', () => background.nextShape());
  toggle.addEventListener('click', () => {
    paused = !paused;
    background.setPaused(paused);
    syncLabels();
  });
  const language = new MutationObserver(syncLabels);
  language.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  motion.addEventListener('change', syncLabels);
  syncLabels();
  controls.hidden = false;
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    background.destroy();
    language.disconnect();
    motion.removeEventListener('change', syncLabels);
  }, { once: true });
}
