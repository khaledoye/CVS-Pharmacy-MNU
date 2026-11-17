/* CVS-Pharmacy-MNU — © 2026 Khaled Osama Yaseen. All rights reserved.
 * Faculty of Pharmacy, Mansoura National University. Proprietary — not licensed
 * for reuse, copying, modification, or redistribution. See LICENSE. */
/* Boot file. Kept separate so index.html carries no inline script,
   which lets the Content-Security-Policy use script-src 'self'. */

/* Clickjacking defence-in-depth. GitHub Pages cannot send X-Frame-Options
   or an enforced frame-ancestors header, so if this page is framed by a
   foreign origin we refuse to render and break out. Not absolute (a
   sandboxed iframe can suppress the navigation) but it stops ordinary
   UI-redress framing. */
(function () {
  try {
    if (window.top !== window.self) {
      var sameOrigin = false;
      try { sameOrigin = (window.top.location.origin === window.self.location.origin); } catch (e) { sameOrigin = false; }
      if (!sameOrigin) {
        document.documentElement.style.display = 'none';
        window.top.location = window.self.location.href;
        return;
      }
    }
  } catch (e) { /* ignore */ }
  App.boot();
})();