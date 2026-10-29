# Deploying v1.0 mock guide fix from an iPhone

This patch is a new website + Worker version. It cannot change a live GitHub Pages site or Worker until its files are committed and deployed.

1. In the GitHub repository `ry778kww2m-afk/Sonic-companion`, replace the existing root `index.html`, `guide-data.js`, `sw.js`, manifest and icon files with those in this ZIP and commit the changes. Keep unrelated repository files unless they conflict with a same-named file in this package.
2. Update the Cloudflare Worker `sonic-companion-research` using the included root `index.js` (the worker entrypoint), then deploy. `research-worker/index.js` is also included as a project copy.
3. Open GitHub Pages and refresh the page. If the old static guide still appears, close the tab and reopen the site so the new `index.html` and service worker can be fetched. The HTML includes build marker `v1.0-auto-mock-guide-render`.
4. Search for a track and tap its result once. A mock guide request now runs automatically; there should be a status under the Research card and the full returned guide in the Listening guides card.

The app forces `mode=mock`, even if a saved endpoint was previously only a base URL. No OpenAI key/credits are used. The contents are prewritten fixtures and are not live-researched or source-verified.
