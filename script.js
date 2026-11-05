const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reveal sections as they enter the viewport.
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

// Custom cursor on pointer devices.
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
if (window.matchMedia('(pointer:fine)').matches && dot && ring) {
  window.addEventListener('mousemove', (event) => {
    dot.style.left = `${event.clientX}px`;
    dot.style.top = `${event.clientY}px`;
    ring.style.left = `${event.clientX}px`;
    ring.style.top = `${event.clientY}px`;
  });
  document.querySelectorAll('a, button').forEach((element) => {
    element.addEventListener('mouseenter', () => ring.classList.add('hover'));
    element.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
}

// Mobile navigation.
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});
nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

// Gentle pointer parallax for the hero radar.
const heroArt = document.querySelector('.hero-art');
if (heroArt && window.matchMedia('(pointer:fine)').matches && !reducedMotion) {
  document.querySelector('.hero')?.addEventListener('mousemove', (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    heroArt.style.transform = `translate(${x * -12}px, ${y * -10}px)`;
  });
  document.querySelector('.hero')?.addEventListener('mouseleave', () => {
    heroArt.style.transform = '';
  });
}


// -------------------------------------------------------------
// Interactive ESP Overlay Simulator Engine
// -------------------------------------------------------------
const espCanvas = document.getElementById('esp-canvas');
if (espCanvas) {
  const ctx = espCanvas.getContext('2d');

  let simSettings = {
    box: true,
    skeleton: true,
    health: true,
    snaplines: true,
    info: true,
    headDot: true,
    aimbot: true,
    aimline: true,
    distance: 18,
    theme: 'neon'
  };

  let simEntities = [
    { id: 1, x: 0.48, y: 0.44, health: 84, name: 'Enemy_Terrorist_1', weapon: 'AK-47', team: 'T' },
    { id: 2, x: 0.76, y: 0.54, health: 42, name: 'Enemy_Terrorist_2', weapon: 'AWP', team: 'T' }
  ];

  const bindCheck = (id, prop) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', (e) => {
        simSettings[prop] = e.target.checked;
      });
    }
  };

  bindCheck('toggle-box', 'box');
  bindCheck('toggle-skeleton', 'skeleton');
  bindCheck('toggle-health', 'health');
  bindCheck('toggle-snaplines', 'snaplines');
  bindCheck('toggle-info', 'info');
  bindCheck('toggle-head', 'headDot');
  bindCheck('toggle-aimbot', 'aimbot');
  bindCheck('toggle-aimline', 'aimline');

  const themeSelect = document.getElementById('color-theme-select');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      simSettings.theme = e.target.value;
    });
  }

  const distSlider = document.getElementById('distance-slider');
  const distVal = document.getElementById('distance-val');
  if (distSlider) {
    distSlider.addEventListener('input', (e) => {
      simSettings.distance = parseInt(e.target.value, 10);
      if (distVal) distVal.innerText = `${simSettings.distance} Meters`;
    });
  }

  const btnSpawn = document.getElementById('btn-spawn-target');
  if (btnSpawn) {
    btnSpawn.addEventListener('click', () => {
      if (simEntities.length < 5) {
        const weapons = ['M4A1-S', 'Desert Eagle', 'Glock-18', 'AK-47', 'SSG 08'];
        simEntities.push({
          id: Date.now(),
          x: Math.random() * 0.6 + 0.2,
          y: Math.random() * 0.35 + 0.35,
          health: Math.floor(Math.random() * 70) + 30,
          name: `Bot_Entity_${simEntities.length + 1}`,
          weapon: weapons[Math.floor(Math.random() * weapons.length)],
          team: 'T'
        });
      }
    });
  }

  const btnClear = document.getElementById('btn-clear-target');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      simEntities = [
        { id: 1, x: 0.48, y: 0.44, health: 84, name: 'Enemy_Terrorist_1', weapon: 'AK-47', team: 'T' },
        { id: 2, x: 0.76, y: 0.54, health: 42, name: 'Enemy_Terrorist_2', weapon: 'AWP', team: 'T' }
      ];
    });
  }

  // Click on canvas to move primary entity
  espCanvas.addEventListener('click', (e) => {
    const rect = espCanvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / espCanvas.width;
    const clickY = (e.clientY - rect.top) / espCanvas.height;
    if (simEntities.length > 0) {
      simEntities[0].x = Math.max(0.1, Math.min(0.9, clickX));
      simEntities[0].y = Math.max(0.15, Math.min(0.85, clickY));
    }
  });

  function resizeEsp() {
    const parent = espCanvas.parentElement;
    if (parent) {
      const dpr = window.devicePixelRatio || 1;
      espCanvas.width = parent.clientWidth * dpr;
      espCanvas.height = parent.clientHeight * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    }
  }
  window.addEventListener('resize', resizeEsp);
  resizeEsp();

  function getThemeColors() {
    if (simSettings.theme === 'acid') {
      return { primary: '#d4ff3f', secondary: '#f0f0e9', line: 'rgba(212, 255, 63, 0.4)' };
    } else if (simSettings.theme === 'classic') {
      return { primary: '#ffaa00', secondary: '#ffffff', line: 'rgba(255, 170, 0, 0.4)' };
    } else if (simSettings.theme === 'violet') {
      return { primary: '#a855f7', secondary: '#00ccff', line: 'rgba(168, 85, 247, 0.4)' };
    }
    // 'neon' default matching screenshot
    return { primary: '#ff0055', secondary: '#00ffcc', line: 'rgba(255, 0, 85, 0.4)' };
  }

  function renderSimLoop() {
    const dpr = window.devicePixelRatio || 1;
    const canvasW = espCanvas.width / dpr;
    const canvasH = espCanvas.height / dpr;

    ctx.clearRect(0, 0, canvasW, canvasH);

    // Subtle background grid inside viewport
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;
    const step = 32;
    for (let x = 0; x < canvasW; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasH);
      ctx.stroke();
    }
    for (let y = 0; y < canvasH; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasW, y);
      ctx.stroke();
    }

    // Center Crosshair
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvasW / 2 - 9, canvasH / 2);
    ctx.lineTo(canvasW / 2 + 9, canvasH / 2);
    ctx.moveTo(canvasW / 2, canvasH / 2 - 9);
    ctx.lineTo(canvasW / 2, canvasH / 2 + 9);
    ctx.stroke();

    const colors = getThemeColors();

    // VOLD LINE Aimbot FOV Circle (Radial display matching software)
    if (simSettings.aimbot) {
      const fovRadius = 85;
      ctx.save();
      ctx.strokeStyle = 'rgba(212, 255, 63, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(canvasW / 2, canvasH / 2, fovRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // VOLD LINE Target Aim Snapline to closest enemy
    if (simSettings.aimline && simEntities.length > 0) {
      const targetEnt = simEntities[0];
      const targetScale = Math.max(0.4, 30 / simSettings.distance);
      const targetHeadY = (targetEnt.y * canvasH) - (175 * targetScale) / 2 + (20 * targetScale);
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 91, 73, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(canvasW / 2, canvasH / 2);
      ctx.lineTo(targetEnt.x * canvasW, targetHeadY);
      ctx.stroke();

      // Mini target reticle marker
      ctx.strokeStyle = '#d4ff3f';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(targetEnt.x * canvasW, targetHeadY, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    simEntities.forEach((ent) => {
      const centerX = ent.x * canvasW;
      const centerY = ent.y * canvasH;

      const scale = Math.max(0.4, 30 / simSettings.distance);
      const boxW = 88 * scale;
      const boxH = 175 * scale;
      const boxX = centerX - boxW / 2;
      const boxY = centerY - boxH / 2;

      // 1. Snaplines (from bottom center)
      if (simSettings.snaplines) {
        ctx.strokeStyle = colors.line;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(canvasW / 2, canvasH);
        ctx.lineTo(centerX, boxY + boxH);
        ctx.stroke();
      }

      // 2. Bounding Box
      if (simSettings.box) {
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 1.8;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Corner accents matching tactical preview
        const cornerLen = Math.min(10, 8 * scale);
        ctx.strokeStyle = colors.secondary;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(boxX, boxY + cornerLen);
        ctx.lineTo(boxX, boxY);
        ctx.lineTo(boxX + cornerLen, boxY);
        ctx.stroke();
      }

      // 3. Bone Skeleton
      if (simSettings.skeleton) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.4;

        const headY = boxY + (20 * scale);
        const neckY = boxY + (34 * scale);
        const pelvisY = boxY + (102 * scale);
        const footY = boxY + boxH;

        ctx.beginPath();
        // Spine
        ctx.moveTo(centerX, headY);
        ctx.lineTo(centerX, pelvisY);
        // Arms
        ctx.moveTo(centerX - (20 * scale), neckY + (4 * scale));
        ctx.lineTo(centerX + (20 * scale), neckY + (4 * scale));
        ctx.lineTo(centerX + (28 * scale), pelvisY);
        ctx.moveTo(centerX - (20 * scale), neckY + (4 * scale));
        ctx.lineTo(centerX - (28 * scale), pelvisY);
        // Legs
        ctx.moveTo(centerX, pelvisY);
        ctx.lineTo(centerX - (18 * scale), footY);
        ctx.moveTo(centerX, pelvisY);
        ctx.lineTo(centerX + (18 * scale), footY);
        ctx.stroke();
      }

      // 4. Head Hitbox Circle
      if (simSettings.headDot) {
        const headY = boxY + (20 * scale);
        ctx.fillStyle = colors.primary;
        ctx.beginPath();
        ctx.arc(centerX, headY, Math.max(3, 7 * scale), 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Health Bar
      if (simSettings.health) {
        const barWidth = 3.5;
        const barX = boxX - 7;
        const healthPct = ent.health / 100;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(barX, boxY, barWidth, boxH);

        ctx.fillStyle = ent.health > 50 ? '#10b981' : (ent.health > 25 ? '#eab308' : '#ef4444');
        ctx.fillRect(barX, boxY + (boxH * (1 - healthPct)), barWidth, boxH * healthPct);
      }

      // 6. Distance & Weapon Tags
      if (simSettings.info) {
        ctx.font = '10px "DM Mono", monospace';
        ctx.fillStyle = '#f0f0e9';
        ctx.fillText(ent.name, boxX, boxY - 6);

        ctx.fillStyle = colors.secondary;
        ctx.fillText(`${ent.weapon} | ${simSettings.distance}m`, boxX, boxY + boxH + 13);
      }
    });

    requestAnimationFrame(renderSimLoop);
  }

  renderSimLoop();
}


// -------------------------------------------------------------
// 3D CS2 Tactical Isometric Map Engine (Dust II)
// -------------------------------------------------------------
(function initDust2IsometricMap() {
  const canvas = document.getElementById('map-3d-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const labelsContainer = document.getElementById('map-html-labels');

  // Interactive isometric camera orientation
  let yaw = Math.PI / 4;       // 45 deg default isometric
  let pitch = Math.atan(0.5);  // ~26.5 deg standard isometric tilt
  let zoom = 1.0;
  let targetYaw = yaw;
  let targetPitch = pitch;

  // Blips matching the screenshot:
  // Green/Acid blips (CT/Allies) and Amber blips (Terrorist/Targets)
  let blips = [
    { id: 'b_site', label: 'B-SITE', x: -50, y: -70, z: 20, color: 'acid', coneH: 38 },
    { id: 'catwalk', label: 'CATWALK', x: -25, y: -25, z: 26, color: 'amber', coneH: 34 },
    { id: 'mid', label: 'MID', x: 0, y: 0, z: 5, color: 'amber', coneH: 42 },
    { id: 'a_04', label: 'A / 04', x: 20, y: -85, z: 28, color: 'acid', coneH: 35 },
    { id: 'b_10', label: 'B / 10', x: 65, y: -30, z: 32, color: 'amber', coneH: 48 },
    { id: 'a_site', label: 'A-SITE', x: 80, y: 35, z: 16, color: 'acid', coneH: 35 },
    { id: 'b_11', label: 'B / 11', x: 92, y: 0, z: 20, color: 'acid', coneH: 30 },
    { id: 'c_02', label: 'C / 02', x: 30, y: 70, z: 0, color: 'acid', coneH: 30 },
    { id: 'd_08', label: 'D / 08', x: -25, y: 55, z: 15, color: 'amber', coneH: 35 },
    { id: 'e_04', label: 'E / 04', x: -65, y: 40, z: 0, color: 'acid', coneH: 32 },
    { id: 'x_04', label: 'X / 04', x: -95, y: 0, z: 0, color: 'acid', coneH: 26 }
  ];

  // CS2 Dust II Buildings & Blocks Layout in 3D Space
  const structures = [
    // Ground Base Platform (Grid slab)
    { x: -110, y: -110, z: -10, w: 220, d: 220, h: 10, type: 'slab', fill: 'rgba(21, 26, 17, 0.75)', border: 'rgba(212, 255, 63, 0.4)' },
    // Center VL Plinth
    { x: -18, y: -18, z: 0, w: 36, d: 36, h: 14, type: 'vl_box', fill: 'rgba(28, 34, 22, 0.95)', border: 'rgba(212, 255, 63, 0.65)' },
    // B-Site Elevated Platform & Raised Site
    { x: -80, y: -95, z: 0, w: 55, d: 50, h: 16, type: 'box', fill: 'rgba(24, 30, 20, 0.85)', border: 'rgba(212, 255, 63, 0.35)' },
    { x: -68, y: -82, z: 16, w: 32, d: 26, h: 6, type: 'glow_pad', fill: 'rgba(212, 255, 63, 0.25)', border: 'rgba(212, 255, 63, 0.8)' },
    // B Upper Tunnels / Back Wall
    { x: -108, y: -108, z: 0, w: 22, d: 80, h: 48, type: 'box', fill: 'rgba(18, 22, 16, 0.85)', border: 'rgba(212, 255, 63, 0.25)' },
    // Catwalk elevated ramp & Mid Left Walls
    { x: -45, y: -45, z: 0, w: 18, d: 45, h: 22, type: 'box', fill: 'rgba(22, 27, 18, 0.85)', border: 'rgba(212, 255, 63, 0.3)' },
    { x: -75, y: -10, z: 0, w: 28, d: 28, h: 26, type: 'box', fill: 'rgba(20, 25, 17, 0.85)', border: 'rgba(212, 255, 63, 0.3)' },
    // Mid Doors & Middle Arch
    { x: 10, y: -38, z: 0, w: 26, d: 22, h: 44, type: 'box_arch', fill: 'rgba(24, 30, 20, 0.85)', border: 'rgba(212, 255, 63, 0.35)' },
    // Mid Doors / Xbox Block
    { x: -5, y: -2, z: 0, w: 14, d: 14, h: 14, type: 'box', fill: 'rgba(26, 32, 22, 0.85)', border: 'rgba(212, 255, 63, 0.4)' },
    // CT Spawn to Short High Wall
    { x: 38, y: -75, z: 0, w: 24, d: 52, h: 65, type: 'box', fill: 'rgba(19, 24, 16, 0.9)', border: 'rgba(212, 255, 63, 0.35)' },
    // A Short & A Site Elevated Platform
    { x: 60, y: 15, z: 0, w: 45, d: 42, h: 12, type: 'box', fill: 'rgba(24, 30, 20, 0.85)', border: 'rgba(212, 255, 63, 0.35)' },
    { x: 70, y: 24, z: 12, w: 25, d: 24, h: 5, type: 'glow_pad', fill: 'rgba(212, 255, 63, 0.25)', border: 'rgba(212, 255, 63, 0.8)' },
    // A Long Massive Corner Block
    { x: 72, y: -45, z: 0, w: 36, d: 38, h: 46, type: 'box', fill: 'rgba(20, 25, 17, 0.85)', border: 'rgba(212, 255, 63, 0.3)' },
    // Lower T / Outer Mid Blocks
    { x: -48, y: 35, z: 0, w: 32, d: 18, h: 24, type: 'box', fill: 'rgba(22, 27, 18, 0.85)', border: 'rgba(212, 255, 63, 0.3)' },
    { x: -70, y: 55, z: 0, w: 28, d: 24, h: 22, type: 'box', fill: 'rgba(20, 25, 17, 0.85)', border: 'rgba(212, 255, 63, 0.3)' },
    // T Spawn Corridor / Low Boxes
    { x: -10, y: 62, z: 0, w: 24, d: 32, h: 20, type: 'box', fill: 'rgba(21, 26, 17, 0.85)', border: 'rgba(212, 255, 63, 0.3)' },
    { x: 25, y: 50, z: 0, w: 22, d: 38, h: 32, type: 'box', fill: 'rgba(21, 26, 17, 0.85)', border: 'rgba(212, 255, 63, 0.3)' }
  ];

  function project3D(x, y, z, originX, originY, scale) {
    // Rotate Yaw around Z
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const x1 = x * cosY - y * sinY;
    const y1 = x * sinY + y * cosY;
    const z1 = z;

    // Pitch tilt
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);
    const y2 = y1 * sinP - z1 * cosP;
    const z2 = y1 * cosP + z1 * sinP;

    return {
      x: originX + x1 * scale,
      y: originY + y2 * scale,
      depth: z2
    };
  }

  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = parent.clientWidth * dpr;
    canvas.height = parent.clientHeight * dpr;
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
  }
  window.addEventListener('resize', resize);
  resize();

  // Dragging & Interaction logic
  let isDragging = false;
  let dragBlip = null;
  let lastMouseX = 0;
  let lastMouseY = 0;

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const dpr = window.devicePixelRatio || 1;
    const cw = canvas.width / dpr;
    const ch = canvas.height / dpr;
    const originX = cw * 0.5;
    const originY = ch * 0.52;
    const scale = (cw / 330) * zoom;

    // Check if clicked close to a blip
    let found = null;
    blips.forEach((b) => {
      const p = project3D(b.x, b.y, b.z + b.coneH, originX, originY, scale);
      const dist = Math.hypot(p.x - mx, p.y - my);
      if (dist < 18) found = b;
    });

    if (found) {
      dragBlip = found;
    } else {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    }
  });

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Telemetry updates
    const coordX = document.getElementById('coord-x');
    const coordY = document.getElementById('coord-y');
    if (coordX && coordY && rect.width > 0) {
      coordX.innerText = (80 + (mx / rect.width) * 5).toFixed(2);
      coordY.innerText = (81 + (my / rect.height) * 4).toFixed(2);
    }

    if (dragBlip) {
      // Invert 2D click delta to 3D plane
      const dpr = window.devicePixelRatio || 1;
      const cw = canvas.width / dpr;
      const scale = (cw / 330) * zoom;
      const dx = (e.movementX || 0) / scale;
      const dy = (e.movementY || 0) / scale;
      const cosY = Math.cos(-yaw);
      const sinY = Math.sin(-yaw);
      dragBlip.x += (dx * cosY - dy * sinY) * 1.5;
      dragBlip.y += (dx * sinY + dy * cosY) * 1.5;
      return;
    }

    if (isDragging) {
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      targetYaw += dx * 0.008;
      targetPitch = Math.max(0.2, Math.min(1.1, targetPitch - dy * 0.006));
    }
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    dragBlip = null;
  });

  // Click on canvas to spawn or ping new blip
  canvas.addEventListener('click', (e) => {
    if (Math.hypot(e.movementX || 0, e.movementY || 0) > 3) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const dpr = window.devicePixelRatio || 1;
    const cw = canvas.width / dpr;
    const ch = canvas.height / dpr;
    const originX = cw * 0.5;
    const originY = ch * 0.52;
    const scale = (cw / 330) * zoom;

    // Estimate plane click (Z = 0)
    const cosY = Math.cos(-yaw);
    const sinY = Math.sin(-yaw);
    const sinP = Math.sin(pitch);
    const rawX = (mx - originX) / scale;
    const rawY = (my - originY) / (scale * sinP);

    const worldX = rawX * cosY - rawY * sinY;
    const worldY = rawX * sinY + rawY * cosY;

    if (Math.abs(worldX) < 100 && Math.abs(worldY) < 100 && blips.length < 15) {
      const isAmber = Math.random() > 0.5;
      const idCode = (Math.floor(Math.random() * 15) + 1).toString().padStart(2, '0');
      blips.push({
        id: `ping_${Date.now()}`,
        label: `${isAmber ? 'T' : 'CT'} / ${idCode}`,
        x: worldX,
        y: worldY,
        z: 0,
        color: isAmber ? 'amber' : 'acid',
        coneH: 34
      });
      const counterEl = document.getElementById('blip-count-num');
      if (counterEl) counterEl.innerText = blips.length;
    }
  });

  // Zoom control via scroll
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoom = Math.max(0.75, Math.min(1.4, zoom - e.deltaY * 0.001));
  }, { passive: false });

  // Update HTML Labels positioned in 3D
  function updateHtmlLabels(originX, originY, scale) {
    if (!labelsContainer) return;
    labelsContainer.innerHTML = '';

    blips.forEach((b) => {
      const topPt = project3D(b.x, b.y, b.z + b.coneH, originX, originY, scale);
      const labelDiv = document.createElement('div');
      labelDiv.className = `map-blip-label label-${b.color}`;
      labelDiv.style.left = `${topPt.x}px`;
      labelDiv.style.top = `${topPt.y - 4}px`;
      labelDiv.innerHTML = `<span class="map-blip-pin"></span><span>${b.label}</span>`;
      labelsContainer.appendChild(labelDiv);
    });
  }

  // Draw 3D Box Prism helper
  function drawPrism(box, originX, originY, scale) {
    const { x, y, z, w, d, h, fill, border, type } = box;

    // 8 vertices of cuboid
    const v = [
      project3D(x, y, z, originX, originY, scale),
      project3D(x + w, y, z, originX, originY, scale),
      project3D(x + w, y + d, z, originX, originY, scale),
      project3D(x, y + d, z, originX, originY, scale),
      project3D(x, y, z + h, originX, originY, scale),
      project3D(x + w, y, z + h, originX, originY, scale),
      project3D(x + w, y + d, z + h, originX, originY, scale),
      project3D(x, y + d, z + h, originX, originY, scale)
    ];

    ctx.lineWidth = 1;
    ctx.strokeStyle = border || 'rgba(212, 255, 63, 0.35)';
    ctx.fillStyle = fill || 'rgba(20, 25, 17, 0.85)';

    // Faces definition
    const faces = [
      // Bottom
      { pts: [v[0], v[1], v[2], v[3]], isTop: false },
      // South / North Sides
      { pts: [v[0], v[1], v[5], v[4]], isTop: false },
      { pts: [v[1], v[2], v[6], v[5]], isTop: false },
      { pts: [v[2], v[3], v[7], v[6]], isTop: false },
      { pts: [v[3], v[0], v[4], v[7]], isTop: false },
      // Top Face
      { pts: [v[4], v[5], v[6], v[7]], isTop: true }
    ];

    faces.forEach((f) => {
      ctx.beginPath();
      ctx.moveTo(f.pts[0].x, f.pts[0].y);
      for (let i = 1; i < f.pts.length; i++) {
        ctx.lineTo(f.pts[i].x, f.pts[i].y);
      }
      ctx.closePath();

      if (f.isTop) {
        ctx.fillStyle = type === 'glow_pad' ? 'rgba(212, 255, 63, 0.45)' : 'rgba(32, 39, 26, 0.9)';
      } else {
        ctx.fillStyle = fill;
      }
      ctx.fill();
      ctx.stroke();
    });

    // If VL box, render isometric text 'VL' on top face
    if (type === 'vl_box') {
      const topCenter = project3D(x + w / 2, y + d / 2, z + h, originX, originY, scale);
      ctx.save();
      ctx.fillStyle = '#d4ff3f';
      ctx.font = '700 13px "Barlow Condensed", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('VL', topCenter.x, topCenter.y);
      ctx.restore();
    }
  }

  // Draw Light Beacon Cone helper
  function drawBlipLight(b, originX, originY, scale, time) {
    const basePt = project3D(b.x, b.y, b.z, originX, originY, scale);
    const topPt = project3D(b.x, b.y, b.z + b.coneH, originX, originY, scale);

    const isAcid = b.color === 'acid';
    const mainColor = isAcid ? '#d4ff3f' : '#ffaa33';
    const gradColor = isAcid ? 'rgba(212, 255, 63, ' : 'rgba(255, 170, 51, ';

    // Ground ripple / contact circle
    const pulse = (Math.sin(time * 3 + b.x) + 1) * 0.5;
    const radiusX = (6 + pulse * 4) * (scale / 2);
    const radiusY = radiusX * 0.5;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(basePt.x, basePt.y, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `${gradColor}${0.35 + pulse * 0.35})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Semi-transparent illuminated inverted cone
    const coneW = (7 + pulse * 2) * (scale / 2);
    const coneGrad = ctx.createLinearGradient(topPt.x, topPt.y, basePt.x, basePt.y);
    coneGrad.addColorStop(0, `${gradColor}0.5)`);
    coneGrad.addColorStop(0.5, `${gradColor}0.18)`);
    coneGrad.addColorStop(1, `${gradColor}0.02)`);

    ctx.beginPath();
    ctx.moveTo(topPt.x, topPt.y);
    ctx.lineTo(basePt.x - coneW, basePt.y);
    ctx.lineTo(basePt.x + coneW, basePt.y);
    ctx.closePath();
    ctx.fillStyle = coneGrad;
    ctx.fill();

    // Central beacon line
    ctx.beginPath();
    ctx.moveTo(topPt.x, topPt.y);
    ctx.lineTo(basePt.x, basePt.y);
    ctx.strokeStyle = `${gradColor}0.75)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Floating glowing orb on top
    ctx.beginPath();
    ctx.arc(topPt.x, topPt.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = mainColor;
    ctx.shadowColor = mainColor;
    ctx.shadowBlur = 10;
    ctx.fill();

    // Concentric pulse ring
    ctx.beginPath();
    ctx.arc(topPt.x, topPt.y, 7 + pulse * 3, 0, Math.PI * 2);
    ctx.strokeStyle = `${gradColor}${0.7 - pulse * 0.4})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  let lastLabelUpdate = 0;

  // Main 3D Render Loop
  function render(time) {
    const t = time * 0.001;

    // Smooth inertia camera rotation
    yaw += (targetYaw - yaw) * 0.08;
    pitch += (targetPitch - pitch) * 0.08;

    const dpr = window.devicePixelRatio || 1;
    const cw = canvas.width / dpr;
    const ch = canvas.height / dpr;

    ctx.clearRect(0, 0, cw, ch);

    const originX = cw * 0.5;
    const originY = ch * 0.52;
    const scale = (cw / 330) * zoom;

    // 1. Draw Iso Ground Grid
    const gridSize = 110;
    const gridStep = 22;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(212, 255, 63, 0.12)';

    for (let x = -gridSize; x <= gridSize; x += gridStep) {
      const p1 = project3D(x, -gridSize, 0, originX, originY, scale);
      const p2 = project3D(x, gridSize, 0, originX, originY, scale);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    for (let y = -gridSize; y <= gridSize; y += gridStep) {
      const p1 = project3D(-gridSize, y, 0, originX, originY, scale);
      const p2 = project3D(gridSize, y, 0, originX, originY, scale);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // 2. Sort all structures & blips by depth from back to front
    const renderItems = [];

    structures.forEach((st) => {
      const center = project3D(st.x + st.w / 2, st.y + st.d / 2, st.z + st.h / 2, originX, originY, scale);
      renderItems.push({ type: 'structure', depth: center.depth, data: st });
    });

    blips.forEach((bl) => {
      const pt = project3D(bl.x, bl.y, bl.z, originX, originY, scale);
      renderItems.push({ type: 'blip', depth: pt.depth, data: bl });
    });

    // Painter's algorithm
    renderItems.sort((a, b) => a.depth - b.depth);

    renderItems.forEach((item) => {
      if (item.type === 'structure') {
        drawPrism(item.data, originX, originY, scale);
      } else {
        drawBlipLight(item.data, originX, originY, scale, t);
      }
    });

    // 3. Update HTML labels position periodically or during rotation
    if (time - lastLabelUpdate > 30) {
      updateHtmlLabels(originX, originY, scale);
      lastLabelUpdate = time;
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
/* ==========================================================================
   TACTICAL HUD CONSOLE CONTROLLER
   ========================================================================== */
(function initTacticalConsole() {
  const navItems = document.querySelectorAll('.console-nav-item');
  if (!navItems.length) return;

  const stageBadge = document.getElementById('stageBadge');
  const stageTitle = document.getElementById('stageTitle');
  const stageCategory = document.getElementById('stageCategory');
  const stageDesc = document.getElementById('stageDesc');

  const metric1Label = document.getElementById('metric1Label');
  const metric1Val = document.getElementById('metric1Val');
  const metric2Label = document.getElementById('metric2Label');
  const metric2Val = document.getElementById('metric2Val');
  const metric3Label = document.getElementById('metric3Label');
  const metric3Val = document.getElementById('metric3Val');

  const hudTargetDummy = document.getElementById('hudTargetDummy');
  const hudTracerSvg = document.getElementById('hudTracerSvg');
  const hudTracerLine = document.getElementById('hudTracerLine');
  const hudFovCircle = document.getElementById('hudFovCircle');
  const hudCenterCrosshair = document.getElementById('hudCenterCrosshair');
  const hudEspBox = document.getElementById('hudEspBox');
  const hudHealthBar = document.getElementById('hudHealthBar');
  const hudHealthFill = document.getElementById('hudHealthFill');
  const hudHpTag = document.getElementById('hudHpTag');
  const hudHeadDot = document.getElementById('hudHeadDot');
  const hudMenuWindow = document.getElementById('hudMenuWindow');

  const featureConfigs = {
    aim: {
      badge: 'CORE / 001',
      title: 'Smart Aim Helper',
      category: 'AIM ASSIST',
      desc: 'Automatically moves your aim toward the nearest enemy smoothly and naturally. You control how wide it reaches and how fast it kicks in. Hold left-click to activate it only when you\'re shooting.',
      m1Label: 'FEATURE TYPE',
      m1Val: 'SMOOTH TARGETING',
      m2Label: 'ACTIVATION METHOD',
      m2Val: 'HOLD LEFT-CLICK',
      m3Label: 'LATENCY IMPACT',
      m3Val: '0.00 MS ZERO DELAY',
      setup: () => {
        hudTargetDummy.style.display = 'flex';
        hudTargetDummy.style.transform = 'translate(60px, 0px)';
        hudMenuWindow.style.display = 'none';
        hudFovCircle.style.display = 'block';
        hudCenterCrosshair.style.display = 'flex';
        hudCenterCrosshair.innerHTML = `
          <div class="cross-center-dot" style="width: 6px; height: 6px; background: #ffffff; box-shadow: 0 0 8px #ffffff;"></div>
        `;
        hudTracerSvg.style.display = 'block';
        hudTracerLine.className.baseVal = 'hud-tracer-line snapline-red';
        hudEspBox.style.display = 'block';
        hudEspBox.className = 'hud-esp-box';
        hudEspBox.style.borderColor = '#ffffff';
        hudEspBox.style.boxShadow = '0 0 12px rgba(255, 255, 255, 0.5)';
        hudHealthBar.style.display = 'none';
        hudHpTag.style.display = 'block';
        hudHpTag.textContent = 'LOCKED // TARGET 1';
        hudHeadDot.style.display = 'block';
      }
    },
    boxes: {
      badge: 'CORE / 002',
      title: 'Enemy Outlines',
      category: 'ESP BOXES',
      desc: 'Draws a crisp colored box around every enemy on the map. The box dynamically changes color based on how much health they have — green when they\'re healthy, red when they\'re almost dead. Never lose track of where enemies are.',
      m1Label: 'STYLE OPTIONS',
      m1Val: '2D FULL & CORNERS',
      m2Label: 'HEALTH ADAPTIVE',
      m2Val: 'GREEN / AMBER / RED',
      m3Label: 'RENDER DEPTH',
      m3Val: '100% WALL OCCLUDED',
      setup: () => {
        hudTargetDummy.style.display = 'flex';
        hudTargetDummy.style.transform = 'translate(0px, 0px)';
        hudMenuWindow.style.display = 'none';
        hudFovCircle.style.display = 'none';
        hudCenterCrosshair.style.display = 'none';
        hudTracerSvg.style.display = 'none';
        hudEspBox.style.display = 'block';
        hudEspBox.className = 'hud-esp-box corner-style';
        hudHealthBar.style.display = 'none';
        hudHpTag.style.display = 'block';
        hudHpTag.textContent = 'ENEMY [TERRORIST]';
        hudHeadDot.style.display = 'none';
      }
    },
    health: {
      badge: 'CORE / 003',
      title: 'Health & Status Tags',
      category: 'HEALTH INFO',
      desc: 'Shows each enemy\'s health bar and exact HP number floating right above them. You\'ll always know exactly how many shots it takes to eliminate a target — no guessing, no hesitation.',
      m1Label: 'HP NUMERICAL',
      m1Val: '0 - 100 REALTIME',
      m2Label: 'BAR ORIENTATION',
      m2Val: 'VERTICAL LEFT FLANK',
      m3Label: 'INFO HEAD TAG',
      m3Val: 'DISTANCE & HEALTH',
      setup: () => {
        hudTargetDummy.style.display = 'flex';
        hudTargetDummy.style.transform = 'translate(0px, 0px)';
        hudMenuWindow.style.display = 'none';
        hudFovCircle.style.display = 'none';
        hudCenterCrosshair.style.display = 'none';
        hudTracerSvg.style.display = 'none';
        hudEspBox.style.display = 'block';
        hudEspBox.className = 'hud-esp-box';
        hudEspBox.style.borderColor = 'rgba(255, 255, 255, 0.25)';
        hudEspBox.style.boxShadow = 'none';
        hudHealthBar.style.display = 'block';
        hudHealthFill.style.height = '35%';
        hudHealthFill.style.background = '#ef4444';
        hudHealthFill.style.boxShadow = '0 0 8px #ef4444';
        hudHpTag.style.display = 'block';
        hudHpTag.textContent = '35 HP // WEAK TARGET';
        hudHeadDot.style.display = 'block';
      }
    },
    tracers: {
      badge: 'CORE / 004',
      title: 'Target Tracers',
      category: 'TRACERS',
      desc: 'Draws a glowing tactical line straight from your screen origin to each enemy. Even when enemies are hiding around blind corners or far at the screen edge, tracers tell you exactly where to look before you peek.',
      m1Label: 'ORIGIN POINT',
      m1Val: 'SCREEN BOTTOM / CENTER',
      m2Label: 'PULSE EFFECT',
      m2Val: 'ANIMATED FLOW SPEED',
      m3Label: 'DISTANCE READOUT',
      m3Val: 'DYNAMIC METRIC 14M',
      setup: () => {
        hudTargetDummy.style.display = 'flex';
        hudTargetDummy.style.transform = 'translate(110px, 0px)';
        hudMenuWindow.style.display = 'none';
        hudFovCircle.style.display = 'none';
        hudCenterCrosshair.style.display = 'none';
        hudTracerSvg.style.display = 'block';
        hudTracerLine.className.baseVal = 'hud-tracer-line snapline-blue';
        hudEspBox.style.display = 'block';
        hudEspBox.className = 'hud-esp-box';
        hudEspBox.style.borderColor = '#ff334b';
        hudEspBox.style.boxShadow = '0 0 12px rgba(255, 51, 75, 0.5)';
        hudHealthBar.style.display = 'block';
        hudHealthFill.style.height = '100%';
        hudHealthFill.style.background = '#22c55e';
        hudHpTag.style.display = 'block';
        hudHpTag.textContent = 'DISTANCE: 14.2 METERS';
        hudHeadDot.style.display = 'none';
      }
    },
    crosshair: {
      badge: 'CORE / 005',
      title: 'Custom Crosshairs',
      category: 'CROSSHAIR',
      desc: 'Ditch the default CS2 crosshair and use your own custom styles. Pick from 6 reticles — dot, cross, circle, and sniper reticles. Tweak thickness, color, and gap until it fits your exact rhythm.',
      m1Label: 'AVAILABLE STYLES',
      m1Val: '6 UNIQUE PRESETS',
      m2Label: 'ACCURACY BOOST',
      m2Val: 'NO-SCOPE SNIPER READY',
      m3Label: 'CUSTOMIZATION',
      m3Val: 'FULL RGB & GAP SIZE',
      setup: () => {
        hudTargetDummy.style.display = 'none';
        hudMenuWindow.style.display = 'none';
        hudFovCircle.style.display = 'none';
        hudTracerSvg.style.display = 'none';
        hudCenterCrosshair.style.display = 'flex';
        hudCenterCrosshair.innerHTML = `
          <div style="position: absolute; width: 34px; height: 34px; border: 2px solid var(--accent); border-radius: 50%; box-shadow: 0 0 10px var(--accent);"></div>
          <div style="position: absolute; width: 6px; height: 6px; background: #ffffff; border-radius: 50%; box-shadow: 0 0 8px #ffffff;"></div>
          <div style="position: absolute; width: 48px; height: 1.5px; background: rgba(212, 255, 63, 0.5);"></div>
          <div style="position: absolute; height: 48px; width: 1.5px; background: rgba(212, 255, 63, 0.5);"></div>
        `;
      }
    },
    menu: {
      badge: 'CORE / 006',
      title: 'In-Game Menu & Keys',
      category: 'MENU & KEYS',
      desc: 'Press INSERT at any moment to open the translucent settings panel right inside CS2 — no alt-tab, no FPS loss. Change keys, adjust colors, and tune features live while in the match.',
      m1Label: 'HOTKEY TRIGGER',
      m1Val: '[INSERT] OR ANY KEY',
      m2Label: 'SETTINGS STORAGE',
      m2Val: 'INSTANT AUTO-SAVED',
      m3Label: 'ENGINE OVERHEAD',
      m3Val: 'ZERO CPU USAGE',
      setup: () => {
        hudTargetDummy.style.display = 'none';
        hudFovCircle.style.display = 'none';
        hudCenterCrosshair.style.display = 'none';
        hudTracerSvg.style.display = 'none';
        hudMenuWindow.style.display = 'block';
      }
    }
  };

  function updateDynamicSnapline(featureKey) {
    const stageViewport = document.getElementById('stageViewport');
    if (!stageViewport) return;
    const vpRect = stageViewport.getBoundingClientRect();
    if (vpRect.width === 0 || vpRect.height === 0) return;

    if (featureKey === 'aim') {
      const dotRect = hudHeadDot.getBoundingClientRect();
      const dotX = (dotRect.left + dotRect.width / 2) - vpRect.left;
      const dotY = (dotRect.top + dotRect.height / 2) - vpRect.top;

      const startX = vpRect.width / 2;
      const startY = vpRect.height / 2;

      hudTracerLine.setAttribute('x1', startX.toFixed(1));
      hudTracerLine.setAttribute('y1', startY.toFixed(1));
      hudTracerLine.setAttribute('x2', dotX.toFixed(1));
      hudTracerLine.setAttribute('y2', dotY.toFixed(1));
    } else if (featureKey === 'tracers') {
      const boxRect = hudEspBox.getBoundingClientRect();
      const targetX = (boxRect.left + boxRect.width / 2) - vpRect.left;
      const targetY = boxRect.bottom - vpRect.top;

      const startX = vpRect.width / 2;
      const startY = vpRect.height;

      hudTracerLine.setAttribute('x1', startX.toFixed(1));
      hudTracerLine.setAttribute('y1', startY.toFixed(1));
      hudTracerLine.setAttribute('x2', targetX.toFixed(1));
      hudTracerLine.setAttribute('y2', targetY.toFixed(1));
    }
  }

  function selectFeature(featureKey) {
    const config = featureConfigs[featureKey];
    if (!config) return;

    // Update active nav button
    navItems.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.feature === featureKey);
    });

    // Animate stage info
    stageBadge.textContent = config.badge;
    stageTitle.textContent = config.title;
    stageCategory.textContent = config.category;
    stageDesc.textContent = config.desc;

    metric1Label.textContent = config.m1Label;
    metric1Val.textContent = config.m1Val;
    metric2Label.textContent = config.m2Label;
    metric2Val.textContent = config.m2Val;
    metric3Label.textContent = config.m3Label;
    metric3Val.textContent = config.m3Val;

    config.setup();

    // Dynamically calculate exact pixel connection to character
    requestAnimationFrame(() => {
      updateDynamicSnapline(featureKey);
    });
  }

  window.addEventListener('resize', () => {
    const activeBtn = document.querySelector('.console-nav-item.active');
    if (activeBtn) updateDynamicSnapline(activeBtn.dataset.feature);
  });

  // Click listeners for nav buttons
  navItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      selectFeature(btn.dataset.feature);
    });
  });

  // Initialize with 'aim'
  selectFeature('aim');
})();

// -------------------------------------------------------------
// GitHub Automatic Version Log & CS2 Compatibility Engine
// -------------------------------------------------------------
(function initVersionLog() {
  const container = document.getElementById('versionLogsContainer');
  const allVersionsContainer = document.getElementById('allVersionsContainer');
  const statusMsg = document.getElementById('cs2StatusMessage');
  const statusTag = document.getElementById('cs2StatusTag');

  // ඔබේ GitHub Repo එකෙහි 'username/repository-name' ලබා දෙන්න
  const repoOwnerAndName = "AI-Dev-Forge/VOLDLINE";

  async function fetchGitHubReleases() {
    try {
      const response = await fetch(`https://api.github.com/repos/${repoOwnerAndName}/releases`);
      if (!response.ok) throw new Error('Failed to fetch releases');

      const releases = await response.json();

      // 1. Homepage Logic (Top 3 Releases)
      if (container) {
        if (releases.length === 0) {
          container.innerHTML = `<div class="protocol-row"><span class="protocol-no mono">v1.0.0</span><div><h3>NO RELEASES FOUND</h3><p>No release logs available on GitHub yet.</p></div></div>`;
        } else {
          container.innerHTML = '';
          const latestReleases = releases.slice(0, 3);

          latestReleases.forEach((release, index) => {
            const versionNum = release.tag_name || `v1.0.${2 - index}`;
            const releaseTitle = release.name || release.tag_name;
            const releaseBody = release.body ? release.body.substring(0, 110) + '...' : 'Stable production build synced with latest patches.';
            const releaseUrl = release.html_url;

            const row = document.createElement('div');
            row.className = 'protocol-row reveal visible';
            row.innerHTML = `
              <span class="protocol-no mono">${versionNum}</span>
              <div>
                <h3>${releaseTitle}</h3>
                <p>${releaseBody}</p>
              </div>
              <a href="${releaseUrl}" target="_blank" rel="noreferrer" class="protocol-symbol">↗</a>
            `;
            container.appendChild(row);
          });
        }

        // CS2 Status Banner Check
        if (statusMsg && releases.length > 0) {
          if (releases[0].body && releases[0].body.includes("CS2_OUTDATED")) {
            statusMsg.innerText = "CS2 Game එක සඳහා නව Update එකක් නිකුත් වී ඇත. එම Game Update එකට ගැළපෙන පරිදි Software එක තවමත් සංවර්ධනය කරමින් පවතී.";
            if (statusTag) statusTag.style.color = "#ff5b49";
          } else {
            statusMsg.innerText = "නවතම CS2 Game Update එක සමඟ Software එක දැන් සම්පූර්ණයෙන්ම අනුකූල වේ.";
            if (statusTag) statusTag.style.color = "var(--acid)";
          }
        }
      }

      // 2. Version History Page Logic (versions.html - ALL Releases)
      if (allVersionsContainer) {
        if (releases.length === 0) {
          allVersionsContainer.innerHTML = `<div class="history-card"><p>No release history available.</p></div>`;
          return;
        }

        allVersionsContainer.innerHTML = '';

        releases.forEach((release, index) => {
          const versionNum = release.tag_name || `v1.0.${releases.length - index}`;
          const releaseTitle = release.name || release.tag_name;

          // Format Release Date
          const dateObj = new Date(release.published_at || Date.now());
          const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }).toUpperCase();

          const releaseBody = release.body ? parseReleaseBody(release.body) : '<p>Routine system update, performance optimizations, and stability improvements.</p>';
          const isLatest = index === 0;

          const card = document.createElement('div');
          card.className = `history-card reveal visible ${isLatest ? 'latest-card' : ''}`;
          card.innerHTML = `
            <div class="history-card-header mono">
              <div class="version-badge-wrap">
                <span class="version-tag">${versionNum}</span>
                ${isLatest ? '<span class="badge-latest">LATEST RELEASE</span>' : ''}
              </div>
              <span class="release-date">RELEASED: ${formattedDate}</span>
            </div>
            <div class="history-card-body">
              <h3 class="history-card-title">${releaseTitle}</h3>
              <div class="history-changelog-content">
                ${releaseBody}
              </div>
              <div class="history-card-foot">
                <a href="${release.html_url}" target="_blank" rel="noreferrer" class="history-dl-link mono">
                  VIEW ON GITHUB <span>↗</span>
                </a>
              </div>
            </div>
          `;
          allVersionsContainer.appendChild(card);
        });
      }

    } catch (error) {
      console.error('GitHub Sync Error:', error);
      if (allVersionsContainer) {
        allVersionsContainer.innerHTML = `<div class="history-card"><p>Unable to load release history at this moment.</p></div>`;
      }
    }
  }

  // Helper function to format markdown-like GitHub Release body text into styled HTML sections
  function parseReleaseBody(bodyText) {
    let formatted = bodyText
      .replace(/^### (.*$)/gim, '<h4 class="changelog-subheading">$1</h4>')
      .replace(/^## (.*$)/gim, '<h4 class="changelog-subheading">$1</h4>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '<br>');

    // Wrap list items if present
    if (formatted.includes('<li>')) {
      formatted = formatted.replace(/(<li>.*<\/li>)/gms, '<ul class="changelog-list">$1<\/ul>');
    }

    return formatted;
  }

  fetchGitHubReleases();
})();

