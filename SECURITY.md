# VOLDLINE Security Policy & Architecture

## Overview
This document details the security posture, controls, policies, and practices implemented across the **VOLDLINE** web application.

---

## 1. Architecture & Threat Model

- **Architecture:** Client-side static single-page application (HTML5, Vanilla CSS3, Native ECMAScript).
- **Backend / Database:** None. Static client execution without persistent user sessions or private databases.
- **Third-Party Integrations:**
  - **GitHub Releases REST API** (`https://api.github.com/repos/AI-Dev-Forge/VOLDLINE/releases`): Read-only public release queries. No private credentials or personal access tokens are stored or exposed.
  - **GitHub Raw Content** (`https://raw.githubusercontent.com/AI-Dev-Forge/VOLDLINE-WEB/refs/heads/main/compatibility.json`): Read-only status verification fallback.
  - **Google Fonts CDN** (`https://fonts.googleapis.com`, `https://fonts.gstatic.com`): Static font typography delivery.
- **Assets:** Local static assets including Direct3D simulator scripts and tactical audio log dispatch (`voice/note.mp3`).

---

## 2. Implemented Security Controls

### 2.1 Defense-in-Depth HTTP Security Headers
Configured across:
1. In-document `<meta http-equiv="...">` tags (`index.html`, `versions.html`).
2. Cloudflare Pages / Netlify `_headers` definition.
3. Apache / LiteSpeed web server `.htaccess` directives.

| Header | Configured Value | Protection Goal |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; media-src 'self' blob:; connect-src 'self' https://api.github.com https://raw.githubusercontent.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';` | Eliminates unauthorized script injection, object embedding, and clickjacking |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Enforces modern HTTPS-only communication and prevents SSL stripping |
| `X-Content-Type-Options` | `nosniff` | Blocks MIME-type sniffing attacks |
| `X-Frame-Options` | `DENY` | Prevents framing and Clickjacking attacks |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Protects visitor navigation privacy |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` | Disables invasive browser sensors and APIs |

### 2.2 XSS Prevention & DOM Sanitization
- Dynamic responses fetched from external APIs (such as release tag names, descriptions, and changelogs) are strictly escaped via `escapeHtml()` prior to DOM injection.
- Replaced dangerous unescaped string interpolations with safe `textContent` DOM setters and whitelisted element creation.
- Markdown release bodies undergo entity escaping before converting markdown subheadings and list bullets.

### 2.3 URL Sanitization & Reverse Tabnabbing Defense
- All dynamic outgoing URLs are validated via `sanitizeUrl()`. Only whitelisted GitHub endpoints are permitted (`https://github.com/` and `https://raw.githubusercontent.com/`).
- Dynamic and static external links (`target="_blank"`) enforce `rel="noopener noreferrer"` to prevent window opener hijacking.

### 2.4 DoS & Resource Exhaustion Protection
- Dynamic external API fetch requests (`fetchGitHubReleases`, `checkCompatibility`) utilize `AbortController` timeouts (4 to 8 seconds) to prevent unbounded memory leaks and hanging network sockets.
- Cache busting query parameters prevent stale lockouts.

### 2.5 Information Disclosure Mitigation
- Console debugging logs and stack traces are suppressed in production runtime.
- Added comprehensive `.gitignore` preventing `.env`, private keys (`.pem`, `.key`), and build artifacts from ever being committed.
- Web server `.htaccess` explicitly restricts access to hidden files (`.git`, `.env`) and disables directory listing (`Options -Indexes`).

---

## 3. Secret Management
- **No private keys, tokens, or credentials are used or embedded in this project.**
- Should backend services or authenticated APIs be added in future iterations:
  1. Store all secrets in host environment variables (`process.env`).
  2. Never commit secrets into Git repositories.
  3. Route requests through a secure serverless backend proxy.

---

## 4. Vulnerability Disclosure Policy
If you discover a security vulnerability within this project, please report it responsibly:
- **Repository Issues / Security Advisories:** Submit a private security advisory through the GitHub repository.
- Please allow up to 48 hours for an initial response before public disclosure.

