import '../../styles/tokens.css';
import '../../styles/base.css';
import '../../styles/components.css';
import { initNav } from './nav.js';
import { initReveal, initCountUp } from './reveal.js';
import { initSmoothScroll } from './smoothScroll.js';
import { initCursor, initMagneticButtons } from '../components/cursor.js';
import { initScrollCompass } from '../components/compass.js';
import { initLoader } from '../components/loader.js';
import { initParticles } from '../components/particles.js';
import { initPurchaseReveal } from '../components/panelReveal.js';

export function bootApp() {
  initLoader();
  initNav();
  initReveal();
  initCountUp();
  initSmoothScroll();
  initCursor();
  initMagneticButtons();
  initScrollCompass();
  initParticles();
  initPurchaseReveal();
}
