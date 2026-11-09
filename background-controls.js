import { initParticleBackground } from './particles-background.js?v=20261109-particle-field';

const canvas = document.getElementById('particle-background');
const controls = document.querySelector('.background-tools');
const pulse = document.getElementById('background-pulse');
const toggle = document.getElementById('background-pause');
const hint = document.getElementById('background-hint');
const motion = matchMedia('(prefers-reduced-motion: reduce)');

if (canvas) {
  const background = initParticleBackground(canvas);
  let paused = false;
  const syncLabels = () => {
    if (!controls || !pulse || !toggle || !hint) return;
    const english = document.documentElement.lang.startsWith('en');
    hint.textContent = motion.matches
      ? (english ? 'Reduced motion is on' : '已跟随系统减少动态效果')
      : paused ? (english ? 'Motion is paused' : '动效已暂停')
      : (english ? 'Move to play · Click to scatter' : '移动拨动 · 点击扩散');
    pulse.textContent = english ? 'Scatter particles' : '扩散粒子';
    pulse.disabled = paused || motion.matches;
    toggle.textContent = motion.matches ? (english ? 'Motion reduced' : '动态效果已减少')
      : paused ? (english ? 'Resume motion' : '继续动效') : (english ? 'Pause motion' : '暂停动效');
    toggle.setAttribute('aria-pressed', String(paused || motion.matches));
    toggle.disabled = motion.matches;
  };
  pulse?.addEventListener('click', () => background.pulse());
  toggle?.addEventListener('click', () => {
    paused = !paused;
    background.setPaused(paused);
    syncLabels();
  });
  const language = new MutationObserver(syncLabels);
  language.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  motion.addEventListener('change', syncLabels);
  syncLabels();
  if (controls) controls.hidden = false;
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    background.destroy();
    language.disconnect();
    motion.removeEventListener('change', syncLabels);
  }, { once: true });
}
