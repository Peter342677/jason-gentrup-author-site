/**
 * Defers the hero background video until after window load so it never
 * competes with critical-path resources, skips it entirely on
 * prefers-reduced-motion or a constrained connection (poster stays as the
 * background in both cases), and pauses playback while the hero is
 * scrolled out of view.
 */
export function initHeroVideo() {
  const video = document.querySelector('.hero-video');
  if (!video) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const connection = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
  const constrained = connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || ''));

  if (prefersReduced || constrained) return;

  const start = () => {
    video.play().catch(() => {});
  };

  if (document.readyState === 'complete') {
    start();
  } else {
    window.addEventListener('load', start, { once: true });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.1 }
  );
  observer.observe(video);
}
