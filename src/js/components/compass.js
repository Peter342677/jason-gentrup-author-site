import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollCompass() {
  const wrap = document.createElement('div');
  wrap.className = 'scroll-compass';
  wrap.innerHTML = `
    <svg viewBox="0 0 100 100" width="46" height="46">
      <circle cx="50" cy="50" r="46" fill="rgba(14,27,38,0.7)" stroke="var(--gold)" stroke-width="1"/>
      <g id="scroll-needle" style="transform-origin:50px 50px;">
        <path d="M50 14 L57 50 L50 86 L43 50 Z" fill="var(--gold-bright)"/>
      </g>
    </svg>
  `;
  document.body.appendChild(wrap);
  const needle = wrap.querySelector('#scroll-needle');

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function update() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    const rotation = progress * 360;
    if (prefersReduced) {
      needle.style.transform = `rotate(${rotation}deg)`;
    } else {
      gsap.to(needle, { rotation, duration: 0.4, ease: 'power2.out' });
    }
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
}