// -------------------------------------------------------------
// CS2 Build & Software Compatibility Checker Engine (Optimized)
// -------------------------------------------------------------
(function initStatusDashboard() {
  const latestBuildEl = document.getElementById('cs2LatestBuild');
  const releaseDateEl = document.getElementById('cs2ReleaseDate');
  const compatBadgePill = document.getElementById('compatBadgePill');
  const compatMsgWrap = document.getElementById('compatMsgWrap');
  const compatIcon = document.getElementById('compatIcon');
  const compatText = document.getElementById('compatText');
  const compatibilityCard = document.getElementById('compatibilityCard');

  const jsonUrl = "https://raw.githubusercontent.com/AI-Dev-Forge/VOLDLINE-WEB/refs/heads/main/compatibility.json";

  async function checkCompatibility() {
    try {
      // 1. Cache Bypass කිරීම සඳහා Unique Query Parameter එකක් සහ No-Cache headers එකතු කිරීම
      const response = await fetch(jsonUrl + "?v=" + new Date().getTime(), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-transform'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch status metadata');

      const data = await response.json();

      // 2. CS2 Game Status Card යාවත්කාලීන කිරීම
      if (latestBuildEl) latestBuildEl.innerText = data.latest_cs2_build;
      if (releaseDateEl) releaseDateEl.innerText = data.release_date;

      // 3. Build IDs සංසන්දනය කිරීම
      const isCompatible = data.latest_cs2_build === data.supported_software_build;

      if (isCompatible) {
        if (compatBadgePill) {
          compatBadgePill.innerText = "Compatible";
          compatBadgePill.className = "status-pill badge-compatible";
        }
        if (compatibilityCard) compatibilityCard.style.borderColor = "rgba(16, 185, 129, 0.35)";
        if (compatIcon) compatIcon.innerHTML = "✅";
        if (compatText) compatText.innerText = "Software එක නවතම CS2 Update එක සමඟ අනුකූල වේ.";
      } else {
        if (compatBadgePill) {
          compatBadgePill.innerText = "Updating";
          compatBadgePill.className = "status-pill badge-updating";
        }
        if (compatibilityCard) compatibilityCard.style.borderColor = "rgba(245, 158, 11, 0.35)";
        if (compatIcon) compatIcon.innerHTML = "⚠️";
        if (compatText) compatText.innerText = "නවතම CS2 Update එක සඳහා Software එක තවමත් Update කරමින් පවතී.";
      }

    } catch (error) {
      console.error('Status fetch error:', error);
      if (latestBuildEl) latestBuildEl.innerText = "SYNC ERROR";
      if (compatText) compatText.innerText = "Unable to verify compatibility status.";
    }
  }

  // පිටුව Load වූ වහාම ක්‍රියාත්මක වීම
  checkCompatibility();

  // (අත්‍යවශ්‍ය නම්) Tab එක Active වන විට හෝ සෑම විනාඩි 5කට වරක් ස්වයංක්‍රීයව පසුබිමින් පරීක්ෂා කිරීම
  setInterval(checkCompatibility, 300000);
})();