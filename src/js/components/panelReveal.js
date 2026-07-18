import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Punchier stagger reveal for the purchase panels — slides up with a
 * slight scale as the section enters on scroll down, instead of the
 * generic fade used elsewhere.
 */
export function initPurchaseReveal() {
  const groups = document.querySelectorAll('[data-purchase-reveal]');
  if (!groups.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  groups.forEach((group) => {
    const panels = group.querySelectorAll('.purchase-panel');
    if (!panels.length) return;

    if (prefersReduced) {
      gsap.set(panels, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    gsap.fromTo(
      panels,
      { opacity: 0, y: 70, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: group,
          start: 'top 82%',
        },
      }
    );
  });
}
