export async function initHeroBook() {
  const stage = document.querySelector('.hero-book-stage');
  const canvasHost = document.getElementById('hero-book-canvas');
  const fallback = document.querySelector('.hero-book-fallback');
  if (!stage || !canvasHost) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasWebGL = (() => {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch {
      return false;
    }
  })();

  if (prefersReduced || !hasWebGL) {
    // Fall back to the static CSS 3D tilt cover already in the markup.
    return;
  }

  const [THREE, { gsap }, { ScrollTrigger }] = await Promise.all([
    import('three'),
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);

  gsap.registerPlugin(ScrollTrigger);
  if (fallback) fallback.style.display = 'none';

  const width = stage.clientWidth;
  const height = stage.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  canvasHost.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.65);
  const key = new THREE.DirectionalLight(0xf2c879, 1.1);
  key.position.set(3, 2, 4);
  const rim = new THREE.DirectionalLight(0xd9a441, 0.5);
  rim.position.set(-3, -1, -2);
  scene.add(ambient, key, rim);

  const coverTexture = new THREE.TextureLoader().load('/assets/book-cover.jpg');
  coverTexture.colorSpace = THREE.SRGBColorSpace;

  const bookWidth = 2.1;
  const bookHeight = 3.15;
  const bookDepth = 0.32;

  const spineColor = new THREE.Color('#16283a');
  const pageColor = new THREE.Color('#efe6d4');

  const materials = [
    new THREE.MeshStandardMaterial({ color: pageColor, roughness: 0.9 }), // right (pages)
    new THREE.MeshStandardMaterial({ color: spineColor, roughness: 0.6 }), // left (spine)
    new THREE.MeshStandardMaterial({ color: pageColor, roughness: 0.9 }), // top
    new THREE.MeshStandardMaterial({ color: pageColor, roughness: 0.9 }), // bottom
    new THREE.MeshStandardMaterial({ map: coverTexture, roughness: 0.45 }), // front cover
    new THREE.MeshStandardMaterial({ color: spineColor, roughness: 0.5 }), // back
  ];

  const geometry = new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth);
  const book = new THREE.Mesh(geometry, materials);
  book.rotation.y = -0.35;
  scene.add(book);

  let targetTiltX = 0;
  let targetTiltY = -0.35;
  let mouseInStage = false;

  stage.addEventListener('mousemove', (e) => {
    const rect = stage.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    targetTiltY = -0.35 + relX * 0.6;
    targetTiltX = -relY * 0.4;
    mouseInStage = true;
  });

  stage.addEventListener('mouseleave', () => {
    mouseInStage = false;
  });

  let floatT = 0;
  function animate() {
    floatT += 0.01;
    book.position.y = Math.sin(floatT) * 0.08;
    book.rotation.x += (targetTiltX - book.rotation.x) * 0.06;
    book.rotation.y += (targetTiltY + (mouseInStage ? 0 : Math.sin(floatT * 0.5) * 0.08) - book.rotation.y) * 0.06;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  ScrollTrigger.create({
    trigger: stage.closest('.hero'),
    start: 'top top',
    end: 'bottom top',
    scrub: 0.6,
    onUpdate: (self) => {
      book.rotation.z = self.progress * 0.6;
      book.position.x = self.progress * 1.4;
      renderer.domElement.style.opacity = String(1 - self.progress);
    },
  });

  window.addEventListener('resize', () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
}
