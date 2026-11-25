// Hridoy's 3D portfolio interactions
const cursorGlow = document.getElementById("cursorGlow");
window.addEventListener("pointermove", (event) => {
  cursorGlow.style.left = event.clientX + "px";
  cursorGlow.style.top = event.clientY + "px";
});

// Mobile navigation
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
menuToggle.addEventListener("click", () => nav.classList.toggle("open"));
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

// Rotating role text
const roles = ["Student", "Creative Learner", "Future Developer", "Tech Enthusiast"];
const roleElement = document.getElementById("typedRole");
let roleIndex = 0, charIndex = 0, deleting = false;
function typeRole() {
  const current = roles[roleIndex];
  roleElement.textContent = current.slice(0, charIndex);
  if (!deleting && charIndex < current.length) {
    charIndex++;
    setTimeout(typeRole, 105);
  } else if (deleting && charIndex > 0) {
    charIndex--;
    setTimeout(typeRole, 45);
  } else {
    deleting = !deleting;
    if (!deleting) roleIndex = (roleIndex + 1) % roles.length;
    setTimeout(typeRole, deleting ? 1300 : 250);
  }
}
typeRole();

// Reveal elements as they enter the viewport
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

// Active nav link
const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav-link");
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
      });
    }
  });
}, { rootMargin: "-35% 0px -55% 0px" });
sections.forEach(section => sectionObserver.observe(section));

// Three.js 3D planet. A CSS fallback remains if Three.js cannot load.
(function initPlanet() {
  const canvas = document.getElementById("planetCanvas");
  const wrap = document.getElementById("planetWrap");
  if (!canvas || !window.THREE) {
    if (wrap) wrap.classList.add("planet-fallback");
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.z = 5.3;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const planetGroup = new THREE.Group();
  scene.add(planetGroup);

  const geometry = new THREE.SphereGeometry(1.28, 96, 96);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x7652c9,
    roughness: 0.32,
    metalness: 0.25,
    clearcoat: 0.8,
    clearcoatRoughness: 0.25,
    emissive: 0x24104f,
    emissiveIntensity: 0.35
  });
  const planet = new THREE.Mesh(geometry, material);
  planetGroup.add(planet);

  // Fine glowing latitude/longitude wire detail
  const wire = new THREE.Mesh(
    new THREE.SphereGeometry(1.292, 32, 24),
    new THREE.MeshBasicMaterial({ color: 0xc4b5fd, wireframe: true, transparent: true, opacity: 0.12 })
  );
  planetGroup.add(wire);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.39, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.075, side: THREE.BackSide })
  );
  planetGroup.add(atmosphere);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.78, 0.009, 8, 180),
    new THREE.MeshBasicMaterial({ color: 0x9f8bfa, transparent: true, opacity: 0.62 })
  );
  ring.rotation.x = Math.PI * 0.37;
  ring.rotation.y = Math.PI * 0.12;
  planetGroup.add(ring);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.02, 0.004, 6, 180),
    new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.38 })
  );
  ring2.rotation.x = Math.PI * 0.58;
  ring2.rotation.y = Math.PI * 0.15;
  planetGroup.add(ring2);

  scene.add(new THREE.AmbientLight(0x9a8bd8, 1.15));
  const keyLight = new THREE.PointLight(0xd9c8ff, 3.2, 15);
  keyLight.position.set(3, 3, 4);
  scene.add(keyLight);
  const cyanLight = new THREE.PointLight(0x36c9e8, 2.2, 12);
  cyanLight.position.set(-3, -1, 2);
  scene.add(cyanLight);

  // Small orbiting particles
  const starCount = 260;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const radius = 2.1 + Math.random() * 1.8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({
    color: 0xc4b5fd, size: 0.018, transparent: true, opacity: 0.8
  }));
  scene.add(stars);

  let targetX = 0, targetY = 0;
  wrap.addEventListener("pointermove", event => {
    const rect = wrap.getBoundingClientRect();
    targetY = ((event.clientX - rect.left) / rect.width - 0.5) * 0.65;
    targetX = ((event.clientY - rect.top) / rect.height - 0.5) * 0.45;
  });
  wrap.addEventListener("pointerleave", () => { targetX = 0; targetY = 0; });

  function resize() {
    const width = wrap.clientWidth;
    const height = wrap.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    planet.rotation.y = t * 0.16;
    wire.rotation.y = -t * 0.11;
    ring.rotation.z = Math.sin(t * 0.25) * 0.08;
    ring2.rotation.z = -Math.sin(t * 0.2) * 0.06;
    planetGroup.rotation.x += (targetX - planetGroup.rotation.x) * 0.025;
    planetGroup.rotation.y += (targetY - (planetGroup.rotation.y % (Math.PI * 2))) * 0.012;
    stars.rotation.y = t * 0.012;
    renderer.render(scene, camera);
  }
  animate();
})();
