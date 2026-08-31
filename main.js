/**
 * CosmoVerse X v2.0 // PHOTOREALISTIC SHADER ENGINE & NEURAL VOICE ARCHITECTURE
 * Dual-Core Engine: Mode A (Observable Universe Simulation) & Mode B (CosmoPedia Apex 3D PBR Studio)
 */

const EngineState = {
  currentMode: 'UNIVERSE', // 'UNIVERSE' | 'COSMOPEDIA'
  selectedPediaId: 'earth',
  currentLang: 'en', // 'en' | 'bn'
  compareEarthActive: false,
  stageAutoRotate: true,
  activeSectorFilter: 'all',
  searchQuery: '',
  shadingMode: 'pbr', // 'pbr' | 'thermal' | 'wireframe'
  sunLightAngle: 45, // degrees (0 - 360)
  savedUniverseCamera: {
    pos: new THREE.Vector3(0, 8, 22),
    target: new THREE.Vector3(0, 0, 0)
  },
  
  // Mode A Simulation state
  timeMultiplier: 1.0,
  isPaused: false,
  activeTarget: 'earth',
  activeTier: 'solarsystem',
  cameraMode: 'orbit',
  flightMode: false,
  isWarping: false,
  showOrbits: true,
  cinematicMode: false,
  voiceActive: false,
  clock: new THREE.Clock(),
  simTime: 0,
  ship: {
    pos: new THREE.Vector3(0, 8, 22),
    vel: new THREE.Vector3(),
    rot: new THREE.Euler(0, 0, 0, 'YXZ'),
    speed: 0,
    maxSpeed: 60.0,
    accel: 30.0
  }
};

const ASTRODYNAMICS_METRICS = {
  universe: { rs: '2.96 × 10²⁶ m', dilation: 'Cosmological a(t)', vorb: '67.4 km/s/Mpc', vesc: '299,792 km/s (c)' },
  cosmicweb: { rs: '1.48 × 10²¹ m', dilation: '1.0000021', vorb: '600 km/s', vesc: '3,500 km/s' },
  milkyway: { rs: '1.20 × 10¹⁰ m', dilation: '1.0000000025', vorb: '220.0 km/s', vesc: '550.0 km/s' },
  sun: { rs: '2.95 km', dilation: '1.00000212', vorb: 'Vis-Viva Solar Core', vesc: '617.5 km/s' },
  mercury: { rs: '0.489 mm', dilation: '1.000000000035', vorb: '47.36 km/s', vesc: '4.25 km/s' },
  venus: { rs: '7.23 mm', dilation: '1.000000000570', vorb: '35.02 km/s', vesc: '10.36 km/s' },
  earth: { rs: '8.87 mm', dilation: '1.000000000696', vorb: '29.78 km/s', vesc: '11.186 km/s' },
  moon: { rs: '0.109 mm', dilation: '1.000000000012', vorb: '1.022 km/s', vesc: '2.38 km/s' },
  mars: { rs: '0.952 mm', dilation: '1.000000000140', vorb: '24.07 km/s', vesc: '5.027 km/s' },
  belt: { rs: '0.0035 mm', dilation: '1.000000000001', vorb: '18.5 km/s', vesc: '0.50 km/s' },
  jupiter: { rs: '2.82 m', dilation: '1.0000000201', vorb: '13.07 km/s', vesc: '59.5 km/s' },
  saturn: { rs: '0.843 m', dilation: '1.0000000068', vorb: '9.68 km/s', vesc: '35.5 km/s' },
  gargantua: { rs: '1.18 × 10⁷ km', dilation: 'Infinite (Horizon)', vorb: 'ISCO: 0.50c', vesc: '300,000 km/s (c)' },
  pulsar: { rs: '4.2 km', dilation: '1.240', vorb: 'Infall: 0.35c', vesc: '150,000 km/s' },
  wormhole: { rs: 'Kerr Metric Throat', dilation: 'Spacetime Fold', vorb: 'Frame Dragging', vesc: '4D Portal' }
};

const AXIAL_TILTS = {
  earth: 23.44 * Math.PI / 180,
  mars: 25.19 * Math.PI / 180,
  jupiter: 3.13 * Math.PI / 180,
  saturn: 26.73 * Math.PI / 180,
  uranus: 97.77 * Math.PI / 180,
  neptune: 28.32 * Math.PI / 180,
  venus: 177.36 * Math.PI / 180,
  mercury: 0.03 * Math.PI / 180,
  moon: 1.54 * Math.PI / 180,
  sun: 7.25 * Math.PI / 180,
  pluto: 122.53 * Math.PI / 180
};

// ============================================================
// 1. SETUP CANVAS & THREE.JS SCENE
// ============================================================
const canvas = document.getElementById('bg');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000108);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3000000);
camera.position.set(0, 8, 22);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  logarithmicDepthBuffer: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setClearColor(0x000108, 1.0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 0.5;
controls.maxDistance = 100000;
controls.target.set(0, 0, 0);

// Clamp Bloom strictly to prevent any white-out
let composer = null;
try {
  if (window.THREE && window.THREE.EffectComposer && window.THREE.UnrealBloomPass) {
    const renderPass = new THREE.RenderPass(scene, camera);
    const bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.25, 0.1, 0.85
    );
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
  }
} catch (e) {
  composer = null;
}

// 2. SCENE LIGHTING RIG
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xfffaed, 2.0, 5000, 0.5);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(100, 150, 100);
scene.add(dirLight);

// Group Roots for Mode A (Universe) and Mode B (Cosmopedia Stage)
const universeGroup = new THREE.Group();
scene.add(universeGroup);

const stageGroup = new THREE.Group();
stageGroup.position.set(0, 0, 0);
scene.add(stageGroup);
stageGroup.visible = false;

// Dedicated rotatable stage directional light for PBR inspection
let stageSunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
stageSunLight.position.set(15, 6, 15);
stageGroup.add(stageSunLight);

const celestialObjects = {};
const orbitLines = [];

function createOrbitRing(radius, color = 0x00f0ff) {
  const pts = []; const segs = 128;
  for (let i = 0; i <= segs; i++) {
    const th = (i / segs) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(th) * radius, 0, Math.sin(th) * radius));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.18 });
  const line = new THREE.Line(geo, mat);
  universeGroup.add(line);
  orbitLines.push(line);
  return line;
}

// 3. ZERO-BOKEH PINPOINT THREE-TIER STARFIELD & MILKY WAY
function buildCrispStarfields() {
  const starCount = 30000;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  const starCols = new Float32Array(starCount * 3);

  const colBlue = new THREE.Color(0xd0e8ff);
  const colWhite = new THREE.Color(0xffffff);
  const colAmber = new THREE.Color(0xffd599);

  for (let i = 0; i < starCount; i++) {
    const r = 5000 + Math.random() * 35000;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(Math.random() * 2 - 1);

    starPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    starPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    starPos[i * 3 + 2] = r * Math.cos(ph);

    const rand = Math.random();
    const c = rand > 0.7 ? colAmber : (rand > 0.3 ? colBlue : colWhite);
    starCols[i * 3] = c.r; starCols[i * 3 + 1] = c.g; starCols[i * 3 + 2] = c.b;
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starCols, 3));

  const starMat = new THREE.PointsMaterial({
    size: 1.0,
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.NormalBlending,
    depthWrite: false
  });
  scene.add(new THREE.Points(starGeo, starMat));

  // Milky Way Spiral Disk
  const mwGroup = new THREE.Group();
  mwGroup.rotation.x = 0.55;

  const mwCount = 40000;
  const mwGeo = new THREE.BufferGeometry();
  const mwPos = new Float32Array(mwCount * 3);
  const mwCols = new Float32Array(mwCount * 3);

  const cCore = new THREE.Color(0xffaa55);
  const cArm = new THREE.Color(0x88ccff);
  const b = 0.38;

  for (let i = 0; i < mwCount; i++) {
    const r = 15 + Math.pow(Math.random(), 1.6) * 320;
    const armIdx = i % 2;
    const th = armIdx * Math.PI + (Math.log(r / 15.0) / b) + (Math.random() - 0.5) * 0.35;

    mwPos[i * 3] = Math.cos(th) * r;
    mwPos[i * 3 + 1] = (Math.random() - 0.5) * (10.0 * Math.exp(-r / 100.0) + 1.0);
    mwPos[i * 3 + 2] = Math.sin(th) * r;

    const t = Math.min(1.0, r / 120.0);
    const c = cCore.clone().lerp(cArm, t);
    mwCols[i * 3] = c.r; mwCols[i * 3 + 1] = c.g; mwCols[i * 3 + 2] = c.b;
  }

  mwGeo.setAttribute('position', new THREE.BufferAttribute(mwPos, 3));
  mwGeo.setAttribute('color', new THREE.BufferAttribute(mwCols, 3));

  const mwMat = new THREE.PointsMaterial({
    size: 1.0,
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.NormalBlending,
    depthWrite: false
  });

  const mwPoints = new THREE.Points(mwGeo, mwMat);
  mwGroup.add(mwPoints);
  universeGroup.add(mwGroup);
  celestialObjects.milkyway = { id: 'milkyway', group: mwGroup, mesh: mwPoints, orbitSpeed: 0, rotationSpeed: 0.0008, angle: 0 };
}



// ============================================================
// 4. PROCEDURAL HIGH-RESOLUTION PBR TEXTURE GENERATION ENGINE
// ============================================================

// Procedural 2D Simplex / Perlin Noise Generator
const SimplexNoise = (function() {
  const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
  const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = Math.floor(Math.random() * 256);
  const perm = new Uint8Array(512);
  const permMod12 = new Uint8Array(512);
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
    permMod12[i] = (perm[i] % 12);
  }
  const grad3 = new Float32Array([
    1,1,0, -1,1,0, 1,-1,0, -1,-1,0,
    1,0,1, -1,0,1, 1,0,-1, -1,0,-1,
    0,1,1, 0,-1,1, 0,1,-1, 0,-1,-1
  ]);

  return {
    noise2D: function(xin, yin) {
      let n0 = 0, n1 = 0, n2 = 0;
      const s = (xin + yin) * F2;
      const i = Math.floor(xin + s);
      const j = Math.floor(yin + s);
      const t = (i + j) * G2;
      const X0 = i - t;
      const Y0 = j - t;
      const x0 = xin - X0;
      const y0 = yin - Y0;
      let i1, j1;
      if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }
      const x1 = x0 - i1 + G2;
      const y1 = y0 - j1 + G2;
      const x2 = x0 - 1.0 + 2.0 * G2;
      const y2 = y0 - 1.0 + 2.0 * G2;
      const ii = i & 255;
      const jj = j & 255;
      let t0 = 0.5 - x0*x0 - y0*y0;
      if (t0 >= 0) {
        const gi0 = permMod12[ii + perm[jj]] * 3;
        t0 *= t0;
        n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0);
      }
      let t1 = 0.5 - x1*x1 - y1*y1;
      if (t1 >= 0) {
        const gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
        t1 *= t1;
        n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
      }
      let t2 = 0.5 - x2*x2 - y2*y2;
      if (t2 >= 0) {
        const gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
        t2 *= t2;
        n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
      }
      return 70.0 * (n0 + n1 + n2);
    },
    fbm: function(x, y, octaves = 6) {
      let val = 0; let amp = 0.5; let freq = 1.0;
      for (let i = 0; i < octaves; i++) {
        val += amp * this.noise2D(x * freq, y * freq);
        amp *= 0.5;
        freq *= 2.0;
      }
      return val;
    }
  };
})();

