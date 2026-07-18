import { bootApp } from '../core/app.js';
import { initFragmentStory } from '../components/scrollStory.js';
import { initHeroBook } from '../components/book3d.js';
import { initFirstVisitIntro } from '../components/loader.js';
import { initHeroVideo } from '../components/heroVideo.js';
import { initTrailerPlayer } from '../components/trailerPlayer.js';

bootApp();

initFragmentStory();
initHeroBook();
initFirstVisitIntro();
initHeroVideo();
initTrailerPlayer();
