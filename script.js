/* ===== VOLDLINE SPLASH — boot sequence + lock-on mini-game ===== */
(() => {
  const root = document.documentElement;
  const sp = document.getElementById('splash');
  if (!sp) return;

  // Session check: only show once per browser/tab session
  try {
    if (sessionStorage.getItem('voldline_visited')) {
      sp.remove();
      root.classList.remove('splash-active');
      return;
    }
    sessionStorage.setItem('voldline_visited', '1');
  } catch (e) { }

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { sp.remove(); root.classList.remove('splash-active'); return; }
  root.classList.add('splash-active');

  const $ = (s) => sp.querySelector(s);
  const cv = $('#sp-canvas'), c = cv.getContext('2d');
  const pctEl = $('#sp-pct'), bar = $('#sp-bari'), logEl = $('#sp-log'), tagEl = $('#sp-tag'), clock = $('#sp-clock'), wordEl = $('.sp-word');
  const AC = '212,255,63', AM = '255,170,51', TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const t0 = performance.now();
  let W, H, left = false, ready = false, raf, last = t0, p = 0, logN = 0, tagged = 0, locked = null, lockSince = 0, lastSpawn = 0;
  let loaded = document.readyState === 'complete';
  addEventListener('load', () => { loaded = true; });

  function fit() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  fit(); addEventListener('resize', fit);

  // Wordmark: letters decode from noise, one by one.
  const WORD = 'VOLDLINE', GLY = '#%&/<>+*0123456789XZ';
  const chs = [...WORD].map((ch, i) => {
    const s = document.createElement('span');
    s.className = 'ch ' + (i < 4 ? 'vd' : 'ln'); s.textContent = ch; s.style.opacity = 0;
    wordEl.appendChild(s); return s;
  });
  let wStart = null;
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    chs.forEach((s) => { s.style.width = (s.offsetWidth / parseFloat(getComputedStyle(s).fontSize)) + 'em'; });
    wStart = performance.now() + 250;
  });

  // Boot log.
  const LOG = [[6, 'INIT VOLDLINE CORE'], [26, 'MOUNT TACTICAL OVERLAY'], [48, 'CALIBRATE DUST II MAP'], [72, 'SYNC RELEASE CHANNEL'], [94, 'FIELD SYSTEMS 001']];
  function addLog(txt, ok = 'OK') {
    const d = document.createElement('div');
    const span = document.createElement('span');
    span.textContent = `> ${txt}`;
    const i = document.createElement('i');
    const b = document.createElement('b');
    b.textContent = ok;
    d.appendChild(span);
    d.appendChild(i);
    d.appendChild(b);
    logEl.appendChild(d);
    while (logEl.children.length > 5) logEl.firstChild.remove();
  }

  // Radar field state.
  const dust = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), v: rnd(.01, .05), a: rnd(.15, .5) }));
  let blips = [], bursts = [];
  const mouse = { x: innerWidth / 2, y: innerHeight * .8, t: 0 };
  const cross = { x: mouse.x, y: mouse.y };

  const nearest = (x, y, r, now = performance.now()) => {
    let best = null, bd = r;
    blips.forEach((b) => { const d = Math.hypot(b.x - x, b.y - y); if (!b.dead && now - b.b > 300 && d < bd) { bd = d; best = b; } });
    return best;
  };
  function tag() {
    if (!locked) return;
    locked.dead = true;
    for (let i = 0; i < 16; i++) { const a = rnd(0, TAU), v = rnd(.05, .3); bursts.push({ x: locked.x, y: locked.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1 }); }
    tagEl.textContent = String(++tagged).padStart(2, '0');
    locked = null;
  }

  function enter() {
    if (left) return; left = true;
    sp.classList.add('is-leaving');
    setTimeout(() => root.classList.remove('splash-active'), 500);
    setTimeout(() => { cancelAnimationFrame(raf); sp.remove(); }, 1200);
  }
  function finish() {
    ready = true; p = 100;
    sp.classList.add('is-ready'); wordEl.classList.add('full');
    addLog('ALL SYSTEMS', 'READY');
    setTimeout(enter, 1000);
  }

  sp.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.t = performance.now(); });
  sp.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    if (ready) return enter();
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.t = performance.now();
    locked = nearest(mouse.x, mouse.y, 90); tag();
  });
  addEventListener('keydown', (e) => { if (ready || e.key === 'Escape') enter(); });
  $('#sp-skip').addEventListener('click', enter);

  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(now - last, 50); last = now;
    const el = now - t0, t = el / 1000;

    // Progress: held at 92% until the page has really loaded.
    if (!ready) {
      const target = Math.min(el / 2500, 1) * 100, cap = loaded ? 100 : 92;
      p += (Math.min(target, cap) - p) * (1 - Math.pow(.9, dt / 16.7));
      if (p > 99.4 && target >= 100 && loaded) finish();
    }
    pctEl.textContent = String(Math.floor(p)).padStart(3, '0');
    bar.style.transform = `scaleX(${p / 100})`;
    clock.textContent = t.toFixed(2);
    while (logN < LOG.length && p >= LOG[logN][0]) addLog(LOG[logN++][1]);

    if (wStart) chs.forEach((s, i) => {
      const e = now - wStart - i * 90; if (e < 0) return;
      s.style.opacity = 1;
      if (e < 520) { if (!s._n || now - s._n > 45) { s.textContent = GLY[Math.random() * GLY.length | 0]; s._n = now; } s.classList.add('scr'); }
      else if (s.classList.contains('scr')) { s.textContent = WORD[i]; s.classList.remove('scr'); }
    });

    // ---- canvas ----
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) * .4;
    c.clearRect(0, 0, W, H);
    c.lineWidth = 1;
    [1, .66, .33].forEach((k) => { c.strokeStyle = `rgba(${AC},.07)`; c.beginPath(); c.arc(cx, cy, R * k, 0, TAU); c.stroke(); });
    for (let k = 0; k < 3; k++) { // expanding pulses
      const f = ((t * .16) + k / 3) % 1;
      c.strokeStyle = `rgba(${AC},${.16 * (1 - f)})`; c.beginPath(); c.arc(cx, cy, f * Math.hypot(W, H) * .55, 0, TAU); c.stroke();
    }
    c.save(); c.translate(cx, cy); c.rotate(t * .08); c.strokeStyle = `rgba(${AC},.3)`; c.beginPath();
    for (let i = 0; i < 120; i++) { const a = i / 120 * TAU, l = i % 10 ? 4 : 11; c.moveTo(Math.cos(a) * R, Math.sin(a) * R); c.lineTo(Math.cos(a) * (R + l), Math.sin(a) * (R + l)); }
    c.stroke(); c.restore();
    if (c.createConicGradient) { // radar sweep
      const g = c.createConicGradient(t * 1.1, cx, cy);
      g.addColorStop(0, `rgba(${AC},0)`); g.addColorStop(.75, `rgba(${AC},0)`); g.addColorStop(1, `rgba(${AC},.22)`);
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fill();
    }
    dust.forEach((d) => { d.y -= d.v * dt / 1000; if (d.y < 0) d.y = 1; c.fillStyle = `rgba(${AC},${d.a})`; c.fillRect(d.x * W, d.y * H, 1.5, 1.5); });

    // contacts
    if (blips.length < 6 && now - lastSpawn > 650) {
      lastSpawn = now;
      for (let i = 0; i < 10; i++) {
        const x = rnd(.08, .92) * W, y = rnd(.12, .88) * H;
        if (Math.abs(y - cy) < H * .17 && Math.abs(x - cx) < W * .34) continue;
        blips.push({ x, y, b: now, life: rnd(4000, 6500), id: String(rnd(1, 40) | 0).padStart(2, '0'), amber: Math.random() < .4 }); break;
      }
    }
    blips = blips.filter((b) => !b.dead && now - b.b < b.life);
    c.font = '9px "DM Mono", monospace';
    blips.forEach((b) => {
      const age = now - b.b, a = Math.max(0, Math.min(1, age / 300, (b.life - age) / 400)), col = b.amber ? AM : AC, pu = (Math.sin(t * 5 + b.x) + 1) / 2;
      c.strokeStyle = `rgba(${col},${a * .6})`; c.beginPath(); c.arc(b.x, b.y, 6 + pu * 5, 0, TAU); c.stroke();
      c.fillStyle = `rgba(${col},${a})`; c.beginPath(); c.arc(b.x, b.y, 2.5, 0, TAU); c.fill();
      c.fillText((b.amber ? 'T / ' : 'CT / ') + b.id, b.x + 14, b.y + 3);
    });

    // crosshair: follows the pointer, or plays itself when idle
    const idle = now - mouse.t > 2500;
    let tx = mouse.x, ty = mouse.y;
    if (idle) { const n = nearest(cross.x, cross.y, 1e5, now); if (n) { tx = n.x; ty = n.y; } else { tx = cx + Math.cos(t * .7) * W * .25; ty = cy + Math.sin(t * .9) * H * .3; } }
    cross.x += (tx - cross.x) * .12; cross.y += (ty - cross.y) * .12;
    const nb = nearest(cross.x, cross.y, 90, now);
    if (nb !== locked) { locked = nb; lockSince = now; }
    if (idle && locked && now - lockSince > 650) tag();

    c.strokeStyle = `rgba(${AC},.95)`; c.lineWidth = 1.2; c.beginPath();
    const r1 = locked ? 12 : 18, r2 = locked ? 16 : 24;
    c.arc(cross.x, cross.y, r1, 0, TAU);
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { c.moveTo(cross.x + dx * r2, cross.y + dy * r2); c.lineTo(cross.x + dx * 34, cross.y + dy * 34); });
    c.stroke();
    c.fillStyle = `rgb(${AC})`; c.fillRect(cross.x - 1, cross.y - 1, 2, 2);
    if (locked) {
      const b = locked, s = 22 * Math.max(1, 2 - (now - lockSince) / 200), col = b.amber ? AM : AC;
      c.strokeStyle = `rgb(${col})`; c.lineWidth = 1.5; c.beginPath();
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => { c.moveTo(b.x + sx * s, b.y + sy * (s - 8)); c.lineTo(b.x + sx * s, b.y + sy * s); c.lineTo(b.x + sx * (s - 8), b.y + sy * s); });
      c.stroke();
      c.setLineDash([3, 4]); c.beginPath(); c.moveTo(cross.x, cross.y); c.lineTo(b.x, b.y); c.stroke(); c.setLineDash([]);
      c.fillStyle = `rgb(${col})`; c.fillText(`LOCK // ${Math.round(Math.hypot(b.x - cx, b.y - cy) / 8)}M`, b.x + s + 8, b.y - s + 4);
    }
    bursts = bursts.filter((b) => (b.l -= dt / 600) > 0);
    bursts.forEach((b) => { b.x += b.vx * dt; b.y += b.vy * dt; c.fillStyle = `rgba(${AC},${b.l})`; c.fillRect(b.x, b.y, 2.5, 2.5); });
  }
  raf = requestAnimationFrame(tick);
})();

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