// Procedural PBR Textures for Earth
function createEarthPBRTextures() {
  const w = 1024; const h = 512;
  
  // 1. Diffuse Albedo Canvas
  const diffCanvas = document.createElement('canvas'); diffCanvas.width = w; diffCanvas.height = h;
  const diffCtx = diffCanvas.getContext('2d');
  
  // 2. Bump / Heightmap Canvas
  const bumpCanvas = document.createElement('canvas'); bumpCanvas.width = w; bumpCanvas.height = h;
  const bumpCtx = bumpCanvas.getContext('2d');
  
  // 3. Specular / Roughness Map Canvas
  const roughCanvas = document.createElement('canvas'); roughCanvas.width = w; roughCanvas.height = h;
  const roughCtx = roughCanvas.getContext('2d');

  // 4. Night-Side City Lights Emissive Canvas
  const emissiveCanvas = document.createElement('canvas'); emissiveCanvas.width = w; emissiveCanvas.height = h;
  const emissiveCtx = emissiveCanvas.getContext('2d');

  // 5. Volumetric Cloud Alpha Canvas
  const cloudCanvas = document.createElement('canvas'); cloudCanvas.width = w; cloudCanvas.height = h;
  const cloudCtx = cloudCanvas.getContext('2d');

  const diffImg = diffCtx.createImageData(w, h);
  const bumpImg = bumpCtx.createImageData(w, h);
  const roughImg = roughCtx.createImageData(w, h);
  const emissiveImg = emissiveCtx.createImageData(w, h);
  const cloudImg = cloudCtx.createImageData(w, h);

  for (let y = 0; y < h; y++) {
    const lat = (y / h) * Math.PI - Math.PI / 2;
    const isPolar = Math.abs(lat) > 1.15;
    
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const lon = (x / w) * Math.PI * 2;
      
      // Spherical projection coords for noise
      const nx = Math.cos(lat) * Math.cos(lon) * 2.2;
      const ny = Math.sin(lat) * 2.2;
      const nz = Math.cos(lat) * Math.sin(lon) * 2.2;
      
      const elevation = SimplexNoise.fbm(nx + 10, ny + nz + 10, 5);
      const isLand = elevation > -0.05 || isPolar;
      
      if (isPolar) {
        // Polar Ice Caps
        diffImg.data[idx] = 230; diffImg.data[idx+1] = 245; diffImg.data[idx+2] = 255; diffImg.data[idx+3] = 255;
        bumpImg.data[idx] = 180; bumpImg.data[idx+1] = 180; bumpImg.data[idx+2] = 180; bumpImg.data[idx+3] = 255;
        roughImg.data[idx] = 200; roughImg.data[idx+1] = 200; roughImg.data[idx+2] = 200; roughImg.data[idx+3] = 255;
        emissiveImg.data[idx] = 0; emissiveImg.data[idx+1] = 0; emissiveImg.data[idx+2] = 0; emissiveImg.data[idx+3] = 255;
      } else if (isLand) {
        // Continent Biomes (green vegetation, mountain ochre, arid deserts)
        const moisture = SimplexNoise.noise2D(nx * 3.0, ny * 3.0);
        let r = 45, g = 110, b = 65; // Lush Green Forest
        if (elevation > 0.4) {
          r = 145; g = 115; b = 85; // Mountain Ridges
        } else if (moisture < -0.2) {
          r = 195; g = 160; b = 100; // Sahara / Desert Sand
        }
        diffImg.data[idx] = r; diffImg.data[idx+1] = g; diffImg.data[idx+2] = b; diffImg.data[idx+3] = 255;
        
        // Bump
        const bVal = Math.floor(Math.min(255, Math.max(0, (elevation + 0.1) * 220)));
        bumpImg.data[idx] = bVal; bumpImg.data[idx+1] = bVal; bumpImg.data[idx+2] = bVal; bumpImg.data[idx+3] = 255;
        
        // Roughness (Land is matte)
        roughImg.data[idx] = 215; roughImg.data[idx+1] = 215; roughImg.data[idx+2] = 215; roughImg.data[idx+3] = 255;
        
        // Emissive Night City Clusters
        const cityNoise = SimplexNoise.fbm(nx * 8.0, ny * 8.0, 3);
        if (cityNoise > 0.35 && elevation < 0.3) {
          emissiveImg.data[idx] = 255; emissiveImg.data[idx+1] = 195; emissiveImg.data[idx+2] = 80; emissiveImg.data[idx+3] = 255;
        } else {
          emissiveImg.data[idx] = 0; emissiveImg.data[idx+1] = 0; emissiveImg.data[idx+2] = 0; emissiveImg.data[idx+3] = 255;
        }
      } else {
        // Deep Azure Oceans with Continental Shelves
        const depth = Math.abs(elevation);
        const r = Math.floor(10 + depth * 5);
        const g = Math.floor(45 + depth * 35);
        const b = Math.floor(120 + depth * 80);
        diffImg.data[idx] = r; diffImg.data[idx+1] = g; diffImg.data[idx+2] = b; diffImg.data[idx+3] = 255;
        
        // Flat ocean floor bump
        bumpImg.data[idx] = 30; bumpImg.data[idx+1] = 30; bumpImg.data[idx+2] = 30; bumpImg.data[idx+3] = 255;
        
        // Roughness: Glossy mirror-like ocean specular
        roughImg.data[idx] = 25; roughImg.data[idx+1] = 25; roughImg.data[idx+2] = 25; roughImg.data[idx+3] = 255;
        
        // No city lights on ocean
        emissiveImg.data[idx] = 0; emissiveImg.data[idx+1] = 0; emissiveImg.data[idx+2] = 0; emissiveImg.data[idx+3] = 255;
      }

      // Swirling Cloud Weather Alpha
      const cloudNoise = SimplexNoise.fbm(nx * 2.5 + 50, ny * 2.5, 4);
      const cAlpha = Math.max(0, Math.min(255, (cloudNoise - 0.05) * 450));
      cloudImg.data[idx] = 255; cloudImg.data[idx+1] = 255; cloudImg.data[idx+2] = 255; cloudImg.data[idx+3] = cAlpha;
    }
  }

  diffCtx.putImageData(diffImg, 0, 0);
  bumpCtx.putImageData(bumpImg, 0, 0);
  roughCtx.putImageData(roughImg, 0, 0);
  emissiveCtx.putImageData(emissiveImg, 0, 0);
  cloudCtx.putImageData(cloudImg, 0, 0);

  return {
    map: new THREE.CanvasTexture(diffCanvas),
    bumpMap: new THREE.CanvasTexture(bumpCanvas),
    roughnessMap: new THREE.CanvasTexture(roughCanvas),
    emissiveMap: new THREE.CanvasTexture(emissiveCanvas),
    cloudsMap: new THREE.CanvasTexture(cloudCanvas)
  };
}

