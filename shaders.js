/**
 * CosmoVerse 3D - Procedural GLSL Shaders
 * High-fidelity celestial graphics and extreme astrophysics shaders
 */

export const Shaders = {
  // 1. SUN / STELLAR SURFACE SHADER
  Sun: {
    uniforms: {
      uTime: { value: 0 },
      uColorCore: { value: null },
      uColorCorona: { value: null },
      uNoiseScale: { value: 4.5 },
      uSpeed: { value: 0.3 }
    },
    vertexShader:       varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    \,
    fragmentShader:       uniform float uTime;
      uniform vec3 uColorCore;
      uniform vec3 uColorCorona;
      uniform float uNoiseScale;
      uniform float uSpeed;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;

      // Simplex 3D noise
      vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

      float snoise(vec3 v){
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + 1.0 * C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
        i = mod(i, 289.0 );
        vec4 p = permute( permute( permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
      }

      float fbm(vec3 p) {
        float total = 0.0;
        float amp = 0.5;
        float freq = 1.0;
        for (int i = 0; i < 4; i++) {
          total += snoise(p * freq) * amp;
          freq *= 2.0;
          amp *= 0.5;
        }
        return total;
      }

      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
        fresnel = pow(fresnel, 2.2);

        // Granulation & convection cells
        vec3 noiseCoord = vPosition * uNoiseScale + vec3(0.0, uTime * uSpeed, 0.0);
        float n1 = fbm(noiseCoord);
        float n2 = fbm(noiseCoord * 2.0 + vec3(uTime * 0.2, 0.0, 0.0));
        float combinedNoise = (n1 + n2 * 0.5) * 0.5 + 0.5;

        // Dark sunspots
        float sunspots = smoothstep(0.35, 0.2, combinedNoise);

        // Core to rim thermal gradient
        vec3 coreColor = mix(uColorCore, vec3(1.0, 0.95, 0.8), combinedNoise * 0.8);
        vec3 rimColor = uColorCorona * 1.5;
        vec3 finalColor = mix(coreColor, rimColor, fresnel * 0.7);

        // Apply sunspot darkening
        finalColor = mix(finalColor, vec3(0.3, 0.05, 0.0), sunspots * 0.85);

        // Intense corona rim flare
        finalColor += uColorCorona * pow(fresnel, 3.5) * 2.5;

        gl_FragColor = vec4(finalColor, 1.0);
      }
      },

  // 2. SUN CORONA / GLOW ATMOSPHERE
  SunGlow: {
    uniforms: {
      uTime: { value: 0 },
      uGlowColor: { value: null }
    },
    vertexShader:       varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    \,
    fragmentShader:       uniform float uTime;
      uniform vec3 uGlowColor;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;

      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float intensity = pow(0.65 - dot(vNormal, viewDir), 2.8);
        intensity = max(intensity, 0.0);
        gl_FragColor = vec4(uGlowColor, intensity * 1.3);
      }
      },

  // 3. EARTH ATMOSPHERE SCATTERING (Rayleigh-Mie Rim)
  EarthAtmosphere: {
    uniforms: {
      uLightDir: { value: null },
      uAtmosphereColor: { value: null }
    },
    vertexShader:       varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    \,
    fragmentShader:       uniform vec3 uLightDir;
      uniform vec3 uAtmosphereColor;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;

      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float viewDot = 1.0 - max(dot(vNormal, viewDir), 0.0);
        float rim = pow(viewDot, 3.0);

        // Sun alignment
        float sunFacing = max(dot(vNormal, uLightDir), 0.0);
        float intensity = rim * (sunFacing * 0.8 + 0.2) * 1.5;

        // Twilight reddening
        vec3 sunset = vec3(1.0, 0.4, 0.1);
        vec3 skyColor = mix(sunset, uAtmosphereColor, smoothstep(-0.2, 0.4, dot(vNormal, uLightDir)));

        gl_FragColor = vec4(skyColor, intensity);
      }
      },

  // 4. PROCEDURAL MOON CRATER & SURFACE DISPLACEMENT
  MoonSurface: {
    uniforms: {
      uLightDir: { value: null },
      uTime: { value: 0 }
    },
    vertexShader:       varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vLocalPos;

      void main() {
        vUv = uv;
        vLocalPos = position;
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    \,
    fragmentShader:       uniform vec3 uLightDir;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vLocalPos;

      // Hash and cellular voronoi for procedural crater topography
      vec3 hash33(vec3 p3) {
        p3 = fract(p3 * vec3(.1031, .1030, .0973));
        p3 += dot(p3, p3.yxz+33.33);
        return fract((p3.xxy + p3.yxx)*p3.zyx);
      }

      float voronoiCrater(vec3 p) {
        vec3 g = floor(p);
        vec3 f = fract(p);
        float res = 1.0;
        for(int k=-1; k<=1; k++) {
          for(int j=-1; j<=1; j++) {
            for(int i=-1; i<=1; i++) {
              vec3 b = vec3(float(i), float(j), float(k));
              vec3 r = vec3(b) - f + hash33(g + b);
              float d = dot(r, r);
              res = min(res, d);
            }
          }
        }
        float crater = sqrt(res);
        // Create rim lip and basin
        float rim = smoothstep(0.4, 0.5, crater) * smoothstep(0.65, 0.5, crater);
        float basin = smoothstep(0.5, 0.0, crater) * 0.4;
        return rim * 0.3 - basin;
      }

      float surfaceNoise(vec3 p) {
        float f = 0.0;
        f += 0.5000 * voronoiCrater(p * 2.0);
        f += 0.2500 * voronoiCrater(p * 6.0);
        f += 0.1250 * voronoiCrater(p * 18.0);
        f += 0.0625 * voronoiCrater(p * 45.0);
        return f;
      }

      void main() {
        vec3 p = normalize(vLocalPos) * 3.0;
        float h = surfaceNoise(p);
        
        // Perturb normal based on craters
        vec3 norm = normalize(vNormal + vec3(h * 0.35));
        
        float diff = max(dot(norm, uLightDir), 0.0);
        float ambient = 0.03;

        // Regolith basalt & anorthosite highland colors
        vec3 highland = vec3(0.82, 0.82, 0.84);
        vec3 mareBasalt = vec3(0.32, 0.33, 0.36);
        
        float mareMask = smoothstep(-0.2, 0.3, surfaceNoise(p * 0.7));
        vec3 baseColor = mix(mareBasalt, highland, mareMask);
        
        // Add crater highlight & ejecta rays
        baseColor += vec3(max(h, 0.0) * 0.4);

        vec3 color = baseColor * (diff + ambient);
        gl_FragColor = vec4(color, 1.0);
      }
      },

  // 5. SATURN VOLUMETRIC RINGS WITH SHADOWING
  SaturnRing: {
    uniforms: {
      uLightDir: { value: null },
      uPlanetRadius: { value: 2.2 },
      uInnerRadius: { value: 3.2 },
      uOuterRadius: { value: 6.8 }
    },
    vertexShader:       varying vec3 vWorldPosition;
      varying vec2 vUv;
      varying vec3 vLocalPos;

      void main() {
        vUv = uv;
        vLocalPos = position;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    \,
    fragmentShader:       uniform vec3 uLightDir;
      uniform float uPlanetRadius;
      uniform float uInnerRadius;
      uniform float uOuterRadius;

      varying vec3 vWorldPosition;
      varying vec2 vUv;
      varying vec3 vLocalPos;

      // Noise for ring micro-divisions (Cassini & Encke divisions)
      float ringDensity(float r) {
        float cassini = 1.0 - smoothstep(4.75, 4.85, r) * (1.0 - smoothstep(5.0, 5.1, r));
        float encke = 1.0 - smoothstep(5.95, 6.0, r) * (1.0 - smoothstep(6.05, 6.1, r));
        float fineBands = sin(r * 120.0) * 0.15 + cos(r * 45.0) * 0.25 + 0.6;
        float mainBands = smoothstep(3.2, 3.8, r) * (1.0 - smoothstep(6.4, 6.8, r));
        return clamp(mainBands * fineBands * cassini * encke, 0.0, 0.95);
      }

      void main() {
        float r = length(vLocalPos.xy);
        if (r < uInnerRadius || r > uOuterRadius) discard;

        float alpha = ringDensity(r);
        if (alpha < 0.01) discard;

        vec3 ringColorA = vec3(0.88, 0.80, 0.68);
        vec3 ringColorB = vec3(0.96, 0.89, 0.77);
        vec3 ringColorC = vec3(0.65, 0.58, 0.50);

        float t = (r - uInnerRadius) / (uOuterRadius - uInnerRadius);
        vec3 color = mix(ringColorC, ringColorB, smoothstep(0.0, 0.45, t));
        color = mix(color, ringColorA, smoothstep(0.45, 1.0, t));

        // Planet shadow on rings
        float distAlongLight = dot(vWorldPosition, uLightDir);
        if (distAlongLight < 0.0) {
          float distToLightAxis = length(vWorldPosition - uLightDir * distAlongLight);
          if (distToLightAxis < uPlanetRadius * 1.05) {
            color *= 0.06;
            alpha *= 0.6;
          }
        }

        gl_FragColor = vec4(color, alpha);
      }
      },

  // 6. NEUTRON STAR / PULSAR CORE & ACCRETION DISK & RELATIVISTIC JETS
  PulsarCore: {
    uniforms: {
      uTime: { value: 0 },
      uPulseRate: { value: 12.0 }
    },
    vertexShader:       varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    \,
    fragmentShader:       uniform float uTime;
      uniform float uPulseRate;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;

      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float pulse = sin(uTime * uPulseRate) * 0.35 + 0.65;
        float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);

        // Hyper-dense blinding blue-violet core
        vec3 core = vec3(0.65, 0.88, 1.0) * 3.5 * pulse;
        vec3 corona = vec3(0.3, 0.6, 1.0) * pow(fresnel, 2.0) * 4.0;
        
        gl_FragColor = vec4(core + corona, 1.0);
      }
      },

  // Pulsar Relativistic Beams / Polar Jets
  PulsarJet: {
    uniforms: {
      uTime: { value: 0 },
      uBeamColor: { value: null }
    },
    vertexShader:       varying vec2 vUv;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    \,
    fragmentShader:       uniform float uTime;
      uniform vec3 uBeamColor;
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        float z = vUv.y;
        float radial = abs(vUv.x - 0.5) * 2.0;

        float wave = sin(z * 40.0 - uTime * 25.0 + radial * 6.0) * 0.5 + 0.5;
        float stream = pow(1.0 - clamp(radial, 0.0, 1.0), 3.0);
        float falloff = (1.0 - z * 0.75);

        float intensity = stream * (0.6 + 0.4 * wave) * falloff;
        vec3 color = uBeamColor * intensity * 3.0;

        // Core central beam blinding white
        color += vec3(1.0, 1.0, 1.0) * pow(1.0 - clamp(radial, 0.0, 1.0), 6.0) * falloff * 2.5;

        gl_FragColor = vec4(color, clamp(intensity * 1.8, 0.0, 1.0));
      }
      },

  // Pulsar Swirling Relativistic Accretion Disk
  AccretionDisk: {
    uniforms: {
      uTime: { value: 0 },
      uInnerRadius: { value: 0.8 },
      uOuterRadius: { value: 4.8 }
    },
    vertexShader:       varying vec3 vLocalPos;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vLocalPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    \,
    fragmentShader:       uniform float uTime;
      uniform float uInnerRadius;
      uniform float uOuterRadius;
      varying vec3 vLocalPos;
      varying vec2 vUv;

      void main() {
        float r = length(vLocalPos.xy);
        if (r < uInnerRadius || r > uOuterRadius) discard;

        float angle = atan(vLocalPos.y, vLocalPos.x);
        float speed = 14.0 / (r * 0.75);
        float swirl = angle + uTime * speed;
        
        float arms = sin(swirl * 3.0 + r * 6.0) * 0.5 + 0.5;
        float density = smoothstep(uInnerRadius, uInnerRadius + 0.4, r) * (1.0 - smoothstep(uOuterRadius - 1.2, uOuterRadius, r));

        float doppler = 0.8 + 0.45 * cos(angle);

        vec3 hotPlasma = vec3(0.4, 0.8, 1.0);
        vec3 ultraHot = vec3(1.0, 0.95, 0.9);
        vec3 outerGas = vec3(0.9, 0.25, 0.75);

        float t = (r - uInnerRadius) / (uOuterRadius - uInnerRadius);
        vec3 col = mix(ultraHot, hotPlasma, smoothstep(0.0, 0.3, t));
        col = mix(col, outerGas, smoothstep(0.3, 1.0, t));

        float alpha = density * (0.35 + 0.65 * arms) * doppler;
        gl_FragColor = vec4(col * (1.6 + arms), clamp(alpha, 0.0, 0.92));
      }
      }
};
