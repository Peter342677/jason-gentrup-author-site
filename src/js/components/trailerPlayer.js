export function initTrailerPlayer() {
  const frame = document.querySelector('.trailer-frame');
  if (!frame) return;

  const video = frame.querySelector('.trailer-video');
  const playBtn = frame.querySelector('.trailer-play');

  const play = () => {
    video.setAttribute('controls', '');
    video.play().catch(() => {});
    playBtn.classList.add('is-hidden');
  };

  playBtn.addEventListener('click', play);
  video.addEventListener('click', () => {
    if (video.paused) play();
  });

  video.addEventListener('pause', () => {
    if (!video.ended) return;
    playBtn.classList.remove('is-hidden');
  });
}
