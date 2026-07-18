import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * The book's thesis, staged as motion: scattered fragments (the hero's
 * shattering stone) drift together into the compass diamond as the reader
 * scrolls out of the hero — fragmentation resolving into coherence.
 */
export function initFragmentStory() {
  const target = document.querySelector('[data-fragment-target]');
  if (!target) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const shardCount = 12;
  const shards = Array.from({ length: shardCount }, () => {
    const shard = document.createElement('span');
    shard.className = 'fragment-shard';
    target.appendChild(shard);
    return shard;
  });

  const startState = shards.map(() => ({
    x: gsap.utils.random(-420, 420),
    y: gsap.utils.random(-260, 260),
    rotation: gsap.utils.random(-180, 180),
    scale: gsap.utils.random(0.6, 1.4),
  }));

  shards.forEach((shard, i) => gsap.set(shard, { ...startState[i], opacity: 0.75 }));

  ScrollTrigger.create({
    trigger: target,
    start: 'top 90%',
    end: 'top 30%',
    scrub: 0.6,
    onUpdate: (self) => {
      const p = self.progress;
      shards.forEach((shard, i) => {
        const s = startState[i];
        gsap.set(shard, {
          x: s.x * (1 - p),
          y: s.y * (1 - p),
          rotation: s.rotation * (1 - p),
          scale: gsap.utils.interpolate(s.scale, 0.2, p),
          opacity: gsap.utils.interpolate(0.75, 0, p),
        });
      });
    },
  });
}
