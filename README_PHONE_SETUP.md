# Sonic Companion — free iPhone test (no Mac, no $99 membership)

This is a static Progressive Web App (PWA). It runs in Safari and can be added to the iPhone Home Screen. It is NOT a native signed iOS application. No Apple Developer membership or payment is required.

## What works
- The demo timeline automatically advances through 25 Rachmaninoff sections and updates the listening note, so you can test the experience without an audio file.
- You can load audio files available in Files. Playback is controlled by this page, so the companion follows the actual player clock and changes the guide automatically.
- In multiple-file mode, select all section files available to you; the page can play them in a queue.
- The interface, notes, and icons are cached for repeat visits after first load.
- No audio is uploaded by this app.

## Important limit
A web app on iOS cannot read the live playback position of Qobuz, TIDAL, or Spotify simply because the song is playing on the same phone. Their offline downloads are normally not regular audio files that can be selected here. This no-cost version synchronizes with audio played by its own player, or runs a clearly-labelled simulated demo. It does not claim streaming-service integration.

## Publish free from your iPhone using GitHub Pages
GitHub Pages is free for public repositories. The repository will contain only this app's code; do not add personal audio files.

1. Download and unzip `SonicCompanion_Free_PWA.zip` using the iPhone Files app.
2. In Safari, sign in to GitHub or create a free account at https://github.com.
3. Create a **Public** repository named `sonic-companion` at https://github.com/new.
4. On the empty repository page, choose **uploading an existing file** (or **Add file → Upload files**).
5. Upload these six files from the unzipped folder: `index.html`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`, and `apple-touch-icon.png`. Commit them to `main`.
6. In the repository, open **Settings → Pages**. Under **Build and deployment**, select **Deploy from a branch**, choose branch `main` and folder `/(root)`, then Save.
7. Wait for the Pages deployment to finish. GitHub shows the site URL in Settings → Pages. It will look like `https://YOUR-USERNAME.github.io/sonic-companion/`.
8. Open that URL in Safari (not the ChatGPT attachment preview) and tap **Start demo timeline** to test the auto-changing guide immediately.
9. To add it like an app: tap Safari's **Share** button → **Add to Home Screen** → enable **Open as Web App** if shown → **Add**. Apple's instructions: https://support.apple.com/en-us/guide/iphone/iphea86e5236/ios

## Using real audio
- Set **Playback format** to `Multiple files — all 25 sections in order` and select the local audio files you have permission to use. Use normal audio files from Files, not the streaming service's encrypted offline cache.
- Or choose `One continuous file — complete Rhapsody` and load one complete file. The long-form timeline is estimated proportionally across that file, so the exact boundaries may differ by recording/edit.
- The passage guide and analyses are bundled with the app; they do not need to be generated while the music is playing.

## Browser compatibility
Use Safari over HTTPS. This package is designed to avoid reliance on ChatGPT's local-file preview, which may display HTML while blocking page JavaScript.