// Procedural PBR Textures for Mars
function createMarsPBRTextures() {
  const w = 512; const h = 256;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);

  for (let y = 0; y < h; y++) {
    const lat = (y / h) * Math.PI - Math.PI / 2;
    const isPolar = Math.abs(lat) > 1.35;
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const lon = (x / w) * Math.PI * 2;
      const nx = Math.cos(lat) * Math.cos(lon) * 2.5;
      const ny = Math.sin(lat) * 2.5;
      const nz = Math.cos(lat) * Math.sin(lon) * 2.5;
      
      if (isPolar) {
        img.data[idx] = 240; img.data[idx+1] = 245; img.data[idx+2] = 250; img.data[idx+3] = 255;
      } else {
        const n = SimplexNoise.fbm(nx, ny + nz, 5);
        const r = Math.floor(180 + n * 45);
        const g = Math.floor(75 + n * 30);
        const b = Math.floor(35 + n * 20);
        img.data[idx] = r; img.data[idx+1] = g; img.data[idx+2] = b; img.data[idx+3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}

// Procedural PBR Textures for Moon / Mercury
function createMoonPBRTextures() {
  const w = 512; const h = 256;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);

  for (let y = 0; y < h; y++) {
    const lat = (y / h) * Math.PI - Math.PI / 2;
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const lon = (x / w) * Math.PI * 2;
      const nx = Math.cos(lat) * Math.cos(lon) * 3.5;
      const ny = Math.sin(lat) * 3.5;
      const nz = Math.cos(lat) * Math.sin(lon) * 3.5;
      
      const craterNoise = SimplexNoise.fbm(nx, ny + nz, 6);
      const val = Math.floor(125 + craterNoise * 65);
      img.data[idx] = val; img.data[idx+1] = val; img.data[idx+2] = val + 5; img.data[idx+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}

// Procedural PBR Textures for Jupiter (Turbulent Bands & Storm Eddies)
function createJupiterPBRTextures() {
  const w = 1024; const h = 512;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);

  for (let y = 0; y < h; y++) {
    const yNorm = (y / h);
    // Sinusoidal counter-rotating bands
    const bandFreq = Math.sin(yNorm * 38.0) * 0.4 + Math.sin(yNorm * 12.0) * 0.6;
    
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const xNorm = (x / w);
      
      // Turbulence
      const turb = SimplexNoise.fbm(xNorm * 8.0, yNorm * 16.0, 4) * 0.25;
      const val = bandFreq + turb;
      
      // Great Red Spot Oval
      const dx = (xNorm - 0.65) * 14.0;
      const dy = (yNorm - 0.68) * 28.0;
      const isRedSpot = (dx * dx + dy * dy) < 1.0;
      
      if (isRedSpot) {
        const spotEdge = Math.sqrt(dx * dx + dy * dy);
        const r = Math.floor(215 - spotEdge * 30);
        const g = Math.floor(75 + spotEdge * 20);
        const b = Math.floor(45 + spotEdge * 20);
        img.data[idx] = r; img.data[idx+1] = g; img.data[idx+2] = b; img.data[idx+3] = 255;
      } else {
        const t = (val + 1.0) * 0.5;
        // Blend between deep amber and cream white bands
        const r = Math.floor(180 * t + 225 * (1.0 - t));
        const g = Math.floor(110 * t + 190 * (1.0 - t));
        const b = Math.floor(65 * t + 150 * (1.0 - t));
        img.data[idx] = r; img.data[idx+1] = g; img.data[idx+2] = b; img.data[idx+3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}

// Procedural PBR Textures for Saturn
function createSaturnPBRTextures() {
  const w = 512; const h = 256;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);

  for (let y = 0; y < h; y++) {
    const yNorm = (y / h);
    const band = Math.sin(yNorm * 24.0) * 0.2 + Math.sin(yNorm * 6.0) * 0.8;
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const turb = SimplexNoise.noise2D((x / w) * 4.0, yNorm * 8.0) * 0.1;
      const t = (band + turb + 1.0) * 0.5;
      
      const r = Math.floor(215 * t + 240 * (1.0 - t));
      const g = Math.floor(185 * t + 215 * (1.0 - t));
      const b = Math.floor(140 * t + 175 * (1.0 - t));
      img.data[idx] = r; img.data[idx+1] = g; img.data[idx+2] = b; img.data[idx+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}

// Procedural 1024-step Concentric Alpha Ring Texture
function createSaturnRingPBRTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 64;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(1024, 64);

  for (let x = 0; x < 1024; x++) {
    const t = x / 1024.0;
    // Cassini division (~0.68) and Encke gap (~0.88)
    let alpha = 0.85;
    if (t < 0.15 || t > 0.95) alpha = 0.0;
    else if (t > 0.65 && t < 0.72) alpha = 0.08; // Cassini Division
    else if (t > 0.87 && t < 0.90) alpha = 0.15; // Encke Gap
    else {
      alpha = 0.4 + 0.55 * Math.abs(Math.sin(t * 180.0));
    }
    
    const r = Math.floor(215 + Math.sin(t * 40.0) * 20);
    const g = Math.floor(190 + Math.sin(t * 40.0) * 20);
    const b = Math.floor(150 + Math.sin(t * 40.0) * 15);
    const a = Math.floor(alpha * 255);

    for (let y = 0; y < 64; y++) {
      const idx = (y * 1024 + x) * 4;
      img.data[idx] = r; img.data[idx+1] = g; img.data[idx+2] = b; img.data[idx+3] = a;
    }
  }
  ctx.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}

// Procedural Textures for Uranus / Neptune
function createIceGiantPBRTexture(isNeptune = false) {
  const w = 512; const h = 256;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);

  for (let y = 0; y < h; y++) {
    const yNorm = (y / h);
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const turb = SimplexNoise.noise2D((x / w) * 6.0, yNorm * 12.0) * 0.15;
      
      if (isNeptune) {
        // Azure deep blue with white methane streak storms
        const r = Math.floor(25 + turb * 40);
        const g = Math.floor(95 + turb * 60);
        const b = Math.floor(225 + turb * 30);
        img.data[idx] = r; img.data[idx+1] = g; img.data[idx+2] = b; img.data[idx+3] = 255;
      } else {
        // Cyan Uranus
        const r = Math.floor(125 + turb * 30);
        const g = Math.floor(210 + turb * 35);
        const b = Math.floor(235 + turb * 20);
        img.data[idx] = r; img.data[idx+1] = g; img.data[idx+2] = b; img.data[idx+3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}

// Procedural Solar Granulation & Sunspots Texture
function createSunCanvasTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(512, 256);

  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 512; x++) {
      const idx = (y * 512 + x) * 4;
      const gran = SimplexNoise.fbm((x / 512) * 16.0, (y / 256) * 16.0, 4);
      const spot = SimplexNoise.noise2D((x / 512) * 4.0 + 10, (y / 256) * 4.0 + 10);
      
      let r = 255, g = 195, b = 50;
      if (spot > 0.45) {
        // Dark sunspots
        r = 120; g = 50; b = 10;
      } else {
        r = Math.min(255, Math.floor(235 + gran * 30));
        g = Math.min(255, Math.floor(165 + gran * 45));
        b = Math.min(255, Math.floor(35 + gran * 25));
      }
      img.data[idx] = r; img.data[idx+1] = g; img.data[idx+2] = b; img.data[idx+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}



// ============================================================
// 5. MODE A: UNIVERSE SIMULATION OBJECTS
// ============================================================
function buildUniverseSimulationObjects() {
  const earthPBR = createEarthPBRTextures();
  const sunTex = createSunCanvasTexture();
  const moonTex = createMoonPBRTextures();
  const marsTex = createMarsPBRTextures();
  const jupTex = createJupiterPBRTextures();
  const satTex = createSaturnPBRTextures();
  const ringTex = createSaturnRingPBRTexture();

  // 1. Sol (The Sun)
  const sunGeo = new THREE.SphereGeometry(18, 48, 48);
  const sunMat = new THREE.MeshBasicMaterial({ map: sunTex });
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  universeGroup.add(sunMesh);
  celestialObjects.sun = { id: 'sun', group: sunMesh, mesh: sunMesh, orbitSpeed: 0, rotationSpeed: 0.002, angle: 0 };

  // Sun Corona Glow
  const coronaGeo = new THREE.SphereGeometry(22, 32, 32);
  const coronaMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.25, side: THREE.BackSide });
  sunMesh.add(new THREE.Mesh(coronaGeo, coronaMat));

  // Helper for planetary orbits
  function addPlanet(id, radius, size, mat, orbitSpeed, rotSpeed, ringMat = null) {
    createOrbitRing(radius);
    const pivot = new THREE.Group();
    universeGroup.add(pivot);

    const planetGroup = new THREE.Group();
    planetGroup.position.set(radius, 0, 0);
    pivot.add(planetGroup);

    const geo = new THREE.SphereGeometry(size, 32, 32);
    const mesh = new THREE.Mesh(geo, mat);
    planetGroup.add(mesh);

    if (ringMat) {
      const ringGeo = new THREE.RingGeometry(size * 1.3, size * 2.3, 48);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2 + 0.15;
      planetGroup.add(ring);
    }

    celestialObjects[id] = { id: id, group: planetGroup, pivot: pivot, mesh: mesh, orbitSpeed: orbitSpeed, rotationSpeed: rotSpeed, angle: Math.random() * Math.PI * 2 };
    return { pivot, planetGroup, mesh };
  }

  // 2. Mercury
  addPlanet('mercury', 36, 1.4, new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.9 }), 0.04, 0.004);

  // 3. Venus
  addPlanet('venus', 54, 2.4, new THREE.MeshStandardMaterial({ color: 0xe6c387, roughness: 0.4 }), 0.015, 0.002);

  // 4. Earth (Mode A Multi-Layer)
  createOrbitRing(76);
  const earthPivot = new THREE.Group(); universeGroup.add(earthPivot);
  const earthGroup = new THREE.Group(); earthGroup.position.set(76, 0, 0); earthPivot.add(earthGroup);

  const earthMat = new THREE.MeshStandardMaterial({
    map: earthPBR.map,
    bumpMap: earthPBR.bumpMap,
    bumpScale: 0.08,
    roughnessMap: earthPBR.roughnessMap,
    metalness: 0.05
  });
  const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(2.6, 48, 48), earthMat);
  earthGroup.add(earthMesh);

  // Volumetric Clouds Sphere
  const cloudsMesh = new THREE.Mesh(new THREE.SphereGeometry(2.64, 32, 32), new THREE.MeshStandardMaterial({
    map: earthPBR.cloudsMap,
    transparent: true,
    opacity: 0.85
  }));
  earthGroup.add(cloudsMesh);

  // Atmosphere Glow
  const atmoMesh = new THREE.Mesh(new THREE.SphereGeometry(2.72, 32, 32), new THREE.MeshBasicMaterial({
    color: 0x00f0ff, transparent: true, opacity: 0.22, side: THREE.BackSide
  }));
  earthGroup.add(atmoMesh);

  // Moon
  const moonGroup = new THREE.Group(); moonGroup.position.set(6.5, 0, 0); earthGroup.add(moonGroup);
  const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 24), new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.9 }));
  moonGroup.add(moonMesh);

  celestialObjects.earth = { id: 'earth', group: earthGroup, pivot: earthPivot, mesh: earthMesh, clouds: cloudsMesh, orbitSpeed: 0.01, rotationSpeed: 0.012, angle: 0 };
  celestialObjects.moon = { id: 'moon', group: moonGroup, pivot: earthGroup, mesh: moonMesh, orbitSpeed: 0.035, rotationSpeed: 0.005, angle: 0 };

  // 5. Mars
  addPlanet('mars', 105, 1.8, new THREE.MeshStandardMaterial({ map: marsTex, roughness: 0.85 }), 0.008, 0.01);

  // 6. Asteroid Belt
  const astCount = 3500;
  const astGeo = new THREE.BufferGeometry();
  const astPos = new Float32Array(astCount * 3);
  for (let i = 0; i < astCount; i++) {
    const r = 125 + Math.random() * 30;
    const th = Math.random() * Math.PI * 2;
    astPos[i * 3] = Math.cos(th) * r;
    astPos[i * 3 + 1] = (Math.random() - 0.5) * 4.0;
    astPos[i * 3 + 2] = Math.sin(th) * r;
  }
  astGeo.setAttribute('position', new THREE.BufferAttribute(astPos, 3));
  const astMesh = new THREE.Points(astGeo, new THREE.PointsMaterial({ size: 1.2, sizeAttenuation: false, color: 0x8c827a }));
  universeGroup.add(astMesh);
  celestialObjects.belt = { id: 'belt', group: astMesh, mesh: astMesh, orbitSpeed: 0.003, rotationSpeed: 0.001, angle: 0 };

  // 7. Jupiter
  addPlanet('jupiter', 185, 6.2, new THREE.MeshStandardMaterial({ map: jupTex, roughness: 0.6 }), 0.003, 0.025);

  // 8. Saturn
  addPlanet('saturn', 260, 5.2, new THREE.MeshStandardMaterial({ map: satTex, roughness: 0.6 }), 0.0018, 0.022, new THREE.MeshBasicMaterial({ map: ringTex, side: THREE.DoubleSide, transparent: true, opacity: 0.88 }));

  // 9. Relativistic Kerr Black Hole (Gargantua / M87*)
  const bhRadius = 450;
  createOrbitRing(bhRadius, 0xffaa00);
  const bhPivot = new THREE.Group(); universeGroup.add(bhPivot);
  const bhGroup = new THREE.Group(); bhGroup.position.set(bhRadius, 0, 0); bhPivot.add(bhGroup);

  const bhCore = new THREE.Mesh(new THREE.SphereGeometry(7.0, 32, 32), new THREE.MeshBasicMaterial({ color: 0x000000 }));
  bhGroup.add(bhCore);

  const photonRing = new THREE.Mesh(new THREE.SphereGeometry(7.6, 32, 32), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85, side: THREE.BackSide }));
  bhGroup.add(photonRing);

  const accRing = new THREE.Mesh(new THREE.RingGeometry(8.5, 22.0, 48), new THREE.MeshBasicMaterial({ color: 0xffaa00, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
  accRing.rotation.x = Math.PI / 2 + 0.18;
  bhGroup.add(accRing);

  celestialObjects.gargantua = { id: 'gargantua', group: bhGroup, pivot: bhPivot, mesh: bhCore, orbitSpeed: 0.0006, rotationSpeed: 0.04, angle: 1.2 };

  // 10. Vela Pulsar
  const pulsarRadius = 600;
  createOrbitRing(pulsarRadius, 0x00f0ff);
  const pulsarPivot = new THREE.Group(); universeGroup.add(pulsarPivot);
  const pulsarGroup = new THREE.Group(); pulsarGroup.position.set(pulsarRadius, 0, 0); pulsarPivot.add(pulsarGroup);

  const pulsarCore = new THREE.Mesh(new THREE.SphereGeometry(3.0, 24, 24), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
  pulsarGroup.add(pulsarCore);

  const jetGeo = new THREE.ConeGeometry(2.5, 20.0, 16, 1, true);
  const jetMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.75, side: THREE.DoubleSide });
  const jetNorth = new THREE.Mesh(jetGeo, jetMat); jetNorth.position.y = 11; pulsarGroup.add(jetNorth);
  const jetSouth = new THREE.Mesh(jetGeo, jetMat); jetSouth.position.y = -11; jetSouth.rotation.x = Math.PI; pulsarGroup.add(jetSouth);

  celestialObjects.pulsar = { id: 'pulsar', group: pulsarGroup, pivot: pulsarPivot, mesh: pulsarCore, orbitSpeed: 0.0004, rotationSpeed: 0.12, angle: 2.5 };

  // 11. 4D Wormhole Portal
  const wormRadius = 780;
  createOrbitRing(wormRadius, 0xf43f5e);
  const wormPivot = new THREE.Group(); universeGroup.add(wormPivot);
  const wormGroup = new THREE.Group(); wormGroup.position.set(wormRadius, 0, 0); wormPivot.add(wormGroup);

  const wormMesh = new THREE.Mesh(new THREE.TorusGeometry(8.0, 2.0, 24, 48), new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.8 }));
  wormGroup.add(wormMesh);
  celestialObjects.wormhole = { id: 'wormhole', group: wormGroup, pivot: wormPivot, mesh: wormMesh, orbitSpeed: 0.003, rotationSpeed: 0.05, angle: 3.4 };

  // Cosmic Web (Level 4)
  const webCount = 25000;
  const webGeo = new THREE.BufferGeometry();
  const webPos = new Float32Array(webCount * 3);
  for (let i = 0; i < webCount; i++) {
    const r = 2000 + Math.random() * 8000;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(Math.random() * 2 - 1);
    webPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    webPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    webPos[i * 3 + 2] = r * Math.cos(ph);
  }
  webGeo.setAttribute('position', new THREE.BufferAttribute(webPos, 3));
  const webMesh = new THREE.Points(webGeo, new THREE.PointsMaterial({ size: 1.0, sizeAttenuation: false, color: 0x38bdf8, opacity: 0.6, transparent: true }));
  universeGroup.add(webMesh);
  celestialObjects.cosmicweb = { id: 'cosmicweb', group: webMesh, mesh: webMesh, orbitSpeed: 0, rotationSpeed: 0.0002, angle: 0 };

  // Observable Universe Horizon (Level 5)
  const cmbGeo = new THREE.SphereGeometry(16000, 32, 24);
  const cmbMat = new THREE.MeshBasicMaterial({ color: 0x071e3d, side: THREE.BackSide, transparent: true, opacity: 0.35 });
  const cmbMesh = new THREE.Mesh(cmbGeo, cmbMat);
  universeGroup.add(cmbMesh);
  celestialObjects.universe = { id: 'universe', group: cmbMesh, mesh: cmbMesh, orbitSpeed: 0, rotationSpeed: 0.0001, angle: 0 };
}

