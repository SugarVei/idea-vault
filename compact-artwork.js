import { compactSamples } from './compact-samples.js?v=2';

// A replacement cover takes effect immediately. Locally hosted covers and posters
// share a basename. These projects use remote cover URLs in the portfolio catalog.
const remotePosters = new Map([
  ['https://sugarvei.github.io/sugarv-library/assets/sugarv-cover.png', 'sugarv-library'],
  ['https://repository-images.githubusercontent.com/1167034425/97dbb8a7-2480-4b2a-99ce-d94de1a34f38', 'nvidia-cad'],
  ['https://www.airsup.ai/plm/rocket-engine/factory-skill/og.jpg', 'airsup-factory'],
  ['https://www.airsup.ai/plm/rocket-engine/og-skill.jpg', 'airsup-machine'],
  ['https://cdn-thumbnails.huggingface.co/social-thumbnails/datasets/nvidia/simready-assets.png', 'nvidia-simready']
]);

export function compactArtwork(item) {
  const cover = item.coverSrc || '';
  const name = item.locked ? 'memory-slides' :
    remotePosters.get(cover) || /^assets\/([\w-]+)\.[\w]+$/.exec(cover)?.[1];
  if (name && Object.hasOwn(compactSamples, name)) {
    return { src: 'assets/compact/' + name + '.webp', sample: compactSamples[name] };
  }
  return { src: item.locked ? '' : cover, sample: '' };
}
