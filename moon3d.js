/* ==========================================================================
   LUNAR BREATHING CHAMBER — 3D MOON (WebGL / Three.js)
   ==========================================================================
   Self-contained, additive module. Does not read from or write to app.js —
   it only watches the `data-phase` attribute that app.js already sets on
   `.canvas-panel`, and reads/writes its own DOM (#moon-3d-canvas).

   Behaviour:
   - Renders a real sphere (not a flat gradient) with procedurally generated
     craters/maria as texture + bump map, lit by actual directional lights.
     Shading, the day/night terminator, and the rim highlight all come from
     real geometry + lighting, so they stay correct as the moon rotates.
   - Drag (mouse) or swipe (touch) rotates the moon freely left/right and
     within a tasteful tilt range up/down, with inertia after release and a
     very slow ambient idle rotation when untouched.
   - Listens for the existing breathing phase (`data-phase="inhale|hold|
     exhale|idle|transition"` on the nearest `.canvas-panel`) and eases
     light intensity + rim glow to match — no polling, no timers duplicated
     from app.js.
   - If Three.js failed to load or WebGL is unavailable, this script simply
     does nothing and the existing flat CSS moon (already in styles.css)
     remains visible exactly as before. Nothing is ever left broken.
   ========================================================================== */

(function () {
  'use strict';

  function init() {
    var canvas = document.getElementById('moon-3d-canvas');
    var container = document.querySelector('.energy-orb-container.moon-container');
    var panel = document.querySelector('.canvas-panel');
    if (!canvas || !container || !panel) return;
    if (typeof THREE === 'undefined') return; // CDN blocked/offline — CSS fallback stands.

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch (e) {
      return; // No WebGL support — CSS fallback stands.
    }
    if (!renderer) return;

    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- Scene setup ----------------------------------------------------
    var scene = new THREE.Scene();
    // Wider FOV + slightly closer distance than before: this opens up how
    // much surrounding space is visible inside the same circular frame —
    // more like looking at a small orbiting model than through a keyhole —
    // and gives Earth much more room to travel before leaving view.
    var camera = new THREE.PerspectiveCamera(46, 1, 0.1, 20);
    camera.position.set(0, 0, 3.6);

    // orbitGroup is what drag/inertia/idle-spin actually rotates — it holds
    // both the moon (near the pivot, so it stays visually centered) and
    // Earth (offset behind it), so dragging feels like orbiting the camera
    // around a small moon–Earth system rather than just spinning the moon.
    var orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    var moonGroup = new THREE.Group();
    orbitGroup.add(moonGroup);

    var textures = buildMoonTextures();
    var moonMat = new THREE.MeshStandardMaterial({
      map: textures.albedo,
      bumpMap: textures.bump,
      bumpScale: 0.034,
      roughness: 0.88,
      metalness: 0.04,
      // Small emissive lift = the moon reads slightly brighter/higher-contrast
      // without blowing out highlights or needing brighter scene lights
      // (which would also brighten Earth).
      emissive: new THREE.Color(0x151b26),
      emissiveIntensity: 1.0
    });
    var moonMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), moonMat);
    moonGroup.add(moonMesh);

    // Thin fresnel-style atmosphere shell for the blue rim light.
    var rimMat = new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color(0x8fc4ff) }, intensity: { value: 0.68 } },
      vertexShader:
        'varying float vFresnel;' +
        'void main() {' +
        '  vec3 vNormal = normalize(normalMatrix * normal);' +
        '  vec3 vViewDir = normalize(-(modelViewMatrix * vec4(position,1.0)).xyz);' +
        '  vFresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.6);' +
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);' +
        '}',
      fragmentShader:
        'uniform vec3 glowColor; uniform float intensity; varying float vFresnel;' +
        'void main() { gl_FragColor = vec4(glowColor, vFresnel * intensity); }',
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    var rimMesh = new THREE.Mesh(new THREE.SphereGeometry(1.045, 48, 48), rimMat);
    moonGroup.add(rimMesh);

    // ---- Earth, orbiting into view behind the moon -----------------------
    // Sits behind the moon at rest (hidden/occluded); as orbitGroup turns,
    // Earth swings around the shared pivot and emerges from behind the
    // moon's limb, then passes to the side, then back behind on the far
    // side — a continuous, natural-feeling orbit rather than a scripted
    // reveal at one fixed angle.
    var earthGroup = new THREE.Group();
    earthGroup.position.set(0, -0.22, -2.5);
    orbitGroup.add(earthGroup);

    var earthTex = buildEarthTexture();
    var earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      // Light gray-blue tint multiplies against the map, pulling down the
      // ocean/continent saturation a notch so Earth stays a supporting
      // background body rather than pulling focus from the moon.
      color: new THREE.Color(0xcfd6de),
      roughness: 0.8,
      metalness: 0.05
    });
    var earthMesh = new THREE.Mesh(new THREE.SphereGeometry(0.62, 48, 48), earthMat);
    earthGroup.add(earthMesh);

    var earthRimMat = new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color(0xbfe3ff) }, intensity: { value: 0.55 } },
      vertexShader: rimMat.vertexShader,
      fragmentShader: rimMat.fragmentShader,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    var earthRimMesh = new THREE.Mesh(new THREE.SphereGeometry(0.645, 40, 40), earthRimMat);
    earthGroup.add(earthRimMesh);

    // Earth turns slowly on its own axis too, independent of the orbit drag.
    // Kept to ~40% of its original speed so it reads as a slow, ambient
    // background body rather than competing with the moon for attention.
    var earthSpin = reducedMotion ? 0 : 0.00044;

    // ---- Orbit ring (real geometry, not a flat overlay) -------------------
    // Lives inside orbitGroup so it turns with the moon/Earth system on
    // drag. Because it's an actual mesh in the depth buffer, Earth and the
    // moon occlude it correctly as they pass in front of/behind it — this
    // replaces the old flat CSS frame's guesswork with real 3D depth.
    // Kept thin and low-glow on purpose so it reads as a quiet halo, not a
    // thick metallic Saturn-style band.
    var ringGroup = new THREE.Group();
    orbitGroup.add(ringGroup);

    var ringMat = new THREE.MeshStandardMaterial({
      color: 0x9fd0ff,
      emissive: 0x5f89b8,
      emissiveIntensity: 0.5,
      roughness: 0.5,
      metalness: 0.2,
      transparent: true,
      opacity: 0.55
    });
    var orbitRing = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.006, 12, 128), ringMat);
    orbitRing.rotation.x = Math.PI / 2.15; // slight tilt, not a flat Saturn disc
    ringGroup.add(orbitRing);

    // Very soft outer glow — low intensity, no depth write so it never
    // fights the crisp occlusion of the core ring line above.
    var orbitGlowMat = new THREE.MeshBasicMaterial({
      color: 0x8fc4ff, transparent: true, opacity: 0.12,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    var orbitGlow = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.022, 12, 128), orbitGlowMat);
    orbitGlow.rotation.copy(orbitRing.rotation);
    ringGroup.add(orbitGlow);

    // ---- Lighting ---------------------------------------------------------
    var ambient = new THREE.AmbientLight(0x2a3550, 0.8);
    scene.add(ambient);

    var keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
    keyLight.position.set(-1.3, 1.05, 1.7);
    scene.add(keyLight);

    var blueLight = new THREE.DirectionalLight(0x93c5fd, 0.55);
    blueLight.position.set(1.6, -0.25, -0.7);
    scene.add(blueLight);

    // ---- Phase sync (reads data-phase, no writes back to app state) -----
    var phaseTargets = {
      inhale:     { key: 1.42, blue: 0.85, rim: 0.85, scale: 1.0, ring: 1.045, ringGlow: 0.16 },
      hold:       { key: 1.18, blue: 0.62, rim: 0.62, scale: 1.0, ring: 1.045, ringGlow: 0.14 },
      exhale:     { key: 0.92, blue: 0.35, rim: 0.35, scale: 1.0, ring: 0.985, ringGlow: 0.08 },
      idle:       { key: 1.0,  blue: 0.45, rim: 0.45, scale: 1.0, ring: 1.0,   ringGlow: 0.12 },
      transition: { key: 1.05, blue: 0.5,  rim: 0.5,  scale: 1.0, ring: 1.01,  ringGlow: 0.12 }
    };
    var current = { key: 1.0, blue: 0.45, rim: 0.45, ring: 1.0, ringGlow: 0.12 };

    function readPhase() {
      var p = panel.getAttribute('data-phase');
      return phaseTargets[p] ? p : 'idle';
    }

    // ---- Pointer drag / inertia / idle auto-rotate -----------------------
    // Start already turned partway out — Earth is meant to read as "there,
    // in the background" even before anyone touches the moon, not hidden
    // until interaction. Dragging still swings it further around/behind.
    var rotY = 0.62, rotX = 0.1;               // current rotation (radians)
    var velY = 0, velX = 0;                    // drag inertia
    var dragging = false, lastX = 0, lastY = 0;
    var idleSpin = reducedMotion ? 0 : 0.0009;  // very slow ambient rotation
    var settleTimer = null;
    var autoResumeDelayMs = 2600;
    var autoRotateAllowed = true;

    function onPointerDown(e) {
      dragging = true;
      autoRotateAllowed = false;
      canvas.style.cursor = 'grabbing';
      lastX = e.clientX; lastY = e.clientY;
      velX = 0; velY = 0;
      if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (err) {} }
      if (settleTimer) { clearTimeout(settleTimer); settleTimer = null; }
    }
    function onPointerMove(e) {
      if (!dragging) return;
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      var sens = 0.006;
      rotY += dx * sens;
      rotX = clamp(rotX + dy * sens, -0.62, 0.62);
      velY = dx * sens; velX = dy * sens;
    }
    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      canvas.style.cursor = 'grab';
      settleTimer = setTimeout(function () { autoRotateAllowed = true; }, autoResumeDelayMs);
    }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    canvas.style.touchAction = 'none';
    canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // ---- Sizing ------------------------------------------------------------
    function resize() {
      var rect = container.getBoundingClientRect();
      var size = Math.max(1, Math.round(rect.width));
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(size, size, false);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    }
    if (window.ResizeObserver) {
      new ResizeObserver(resize).observe(container);
    } else {
      window.addEventListener('resize', resize);
    }
    resize();

    // ---- Render loop --------------------------------------------------------
    var running = true;
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running) requestAnimationFrame(tick);
    });

    function tick() {
      if (!running) return;
      requestAnimationFrame(tick);

      var phase = readPhase();
      var target = phaseTargets[phase];
      var ease = 0.045;
      current.key  += (target.key  - current.key)  * ease;
      current.blue += (target.blue - current.blue) * ease;
      current.rim  += (target.rim  - current.rim)  * ease;
      keyLight.intensity = current.key;
      blueLight.intensity = current.blue;
      // Moon rim runs a bit hotter than the shared phase target (keeps the
      // moon the clear visual focus); Earth's rim is pulled back so it
      // never competes with the moon for attention.
      rimMat.uniforms.intensity.value = current.rim * 1.2;
      earthRimMat.uniforms.intensity.value = current.rim * 0.58;

      // Orbit ring gently expands on inhale, holds, contracts on exhale —
      // smooth easing, same rhythm as the light targets above, so it never
      // reads as a separate/competing animation.
      current.ring += (target.ring - current.ring) * ease;
      current.ringGlow += (target.ringGlow - current.ringGlow) * ease;
      ringGroup.scale.setScalar(current.ring);
      orbitGlowMat.opacity = current.ringGlow;
      ringGroup.rotation.z += 0.00025;

      if (dragging) {
        // rotation already updated in onPointerMove
      } else if (Math.abs(velX) > 0.00005 || Math.abs(velY) > 0.00005) {
        rotY += velY;
        rotX = clamp(rotX + velX, -0.62, 0.62);
        velY *= 0.93;
        velX *= 0.93;
      } else if (autoRotateAllowed) {
        rotY += idleSpin;
      }
      // orbitGroup carries the whole moon+Earth system — this is what makes
      // dragging feel like orbiting the camera around them, swinging Earth
      // into and out of view from behind the moon.
      orbitGroup.rotation.y = rotY;
      orbitGroup.rotation.x = rotX;
      // Each body also turns slowly on its own axis, independent of the
      // drag — keeps things feeling alive even mid-drag or at rest.
      moonMesh.rotation.y += 0.00035;
      earthMesh.rotation.y += earthSpin;

      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);

    // ---- Hand off from the flat CSS moon to this 3D one --------------------
    container.classList.add('moon-3d-active');
  }

  // Procedurally paint an equirectangular moon albedo + bump texture.
  // Base albedo is a neutral mid-tone (no baked directional light — real
  // shading comes from the scene's lights so it stays correct as the
  // sphere rotates). Small crater rims carry their own tiny fixed-direction
  // relief shading, same as real lunar texture maps use.
  function buildMoonTextures() {
    var W = 1024, H = 512;
    var albedoCv = document.createElement('canvas'); albedoCv.width = W; albedoCv.height = H;
    var bumpCv = document.createElement('canvas'); bumpCv.width = W; bumpCv.height = H;
    var a = albedoCv.getContext('2d');
    var b = bumpCv.getContext('2d');

    a.fillStyle = '#9aa7b8'; a.fillRect(0, 0, W, H);
    b.fillStyle = '#8a8a8a'; b.fillRect(0, 0, W, H);

    var rng = mulberry32(20260823);

    function wrapDraw(x, y, drawFn) {
      drawFn(x, y);
      if (x < 120) drawFn(x + W, y);
      if (x > W - 120) drawFn(x - W, y);
    }

    // Maria — soft dark plains
    for (var m = 0; m < 5; m++) {
      var mx = rng() * W, my = H * 0.18 + rng() * H * 0.64, mr = 55 + rng() * 70;
      wrapDraw(mx, my, function (x, y) {
        var g = a.createRadialGradient(x, y, 0, x, y, mr);
        g.addColorStop(0, 'rgba(45,58,80,0.40)');
        g.addColorStop(1, 'rgba(45,58,80,0)');
        a.fillStyle = g; a.beginPath(); a.ellipse(x, y, mr * 1.15, mr * 0.85, rng() * Math.PI, 0, Math.PI * 2); a.fill();
        var gb = b.createRadialGradient(x, y, 0, x, y, mr);
        gb.addColorStop(0, 'rgba(90,90,90,0.5)');
        gb.addColorStop(1, 'rgba(90,90,90,0)');
        b.fillStyle = gb; b.beginPath(); b.ellipse(x, y, mr * 1.15, mr * 0.85, 0, 0, Math.PI * 2); b.fill();
      });
    }

    // Craters — small relief circles with a thin bright rim + dark interior
    for (var c = 0; c < 26; c++) {
      var cx = rng() * W, cy = H * 0.12 + rng() * H * 0.76, cr = 6 + rng() * 22;
      wrapDraw(cx, cy, function (x, y) {
        a.beginPath(); a.arc(x, y, cr, 0, Math.PI * 2);
        a.fillStyle = 'rgba(20,26,38,' + (0.28 + rng() * 0.18) + ')'; a.fill();
        a.beginPath(); a.arc(x - cr * 0.22, y - cr * 0.22, cr * 0.92, 0, Math.PI * 2);
        a.strokeStyle = 'rgba(230,238,250,0.35)'; a.lineWidth = Math.max(0.6, cr * 0.08); a.stroke();

        b.beginPath(); b.arc(x, y, cr, 0, Math.PI * 2);
        b.fillStyle = 'rgba(40,40,40,0.8)'; b.fill();
        b.beginPath(); b.arc(x - cr * 0.22, y - cr * 0.22, cr * 0.95, 0, Math.PI * 2);
        b.strokeStyle = 'rgba(225,225,225,0.9)'; b.lineWidth = Math.max(0.8, cr * 0.16); b.stroke();
      });
    }

    // Fine regolith speckle
    for (var s = 0; s < 900; s++) {
      var sx = rng() * W, sy = rng() * H, sr = rng() * 1.1;
      a.fillStyle = rng() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(10,14,24,0.06)';
      a.beginPath(); a.arc(sx, sy, sr, 0, Math.PI * 2); a.fill();
    }

    var albedo = new THREE.CanvasTexture(albedoCv);
    var bump = new THREE.CanvasTexture(bumpCv);
    albedo.wrapS = bump.wrapS = THREE.RepeatWrapping;
    albedo.anisotropy = 4;
    return { albedo: albedo, bump: bump };
  }

  // Small, stylized Earth texture — ocean base, soft continent shapes,
  // light cloud wisps. Kept simple/soft on purpose: Earth is a supporting
  // background element, the moon stays the primary visual focus.
  function buildEarthTexture() {
    var W = 512, H = 256;
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d');
    var rng = mulberry32(7391);

    var ocean = ctx.createLinearGradient(0, 0, 0, H);
    ocean.addColorStop(0, '#2668a3');
    ocean.addColorStop(0.5, '#2f7cad');
    ocean.addColorStop(1, '#1d5286');
    ctx.fillStyle = ocean; ctx.fillRect(0, 0, W, H);

    function wrapDraw(x, y, drawFn) {
      drawFn(x, y);
      if (x < 90) drawFn(x + W, y);
      if (x > W - 90) drawFn(x - W, y);
    }

    // Continents — soft irregular green/tan blobs made of overlapping circles
    var continentSeeds = 6;
    for (var i = 0; i < continentSeeds; i++) {
      var cx = rng() * W, cy = H * 0.22 + rng() * H * 0.56;
      var blobs = 5 + Math.floor(rng() * 5);
      var tone = rng() > 0.4 ? 'rgba(92,140,76,0.85)' : 'rgba(148,132,90,0.85)';
      wrapDraw(cx, cy, function (x, y) {
        for (var j = 0; j < blobs; j++) {
          var ox = x + (rng() - 0.5) * 70, oy = y + (rng() - 0.5) * 40;
          var r = 14 + rng() * 26;
          ctx.fillStyle = tone;
          ctx.beginPath(); ctx.arc(ox, oy, r, 0, Math.PI * 2); ctx.fill();
        }
      });
    }

    // Clouds — soft white wisps over the top
    for (var c = 0; c < 20; c++) {
      var wx = rng() * W, wy = rng() * H, wr = 18 + rng() * 34;
      ctx.fillStyle = 'rgba(255,255,255,' + (0.08 + rng() * 0.1) + ')';
      ctx.beginPath();
      ctx.ellipse(wx, wy, wr, wr * 0.4, rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    var tex = new THREE.CanvasTexture(cv);
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  }

  // Deterministic small PRNG so the crater layout is stable across reloads.
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