// ============================================================
// 6. MODE B: COSMOPEDIA 3D PBR INSPECTION STUDIO
// ============================================================
let currentStageMesh = null;
let currentEarthCompareMesh = null;
let stageGrid = null;
let stageRotatorPivot = null;

function initCosmopediaStage() {
  // Studio Holographic Grid
  const gridHelper = new THREE.GridHelper(16, 16, 0x00f0ff, 0x1e293b);
  gridHelper.position.y = -3.5;
  stageGroup.add(gridHelper);
  stageGrid = gridHelper;

  // Studio Soft Rim Lights
  const stageLightA = new THREE.PointLight(0x00f0ff, 1.2, 40);
  stageLightA.position.set(10, 10, 10);
  stageGroup.add(stageLightA);

  const stageLightB = new THREE.PointLight(0xc084fc, 0.9, 40);
  stageLightB.position.set(-10, -5, -10);
  stageGroup.add(stageLightB);

  // Setup Stage Rotator Pivot
  stageRotatorPivot = new THREE.Group();
  stageGroup.add(stageRotatorPivot);
}

function disposeCurrentStageObject() {
  if (currentStageMesh) {
    stageRotatorPivot.remove(currentStageMesh);
    currentStageMesh.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
        else { if (child.material.map) child.material.map.dispose(); child.material.dispose(); }
      }
    });
    currentStageMesh = null;
  }
  if (currentEarthCompareMesh) {
    stageGroup.remove(currentEarthCompareMesh);
    currentEarthCompareMesh.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    });
    currentEarthCompareMesh = null;
  }
}

