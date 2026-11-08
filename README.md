# VOLDLINE — Advanced Counter-Strike 2 Tactical Companion

> **Notice:** This repository contains the official frontend web source for **VOLDLINE**. All designs, scripts, interactive modules, and multimedia assets are proprietary. Cloning, mirroring, redistributing, or rehosting this project for public or commercial purposes is strictly prohibited.

---

## Overview

**VOLDLINE** is a responsive, high-performance, dark-mode web portal engineered for Counter-Strike 2 players. Built without bloated frameworks, the site delivers a cinematic tactical experience powered by vanilla HTML5, modern CSS3, and native ECMAScript.

---

## Key Features

- **Boot Sequence Splash Screen**: Interactive cyber lock-on targeting minigame with noise-decoded typography and session storage controls.
- **Dynamic Release Engine**: Automatically syncs software versions, binary file sizes, and direct downloads via the GitHub Releases API.
- **3D Isometric Map Visualizer**: Interactive canvas-rendered tactical overview of Dust II with draggable blips, depth projection, and live tagging.
- **Interactive Feature Simulator**: Live HUD preview console showcasing customizable ESP boxes, snaplines, smooth aim assist indicators, and in-game menu overlays.
- **Tactical Audio Decryption Player**: Integrated voice log transmitter with custom audio waveform visualizer and volume calibration.
- **Real-Time Conduit Radar**: Multi-ring tactical radar scope complete with sweep-cone rendering and distance-faded blip targets.
- **Defense-in-Depth Security**: Strict Content Security Policy (CSP), anti-clickjacking protection, safe DOM text node construction, and anti-scraping inspection shields.

---

## Architecture & Technology Stack

| Component | Implementation |
|---|---|
| **Markup** | Semantic HTML5, Schema.org JSON-LD Structured Data |
| **Styling** | Vanilla CSS3 (Custom Properties, Grid, Flexbox, Glassmorphism) |
| **Scripting** | Modern ECMAScript (ES2022+), Canvas 2D API |
| **Audio** | HTML5 Audio API & dynamic synthesized frequency spectrum |
| **Typography** | Barlow Condensed, DM Mono, Manrope |
| **Security** | Zero external runtimes, CSP, HSTS, no-referrer outgoing anchors |

---

## File Structure

```text
├── index.html            # Main tactical homepage & interactive consoles
├── versions.html         # Live release changelogs synced with GitHub
├── style.css             # Unified styling, animations, responsive layouts
├── script.js             # Canvas renderers, audio player, dynamic API sync
├── compatibility.json    # CS2 build verification configuration
├── voice/                # Tactical voice transmission audio assets
├── images/               # Media graphics and multi-resolution icons
│   └── icon/             # Multi-size favicons and touch icons
├── sitemap.xml           # Search engine indexing map
├── robots.txt            # Search crawler directives
├── _headers              # Cloudflare Pages / Netlify security header rules
├── .htaccess             # Apache / LiteSpeed server protection
├── SECURITY.md           # Security policy and disclosure protocols
└── SECURITY_AUDIT.md     # OWASP ASVS verification audit report
```

---

## Legal & Intellectual Property

- **Proprietary Software**: All rights reserved. Do not copy, scrape, or republish the code or graphical assets found in this repository.
- **Disclaimer**: Counter-Strike 2, Valve, and Steam are registered trademarks of Valve Corporation. This project is an independent utility and is not affiliated with, endorsed by, or sponsored by Valve Corporation.
