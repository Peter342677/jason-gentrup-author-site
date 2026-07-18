/**
 * A persistent field of glowing gold motes drifting behind the entire
 * site — fixed to the viewport (not the document), so it reads as an
 * ambient light wherever you scroll. Each mote pulses gently and drifts
 * continuously, and the whole field gently repels away from the cursor.
 */
export function initParticles() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  const canvas = document.createElement('canvas');
  canvas.className = 'bg-particles';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let width, height, dpr;
  let particles = [];
  let mouseX = -9999;
  let mouseY = -9999;
  let t = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeParticles() {
    const count = Math.min(55, Math.floor((width * height) / 24000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 1.4,
      vx: (Math.random() - 0.5) * 0.34,
      vy: (Math.random() - 0.5) * 0.34,
      baseOpacity: Math.random() * 0.35 + 0.25,
      twinkleSpeed: Math.random() * 0.02 + 0.008,
      twinklePhase: Math.random() * Math.PI * 2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    t += 1;
    ctx.globalCompositeOperation = 'lighter';

    particles.forEach((p) => {
      if (!prefersReduced) {
        p.x += p.vx;
        p.y += p.vy;
      }

      if (!isTouch && !prefersReduced) {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.hypot(dx, dy);
        const radius = 170;
        if (dist < radius) {
          const force = (radius - dist) / radius;
          p.x += (dx / (dist || 1)) * force * 4;
          p.y += (dy / (dist || 1)) * force * 4;
        }
      }

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      const twinkle = prefersReduced
        ? 1
        : 0.55 + 0.45 * Math.sin(t * p.twinkleSpeed + p.twinklePhase);
      const opacity = p.baseOpacity * twinkle;
      const glowSize = p.size * 7;

      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
      gradient.addColorStop(0, `rgba(242, 200, 121, ${opacity})`);
      gradient.addColorStop(0.35, `rgba(217, 164, 65, ${opacity * 0.5})`);
      gradient.addColorStop(1, 'rgba(217, 164, 65, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255, 240, 210, ${Math.min(opacity * 1.6, 1)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
  }

  resize();
  makeParticles();
  draw();

  window.addEventListener('resize', () => {
    resize();
    makeParticles();
  });

  if (!isTouch) {
    window.addEventListener(
      'mousemove',
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      },
      { passive: true }
    );
  }
}