// Thermal Infrared Heatmap Shader
function createThermalMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        float intensity = max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0);
        // Thermal Heatmap Gradient: Black -> Purple -> Orange -> Yellow -> White
        vec3 col = vec3(0.0);
        if (intensity < 0.25) {
          col = mix(vec3(0.05, 0.0, 0.2), vec3(0.5, 0.0, 0.6), intensity * 4.0);
        } else if (intensity < 0.6) {
          col = mix(vec3(0.5, 0.0, 0.6), vec3(0.95, 0.4, 0.0), (intensity - 0.25) / 0.35);
        } else if (intensity < 0.85) {
          col = mix(vec3(0.95, 0.4, 0.0), vec3(1.0, 0.9, 0.1), (intensity - 0.6) / 0.25);
        } else {
          col = mix(vec3(1.0, 0.9, 0.1), vec3(1.0, 1.0, 1.0), (intensity - 0.85) / 0.15);
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `
  });
}

// Wireframe Topology Material
function createWireframeMaterial() {
  return new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    wireframe: true,
    transparent: true,
    opacity: 0.75
  });
}

function mountCosmopediaObject(entityId) {
  disposeCurrentStageObject();

  const entity = COSMO_DATA.entities.find(e => e.id === entityId) || COSMO_DATA.entities[0];
  EngineState.selectedPediaId = entity.id;

  const arch = entity.archetype;
  const stageObj = new THREE.Group();
  const hexColor = entity.color ? parseInt(entity.color.replace('#', '0x'), 16) : 0x38bdf8;
  const mode = EngineState.shadingMode;

  // Set Axial Tilt
  const tiltAngle = AXIAL_TILTS[entity.id] || (Math.random() * 0.35);
  stageRotatorPivot.rotation.z = tiltAngle;

  if (mode === 'thermal') {
    const geo = new THREE.SphereGeometry(2.6, 48, 48);
    const mesh = new THREE.Mesh(geo, createThermalMaterial());
    stageObj.add(mesh);
  }
  else if (mode === 'wireframe') {
    const geo = new THREE.SphereGeometry(2.6, 32, 32);
    const mesh = new THREE.Mesh(geo, createWireframeMaterial());
    stageObj.add(mesh);
  }
  else {
    // ---------------- NATURAL PBR RENDERING ----------------
    if (arch === 'TerrestrialWorld') {
      const earthPBR = createEarthPBRTextures();
      let texMap = earthPBR.map;
      let bumpMap = earthPBR.bumpMap;
      let roughMap = earthPBR.roughnessMap;
      let emissiveMap = (entity.id === 'earth') ? earthPBR.emissiveMap : null;

      if (entity.id === 'mercury' || entity.id.includes('moon') || entity.id === 'ceres' || entity.id === 'phobos' || entity.id === 'deimos' || entity.id === 'callisto' || entity.id.includes('trappist_1h')) {
        texMap = createMoonPBRTextures();
        bumpMap = texMap;
      } else if (entity.id === 'mars' || entity.id === 'io' || entity.id.includes('trappist_1g')) {
        texMap = createMarsPBRTextures();
        bumpMap = texMap;
      } else if (entity.id === 'venus' || entity.id === 'cancri_55e' || entity.id.includes('trappist_1c') || entity.id === 'corot_7b') {
        texMap = createSaturnPBRTextures();
        bumpMap = texMap;
      }

      const geo = new THREE.SphereGeometry(2.5, 64, 64);
      const mat = new THREE.MeshPhysicalMaterial({
        map: texMap,
        bumpMap: bumpMap,
        bumpScale: 0.06,
        roughnessMap: roughMap,
        roughness: 0.7,
        metalness: 0.05,
        emissiveMap: emissiveMap,
        emissive: (entity.id === 'earth') ? new THREE.Color(0xffbb44) : new THREE.Color(0x000000),
        emissiveIntensity: (entity.id === 'earth') ? 1.2 : 0.0,
        clearcoat: (entity.id === 'earth') ? 0.2 : 0.0,
        clearcoatRoughness: 0.1
      });
      const mesh = new THREE.Mesh(geo, mat);
      stageObj.add(mesh);

      // Earth Cloud Layer
      if (entity.id === 'earth' || entity.id.includes('kepler_452') || entity.id.includes('trappist_1e')) {
        const cloudGeo = new THREE.SphereGeometry(2.53, 48, 48);
        const cloudMat = new THREE.MeshStandardMaterial({
          map: earthPBR.cloudsMap,
          transparent: true,
          opacity: 0.85,
          roughness: 0.9
        });
        const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
        stageObj.add(cloudMesh);
      }

      // Two-Layer Atmospheric Rayleigh Limb Scattering Shader
      const atmoCol = entity.id === 'earth' || entity.id.includes('kepler') || entity.id.includes('trappist_1e') ? 0x00f0ff : hexColor;
      const atmoMat = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(vViewPosition);
            float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.5);
            gl_FragColor = vec4(color, fresnel * 0.85);
          }
        `,
        uniforms: { color: { value: new THREE.Color(atmoCol) } },
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
      });
      const atmo = new THREE.Mesh(new THREE.SphereGeometry(2.7, 48, 48), atmoMat);
      stageObj.add(atmo);
    }
    else if (arch === 'GasGiant') {
      let tex = createJupiterPBRTextures();
      if (entity.id === 'saturn' || entity.id.includes('wasp') || entity.id.includes('hd_') || entity.id.includes('hat_p')) tex = createSaturnPBRTextures();
      else if (entity.id === 'uranus') tex = createIceGiantPBRTexture(false);
      else if (entity.id === 'neptune') tex = createIceGiantPBRTexture(true);

      const geo = new THREE.SphereGeometry(2.8, 64, 64);
      const mat = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.5, metalness: 0.05, clearcoat: 0.3, clearcoatRoughness: 0.2 });
      const mesh = new THREE.Mesh(geo, mat);
      stageObj.add(mesh);

      // Physical Ring Systems with 1024-step Concentric Alpha
      if (entity.id === 'saturn' || entity.id.includes('kepler_16') || entity.id.includes('wasp_76') || entity.id.includes('proxima_c') || entity.id === 'uranus') {
        const ringGeo = new THREE.RingGeometry(3.5, 6.4, 64);
        const ringMat = new THREE.MeshStandardMaterial({
          map: createSaturnRingPBRTexture(),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.92,
          roughness: 0.7
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2 + 0.2;
        stageObj.add(ring);
      }
    }
    else if (arch === 'PlasmaStar') {
      const geo = new THREE.SphereGeometry(2.6, 64, 64);
      const starCol = new THREE.Color(hexColor);

      // Convective Animated Solar Simplex Shader
      const starMat = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: starCol }
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 color;
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            float n = sin(vUv.x * 24.0 + time * 1.5) * cos(vUv.y * 24.0 + time * 1.2);
            float gran = sin(vUv.x * 60.0 - time * 0.8) * cos(vUv.y * 60.0 + time * 0.9);
            vec3 plasma = color + vec3(n * 0.15 + gran * 0.08);
            gl_FragColor = vec4(plasma, 1.0);
          }
        `
      });
      const mesh = new THREE.Mesh(geo, starMat);
      stageObj.add(mesh);

      // Pulsating Coronal Halo
      const coronaMat = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(vViewPosition);
            float glow = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.2);
            gl_FragColor = vec4(color, glow * 0.95);
          }
        `,
        uniforms: { color: { value: starCol } },
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
      });
      const corona = new THREE.Mesh(new THREE.SphereGeometry(3.3, 48, 48), coronaMat);
      stageObj.add(corona);
    }
    else if (arch === 'RelativisticBH') {
      // 1. Inky Event Horizon Sphere (0x000000)
      const bhMesh = new THREE.Mesh(new THREE.SphereGeometry(2.0, 48, 48), new THREE.MeshBasicMaterial({ color: 0x000000 }));
      stageObj.add(bhMesh);

      // 2. Razor-sharp 1.5 rs Photon Sphere Ring
      const photonRim = new THREE.Mesh(new THREE.SphereGeometry(2.15, 48, 48), new THREE.MeshBasicMaterial({
        color: 0x38bdf8, transparent: true, opacity: 0.85, side: THREE.BackSide
      }));
      stageObj.add(photonRim);

      // 3. Relativistic Doppler Accretion Disk with Beaming Asymmetry
      const accGeo = new THREE.RingGeometry(2.4, 6.2, 64);
      const accMat = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          varying vec3 vPos;
          void main() {
            float dist = length(vPos.xy);
            // Approaching side (left x < 0) blueshifted 1.8x, Receding (x > 0) dimmed 0.4x
            float beam = (vPos.x < 0.0) ? 1.8 : 0.4;
            float ringGrad = smoothstep(2.4, 3.2, dist) * smoothstep(6.2, 3.8, dist);
            gl_FragColor = vec4(color * beam, ringGrad * 0.95);
          }
        `,
        uniforms: { color: { value: new THREE.Color(hexColor) } },
        side: THREE.DoubleSide,
        transparent: true,
        blending: THREE.AdditiveBlending
      });
      const accRing = new THREE.Mesh(accGeo, accMat);
      accRing.rotation.x = Math.PI / 2 + 0.18;
      stageObj.add(accRing);

      // 4. Vertical Gravitational Lensing Arcs (Top & Bottom arcs)
      const lensGeo = new THREE.TorusGeometry(3.6, 0.4, 16, 48, Math.PI);
      const lensMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
      const topArc = new THREE.Mesh(lensGeo, lensMat);
      topArc.rotation.z = Math.PI; topArc.position.y = 0.5; stageObj.add(topArc);
      const btmArc = new THREE.Mesh(lensGeo, lensMat);
      btmArc.position.y = -0.5; stageObj.add(btmArc);
    }
    else if (arch === 'PulsarMagnetar') {
      const core = new THREE.Mesh(new THREE.SphereGeometry(1.4, 32, 32), new THREE.MeshBasicMaterial({ color: hexColor }));
      stageObj.add(core);

      // Dual Rotating Relativistic Magnetic Beam Cones
      const jetGeo = new THREE.ConeGeometry(1.2, 8.0, 24, 1, true);
      const jetMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.85, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
      const jetN = new THREE.Mesh(jetGeo, jetMat); jetN.position.y = 4.2; stageObj.add(jetN);
      const jetS = new THREE.Mesh(jetGeo, jetMat); jetS.position.y = -4.2; jetS.rotation.x = Math.PI; stageObj.add(jetS);
    }
    else if (arch === 'VolumetricNebula') {
      const count = 6000;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const cols = new Float32Array(count * 3);
      const c1 = new THREE.Color(hexColor);
      const c2 = new THREE.Color(0x38bdf8);

      for (let i = 0; i < count; i++) {
        const r = Math.random() * 3.8;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(Math.random() * 2 - 1);
        pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
        pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
        pos[i * 3 + 2] = r * Math.cos(ph);

        const c = Math.random() > 0.5 ? c1 : c2;
        cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      const nebPoints = new THREE.Points(geo, new THREE.PointsMaterial({ size: 1.5, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending }));
      stageObj.add(nebPoints);
    }
    else if (arch === 'GalacticSpiral') {
      const count = 14000;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const cols = new Float32Array(count * 3);
      const cCore = new THREE.Color(hexColor);
      const cArm = new THREE.Color(0x88ccff);

      for (let i = 0; i < count; i++) {
        const r = 0.2 + Math.pow(Math.random(), 1.5) * 4.4;
        const armIdx = i % 2;
        const th = armIdx * Math.PI + (Math.log(r / 0.2) / 0.38) + (Math.random() - 0.5) * 0.3;
        pos[i * 3] = Math.cos(th) * r;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 0.4 * Math.exp(-r / 2.0);
        pos[i * 3 + 2] = Math.sin(th) * r;

        const t = Math.min(1.0, r / 3.0);
        const c = cCore.clone().lerp(cArm, t);
        cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      const galPoints = new THREE.Points(geo, new THREE.PointsMaterial({ size: 1.2, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.8 }));
      stageObj.add(galPoints);
    }
    else if (arch === 'SpacecraftProbe') {
      // High-tech satellite bus
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.2), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.85, roughness: 0.2 }));
      stageObj.add(body);

      // Twin blue solar arrays
      const panelGeo = new THREE.BoxGeometry(2.4, 0.05, 1.0);
      const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.3 });
      const panelL = new THREE.Mesh(panelGeo, panelMat); panelL.position.x = 2.1; stageObj.add(panelL);
      const panelR = new THREE.Mesh(panelGeo, panelMat); panelR.position.x = -2.1; stageObj.add(panelR);

      // High gain dish antenna
      const dish = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.4, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, side: THREE.DoubleSide }));
      dish.position.set(0, 0.9, 0); dish.rotation.x = Math.PI; stageObj.add(dish);
    }
  }

  stageRotatorPivot.add(stageObj);
  currentStageMesh = stageObj;

  if (EngineState.compareEarthActive) {
    mountEarthComparison(entity);
  }

  updateDossierCard(entity);
}

function mountEarthComparison(entity) {
  if (currentEarthCompareMesh) {
    stageGroup.remove(currentEarthCompareMesh);
    currentEarthCompareMesh = null;
  }

  const earthComp = new THREE.Group();
  earthComp.position.set(-5.5, 0, 0);

  const earthPBR = createEarthPBRTextures();
  const earthGeo = new THREE.SphereGeometry(1.2, 32, 32);
  const earthMat = new THREE.MeshPhysicalMaterial({ map: earthPBR.map, roughness: 0.6, metalness: 0.1 });
  const mesh = new THREE.Mesh(earthGeo, earthMat);
  earthComp.add(mesh);

  stageGroup.add(earthComp);
  currentEarthCompareMesh = earthComp;
}



// ============================================================
// 7. DUAL-MODE CONTROLLER & MODE BRIDGING
// ============================================================
function switchMode(targetMode, targetObjectId = null) {
  if (EngineState.currentMode === targetMode && !targetObjectId) return;

  const prevMode = EngineState.currentMode;
  EngineState.currentMode = targetMode;

  const btnUniverse = document.getElementById('btn-mode-universe');
  const btnCosmopedia = document.getElementById('btn-mode-cosmopedia');
  const universeHud = document.getElementById('universe-hud');
  const cosmopediaHud = document.getElementById('cosmopedia-hud');
  const cockpitOverlay = document.getElementById('cockpit-overlay');

  if (targetMode === 'COSMOPEDIA') {
    // Leaving Mode A -> Entering Mode B
    EngineState.savedUniverseCamera.pos.copy(camera.position);
    EngineState.savedUniverseCamera.target.copy(controls.target);

    if (btnUniverse) btnUniverse.classList.remove('active');
    if (btnCosmopedia) btnCosmopedia.classList.add('active');
    if (universeHud) universeHud.style.display = 'none';
    if (cosmopediaHud) cosmopediaHud.style.display = 'block';
    if (cockpitOverlay) cockpitOverlay.style.display = 'none';

    universeGroup.visible = false;
    stageGroup.visible = true;

    // Reset turntable camera
    camera.position.set(0, 3.5, 9.5);
    controls.target.set(0, 0, 0);
    controls.enabled = true;

    const idToMount = targetObjectId || EngineState.selectedPediaId || 'earth';
    mountCosmopediaObject(idToMount);
    speakAI(EngineState.currentLang === 'bn' ? 'কসমোপিডিয়া ৩ডি মিউজিয়াম স্টুডিও সক্রিয়।' : 'Cosmopedia 3D Museum Studio Active.');
  } else {
    // Leaving Mode B -> Entering Mode A
    if (btnCosmopedia) btnCosmopedia.classList.remove('active');
    if (btnUniverse) btnUniverse.classList.add('active');
    if (cosmopediaHud) cosmopediaHud.style.display = 'none';
    if (universeHud) universeHud.style.display = 'block';

    disposeCurrentStageObject();
    stageGroup.visible = false;
    universeGroup.visible = true;

    if (targetObjectId && celestialObjects[targetObjectId]) {
      focusOnCelestialObject(targetObjectId);
    } else {
      camera.position.copy(EngineState.savedUniverseCamera.pos);
      controls.target.copy(EngineState.savedUniverseCamera.target);
    }
    speakAI(EngineState.currentLang === 'bn' ? 'মহাবিশ্ব সিমুলেশনে প্রত্যাবর্তন সম্পন্ন।' : 'Returned to Universe Simulation.');
  }
}

// ============================================================
// 8. ROBUST DOCUMENTARY-GRADE NEURAL VOICE ENGINE
// ============================================================
const VoiceGuide = {
  synth: window.speechSynthesis,
  isSpeaking: false,
  chunks: [],
  currentChunk: 0,
  
  speak(text, lang = 'en') {
    this.stop();
    if (!this.synth) return;
    
    // Clean sentence chunking with English & Bangla punctuation to prevent Web Speech API cutoff
    this.chunks = text.match(/[^।!?.।]+[।!?.।]+/g) || [text];
    this.currentChunk = 0;
    this.isSpeaking = true;
    this.playNext(lang);
  },
  
  playNext(lang) {
    if (this.currentChunk >= this.chunks.length) {
      this.isSpeaking = false;
      this.updateUI(false);
      return;
    }
    
    const chunkText = this.chunks[this.currentChunk].trim();
    if (!chunkText) {
      this.currentChunk++;
      this.playNext(lang);
      return;
    }

    const utter = new SpeechSynthesisUtterance(chunkText);
    const voices = this.synth.getVoices() || [];
    const targetLang = lang === 'bn' ? 'bn' : 'en';
    
    // Intelligent Natural / Neural / Google voice selection
    const bestVoice = voices.find(v => v.lang.startsWith(targetLang) && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural') || v.name.includes('Shaan') || v.name.includes('Christopher'))) 
                      || voices.find(v => v.lang.startsWith(targetLang));
    if (bestVoice) utter.voice = bestVoice;
    else utter.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
    
    utter.rate = 0.90; // Authoritative documentarian cadence
    utter.pitch = 0.98;
    
    utter.onend = () => {
      this.currentChunk++;
      this.playNext(lang);
    };
    
    utter.onerror = (e) => {
      if (e.error !== 'canceled') {
        this.isSpeaking = false;
        this.updateUI(false);
      }
    };
    
    this.updateUI(true);
    this.synth.speak(utter);
  },
  
  stop() {
    if (this.synth) this.synth.cancel();
    this.isSpeaking = false;
    this.updateUI(false);
  },
  
  toggle(text, lang) {
    if (this.isSpeaking) {
      this.stop();
    } else {
      this.speak(text, lang);
    }
  },
  
  updateUI(speaking) {
    const btn = document.getElementById('voice-narrate-btn');
    const textSpan = document.getElementById('voice-btn-text');
    if (btn) {
      btn.classList.toggle('speaking-active', speaking);
    }
    if (textSpan) {
      if (speaking) {
        textSpan.innerText = EngineState.currentLang === 'bn' ? '⏸️ থামুন / Stop' : '⏸️ Stop Narration';
      } else {
        textSpan.innerText = EngineState.currentLang === 'bn' ? '🔊 শুনুন / Listen' : '🔊 Listen Narration';
      }
    }
  }
};

function speakAI(text) {
  if (!EngineState.voiceActive || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = EngineState.currentLang === 'bn' ? 'bn-BD' : 'en-US';
    utter.rate = 1.0;
    window.speechSynthesis.speak(utter);
  } catch (e) {}
}

function updateDossierCard(entity) {
  const isBn = (EngineState.currentLang === 'bn');
  const sec = COSMO_DATA.sectors.find(s => s.id === entity.sectorId);
  const m = entity.metrics || {};

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val || '--';
  };

  setEl('dossier-sec-badge', sec ? (isBn ? sec.nameBn : sec.nameEn.toUpperCase()) : 'SECTOR');
  setEl('dossier-title-en', entity.nameEn);
  setEl('dossier-title-bn', entity.nameBn);
  setEl('dossier-mass', isBn ? (m.massBn || m.mass) : (m.mass || '--'));
  setEl('dossier-radius', isBn ? (m.radiusBn || m.radius) : (m.radius || '--'));
  setEl('dossier-dist', isBn ? (m.distanceBn || m.distance) : (m.distance || '--'));
  setEl('dossier-temp', isBn ? (m.tempBn || m.temp) : (m.temp || '--'));
  setEl('dossier-spectral', entity.color || '#00f0ff');
  setEl('dossier-desc-text', isBn ? entity.descBn : entity.descEn);
  setEl('dossier-archetype', entity.archetype);

  // Update active state in list
  document.querySelectorAll('.entity-card-item').forEach(item => {
    item.classList.toggle('active', item.dataset.id === entity.id);
  });
}

function renderPediaSectors() {
  const pillsContainer = document.getElementById('pedia-sector-pills');
  if (!pillsContainer) return;

  const total = COSMO_DATA.entities.length;
  pillsContainer.innerHTML = `<button class="sector-pill active" data-sec="all">🌐 ${EngineState.currentLang === 'bn' ? 'সবগুলো' : 'All'} (${total})</button>`;

  COSMO_DATA.sectors.forEach(sec => {
    const secCount = COSMO_DATA.entities.filter(e => e.sectorId === sec.id).length;
    const btn = document.createElement('button');
    btn.className = 'sector-pill';
    btn.dataset.sec = sec.id;
    btn.innerText = `${sec.icon} ${(EngineState.currentLang === 'bn' ? sec.nameBn : sec.nameEn)} (${secCount})`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sector-pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      EngineState.activeSectorFilter = sec.id;
      renderPediaEntities();
    });
    pillsContainer.appendChild(btn);
  });

  const allBtn = pillsContainer.querySelector('[data-sec="all"]');
  if (allBtn) {
    allBtn.addEventListener('click', () => {
      document.querySelectorAll('.sector-pill').forEach(p => p.classList.remove('active'));
      allBtn.classList.add('active');
      EngineState.activeSectorFilter = 'all';
      renderPediaEntities();
    });
  }
}

function renderPediaEntities() {
  const listContainer = document.getElementById('pedia-entity-list');
  if (!listContainer) return;

  listContainer.innerHTML = '';
  const query = EngineState.searchQuery.toLowerCase().trim();

  const filtered = COSMO_DATA.entities.filter(ent => {
    const matchesSec = (EngineState.activeSectorFilter === 'all' || ent.sectorId === EngineState.activeSectorFilter);
    const matchesQuery = !query || ent.nameEn.toLowerCase().includes(query) || ent.nameBn.includes(query);
    return matchesSec && matchesQuery;
  });

  filtered.forEach(ent => {
    const item = document.createElement('div');
    item.className = 'entity-card-item' + (ent.id === EngineState.selectedPediaId ? ' active' : '');
    item.dataset.id = ent.id;

    item.innerHTML = `
      <div>
        <div class="card-item-title">${ent.nameEn}</div>
        <div class="card-item-sub">${ent.nameBn}</div>
      </div>
      <div class="card-item-badge">${ent.archetype.replace('World', '').replace('Giant', '')}</div>
    `;

    item.addEventListener('click', () => {
      mountCosmopediaObject(ent.id);
    });

    listContainer.appendChild(item);
  });
}

// ============================================================
// 9. MEDIARECORDER CANVAS CAPTURE ENGINE & 40s CINEMATIC TOUR
// ============================================================
const VideoRecorder = {
  recorder: null,
  recordedChunks: [],
  isRecording: false,

  start() {
    if (this.isRecording) return;
    try {
      const canvas = renderer.domElement;
      const stream = canvas.captureStream(60);
      this.recordedChunks = [];
      
      let mimeType = 'video/webm; codecs=vp9';
      if (typeof MediaRecorder !== 'undefined' && !MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      this.recorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: 12000000 // 12 Mbps ultra-high quality
      });

      this.recorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.recordedChunks.push(e.data);
      };

      this.recorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = `cosmoverse-cinematic-trailer-${Date.now()}.webm`;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
      };

      this.recorder.start();
      this.isRecording = true;
      this.updateRecordHUD(true);
      speakAI('Video Recording Started. Capturing 60 FPS 12 Mbps stream.');
    } catch (err) {
      console.error('VideoRecorder error:', err);
    }
  },

  stop() {
    if (this.recorder && this.isRecording) {
      this.recorder.stop();
      this.isRecording = false;
      this.updateRecordHUD(false);
      speakAI('Video Recording Saved.');
    }
  },

  toggle() {
    if (this.isRecording) this.stop();
    else this.start();
  },

  updateRecordHUD(recording) {
    const badge = document.getElementById('rec-status-badge');
    const btn = document.getElementById('btn-video-rec');
    if (badge) {
      badge.style.display = recording ? 'flex' : 'none';
    }
    if (btn) {
      btn.classList.toggle('active', recording);
      btn.innerHTML = recording ? '⏹️ STOP REC (R)' : '🎥 REC (R)';
    }
  }
};

let tourActive = false;
let tourTimer = null;

function startCinematicTour() {
  if (tourActive) {
    stopCinematicTour();
    return;
  }

  tourActive = true;
  const tourBtn = document.getElementById('btn-trailer-tour');
  if (tourBtn) {
    tourBtn.classList.add('active');
    tourBtn.innerHTML = '⏹️ STOP TOUR (T)';
  }

  speakAI('Commencing 40-Second Automated Cinematic Universe Tour.');
  VideoRecorder.start();

  // Phase 1 (0s - 8s): Earth Orbital Flyaround
  switchMode('UNIVERSE', 'earth');
  camera.position.set(76 + 8, 3, 8);
  controls.target.set(76, 0, 0);

  let elapsed = 0;
  const tourInterval = setInterval(() => {
    elapsed += 0.1;

    // 0s - 8s: Earth orbit
    if (elapsed < 8.0) {
      const angle = elapsed * 0.4;
      camera.position.set(76 + Math.cos(angle) * 7.5, Math.sin(angle * 0.5) * 2.5 + 2.0, Math.sin(angle) * 7.5);
      controls.target.set(76, 0, 0);
    }
    // 8s - 16s: Hyper-warp glide through Jupiter and Saturn
    else if (elapsed >= 8.0 && elapsed < 16.0) {
      if (elapsed >= 8.0 && elapsed < 8.2) focusOnCelestialObject('jupiter');
      if (elapsed >= 12.0 && elapsed < 12.2) focusOnCelestialObject('saturn');
      const angle = (elapsed - 8.0) * 0.5;
      const targetPos = celestialObjects.saturn ? celestialObjects.saturn.group.position : new THREE.Vector3(260, 0, 0);
      camera.position.set(targetPos.x + Math.cos(angle) * 16, 6 + Math.sin(angle) * 4, targetPos.z + Math.sin(angle) * 16);
      controls.target.copy(targetPos);
    }
    // 16s - 26s: Gargantua Kerr Black Hole slow orbit
    else if (elapsed >= 16.0 && elapsed < 26.0) {
      if (elapsed >= 16.0 && elapsed < 16.2) focusOnCelestialObject('gargantua');
      const angle = (elapsed - 16.0) * 0.25;
      const bhPos = celestialObjects.gargantua ? celestialObjects.gargantua.group.position : new THREE.Vector3(450, 0, 0);
      camera.position.set(bhPos.x + Math.cos(angle) * 22, 5 + Math.sin(angle) * 3, bhPos.z + Math.sin(angle) * 22);
      controls.target.copy(bhPos);
    }
    // 26s - 34s: Transition to CosmoPedia Mode: 360° spin of Orion Nebula & Pulsar
    else if (elapsed >= 26.0 && elapsed < 34.0) {
      if (elapsed >= 26.0 && elapsed < 26.2) {
        switchMode('COSMOPEDIA', 'orion_nebula');
      }
      if (elapsed >= 30.0 && elapsed < 30.2) {
        mountCosmopediaObject('vela_pulsar');
      }
      const angle = (elapsed - 26.0) * 0.6;
      camera.position.set(Math.cos(angle) * 9.0, 3.5 + Math.sin(angle * 0.5) * 1.5, Math.sin(angle) * 9.0);
      controls.target.set(0, 0, 0);
    }
    // 34s - 40s: Macro Zoom-out to Cosmic Web filaments and CMB Horizon
    else if (elapsed >= 34.0 && elapsed < 40.0) {
      if (elapsed >= 34.0 && elapsed < 34.2) {
        switchMode('UNIVERSE');
      }
      const p = (elapsed - 34.0) / 6.0;
      camera.position.set(0, 1500 + p * 12000, 3000 + p * 20000);
      controls.target.set(0, 0, 0);
    }
    // 40s: Tour complete
    else if (elapsed >= 40.0) {
      stopCinematicTour();
    }
  }, 100);

  tourTimer = tourInterval;
}

function stopCinematicTour() {
  if (!tourActive) return;
  tourActive = false;
  if (tourTimer) {
    clearInterval(tourTimer);
    tourTimer = null;
  }
  const tourBtn = document.getElementById('btn-trailer-tour');
  if (tourBtn) {
    tourBtn.classList.remove('active');
    tourBtn.innerHTML = '🎬 TOUR (T)';
  }
  VideoRecorder.stop();
  speakAI('Cinematic Universe Tour Completed.');
}

// ============================================================
// 10. 6-DOF STARSHIP FLIGHT & RELATIVISTIC WARP (MODE A)
// ============================================================
const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'KeyC' && EngineState.currentMode === 'UNIVERSE') toggleFlightMode();
  if (e.code === 'KeyF' && EngineState.currentMode === 'UNIVERSE') triggerRelativisticWarp();
  if (e.key === 'r' || e.key === 'R') VideoRecorder.toggle();
  if (e.key === 't' || e.key === 'T') startCinematicTour();
  
  // Press 'P' to export pristine canvas screenshot
  if (e.key === 'p' || e.key === 'P') {
    const canvas = renderer.domElement;
    renderer.render(scene, camera);
    const image = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `cosmoverse-${EngineState.currentMode.toLowerCase()}-preview.png`;
    a.href = image;
    a.click();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

let isPointerLocked = false;
canvas.addEventListener('click', () => {
  if (EngineState.flightMode && !isPointerLocked && EngineState.currentMode === 'UNIVERSE') {
    canvas.requestPointerLock();
  }
});

document.addEventListener('pointerlockchange', () => {
  isPointerLocked = (document.pointerLockElement === canvas);
});

document.addEventListener('mousemove', (e) => {
  if (EngineState.flightMode && isPointerLocked && EngineState.currentMode === 'UNIVERSE') {
    const sensitivity = 0.0022;
    EngineState.ship.rot.y -= e.movementX * sensitivity;
    EngineState.ship.rot.x -= e.movementY * sensitivity;
    EngineState.ship.rot.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, EngineState.ship.rot.x));
  }
});

function toggleFlightMode() {
  if (EngineState.currentMode !== 'UNIVERSE') return;
  EngineState.flightMode = !EngineState.flightMode;
  const overlay = document.getElementById('cockpit-overlay');
  const btn = document.getElementById('btn-cockpit');

  if (EngineState.flightMode) {
    controls.enabled = false;
    if (overlay) overlay.style.display = 'block';
    if (btn) { btn.classList.add('active'); btn.innerHTML = '🚀 ORBIT (C)'; }
    EngineState.ship.pos.copy(camera.position);
    canvas.requestPointerLock();
    speakAI('6-DOF Cockpit Flight Mode Active. Use WASD, Space, Shift, QE to maneuver.');
  } else {
    controls.enabled = true;
    if (overlay) overlay.style.display = 'none';
    if (btn) { btn.classList.remove('active'); btn.innerHTML = '✈️ FLIGHT (C)'; }
    if (document.exitPointerLock) document.exitPointerLock();
    speakAI('Orbit Mode Resumed.');
  }
}

function triggerRelativisticWarp() {
  if (EngineState.isWarping || EngineState.currentMode !== 'UNIVERSE') return;
  EngineState.isWarping = true;

  const overlay = document.getElementById('warp-overlay');
  if (overlay) overlay.classList.add('active');

  speakAI('Relativistic Spacetime Warp Active.');

  const startFov = camera.fov;
  const targetFov = 95;

  let p = 0;
  const warpInterval = setInterval(() => {
    p += 0.05;
    if (p < 0.5) camera.fov = THREE.MathUtils.lerp(startFov, targetFov, p * 2);
    else camera.fov = THREE.MathUtils.lerp(targetFov, startFov, (p - 0.5) * 2);
    camera.updateProjectionMatrix();

    if (EngineState.flightMode) {
      const fwd = new THREE.Vector3(0, 0, -1).applyEuler(EngineState.ship.rot);
      EngineState.ship.pos.add(fwd.multiplyScalar(35.0));
    }

    if (p >= 1.0) {
      clearInterval(warpInterval);
      camera.fov = startFov;
      camera.updateProjectionMatrix();
      if (overlay) overlay.classList.remove('active');
      EngineState.isWarping = false;
    }
  }, 25);
}

function updateShipFlight(delta) {
  if (!EngineState.flightMode || EngineState.currentMode !== 'UNIVERSE') return;

  const fwd = new THREE.Vector3(0, 0, -1).applyEuler(EngineState.ship.rot);
  const right = new THREE.Vector3(1, 0, 0).applyEuler(EngineState.ship.rot);
  const up = new THREE.Vector3(0, 1, 0).applyEuler(EngineState.ship.rot);

  const moveDir = new THREE.Vector3();
  if (keys['KeyW']) moveDir.add(fwd);
  if (keys['KeyS']) moveDir.sub(fwd);
  if (keys['KeyD']) moveDir.add(right);
  if (keys['KeyA']) moveDir.sub(right);
  if (keys['Space']) moveDir.add(up);
  if (keys['ShiftLeft'] || keys['ShiftRight']) moveDir.sub(up);

  if (keys['KeyQ']) EngineState.ship.rot.z += 1.5 * delta;
  if (keys['KeyE']) EngineState.ship.rot.z -= 1.5 * delta;

  if (moveDir.lengthSq() > 0) {
    moveDir.normalize();
    EngineState.ship.speed = Math.min(EngineState.ship.maxSpeed, EngineState.ship.speed + EngineState.ship.accel * delta);
  } else {
    EngineState.ship.speed = Math.max(0, EngineState.ship.speed - EngineState.ship.accel * 0.8 * delta);
  }

  EngineState.ship.vel.copy(moveDir).multiplyScalar(EngineState.ship.speed);
  EngineState.ship.pos.addScaledVector(EngineState.ship.vel, delta);

  camera.position.copy(EngineState.ship.pos);
  camera.rotation.copy(EngineState.ship.rot);

  // Update Cockpit HUD Instruments
  const thrustEl = document.getElementById('hud-thrust-val');
  const pitchEl = document.getElementById('hud-pitch-val');
  const gammaEl = document.getElementById('hud-gamma-val');
  if (thrustEl) thrustEl.innerText = (EngineState.ship.speed * 2.8).toFixed(2) + ' km/s';
  if (pitchEl) pitchEl.innerText = (EngineState.ship.rot.x * 180 / Math.PI).toFixed(1) + '° // ' + (EngineState.ship.rot.y * 180 / Math.PI).toFixed(1) + '°';
  if (gammaEl) {
    const beta = Math.min(0.99, EngineState.ship.speed / EngineState.ship.maxSpeed);
    const gamma = 1.0 / Math.sqrt(1.0 - beta * beta);
    gammaEl.innerText = gamma.toFixed(6);
  }
}

// Focus on Celestial Body (Mode A)
function focusOnCelestialObject(targetId) {
  const target = celestialObjects[targetId];
  if (!target) return;

  EngineState.activeTarget = targetId;

  // Jump bar active class
  document.querySelectorAll('.jump-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.target === targetId);
  });

  const worldPos = new THREE.Vector3();
  target.group.getWorldPosition(worldPos);

  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const targetCamPos = worldPos.clone().add(new THREE.Vector3(0, 4, 14));

  let p = 0;
  const anim = setInterval(() => {
    p += 0.04;
    camera.position.lerpVectors(startPos, targetCamPos, p);
    controls.target.lerpVectors(startTarget, worldPos, p);
    if (p >= 1.0) {
      clearInterval(anim);
      controls.target.copy(worldPos);
    }
  }, 20);

  updateTelemetrySidebar(targetId);
}

function updateTelemetrySidebar(targetId) {
  const entity = COSMO_DATA.entities.find(e => e.id === targetId || e.universeId === targetId) || COSMO_DATA.entities[0];
  const isBn = (EngineState.currentLang === 'bn');
  const m = entity.metrics || {};

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val || '--';
  };

  setEl('tel-name', isBn ? entity.nameBn : entity.nameEn);
  setEl('tel-type', entity.archetype);
  setEl('tel-mass', isBn ? (m.massBn || m.mass) : (m.mass || '--'));
  setEl('tel-temp', isBn ? (m.tempBn || m.temp) : (m.temp || '--'));
  setEl('tel-desc', isBn ? entity.descBn : entity.descEn);

  // Update Astrodynamics Math HUD
  const astro = ASTRODYNAMICS_METRICS[targetId] || ASTRODYNAMICS_METRICS.earth;
  setEl('metric-rs', astro.rs);
  setEl('metric-dilation', astro.dilation);
  setEl('metric-vorb', astro.vorb);
  setEl('metric-vesc', astro.vesc);
}

// Web Audio Deep-Space Ambient Drone
let audioCtx = null;
let droneGain = null;
function toggleAudio() {
  const btn = document.getElementById('btn-audio');
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      droneGain = audioCtx.createGain();

      osc1.type = 'sine'; osc1.frequency.setValueAtTime(55, audioCtx.currentTime); // A1
      osc2.type = 'sine'; osc2.frequency.setValueAtTime(110, audioCtx.currentTime); // A2

      droneGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc1.connect(droneGain);
      osc2.connect(droneGain);
      droneGain.connect(audioCtx.destination);

      osc1.start(); osc2.start();
      if (btn) { btn.innerHTML = '🔊 AUDIO'; btn.classList.add('active'); }
    } catch (e) {}
  } else {
    if (audioCtx.state === 'running') {
      audioCtx.suspend();
      if (btn) { btn.innerHTML = '🔇 AUDIO'; btn.classList.remove('active'); }
    } else {
      audioCtx.resume();
      if (btn) { btn.innerHTML = '🔊 AUDIO'; btn.classList.add('active'); }
    }
  }
}

// ============================================================
// 10. ATTACH INTERACTIVE UI EVENT LISTENERS
// ============================================================
function setupEventListeners() {
  // Mode Buttons
  const btnUniverse = document.getElementById('btn-mode-universe');
  const btnCosmopedia = document.getElementById('btn-mode-cosmopedia');
  if (btnUniverse) btnUniverse.addEventListener('click', () => switchMode('UNIVERSE'));
  if (btnCosmopedia) btnCosmopedia.addEventListener('click', () => switchMode('COSMOPEDIA'));

  // Header Buttons
  const btnAudio = document.getElementById('btn-audio');
  const btnCockpit = document.getElementById('btn-cockpit');
  const btnWarp = document.getElementById('btn-warp');
  const voiceBtn = document.getElementById('voice-btn');
  const btnTour = document.getElementById('btn-trailer-tour');
  const btnRec = document.getElementById('btn-video-rec');

  if (btnTour) btnTour.addEventListener('click', startCinematicTour);
  if (btnRec) btnRec.addEventListener('click', () => VideoRecorder.toggle());
  if (btnAudio) btnAudio.addEventListener('click', toggleAudio);
  if (btnCockpit) btnCockpit.addEventListener('click', toggleFlightMode);
  if (btnWarp) btnWarp.addEventListener('click', triggerRelativisticWarp);
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      EngineState.voiceActive = !EngineState.voiceActive;
      voiceBtn.classList.toggle('active', EngineState.voiceActive);
      const label = document.getElementById('voice-label');
      if (label) label.innerText = EngineState.voiceActive ? 'VOICE AI: ACTIVE' : 'VOICE AI: MUTED';
      speakAI(EngineState.voiceActive ? 'Voice Co-Pilot Enabled.' : 'Voice Co-Pilot Muted.');
    });
  }

  // Quick Jump Bar
  document.querySelectorAll('.jump-btn').forEach(btn => {
    btn.addEventListener('click', () => focusOnCelestialObject(btn.dataset.target));
  });

  // Cosmopedia Search Input
  const searchInput = document.getElementById('pedia-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      EngineState.searchQuery = e.target.value;
      renderPediaEntities();
    });
  }

  // Language Pills
  const btnLangEn = document.getElementById('btn-lang-en');
  const btnLangBn = document.getElementById('btn-lang-bn');
  if (btnLangEn) {
    btnLangEn.addEventListener('click', () => {
      EngineState.currentLang = 'en';
      btnLangEn.classList.add('active');
      if (btnLangBn) btnLangBn.classList.remove('active');
      renderPediaSectors();
      renderPediaEntities();
      const current = COSMO_DATA.entities.find(e => e.id === EngineState.selectedPediaId);
      if (current) updateDossierCard(current);
    });
  }
  if (btnLangBn) {
    btnLangBn.addEventListener('click', () => {
      EngineState.currentLang = 'bn';
      btnLangBn.classList.add('active');
      if (btnLangEn) btnLangEn.classList.remove('active');
      renderPediaSectors();
      renderPediaEntities();
      const current = COSMO_DATA.entities.find(e => e.id === EngineState.selectedPediaId);
      if (current) updateDossierCard(current);
    });
  }

  // Robust Documentary Voice Narration Button
  const voiceNarrateBtn = document.getElementById('voice-narrate-btn') || document.getElementById('btn-speak-dossier');
  if (voiceNarrateBtn) {
    voiceNarrateBtn.addEventListener('click', () => {
      const current = COSMO_DATA.entities.find(e => e.id === EngineState.selectedPediaId);
      if (!current) return;
      const isBn = (EngineState.currentLang === 'bn');
      const textToSpeak = (isBn ? `${current.nameBn}। ${current.descBn}` : `${current.nameEn}. ${current.descEn}`);
      VoiceGuide.toggle(textToSpeak, EngineState.currentLang);
    });
  }

  // Shading Mode Switcher Pills
  document.querySelectorAll('.shading-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.shading-pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      EngineState.shadingMode = btn.dataset.shading;
      mountCosmopediaObject(EngineState.selectedPediaId);
    });
  });

  // Sunlight Direction Rotator Slider
  const sunSlider = document.getElementById('sun-light-slider');
  if (sunSlider) {
    sunSlider.addEventListener('input', (e) => {
      EngineState.sunLightAngle = parseFloat(e.target.value);
      const rad = EngineState.sunLightAngle * Math.PI / 180;
      stageSunLight.position.set(Math.cos(rad) * 16, 6, Math.sin(rad) * 16);
    });
  }

  // Compare with Earth Toggle
  const btnCompare = document.getElementById('btn-compare-earth');
  if (btnCompare) {
    btnCompare.addEventListener('click', () => {
      EngineState.compareEarthActive = !EngineState.compareEarthActive;
      btnCompare.classList.toggle('active', EngineState.compareEarthActive);
      const current = COSMO_DATA.entities.find(e => e.id === EngineState.selectedPediaId);
      if (current) mountCosmopediaObject(current.id);
    });
  }

  // Locate in Universe Button (Mode B -> Mode A bridge)
  const btnLocate = document.getElementById('btn-locate-universe');
  if (btnLocate) {
    btnLocate.addEventListener('click', () => {
      const current = COSMO_DATA.entities.find(e => e.id === EngineState.selectedPediaId);
      const univTargetId = current ? (current.universeId || current.id) : 'earth';
      switchMode('UNIVERSE', univTargetId);
    });
  }

  // Inspect in Pedia Button (Mode A -> Mode B bridge)
  const btnInspectPedia = document.getElementById('btn-inspect-pedia');
  if (btnInspectPedia) {
    btnInspectPedia.addEventListener('click', () => {
      switchMode('COSMOPEDIA', EngineState.activeTarget);
    });
  }

  // Turntable Auto-Rotate Button
  const btnTurntable = document.getElementById('btn-stage-autorotate');
  if (btnTurntable) {
    btnTurntable.addEventListener('click', () => {
      EngineState.stageAutoRotate = !EngineState.stageAutoRotate;
      btnTurntable.classList.toggle('active', EngineState.stageAutoRotate);
    });
  }

  // Time Warp Controls (Mode A)
  document.querySelectorAll('.time-speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.time-speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const spd = parseFloat(btn.dataset.speed);
      if (spd === 0) {
        EngineState.isPaused = true;
      } else {
        EngineState.isPaused = false;
        EngineState.timeMultiplier = spd;
      }
    });
  });

  // Toggle Orbit Paths Button
  const btnOrbits = document.getElementById('btn-toggle-orbits');
  if (btnOrbits) {
    btnOrbits.addEventListener('click', () => {
      EngineState.showOrbits = !EngineState.showOrbits;
      btnOrbits.classList.toggle('active', EngineState.showOrbits);
      orbitLines.forEach(l => { l.visible = EngineState.showOrbits; });
    });
  }
}

// ============================================================
// 11. MAIN ENGINE ANIMATION & RENDER LOOP
// ============================================================
function animate() {
  requestAnimationFrame(animate);

  const delta = EngineState.clock.getDelta();
  const time = EngineState.clock.getElapsedTime();

  if (EngineState.currentMode === 'UNIVERSE') {
    // Mode A Universe Animation
    const speedMult = EngineState.isPaused ? 0 : EngineState.timeMultiplier;

    Object.values(celestialObjects).forEach(obj => {
      if (obj.pivot && obj.orbitSpeed) {
        obj.angle += obj.orbitSpeed * 0.5 * speedMult * delta;
        obj.group.position.x = Math.cos(obj.angle) * obj.group.position.length();
        obj.group.position.z = Math.sin(obj.angle) * obj.group.position.length();
      }
      if (obj.mesh && obj.rotationSpeed) {
        obj.mesh.rotation.y += obj.rotationSpeed * speedMult;
      }
      if (obj.clouds) {
        obj.clouds.rotation.y += 0.003 * speedMult;
      }
    });

    if (EngineState.flightMode) {
      updateShipFlight(delta);
    } else {
      controls.update();
    }
  } else {
    // Mode B Cosmopedia Turntable Studio Animation
    controls.update();
    if (stageRotatorPivot && EngineState.stageAutoRotate) {
      stageRotatorPivot.rotation.y += 0.008;
    }
  }

  if (composer) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
}

// Window Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  if (composer) composer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================================
// 12. BOOTSTRAP COSMOVERSE X
// ============================================================
function bootstrap() {
  buildCrispStarfields();
  buildUniverseSimulationObjects();
  initCosmopediaStage();
  setupEventListeners();

  renderPediaSectors();
  renderPediaEntities();

  // Focus Earth on launch
  focusOnCelestialObject('earth');

  animate();
  console.log("CosmoVerse X v2.0 // Photorealistic Shader Engine & Neural Voice Guide Initialized.");
}

window.addEventListener('DOMContentLoaded', bootstrap);


