<div align="center">

# 🌌 COSMOVERSE X (v2.0)
### *Next-Gen WebGL2/Three.js Open-Universe Simulation & 250+ Celestial CosmoPedia*

[![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![WebGL2](https://img.shields.io/badge/WebGL2-GPU_Accelerated-blue?style=for-the-badge&logo=webgl)](https://www.khronos.org/webgl/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)
[![Frame Rate](https://img.shields.io/badge/Performance-Locked_60_FPS-cyan?style=for-the-badge)](http://localhost:8080)
[![Bilingual](https://img.shields.io/badge/Language-English_%7C_%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE-purple?style=for-the-badge)](#)

<p align="center">
  <b>CosmoVerse X v2.0</b> is a dual-core astronomical visualization platform combining a continuous-scale open-universe spaceflight engine with an interactive, parametric 3D encyclopedia of over 250 celestial entities, complete with procedural shaders, real-time relativistic astrodynamics HUD, and native bilingual voice synthesis.
</p>

[Explore Features](#-system-architecture) • [Controls](#-flight--inspection-controls) • [Catalog Breakdown](#-250-celestial-matrix) • [Quickstart](#-local-deployment)

</div>

---

## 🏗️ System Architecture

```
                    ┌────────────────────────────────────────┐
                    │   COSMOVERSE X : STATE MACHINE CORE    │
                    └───────────────────┬────────────────────┘
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
┌───────────────────────────────┐                     ┌───────────────────────────────┐
│     MODE A: UNIVERSE TWIN     │ ◄─── [Mode Bridge] ──► │     MODE B: COSMOPEDIA 3D     │
│   (Macrocosm Flight & Orbit)  │    [Locate / Inspect]  │   (250+ Object 3D Museum)     │
└───────────────────────────────┘                     └───────────────────────────────┘
 • 6-DOF Cockpit & Relativistic Warp                   • Parametric 3D Turntable Stage
 • Real-Time Astrodynamics & Telemetry                 • Bilingual Science Dossiers (EN/BN)
 • True-Scale Cosmic Web & CMB Horizon                 • Web Speech API Natural Voice AI
 • Keplerian Planetary Systems                         • "Compare with Earth" True-Scale Tool
```

---

## ✨ Key Features

### 🌌 1. Mode A: Universe Twin (Macrocosm Flight Simulation)
* **Continuous Depth Pipeline:** Seamless navigation across logarithmic scales from planetary low-orbit ($r \approx 10$) to the Observable Universe CMB boundary ($r \approx 250,000$).
* **Procedural Planetary Shaders:** Dynamic Rayleigh atmospheric rim scattering, specular ocean glint, procedural bump-mapped landmasses, and unlit hemisphere city lights.
* **Kerr Singularity (Gargantua):** Pure black event horizon surrounded by a Doppler-beamed accretion disk and gravitational lensing photon ring.
* **Large-Scale Cosmic Web:** 40,000+ galaxy nodes connected along procedural 3D Voronoi filament lines framing cosmic voids.

### 📚 2. Mode B: CosmoPedia 3D (250+ Celestial Catalog)
* **250+ Curated Entities:** Spanning 9 distinct cosmological sectors.
* **Parametric Archetype Engine:** Instantly visualizes Terrestrial Worlds, Gas Giants, Plasma Stars, Relativistic Singularities, Pulsars, and Volumetric Nebulae.
* **Bilingual Telemetry Dossiers:** High-precision physical parameters (Mass, Radius, Surface Temp, Distance) alongside narrative science overviews in both **English** and **বাংলা**.
* **Voice AI Guide:** Sentence-chunked Web Speech API audio synthesis for fluid, documentary-grade narration without mid-speech timeouts.
* **Scale Comparison Engine:** Dynamic true-scale Earth reference comparison tool.

---

## 🪐 250+ Celestial Matrix (9 Sectors)

| Sector | Domain | Sample Catalog Highlights |
| :--- | :--- | :--- |
| **01** | **Solar System & TNOs** | Sun, Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Ceres, Sedna, 'Oumuamua |
| **02** | **Planetary Moons** | Luna, Europa, Titan, Enceladus, Io, Ganymede, Callisto, Triton, Charon, Miranda, Phobos |
| **03** | **Exoplanets** | TRAPPIST-1e, Proxima b, 55 Cancri e (Diamond), WASP-76b (Iron Rain), Kepler-22b, HD 189733b |
| **04** | **Stellar Spectrum** | Sirius A/B, Betelgeuse, Rigel, UY Scuti, Stephenson 2-18, VY Canis Majoris, Alpha Centauri |
| **05** | **Relativistic Relics** | Gargantua, Sagittarius A*, M87*, TON 618, Cygnus X-1, 4D Einstein-Rosen Wormhole, Quasars |
| **06** | **Pulsars & Magnetars** | Vela Pulsar, Crab Pulsar, SGR 1806-20, Magnetar 1E 2259+586, Black Widow Pulsar |
| **07** | **Nebulae & Remnants** | Pillars of Creation, Orion Nebula, Helix (Eye of God), Crab Nebula, Carina, Horsehead Nebula |
| **08** | **Galaxies & Clusters** | Milky Way, Andromeda (M31), Sombrero (M104), Whirlpool (M51), Cartwheel, Antennae Collision |
| **09** | **Macrocosm & Probes** | Laniakea, Boötes Void, Cosmic Web, CMB Horizon, JWST, Voyager 1, Hubble, ISS, Dyson Swarm |

---

## 🎮 Flight & Inspection Controls

### Simulation Mode (Mode A)
| Key / Input | Action |
| :--- | :--- |
| **`W` / `S`** | Forward / Backward Starship Thrust |
| **`A` / `D`** | Lateral Strafe Left / Right |
| **`Q` / `E`** | Roll Counter-Clockwise / Clockwise |
| **`Space` / `Shift`** | Ascend / Descend Elevation |
| **`F`** | Toggle Relativistic Warp Speed |
| **`Mouse Drag`** | Pitch / Yaw Flight Vector |

### CosmoPedia Mode (Mode B)
| Control | Action |
| :--- | :--- |
| **`Left Click + Drag`** | 360° Object Turntable Rotation |
| **`Scroll Wheel`** | Zoom In / Out |
| **`Compare with Earth`** | Spawn True-Scale Earth Reference |
| **`🔊 Listen / শুনুন`** | Trigger Neural Audio Narration (EN/BN) |
| **`Locate in Universe`** | Bridge to Open-World Coordinates |

---

## ⚡ Local Deployment

CosmoVerse X runs 100% procedurally in-memory without external asset or texture downloads.

```bash
# 1. Clone the repository
git clone https://github.com/fokrulanthro16-eng/cosmoverse-x.git

# 2. Navigate to project directory
cd cosmoverse-x

# 3. Start local development server (Python)
python -m http.server 8080

# 4. Open in browser
# Navigate to http://localhost:8080
```

---

## 🛠️ Built With

* **Core Engine:** [Three.js r128](https://threejs.org/) / WebGL2
* **Styling & UI:** Vanilla CSS3 Glassmorphism (Zero Framework Overhead)
* **Audio Synthesis:** Web Speech API (`SpeechSynthesisUtterance`)
* **Astrodynamic Math:** Relativistic Schwarzschild, Keplerian Orbitals & Dilations

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

Developed with 🌌 by [Fokrul Islam](https://github.com/fokrulanthro16-eng).
