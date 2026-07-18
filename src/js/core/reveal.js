import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export function initReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dividers = document.querySelectorAll('.divider');
  const bodyTargets = document.querySelectorAll('[data-reveal]:not(h1):not(h2)');
  const headings = document.querySelectorAll('h1[data-reveal], h2[data-reveal]');

  if (prefersReduced) {
    dividers.forEach((el) => el.classList.add('is-visible'));
    bodyTargets.forEach((el) => (el.style.opacity = 1));
    headings.forEach((el) => (el.style.opacity = 1));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
  );

  dividers.forEach((el) => observer.observe(el));

  bodyTargets.forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 26 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      }
    );
  });

  headings.forEach((el) => {
    const split = new SplitText(el, { type: 'lines', linesClass: 'split-line' });
    split.lines.forEach((line) => {
      const wrapper = document.createElement('span');
      wrapper.className = 'split-line-mask';
      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
    });

    gsap.fromTo(
      split.lines,
      { yPercent: 110 },
      {
        yPercent: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 85%' },
      }
    );
  });
}

export function initCountUp() {
  const nodes = document.querySelectorAll('[data-count-to]');
  if (!nodes.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animate = (el) => {
    const target = Number(el.dataset.countTo);
    if (prefersReduced) {
      el.textContent = String(target);
      return;
    }
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  nodes.forEach((el) => observer.observe(el));
}
