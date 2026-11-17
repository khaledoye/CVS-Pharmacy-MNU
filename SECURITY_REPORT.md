# Security Report — CVS-Pharmacy-MNU

Scope: the static educational site in this repository, deployed to GitHub Pages
(`https://khaledoye.github.io/CVS-Pharmacy-MNU/`). Audit date: 2026-11-17.
Non-destructive review of the real code only; no intrusive testing against the live site.

## 1. What this application is (sets the realistic threat model)

A **100% client-side static site**: HTML, CSS, vanilla JS, local Three.js, local fonts.
There is **no server, no database, no backend, no API keys, no user accounts, no secrets**.
Whole classes of vulnerability therefore do not apply: SQL injection, server-side RCE,
auth bypass, SSRF, insecure direct object references, server misconfig. They are marked
N/A below rather than padded into findings.

## 2. Audit findings

### Confirmed — clean (verified by reading the code, not pattern-matching)
| Area | Result |
|---|---|
| Secrets / API keys / tokens | **None present.** Full-tree scan of JS/HTML/CSS/MD found nothing. |
| `eval` / `new Function` / `document.write` | **None.** No dynamic code execution. |
| DOM XSS sinks | `innerHTML` is used **only** to clear nodes (`= ''`) or with static strings. All dynamic text is rendered through `document.createTextNode` via the `h()` helper. The `html:` attribute path of `h()` is **never called with dynamic data**. |
| Search box (only free user input) | User text is used solely in `String.includes()` for filtering; results are built with text nodes. **Not reflected into HTML.** |
| `location.hash` routing | Hash is sliced and matched against a fixed map of section ids; never written to the DOM. No open-redirect, no injection. |
| `localStorage` | Stores only the user's own progress/sim settings; read back inside `try/catch` with `JSON.parse`. Same-origin only. |
| Third-party scripts | **None.** Three.js r128 and OrbitControls are MIT-licensed and **self-hosted** in `/lib`. No CDN, no remote `<script>`. |
| Transport | GitHub Pages serves **HTTPS** and sets HSTS on `*.github.io`. |

### Fixed in this change
| # | Issue | Severity | Fix |
|---|---|---|---|
| 1 | No Content-Security-Policy; a single injected/compromised asset could load anything. | Medium | Strict CSP added via `<meta http-equiv>`: `default-src 'self'`, `script-src 'self'`, `style-src 'self'`, `img-src 'self' data:`, `font-src 'self'`, `connect-src 'self'`, `object-src 'none'`, `base-uri 'none'`, `form-action 'none'`, `upgrade-insecure-requests`. |
| 2 | Fonts loaded from `fonts.googleapis.com` / `fonts.gstatic.com` — a third-party origin and a privacy leak (visitor IPs to Google). | Low/Med | **Fonts self-hosted** (`assets/fonts`, woff2 subsets). External origin removed, so CSP can be locked to `'self'`. |
| 3 | Inline `<script>App.boot()</script>` forced `script-src` to allow inline code. | Medium | Moved to `js/boot.js`; CSP needs no `'unsafe-inline'` for scripts. |
| 4 | Inline `style="…"` on the footer forced `style-src` to allow inline styles. | Low | Moved to a `.foot` CSS rule; no `'unsafe-inline'` for styles. |
| 5 | `referrer` not constrained. | Low | `<meta name="referrer" content="no-referrer">`. |
| 6 | Clickjacking: GitHub Pages cannot send `X-Frame-Options`, and `frame-ancestors` is ignored inside a `<meta>` CSP. | Low | JS frame-breaker in `boot.js` (breaks out of foreign-origin frames). Partial — see residual risk. |

### Not applicable
Server-side vulns, dependency CVEs from a package manager (no runtime npm deps shipped),
GitHub Actions/pipeline vulns (**no workflows** — Pages builds from branch directly).

## 3. Residual risks (honest)
- **Clickjacking is not fully closed.** No hosting-level `X-Frame-Options` is possible on
  GitHub Pages. The JS frame-breaker stops ordinary framing but a `sandbox`-ed iframe can
  suppress the break-out. Full fix requires a reverse proxy (e.g. Cloudflare) that adds the
  header — see Source-Protection Assessment.
- **CSP is meta-delivered**, so directives that only work as real HTTP headers
  (`frame-ancestors`, reporting) are unavailable. The resource-loading directives above
  **do** take effect from meta.
- **All client code remains readable.** See below — this is inherent, not a bug.

## 4. Source-Protection Assessment (the "code theft" objective)

Plain truth, stated as the brief requires: **browser-delivered code cannot be made secret,
and this repository is currently public.** Anyone can read the full, commented source in the
repo and in DevTools. What is realistic:

| Asset | Can it be hidden? | Lever |
|---|---|---|
| Full source + git history | Not while the **repo is public**. | Make the repo **private** — but GitHub Pages on a private repo needs a **paid plan** (GitHub Pro) for a personal account; on the free plan you'd lose the free `github.io` URL. **Not changed without your approval.** |
| Browser-delivered JS | **No.** Delivered to run = readable. | Minification + obfuscation only **raise effort**; they never make it secret. Pointless while the repo is public (the clean source sits right there). |
| Proprietary models (`models.js`, `content.js`, `quiz.js`) | Only by **not shipping them**. | Move the simulation math to a server (e.g. a Cloudflare Worker) that returns sampled points, not formulas. Real confidentiality, but adds latency, a runtime dependency, breaks offline use, and is an architecture change. Described, **not implemented**. |
| Three.js / OrbitControls | N/A (already public MIT libraries). | Keep self-hosted. |

**Recommendation:** obfuscation now buys nothing. The only change that materially protects
the source is repo-private (paid) and/or server-side execution of the models. If you decide
to go private, I can then add a reversible minified `dist/` build and, if you want, move the
model math behind a Worker. A copyright/licence header + `LICENSE` file is the cheapest
deterrent against reuse and is recommended regardless.

## 5. Testing evidence
- Model tests: **99/99 pass** after changes (`tests/test-models.js`).
- UI tests: **110/110 pass** (`tests/test-ui.js`).
- Under an HTTP server with the CSP enforced (desktop 1366px + mobile 390px):
  **0 CSP violations, 0 JS errors**, no horizontal overflow on any of the 13 modules.
- Canvases verified painting under CSP: AP (2D) painted, ECG (7 canvases) painted,
  3D anatomy WebGL canvas present and initialised.
- Self-hosted fonts confirmed loaded (`document.fonts.check` true for Cairo 700 and Inter 400).

## 6. What a visitor can still do (do not over-claim)
Open DevTools and read every line of HTML/CSS/JS, copy the simulation logic, clone the
GitHub repo, and run a local copy. The CSP and self-hosting protect **visitors** (and the
page's integrity); they do **not** hide the code. No change here makes the app impossible to
copy or "hack-proof," and none is claimed.
