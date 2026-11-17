# Deployment & rollback — CVS-Pharmacy-MNU

Static site, deployed by GitHub Pages from the `main` branch root. No build step.

## Deploy
1. `git add -A && git commit -m "…"` then `git push origin main`.
2. GitHub Pages rebuilds automatically (≈1–2 min).
3. Hard-refresh (Ctrl/Cmd+Shift+R). Asset `?v=` query bumps already force fresh CSS/JS.

## Verify after deploy
- Open the live URL; confirm the 13 modules, ECG/AP canvases, 3D heart, quizzes.
- DevTools → Console: no CSP violations, no errors.
- DevTools → Network: fonts load from `assets/fonts/…` (not fonts.gstatic.com).

## Rollback
- `git revert <commit>` then push — safest, keeps history.
- Or reset to the previous good commit on a branch and force-push only if you understand the
  consequences. Previous good commit before this hardening: run `git log --oneline` and pick
  the commit tagged before "security hardening".

## If you later make the repo private
GitHub Pages on a private repo requires GitHub Pro (paid) for a personal account. If you
upgrade, Pages keeps working and the URL is unchanged. On the free plan, keep the repo public
or move hosting (e.g. Cloudflare Pages) — ask me and I'll walk through it.
