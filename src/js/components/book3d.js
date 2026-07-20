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
  renderer.domElement.style.touchAction = 'none';
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
  const pageColorDim = new THREE.Color('#e2d8c2');

  const pageMat = new THREE.MeshStandardMaterial({ color: pageColor, roughness: 0.9 });
  const spineMat = new THREE.MeshStandardMaterial({ color: spineColor, roughness: 0.6 });

  // Root group — everything (cover, pages, block) tilts/floats/spins together.
  const bookGroup = new THREE.Group();
  bookGroup.rotation.y = -0.35;
  scene.add(bookGroup);

  // The page block: what's left once the front cover swings open.
  const pagesGeometry = new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth);
  const pagesBlock = new THREE.Mesh(pagesGeometry, [
    pageMat, // right
    spineMat, // left (spine)
    pageMat, // top
    pageMat, // bottom
    pageMat, // front — visible once the cover opens
    spineMat, // back
  ]);
  bookGroup.add(pagesBlock);

  // Front cover — a thin hinged box so it has a believable inside-cover face too.
  const coverPivot = new THREE.Group();
  coverPivot.position.set(-bookWidth / 2, 0, bookDepth / 2);
  bookGroup.add(coverPivot);

  const coverDepth = 0.03;
  const coverGeometry = new THREE.BoxGeometry(bookWidth, bookHeight, coverDepth);
  coverGeometry.translate(bookWidth / 2, 0, 0);
  const coverMesh = new THREE.Mesh(coverGeometry, [
    pageMat,
    spineMat,
    pageMat,
    pageMat,
    new THREE.MeshStandardMaterial({ map: coverTexture, roughness: 0.45 }), // outside
    new THREE.MeshStandardMaterial({ color: pageColorDim, roughness: 0.9 }), // inside cover
  ]);
  coverPivot.add(coverMesh);

  // A couple of fanned inner pages, revealed as the cover opens.
  const pagePivots = [0.985, 0.965].map((zFactor, i) => {
    const pivot = new THREE.Group();
    pivot.position.set(-bookWidth / 2, 0, bookDepth * zFactor);
    bookGroup.add(pivot);

    const geo = new THREE.BoxGeometry(bookWidth * 0.985, bookHeight * 0.985, 0.012);
    geo.translate((bookWidth * 0.985) / 2, 0, 0);
    const mat = new THREE.MeshStandardMaterial({ color: i === 0 ? pageColor : pageColorDim, roughness: 0.95 });
    const mesh = new THREE.Mesh(geo, mat);
    pivot.add(mesh);
    return pivot;
  });

  let isOpen = false;
  const openTimeline = gsap.timeline({ paused: true })
    .to(coverPivot.rotation, { y: -2.35, duration: 1.1, ease: 'power3.out' }, 0)
    .to(pagePivots[0].rotation, { y: -1.3, duration: 1, ease: 'power3.out' }, 0.08)
    .to(pagePivots[1].rotation, { y: -0.85, duration: 0.95, ease: 'power3.out' }, 0.16);

  function setOpen(open) {
    isOpen = open;
    stage.classList.toggle('is-open', open);
    if (open) openTimeline.play();
    else openTimeline.reverse();
  }

  // Mouse-parallax tilt (suspended while dragging).
  let targetTiltX = 0;
  let targetTiltY = -0.35;
  let mouseInStage = false;
  let isDragging = false;
  let dragMoved = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragBaseRotX = 0;
  let dragBaseRotY = 0;

  stage.addEventListener('mousemove', (e) => {
    if (isDragging) return;
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

  stage.style.cursor = 'grab';

  stage.addEventListener('pointerdown', (e) => {
    stage.classList.add('has-interacted');
    isDragging = true;
    dragMoved = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragBaseRotX = bookGroup.rotation.x;
    dragBaseRotY = bookGroup.rotation.y;
    stage.style.cursor = 'grabbing';
    stage.setPointerCapture(e.pointerId);
  });

  stage.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragMoved = true;
    bookGroup.rotation.y = dragBaseRotY + dx * 0.012;
    bookGroup.rotation.x = Math.max(-0.5, Math.min(0.5, dragBaseRotX - dy * 0.01));
  });

  function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    stage.style.cursor = 'grab';
    targetTiltY = bookGroup.rotation.y;
    targetTiltX = bookGroup.rotation.x;
    if (!dragMoved) setOpen(!isOpen);
  }

  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  let floatT = 0;
  function animate() {
    floatT += 0.01;
    bookGroup.position.y = Math.sin(floatT) * 0.08;
    if (!isDragging) {
      bookGroup.rotation.x += (targetTiltX - bookGroup.rotation.x) * 0.06;
      bookGroup.rotation.y += (targetTiltY + (mouseInStage ? 0 : Math.sin(floatT * 0.5) * 0.08) - bookGroup.rotation.y) * 0.06;
    }
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
      bookGroup.rotation.z = self.progress * 0.6;
      bookGroup.position.x = self.progress * 1.4;
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