// Mobile navigation & Topbar scroll state.
const topbar = document.querySelector('.topbar');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 30) {
    topbar?.classList.add('scrolled');
  } else {
    topbar?.classList.remove('scrolled');
  }
}, { passive: true });

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

// Active nav section highlighter on scroll
const sections = document.querySelectorAll('section[id], main[id]');
const navItems = document.querySelectorAll('.nav-item');

if (sections.length && navItems.length) {
  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 160;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    if (currentId) {
      navItems.forEach(item => {
        const href = item.getAttribute('href') || '';
        if (href.endsWith(`#${currentId}`)) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  }, { passive: true });
}

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
    labelsContainer.textContent = '';

    blips.forEach((b) => {
      const topPt = project3D(b.x, b.y, b.z + b.coneH, originX, originY, scale);
      const labelDiv = document.createElement('div');
      labelDiv.className = `map-blip-label label-${b.color}`;
      labelDiv.style.left = `${topPt.x}px`;
      labelDiv.style.top = `${topPt.y - 4}px`;

      const pin = document.createElement('span');
      pin.className = 'map-blip-pin';
      const labelText = document.createElement('span');
      labelText.textContent = b.label;

      labelDiv.appendChild(pin);
      labelDiv.appendChild(labelText);
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
let latestReleaseDownloadUrl = "https://github.com/AI-Dev-Forge/VOLDLINE/releases/latest/download/VOLD-LINE.exe";
let latestReleaseVersionTag = "v1.0.7";
//let latestReleaseFileSize = "914 KB";

(function initVersionLog() {
  const container = document.getElementById('versionLogsContainer');
  const allVersionsContainer = document.getElementById('allVersionsContainer');
  const statusMsg = document.getElementById('cs2StatusMessage');
  const statusTag = document.getElementById('cs2StatusTag');
  const releaseBadgeVersion = document.getElementById('releaseBadgeVersion');
  const dlBtnVersion = document.getElementById('dlBtnVersion');
  const dlBtnSize = document.getElementById('dlBtnSize');

  // Provide your GitHub Repo in the format 'username/repository-name'
  const repoOwnerAndName = "AI-Dev-Forge/VOLDLINE";

  // Direct latest asset download endpoint
  const directLatestExeUrl = `https://github.com/${repoOwnerAndName}/releases/latest/download/VOLD-LINE.exe`;

  // Safe HTML escaper for dynamic external data
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Safe URL sanitizer for dynamic links
  function sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return directLatestExeUrl;
    const trimmed = url.trim();
    if (/^(https:\/\/github\.com\/|https:\/\/raw\.githubusercontent\.com\/)/i.test(trimmed)) {
      return trimmed;
    }
    return directLatestExeUrl;
  }

  // Fetch with explicit timeout to prevent hanging connections
  async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 8000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(resource, {
        ...options,
        signal: controller.signal
      });
      return response;
    } finally {
      clearTimeout(id);
    }
  }

  async function fetchGitHubReleases() {
    try {
      const response = await fetchWithTimeout(`https://api.github.com/repos/${repoOwnerAndName}/releases`);
      if (!response.ok) throw new Error('Failed to fetch releases');

      const releases = await response.json();
      if (!Array.isArray(releases)) throw new Error('Invalid releases payload format');

      // Update Latest Release Metadata for Download Section
      if (releases.length > 0) {
        const topRelease = releases[0];
        const rawTag = (topRelease.tag_name && typeof topRelease.tag_name === 'string') ? topRelease.tag_name : "v1.0.7";
        // Strict sanitize version tag: allow only v, digits, dots, hyphens, alphanumeric
        const vTag = rawTag.replace(/[^a-zA-Z0-9.-]/g, '');
        latestReleaseVersionTag = vTag;

        // Clean version string for badge (e.g. "PROD-1.0.7")
        const cleanVersion = vTag.replace(/^v/i, '');
        if (releaseBadgeVersion) {
          releaseBadgeVersion.textContent = `PROD-${cleanVersion}`;
        }
        if (dlBtnVersion) {
          dlBtnVersion.textContent = vTag;
        }

        // Update all other version displays across the site
        const splashVersionHud = document.getElementById('splashVersionHud');
        const heroVersionMeta = document.getElementById('heroVersionMeta');
        if (splashVersionHud) splashVersionHud.textContent = cleanVersion;
        if (heroVersionMeta) heroVersionMeta.textContent = cleanVersion;

        // Check if there is an uploaded asset executable for size and direct download
        if (Array.isArray(topRelease.assets) && topRelease.assets.length > 0) {
          const mainAsset = topRelease.assets.find(a => a && a.name && (a.name.endsWith('.exe') || a.name.endsWith('.zip'))) || topRelease.assets[0];
          if (mainAsset) {
            if (mainAsset.browser_download_url) {
              latestReleaseDownloadUrl = sanitizeUrl(mainAsset.browser_download_url);
            }
            if (typeof mainAsset.size === 'number' && mainAsset.size > 0) {
              const sizeInKb = Math.round(mainAsset.size / 1024);
              if (sizeInKb > 1024) {
                latestReleaseFileSize = (sizeInKb / 1024).toFixed(1) + " MB";
              } else {
                latestReleaseFileSize = sizeInKb + " KB";
              }
              if (dlBtnSize) {
                dlBtnSize.textContent = latestReleaseFileSize;
              }
            }
          }
        } else {
          // If no assets array in response, construct the direct latest exe asset URL using the tag or default
          latestReleaseDownloadUrl = `https://github.com/${repoOwnerAndName}/releases/download/${vTag}/VOLD-LINE.exe`;
        }
      }

      // 1. Homepage Logic (Top 3 Releases)
      if (container) {
        if (releases.length === 0) {
          container.textContent = '';
          const emptyRow = document.createElement('div');
          emptyRow.className = 'protocol-row';
          const protoNo = document.createElement('span');
          protoNo.className = 'protocol-no mono';
          protoNo.textContent = 'v1.0.0';
          const textDiv = document.createElement('div');
          const h3 = document.createElement('h3');
          h3.textContent = 'NO RELEASES FOUND';
          const p = document.createElement('p');
          p.textContent = 'No release logs available on GitHub yet.';
          textDiv.appendChild(h3);
          textDiv.appendChild(p);
          emptyRow.appendChild(protoNo);
          emptyRow.appendChild(textDiv);
          container.appendChild(emptyRow);
        } else {
          container.textContent = '';
          const latestReleases = releases.slice(0, 3);

          latestReleases.forEach((release, index) => {
            const versionNum = String(release.tag_name || `v1.0.${2 - index}`).replace(/[^a-zA-Z0-9.-]/g, '');
            const releaseTitle = String(release.name || release.tag_name || 'Release Build');
            const rawBody = typeof release.body === 'string' ? release.body : 'Stable production build synced with latest patches.';
            const releaseBody = rawBody.substring(0, 110) + (rawBody.length > 110 ? '...' : '');
            const safeUrl = sanitizeUrl(release.html_url);

            const row = document.createElement('div');
            row.className = 'protocol-row reveal visible';

            const protoNo = document.createElement('span');
            protoNo.className = 'protocol-no mono';
            protoNo.textContent = versionNum;

            const textDiv = document.createElement('div');
            const h3 = document.createElement('h3');
            h3.textContent = releaseTitle;
            const p = document.createElement('p');
            p.textContent = releaseBody;
            textDiv.appendChild(h3);
            textDiv.appendChild(p);

            const link = document.createElement('a');
            link.href = safeUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'protocol-symbol';
            link.textContent = '↗';

            row.appendChild(protoNo);
            row.appendChild(textDiv);
            row.appendChild(link);
            container.appendChild(row);
          });
        }

        // CS2 Status Banner Check
        if (statusMsg && releases.length > 0) {
          if (typeof releases[0].body === 'string' && releases[0].body.includes("CS2_OUTDATED")) {
            statusMsg.textContent = "A new CS2 game update has been detected. Software update is currently in progress to match this patch.";
            if (statusTag) statusTag.style.color = "#ff5b49";
          } else {
            statusMsg.textContent = "Software is currently fully compatible with the latest CS2 game update.";
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
          const versionNum = escapeHtml(String(release.tag_name || `v1.0.${releases.length - index}`).replace(/[^a-zA-Z0-9.-]/g, ''));
          const releaseTitle = escapeHtml(String(release.name || release.tag_name || 'Release Build'));

          // Format Release Date safely
          const rawDate = release.published_at ? new Date(release.published_at) : new Date();
          const validDate = isNaN(rawDate.getTime()) ? new Date() : rawDate;
          const formattedDate = escapeHtml(validDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }).toUpperCase());

          const releaseBody = release.body ? parseReleaseBody(release.body) : '<p>Routine system update, performance optimizations, and stability improvements.</p>';
          const isLatest = index === 0;
          const safeUrl = sanitizeUrl(release.html_url);

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
                <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="history-dl-link mono">
                  VIEW ON GITHUB <span>↗</span>
                </a>
              </div>
            </div>
          `;
          allVersionsContainer.appendChild(card);
        });
      }

    } catch (error) {
      if (allVersionsContainer) {
        allVersionsContainer.innerHTML = `<div class="history-card"><p>Unable to load release history at this moment.</p></div>`;
      }
    }
  }

  // Safe parser for release changelog markdown to prevent XSS
  function parseReleaseBody(bodyText) {
    if (typeof bodyText !== 'string') return '<p>Routine system update.</p>';

    // First escape all raw HTML to prevent injection
    const escaped = escapeHtml(bodyText);

    let formatted = escaped
      .replace(/^### (.*$)/gim, '<h4 class="changelog-subheading">$1</h4>')
      .replace(/^## (.*$)/gim, '<h4 class="changelog-subheading">$1</h4>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '<br>');

    if (formatted.includes('<li>')) {
      formatted = formatted.replace(/(<li>.*<\/li>)/gms, '<ul class="changelog-list">$1<\/ul>');
    }

    return formatted;
  }

  fetchGitHubReleases();
})();

// -------------------------------------------------------------
// Interactive Tactical Download Sequence & Particle Shockwave Engine
// -------------------------------------------------------------
(function initTacticalDownload() {
  const downloadBtn = document.getElementById('tacticalDownloadBtn');
  const hudTerminal = document.getElementById('downloadHudTerminal');
  const progressBar = document.getElementById('terminalProgressBar');
  const pctEl = document.getElementById('terminalPct');
  const speedEl = document.getElementById('terminalSpeed');
  const stateEl = document.getElementById('terminalState');
  const statusText = document.getElementById('terminalStatusText');
  const logsContainer = document.getElementById('terminalLogs');
  const fxCanvas = document.getElementById('downloadShockwaveCanvas');

  if (!downloadBtn || !fxCanvas) return;

  const ctx = fxCanvas.getContext('2d');
  let isDownloading = false;
  let particles = [];
  let shockwaves = [];
  let animId = null;

  function resizeFxCanvas() {
    const parent = fxCanvas.parentElement;
    if (!parent) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    fxCanvas.width = parent.clientWidth * dpr;
    fxCanvas.height = parent.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resizeFxCanvas();
  window.addEventListener('resize', resizeFxCanvas);

  // Trigger Shockwave & Particle Explosion
  function triggerCyberBlast(originX, originY) {
    const rect = fxCanvas.getBoundingClientRect();
    const x = originX - rect.left;
    const y = originY - rect.top;

    // Add Shockwaves
    for (let i = 0; i < 3; i++) {
      shockwaves.push({
        x,
        y,
        radius: 10 + i * 15,
        maxRadius: 280 + i * 90,
        speed: 7 + i * 3,
        alpha: 0.95,
        color: i === 0 ? '255, 255, 255' : '212, 255, 63'
      });
    }

    // Add Energy Sparks / Particles
    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8.5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2.5,
        alpha: 1,
        life: 0.95 + Math.random() * 0.04,
        decay: 0.015 + Math.random() * 0.02,
        color: Math.random() > 0.3 ? '212, 255, 63' : '255, 255, 255'
      });
    }

    if (!animId) renderFx();
  }

  function renderFx() {
    const w = fxCanvas.clientWidth;
    const h = fxCanvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // Render Shockwaves
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.radius += sw.speed;
      sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);

      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${sw.color}, ${sw.alpha * 0.8})`;
      ctx.lineWidth = Math.max(1, (1 - sw.radius / sw.maxRadius) * 4);
      ctx.shadowColor = `rgba(${sw.color}, 0.8)`;
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.restore();

      if (sw.radius >= sw.maxRadius || sw.alpha <= 0.01) {
        shockwaves.splice(i, 1);
      }
    }

    // Render Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.alpha -= p.decay;

      ctx.save();
      ctx.fillStyle = `rgba(${p.color}, ${Math.max(0, p.alpha)})`;
      ctx.shadowColor = `rgba(${p.color}, 0.8)`;
      ctx.shadowBlur = 8;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.restore();

      if (p.alpha <= 0.02) {
        particles.splice(i, 1);
      }
    }

    if (shockwaves.length > 0 || particles.length > 0) {
      animId = requestAnimationFrame(renderFx);
    } else {
      ctx.clearRect(0, 0, w, h);
      animId = null;
    }
  }

  function addLog(text, isActive = false) {
    if (!logsContainer) return;
    const line = document.createElement('div');
    line.className = 'log-line' + (isActive ? ' active' : '');
    line.innerText = text;
    logsContainer.appendChild(line);

    while (logsContainer.children.length > 4) {
      logsContainer.removeChild(logsContainer.firstChild);
    }
  }

  downloadBtn.addEventListener('click', (e) => {
    if (isDownloading) return;
    isDownloading = true;

    const btnRect = downloadBtn.getBoundingClientRect();
    const blastX = e.clientX || (btnRect.left + btnRect.width / 2);
    const blastY = e.clientY || (btnRect.top + btnRect.height / 2);

    triggerCyberBlast(blastX, blastY);

    // Button state transformation
    downloadBtn.style.pointerEvents = 'none';
    downloadBtn.style.opacity = '0.7';

    // Show HUD Terminal
    if (hudTerminal) {
      hudTerminal.style.display = 'block';
      if (logsContainer) logsContainer.textContent = '';
      if (progressBar) progressBar.style.width = '0%';
      if (pctEl) pctEl.innerText = '0%';
      if (statusText) statusText.innerText = 'ESTABLISHING SECURE HANDSHAKE...';
      if (stateEl) stateEl.innerText = 'INITIALIZING';
    }

    addLog('> INITIATING SHA-256 SIGNATURE VERIFICATION...');

    let progress = 0;
    const logMilestones = [
      { at: 15, msg: '> VERIFYING SIGNED DIGITAL CERTIFICATE [VALID]' },
      { at: 40, msg: '> CALIBRATING DIRECT3D 11 TRANSPARENT HOOKS...' },
      { at: 70, msg: '> SYNCING DYNAMIC OFFSETS // MATCH READY' },
      { at: 92, msg: `> PACKING PAYLOAD: VOLDLINE_${latestReleaseVersionTag}_x64` }
    ];
    let milestoneIndex = 0;

    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 6) + 3;

      if (progress > 100) progress = 100;

      if (progressBar) progressBar.style.width = `${progress}%`;
      if (pctEl) pctEl.innerText = `${progress}%`;
      if (speedEl) speedEl.innerText = `${(42 + Math.random() * 12).toFixed(1)} MB/s`;

      if (progress < 40) {
        if (stateEl) stateEl.innerText = 'NEGOTIATING';
      } else if (progress < 95) {
        if (stateEl) stateEl.innerText = 'STREAMING_PAYLOAD';
        if (statusText) statusText.innerText = 'RECEIVING COMPILED BINARY...';
      } else {
        if (stateEl) stateEl.innerText = 'FINALIZING';
      }

      if (milestoneIndex < logMilestones.length && progress >= logMilestones[milestoneIndex].at) {
        addLog(logMilestones[milestoneIndex].msg);
        milestoneIndex++;
      }

      if (progress >= 100) {
        clearInterval(interval);
        if (statusText) statusText.innerText = 'PACKAGE READY // INITIATING TRANSFER';
        if (stateEl) stateEl.innerText = 'DEPLOYED';
        addLog('> STREAM COMPLETE. TRIGGERING SYSTEM DOWNLOAD...', true);

        // Second shockwave blast for completion
        const btnBox = downloadBtn.getBoundingClientRect();
        triggerCyberBlast(btnBox.left + btnBox.width / 2, btnBox.top + btnBox.height / 2);

        setTimeout(() => {
          // Trigger direct executable download
          const downloadLink = document.createElement('a');
          downloadLink.href = latestReleaseDownloadUrl;
          downloadLink.setAttribute('download', '');
          downloadLink.target = '_blank';
          downloadLink.rel = 'noopener noreferrer';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          downloadLink.remove();

          // Reset button
          downloadBtn.style.pointerEvents = 'auto';
          downloadBtn.style.opacity = '1';
          isDownloading = false;
        }, 1100);
      }
    }, 55);
  });
})();

