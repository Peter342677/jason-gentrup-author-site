import { gsap } from 'gsap';

export function initLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const finish = () => {
    if (prefersReduced) {
      loader.style.display = 'none';
      return;
    }
    gsap.to(loader, {
      opacity: 0,
      duration: 0.5,
      delay: 0.15,
      ease: 'power1.out',
      onComplete: () => loader.remove(),
    });
  };

  if (document.readyState === 'complete') {
    finish();
  } else {
    window.addEventListener('load', finish, { once: true });
  }
}

export function initFirstVisitIntro() {
  const heroTitle = document.querySelector('.hero-title');
  const needle = document.querySelector('[data-compass] path');
  if (!heroTitle) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const alreadySeen = sessionStorage.getItem('hc-intro-seen');

  if (prefersReduced || alreadySeen) {
    gsap.set(heroTitle, { opacity: 1, y: 0 });
    return;
  }

  sessionStorage.setItem('hc-intro-seen', '1');

  gsap.set(heroTitle, { opacity: 0, y: 24 });
  if (needle) gsap.set(needle, { opacity: 0, scale: 0.7, transformOrigin: '50% 50%' });

  const tl = gsap.timeline({ delay: 0.5 });
  if (needle) {
    tl.to(needle, { opacity: 0.5, scale: 1, duration: 0.8, ease: 'power2.out' });
  }
  tl.to(heroTitle, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.3');
}
