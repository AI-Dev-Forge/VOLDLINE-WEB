const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

const targetSection = `    <!-- CHEAT Codebase Architecture & Technical Features -->
    <section class="cheat-features section-pad" id="architecture">
      <div class="section-heading reveal">
        <div>
          <h2>VOLD LINE<br><em>CORE ARCHITECTURE.</em></h2>
        </div>
        <p class="section-intro">Engineered in modern C++20 with a DirectX 11 transparent overlay, humanized aim assist
          math, dynamic memory offsets, and real-time GitHub auto-update daemon.</p>
      </div>

      <div class="cheat-specs-grid">`;

// Find where <section class="cheat-features section-pad" id="architecture"> starts and where it ends
const startIdx = html.indexOf('<section class="cheat-features section-pad" id="architecture">');
const endMarker = '</section>';
const endIdx = html.indexOf(endMarker, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.error("Couldn't find section start or end");
  process.exit(1);
}

const sectionContentToReplace = html.substring(startIdx, endIdx + endMarker.length);

const newSection = `<section class="cheat-features section-pad" id="architecture">
      <div class="section-heading reveal">
        <div>
          <p class="eyebrow"><span class="eyebrow-line"></span> 04 / LIVE WEAPONS &amp; RADAR SYSTEM</p>
          <h2>VOLD LINE<br><em>CORE SUITE.</em></h2>
        </div>
        <p class="section-intro">Experience every feature in real-time. Click any capability on the left console to test drive its live tactical overlay and targeting view.</p>
      </div>

      <!-- TACTICAL INTERACTIVE HUD CONSOLE -->
      <div class="tactical-console reveal">
        <!-- Console Left: Feature Navigation Selector -->
        <div class="console-nav-panel">
          <div class="console-panel-header mono">
            <span class="console-tag">// MODULE_SELECT</span>
            <div class="console-status-led">
              <span class="led-dot"></span>
              <span>LIVE_FEED</span>
            </div>
          </div>
          <div class="console-items-list" role="tablist">
            <!-- Item 1 -->
            <button class="console-nav-item active" data-feature="aim" type="button">
              <span class="nav-idx mono">01</span>
              <div class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3v3m0 12v3M3 12h3m12 0h3" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                </svg>
              </div>
              <div class="nav-info">
                <span class="nav-title">Smart Aim Helper</span>
                <span class="nav-sub">AIM ASSIST // FOV CIRCLE</span>
              </div>
            </button>

            <!-- Item 2 -->
            <button class="console-nav-item" data-feature="boxes" type="button">
              <span class="nav-idx mono">02</span>
              <div class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <div class="nav-info">
                <span class="nav-title">Enemy Outlines</span>
                <span class="nav-sub">ESP BOXES // CORNER 2D</span>
              </div>
            </button>

            <!-- Item 3 -->
            <button class="console-nav-item" data-feature="health" type="button">
              <span class="nav-idx mono">03</span>
              <div class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <div class="nav-info">
                <span class="nav-title">Health &amp; Status Tags</span>
                <span class="nav-sub">HP BAR // HEAD INDICATOR</span>
              </div>
            </button>

            <!-- Item 4 -->
            <button class="console-nav-item" data-feature="tracers" type="button">
              <span class="nav-idx mono">04</span>
              <div class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
              <div class="nav-info">
                <span class="nav-title">Target Tracers</span>
                <span class="nav-sub">SNAPLINES // DISTANCE TRACK</span>
              </div>
            </button>

            <!-- Item 5 -->
            <button class="console-nav-item" data-feature="crosshair" type="button">
              <span class="nav-idx mono">05</span>
              <div class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="7" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                </svg>
              </div>
              <div class="nav-info">
                <span class="nav-title">Custom Crosshairs</span>
                <span class="nav-sub">RETICLES // NO-SCOPE PRO</span>
              </div>
            </button>

            <!-- Item 6 -->
            <button class="console-nav-item" data-feature="menu" type="button">
              <span class="nav-idx mono">06</span>
              <div class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h8M6 16h12" />
                </svg>
              </div>
              <div class="nav-info">
                <span class="nav-title">In-Game Menu &amp; Keys</span>
                <span class="nav-sub">PRESS INSERT // REALTIME</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Console Right: Interactive Live Tactical Display Stage -->
        <div class="console-display-stage">
          <div class="console-stage-header">
            <div class="stage-title-wrap">
              <span class="stage-core-badge mono" id="stageBadge">CORE / 001</span>
              <h3 class="stage-main-title" id="stageTitle">Smart Aim Helper</h3>
            </div>
            <span class="stage-badge-pill mono" id="stageCategory">AIM ASSIST</span>
          </div>

          <!-- Dynamic Live HUD Simulation Viewport -->
          <div class="stage-hud-viewport" id="stageViewport">
            <div class="stage-scanline"></div>
            
            <!-- Tracer SVG -->
            <svg class="hud-tracer-svg" id="hudTracerSvg" viewBox="0 0 500 280" preserveAspectRatio="none">
              <line id="hudTracerLine" class="hud-tracer-line" x1="250" y1="280" x2="310" y2="120" />
            </svg>

            <!-- FOV Circle -->
            <div class="hud-fov-circle" id="hudFovCircle"></div>

            <!-- Center Crosshair -->
            <div class="hud-center-crosshair" id="hudCenterCrosshair">
              <div class="cross-line-h"></div>
              <div class="cross-line-v"></div>
              <div class="cross-center-dot"></div>
            </div>

            <!-- Target Dummy Model -->
            <div class="hud-target-dummy" id="hudTargetDummy" style="transform: translate(60px, 0px);">
              <div class="target-model-box">
                <!-- Head -->
                <div class="target-head">
                  <div class="hud-head-dot" id="hudHeadDot"></div>
                </div>
                <!-- Torso -->
                <div class="target-torso"></div>
                <!-- Legs -->
                <div class="target-legs">
                  <span></span><span></span>
                </div>

                <!-- Overlays -->
                <div class="hud-esp-box" id="hudEspBox"></div>
                <div class="hud-health-bar-side" id="hudHealthBar">
                  <div class="hud-health-fill" id="hudHealthFill"></div>
                </div>
                <div class="hud-tag-hp mono" id="hudHpTag">100 HP // DUST II</div>
              </div>
            </div>

            <!-- In-game Menu Floating Mockup -->
            <div class="hud-menu-window" id="hudMenuWindow" style="display: none;">
              <div class="menu-win-titlebar mono">
                <span>VOLD LINE // SETTINGS [INSERT]</span>
                <span>v1.0.2</span>
              </div>
              <div class="menu-win-row">
                <span>Aimbot Smoothing</span>
                <span style="color: var(--accent); font-weight: bold;">4.2x (Soft)</span>
              </div>
              <div class="menu-win-row">
                <span>Enemy ESP Boxes</span>
                <div class="menu-win-toggle"></div>
              </div>
              <div class="menu-win-row">
                <span>Health Numbers</span>
                <div class="menu-win-toggle"></div>
              </div>
              <div class="menu-win-row">
                <span>Target Snaplines</span>
                <div class="menu-win-toggle"></div>
              </div>
            </div>
          </div>

          <!-- Bottom Description & Tactical Metrics -->
          <div class="console-details-wrap">
            <p class="stage-desc-text" id="stageDesc">
              Automatically moves your aim toward the nearest enemy smoothly and naturally. You control how wide it reaches and how fast it kicks in. Hold left-click to activate it only when you're shooting.
            </p>

            <div class="stage-metrics-row">
              <div class="metric-pill">
                <span class="metric-label" id="metric1Label">FEATURE TYPE</span>
                <span class="metric-val mono" id="metric1Val">SMOOTH TARGETING</span>
              </div>
              <div class="metric-pill">
                <span class="metric-label" id="metric2Label">ACTIVATION METHOD</span>
                <span class="metric-val mono" id="metric2Val">HOLD LEFT-CLICK</span>
              </div>
              <div class="metric-pill">
                <span class="metric-label" id="metric3Label">LATENCY IMPACT</span>
                <span class="metric-val mono" id="metric3Val">0.00 MS ZERO DELAY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`;

html = html.replace(sectionContentToReplace, newSection);
fs.writeFileSync(filePath, html, 'utf8');
console.log('Successfully replaced old architecture cards section with Tactical HUD Console!');