// -------------------------------------------------------------
// Tactical Voice Transmission & Soundwave Visualizer Player
// -------------------------------------------------------------
(function initVoicePlayer() {
  const audio = document.getElementById('tacticalVoiceAudio');
  const playBtn = document.getElementById('audioPlayBtn');
  const playIcon = document.getElementById('playIconSvg');
  const pauseIcon = document.getElementById('pauseIconSvg');
  const playBtnText = document.getElementById('playBtnText');
  const timeDisplay = document.getElementById('audioTimeDisplay');
  const statusDisplay = document.getElementById('audioTrackStatus');
  const progressBar = document.getElementById('audioProgressBar');
  const progressHandle = document.getElementById('audioProgressHandle');
  const progressWrap = document.getElementById('audioProgressWrap');
  const canvas = document.getElementById('voiceVisualizerCanvas');

  // Volume slider elements
  const volTrack = document.getElementById('volSliderTrack');
  const volFill = document.getElementById('volSliderFill');
  const volThumb = document.getElementById('volSliderThumb');
  const volText = document.getElementById('volValText');

  if (!audio || !playBtn || !canvas) return;

  const ctx = canvas.getContext('2d');
  let isPlaying = false;
  let animFrameId = null;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.parentElement.clientWidth * dpr;
    canvas.height = canvas.parentElement.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // Draw Audio Waveform (Simulated tactical audio waveform spectrum matching screenshot)
  let phase = 0;
  function drawWaveform() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    const bottomY = h - 12;
    const barCount = 44;
    const barSpacing = w / barCount;
    const barWidth = Math.max(2.5, barSpacing * 0.55);

    phase += isPlaying ? 0.08 : 0.012;

    for (let i = 0; i < barCount; i++) {
      const x = i * barSpacing + (barSpacing - barWidth) / 2;

      // Base smooth landscape wave (two hills like in the screenshot)
      const normI = i / barCount;
      const hill1 = Math.sin(normI * Math.PI * 2 - 0.4);
      const hill2 = Math.sin(normI * Math.PI * 4);
      let baseShape = Math.max(0.08, 0.28 + 0.35 * hill1 + 0.15 * hill2);

      let magnitude = baseShape;
      if (isPlaying) {
        const dynamicWiggle = (Math.sin(phase * 2 + i * 0.4) * 0.5 + 0.5) * 0.5;
        magnitude = Math.min(0.9, baseShape * (0.6 + dynamicWiggle));
      } else {
        magnitude = baseShape * (0.85 + 0.15 * Math.sin(phase + i * 0.25));
      }

      const barH = Math.max(3, magnitude * (h - 24));
      const topY = bottomY - barH;

      const isPastProgress = audio.duration ? (i / barCount) <= (audio.currentTime / audio.duration) : false;
      ctx.fillStyle = isPastProgress
        ? '#d4ff3f'
        : (isPlaying ? 'rgba(212, 255, 63, 0.7)' : 'rgba(212, 255, 63, 0.38)');

      ctx.fillRect(x, topY, barWidth, barH);
    }

    animFrameId = requestAnimationFrame(drawWaveform);
  }

  drawWaveform();

  // Play / Pause Logic
  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => {
        isPlaying = true;
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        playBtnText.innerText = 'PAUSE DISPATCH';
        if (statusDisplay) statusDisplay.innerText = 'TRANSMITTING';
      }).catch(err => {
        console.warn('Audio playback error:', err);
      });
    } else {
      audio.pause();
      isPlaying = false;
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      playBtnText.innerText = 'PLAY DISPATCH';
      if (statusDisplay) statusDisplay.innerText = 'PAUSED';
    }
  });

  // Time & Progress Updates
  audio.addEventListener('timeupdate', () => {
    const cur = audio.currentTime;
    const dur = audio.duration || 7;
    if (timeDisplay) timeDisplay.innerText = `${formatTime(cur)} / ${formatTime(dur)}`;

    if (dur > 0) {
      const pct = (cur / dur) * 100;
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (progressHandle) progressHandle.style.left = `${pct}%`;
    }
  });

  audio.addEventListener('loadedmetadata', () => {
    if (timeDisplay) timeDisplay.innerText = `00:00 / ${formatTime(audio.duration)}`;
  });

  audio.addEventListener('ended', () => {
    isPlaying = false;
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    playBtnText.innerText = 'PLAY DISPATCH';
    if (statusDisplay) statusDisplay.innerText = 'TRANSMISSION COMPLETE';
    if (progressBar) progressBar.style.width = '0%';
    if (progressHandle) progressHandle.style.left = '0%';
  });

  // Volume slider interaction
  if (volTrack && volFill && volThumb && volText) {
    let isDraggingVol = false;

    function updateVolume(e) {
      const rect = volTrack.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      audio.volume = pct;
      volFill.style.width = `${pct * 100}%`;
      volThumb.style.left = `${pct * 100}%`;
      volText.innerText = `${Math.round(pct * 100)}%`;
    }

    volTrack.addEventListener('mousedown', (e) => {
      isDraggingVol = true;
      updateVolume(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDraggingVol) updateVolume(e);
    });

    window.addEventListener('mouseup', () => {
      isDraggingVol = false;
    });

    // Touch support
    volTrack.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) updateVolume(e.touches[0]);
    });
    volTrack.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) updateVolume(e.touches[0]);
    });
  }
})();

