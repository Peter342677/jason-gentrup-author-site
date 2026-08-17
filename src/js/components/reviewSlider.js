/**
 * Wires prev/next buttons to a horizontally-scrolling, scroll-snap review
 * slider. Native scroll-snap already handles touch/trackpad drag; this just
 * adds click controls and disables a button at each scroll boundary.
 */
export function initReviewSliders() {
  document.querySelectorAll('.review-slider-block').forEach((block) => {
    const slider = block.querySelector('.review-slider');
    const prevBtn = block.querySelector('[data-slider-prev]');
    const nextBtn = block.querySelector('[data-slider-next]');
    if (!slider || !prevBtn || !nextBtn) return;

    const scrollByCard = (direction) => {
      const card = slider.querySelector('.review-card');
      if (!card) return;
      const gap = parseFloat(getComputedStyle(slider).columnGap || getComputedStyle(slider).gap) || 0;
      slider.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: 'smooth' });
    };

    prevBtn.addEventListener('click', () => scrollByCard(-1));
    nextBtn.addEventListener('click', () => scrollByCard(1));

    const updateButtons = () => {
      const maxScroll = slider.scrollWidth - slider.clientWidth - 1;
      prevBtn.disabled = slider.scrollLeft <= 0;
      nextBtn.disabled = maxScroll <= 0 || slider.scrollLeft >= maxScroll;
    };

    slider.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);
    updateButtons();
  });
}
