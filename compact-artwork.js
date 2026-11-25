// Match the original cover so replacing it in the editor also updates the compact card.
// Percentages keep the subject in the square crop on desktop and mobile.
const compositions = new Map(Object.entries({
  'assets/stillroom-cover.webp': { position: '66% 45%' },
  'assets/qinglian-cover.svg': { treatment: 'inset', background: '#b3c8bf' },
  'assets/punch-drive-menu.webp': { src: 'assets/punch-drive-garage.webp', position: '74% 45%' },
  'assets/sugar-job-system-dashboard.jpg': { treatment: 'inset', background: '#d4a5ad' },
  'assets/harbor-1.jpg': { position: '55% 45%' },
  'assets/earth-2.jpg': { src: 'assets/earth-0.jpg', position: '49% 39%' },
  'assets/jolly-1.jpg': { position: '50% 28%' },
  'assets/sugar-neon-1.jpg': { treatment: 'inset', background: '#080a06' },
  'assets/sugar-mono-1.jpg': { treatment: 'inset', background: '#d6d6d6' },
  'assets/usb-1.jpg': { src: 'assets/usb-2.jpg', position: '52% 44%' },
  'assets/travel-journal-1.jpg': { src: 'assets/travel-journal-4.jpg', position: '50% 40%' },
  'assets/factory-anatomy-1.webp': { position: '57% 40%' },
  'assets/anatomy-skill-1.webp': { position: '50% 35%' },
  'assets/car-atlas-1.jpg': { position: '67% 44%' },
  'assets/sugarv-1.jpg': { src: 'assets/sugarv-4.jpg', position: '50% 40%' },
  'assets/shijian-stones.jpg': { position: '76% 55%' },
  'assets/ui-gallery-cover.png': { treatment: 'inset', background: '#b6b5a8' },
  'assets/muse-ui-cover.jpg': { treatment: 'inset', background: '#c2bbc7' },
  'assets/pelican-1.jpg': { position: '55% 38%' },
  'assets/jolly-film-cover.webp': { position: '50% 38%' },
  'assets/jolly-poses-cover.webp': { position: '52% 34%' },
  'assets/resume-site-ad-cover.webp': { position: '52% 40%' },
  'assets/sugar-flyover-cover.webp': { position: '55% 44%' },
  'assets/sugar-landing-cover.webp': { treatment: 'inset', background: '#bfc7c8' },
  'assets/shijian-film-cover.webp': { position: '57% 40%' },
  'assets/factory-models-cover.png': { position: '50% 34%' },
  'assets/cimine-chose-gpt.webp': { position: '50% 37%' },
  'assets/cimine-chose-neon.webp': { src: 'assets/cimine-chose-neon-wall.webp', position: '31% 45%' },
  'https://sugarvei.github.io/sugarv-library/assets/sugarv-cover.png': { src: 'assets/sugarv-library-compact.webp', treatment: 'inset', background: '#bfc4ce' },
  'https://repository-images.githubusercontent.com/1167034425/97dbb8a7-2480-4b2a-99ce-d94de1a34f38': { position: '70% 43%' },
  'https://www.airsup.ai/plm/rocket-engine/factory-skill/og.jpg': { position: '30% 40%' },
  'https://www.airsup.ai/plm/rocket-engine/og-skill.jpg': { position: '38% 42%' },
  'https://cdn-thumbnails.huggingface.co/social-thumbnails/datasets/nvidia/simready-assets.png': { treatment: 'inset', background: '#3e3c78' }
}));

export function compactArtwork(item) {
  const src = item.coverSrc || '';
  return { src, position: '50% 42%', treatment: 'full', ...compositions.get(src) };
}