// -------------------------------------------------------------
// Tactical DATA CONDUIT Radar Canvas Engine
// -------------------------------------------------------------
(function initConduitRadar() {
  const canvas = document.getElementById('conduitRadarCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animId = null;

  function resizeRadar() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = 170 * dpr;
    canvas.height = 170 * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resizeRadar();
  window.addEventListener('resize', resizeRadar);

  let angle = 0;
  // Blips matching the screenshot positions
  const blips = [
    { dist: 0.58, angle: -0.85, baseAlpha: 0.9 }, // top-right green dot
    { dist: 0.68, angle: 2.35, baseAlpha: 0.75 }   // bottom-left small blip
  ];

  function drawRadar() {
    const w = 170;
    const h = 170;
    const cx = w / 2;
    const cy = h / 2;
    const r = w / 2 - 4;

    ctx.clearRect(0, 0, w, h);

    // Dark circular background
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#10150d';
    ctx.fill();
    ctx.clip();

    // Concentric grid circles
    const rings = [0.32, 0.62, 0.88, 1.0];
    rings.forEach((scale, idx) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
      if (idx === 1) {
        ctx.strokeStyle = 'rgba(212, 255, 63, 0.28)';
        ctx.setLineDash([3, 4]);
      } else {
        ctx.strokeStyle = 'rgba(212, 255, 63, 0.16)';
        ctx.setLineDash([]);
      }
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Crosshairs
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(212, 255, 63, 0.18)';
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx, cy + r);
    ctx.stroke();

    // Radar Sweep Pie Cone
    angle += 0.024;
    if (angle > Math.PI * 2) angle -= Math.PI * 2;

    const sweepAngle = 0.55; // ~32 degrees sweep
    const startA = angle - sweepAngle;
    const endA = angle;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startA, endA);
    ctx.closePath();

    const sweepGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, r);
    sweepGrad.addColorStop(0, 'rgba(212, 255, 63, 0.35)');
    sweepGrad.addColorStop(0.8, 'rgba(212, 255, 63, 0.18)');
    sweepGrad.addColorStop(1, 'rgba(212, 255, 63, 0.02)');
    ctx.fillStyle = sweepGrad;
    ctx.fill();

    // Leading sweep line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(endA) * r, cy + Math.sin(endA) * r);
    ctx.strokeStyle = '#d4ff3f';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Draw Blips with fade glow
    blips.forEach(b => {
      const bx = cx + Math.cos(b.angle) * (r * b.dist);
      const by = cy + Math.sin(b.angle) * (r * b.dist);

      let diff = angle - b.angle;
      while (diff < 0) diff += Math.PI * 2;
      while (diff > Math.PI * 2) diff -= Math.PI * 2;

      let alpha = 0.35;
      if (diff < 1.0) {
        alpha = 1.0 - diff * 0.65;
      }

      ctx.beginPath();
      ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 255, 63, ${alpha})`;
      ctx.shadowColor = '#d4ff3f';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Center pivot point
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#d4ff3f';
    ctx.shadowColor = '#d4ff3f';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Outer border ring
    ctx.restore();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#27341e';
    ctx.lineWidth = 2;
    ctx.stroke();

    animId = requestAnimationFrame(drawRadar);
  }

  drawRadar();
})();

// -------------------------------------------------------------
// Source Code Inspection & DevTools Shield
// -------------------------------------------------------------
(function initSourceShield() {
  // 1. Block Context Menu (Right Click)
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  }, { capture: true });

  // 2. Block DevTools, View-Source, Save, and Print Shortcut Keys
  document.addEventListener('keydown', (e) => {
    const key = (e.key || '').toLowerCase();
    const keyCode = e.keyCode || e.which;

    // F12 (DevTools)
    if (key === 'f12' || keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I / Cmd+Option+I (Inspect Element)
    // Ctrl+Shift+J / Cmd+Option+J (Console)
    // Ctrl+Shift+C / Cmd+Option+C (Inspect DOM)
    // Ctrl+Shift+K / Cmd+Option+K (Firefox Console)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c', 'k'].includes(key)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U / Cmd+U (View Source)
    if ((e.ctrlKey || e.metaKey) && key === 'u') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S / Cmd+S (Save Page)
    if ((e.ctrlKey || e.metaKey) && key === 's') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+P / Cmd+P (Print Page)
    if ((e.ctrlKey || e.metaKey) && key === 'p') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 3. Disable Dragging of Images and Assets
  document.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
  }, { capture: true });

  // 4. In-console warning watermark
  try {
    const warningTitle = 'font-size: 20px; font-weight: bold; color: #d4ff3f; background: #10120d; padding: 6px 12px; border: 1px solid #d4ff3f; border-radius: 4px;';
    const warningBody = 'font-size: 12px; color: #ff5b49; font-weight: bold; margin-top: 4px;';
    console.log('%c// VOLDLINE SECURITY PROTOCOL //', warningTitle);
    console.log('%cUnauthorized inspection, scraping, or extraction of proprietary client resources is strictly restricted.', warningBody);
  } catch (err) { }
})();
