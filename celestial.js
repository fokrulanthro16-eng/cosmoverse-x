/**
 * CosmoVerse 3D - Celestial Hierarchy & Procedural Texture Engine
 */

import * as THREE from 'three';
import { Shaders } from './shaders.js';

// Procedural Canvas Texture Generators
export function createEarthCanvasTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Deep Ocean Blue Base
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0, '#0a2342');
  grad.addColorStop(0.5, '#0b3954');
  grad.addColorStop(1, '#081c34');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Procedural Continents (Perlin-like blobs)
  ctx.fillStyle = '#2d5a27';
  function drawContinent(cx, cy, rx, ry, seed) {
    ctx.beginPath();
    for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
      const rNoise = 1 + 0.3 * Math.sin(angle * 4 + seed) + 0.15 * Math.cos(angle * 7 - seed);
      const x = cx + Math.cos(angle) * rx * rNoise;
      const y = cy + Math.sin(angle) * ry * rNoise;
      if (angle === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Africa & Europe
  ctx.fillStyle = '#5c6d37';
  drawContinent(1050, 480, 180, 260, 1.2);
  ctx.fillStyle = '#8b7d52'; // Sahara
  drawContinent(1040, 400, 140, 90, 2.5);
  ctx.fillStyle = '#2e5d32'; // Europe
  drawContinent(1060, 250, 140, 110, 3.1);

  // Americas
  ctx.fillStyle = '#3a6332';
  drawContinent(480, 300, 180, 150, 4.4); // N America
  drawContinent(600, 680, 130, 220, 5.8); // S America
  ctx.fillStyle = '#8b6f47'; // Rockies / Andes
  drawContinent(400, 310, 40, 140, 6.2);
  drawContinent(540, 690, 30, 200, 7.1);

  // Asia & Australia
  ctx.fillStyle = '#395e2d';
  drawContinent(1450, 320, 280, 190, 8.4);
  ctx.fillStyle = '#a68a56'; // Gobi / Middle East
  drawContinent(1250, 360, 120, 70, 9.3);
  ctx.fillStyle = '#9c5a2b'; // Australia
  drawContinent(1600, 720, 130, 100, 10.5);

  // Polar Ice Caps
  ctx.fillStyle = '#e8f4f8';
  ctx.fillRect(0, 0, 2048, 65);
  ctx.fillRect(0, 960, 2048, 64);
  for (let i = 0; i < 2048; i += 20) {
    const topH = 65 + Math.sin(i * 0.05) * 20;
    const botH = 960 - Math.cos(i * 0.04) * 25;
    ctx.fillRect(i, 0, 20, topH);
    ctx.fillRect(i, botH, 20, 1024 - botH);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createEarthCloudCanvasTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, 2048, 1024);

  // Swirling cloud bands
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * 2048;
    const y = 150 + Math.random() * 724;
    const rad = 50 + Math.random() * 140;
    const grad = ctx.createRadialGradient(x, y, 10, x, y, rad);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, rad * 2.2, rad * 0.5, Math.sin(y * 0.01) * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createSaturnCanvasTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const bands = [
    { y: 0.0, color: '#4a3c28' },
    { y: 0.1, color: '#8c7d5c' },
    { y: 0.2, color: '#c4b58e' },
    { y: 0.35, color: '#dfcfa6' },
    { y: 0.45, color: '#eddcb4' },
    { y: 0.5, color: '#f3e6c3' },
    { y: 0.55, color: '#dfcfa6' },
    { y: 0.65, color: '#c4b58e' },
    { y: 0.8, color: '#9d8e6c' },
    { y: 0.9, color: '#68593e' },
    { y: 1.0, color: '#3d3120' }
  ];

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  bands.forEach(b => grad.addColorStop(b.y, b.color));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Micro turbulent streaks
  for (let y = 0; y < 512; y += 2) {
    const alpha = (Math.sin(y * 0.35) * 0.5 + 0.5) * 0.12;
    ctx.fillStyle = 
gba(255, 255, 255, );
    ctx.fillRect(0, y, 1024, 1.5);
  }

  // Hexagonal Polar Storm on North Pole
  ctx.fillStyle = '#2d3b36';
  ctx.beginPath();
  ctx.arc(512, 25, 22, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Celestial Bodies Database & Telemetry
export const CELESTIAL_DATA = {
  sun: {
    id: 'sun',
    name: 'The Sun (Sol)',
    type: 'G-Type Main-Sequence Star',
    mass: '1.989 × 10³⁰ kg (333,000 M⊕)',
    radius: '696,340 km (109 R⊕)',
    surfaceGravity: '274.0 m/s² (27.9 g)',
    orbitalVelocity: '230 km/s (Galactic Orbit)',
    orbitalPeriod: '230 Million Years (Galactic Year)',
    temperature: '5,778 K (Core: 15.7M K)',
    atmosphere: '73.46% H₂, 24.85% He, 0.77% O, 0.29% Fe',
    magneticField: '1 to 50 Gauss (Sunspots up to 4000 G)',
    escapeVelocity: '617.5 km/s',
    radiation: '3.828 × 10²⁶ Watts (Luminosity)',
    spectralClass: 'G2V (Yellow Dwarf)',
    physicsAlert: 'THERMONUCLEAR FUSION: Proton-Proton chain converting 600M tons of H to He per second.',
    description: 'The gravitational heart of the Solar System, containing 99.86% of its total mass. Governed by magnetohydrodynamic convection cells and high-energy coronal mass ejections.',
    cameraDistance: 45.0,
    surfaceDistance: 22.0
  },
  earth: {
    id: 'earth',
    name: 'Earth (Terra)',
    type: 'Terrestrial Habitable Planet',
    mass: '5.972 × 10²⁴ kg (1.0 M⊕)',
    radius: '6,371 km (1.0 R⊕)',
    surfaceGravity: '9.807 m/s² (1.0 g)',
    orbitalVelocity: '29.78 km/s',
    orbitalPeriod: '365.25 Days',
    temperature: '288 K (15°C Mean)',
    atmosphere: '78.08% N₂, 20.95% O₂, 0.93% Ar, 0.04% CO₂',
    magneticField: '0.25 to 0.65 Gauss (Geodynamo)',
    escapeVelocity: '11.186 km/s',
    radiation: '1,361 W/m² (Solar Constant at 1 AU)',
    spectralClass: 'Class M Biosphere',
    physicsAlert: 'ACTIVE MAGNETOSPHERE: Shields surface biosphere from energetic solar wind and cosmic rays.',
    description: 'The only known astronomical object known to harbor life. Features active plate tectonics, liquid water oceans, and a dense, protective nitrogen-oxygen atmosphere.',
    cameraDistance: 12.0,
    surfaceDistance: 4.8
  },
  moon: {
    id: 'moon',
    name: 'The Moon (Luna)',
    type: 'Major Natural Satellite',
    mass: '7.342 × 10²² kg (0.0123 M⊕)',
    radius: '1,737.4 km (0.273 R⊕)',
    surfaceGravity: '1.62 m/s² (0.165 g)',
    orbitalVelocity: '1.022 km/s (around Earth)',
    orbitalPeriod: '27.32 Days (Tidally Locked)',
    temperature: '100 K to 390 K (-173°C to 117°C)',
    atmosphere: 'Exosphere: He, Ne, H₂, Ar (< 10⁻¹⁰ Pa)',
    magneticField: '< 10⁻⁴ Gauss (Crustal Remanent)',
    escapeVelocity: '2.38 km/s',
    radiation: 'Unshielded Solar & Galactic Cosmic Rays',
    spectralClass: 'Anorthositic Regolith Body',
    physicsAlert: 'TIDAL LOCKING & TOPOGRAPHY: High-density crater impact basins (Maria) with zero atmospheric erosion.',
    description: 'Earths single permanent natural satellite. Its surface is scarred by billions of years of meteorite impacts, creating prominent basaltic maria and impact craters.',
    cameraDistance: 6.0,
    surfaceDistance: 2.1
  },
  saturn: {
    id: 'saturn',
    name: 'Saturn (Cronus)',
    type: 'Gas Giant (Ringed Jovian)',
    mass: '5.683 × 10²⁶ kg (95.16 M⊕)',
    radius: '58,232 km (9.14 R⊕)',
    surfaceGravity: '10.44 m/s² (1.06 g)',
    orbitalVelocity: '9.68 km/s',
    orbitalPeriod: '29.45 Earth Years',
    temperature: '134 K (-139°C at 1 bar level)',
    atmosphere: '96.3% H₂, 3.25% He, 0.45% CH₄, 0.01% NH₃',
    magneticField: '0.21 Gauss (Highly Axisymmetric)',
    escapeVelocity: '35.5 km/s',
    radiation: '2.5x Heat Radiation vs Solar Absorption',
    spectralClass: 'Jovian Gas Giant',
    physicsAlert: 'EXTENSIVE RING SYSTEM: Billions of water-ice boulders spanning 282,000 km with only ~10m thickness.',
    description: 'The second largest planet in the solar system, famous for its magnificent, complex ring system consisting mostly of pure water ice particles, chunks, and dust.',
    cameraDistance: 24.0,
    surfaceDistance: 8.5
  },
  pulsar: {
    id: 'pulsar',
    name: 'PSR B1919+21 (Neutron Star / Pulsar)',
    type: 'Ultra-Dense Relativistic Pulsar',
    mass: '2.784 × 10³⁰ kg (1.4 M☉ / 465,000 M⊕)',
    radius: '11.5 km (0.000016 R⊕)',
    surfaceGravity: '2.0 × 10¹² m/s² (200 Billion g)',
    orbitalVelocity: 'Relativistic Surface Spin ~ 70,000 km/s',
    orbitalPeriod: 'Rotation Period: 1.337 Seconds (Pulsing)',
    temperature: '1,000,000 K (Surface X-ray Glow)',
    atmosphere: 'Degenerate Electron-Proton Plasma Skin (~1 cm)',
    magneticField: '1.2 × 10¹² Gauss (Trillion G Dipole)',
    escapeVelocity: '180,000 km/s (0.60 c)',
    radiation: 'Synchrotron & Relativistic Gamma/X-Ray Beams',
    spectralClass: 'Relativistic Compact Remnant',
    physicsAlert: 'EXTREME RELATIVISTIC BEAMS: Magnetic poles accelerate plasma to 0.999c, firing pulsed synchrotron radiation.',
    description: 'The collapsed iron core of a massive supernova. Matter inside is squeezed into degenerate nuclear fluid where a teaspoon of neutronium weighs 5 billion tons.',
    cameraDistance: 16.0,
    surfaceDistance: 3.5
  }
};
