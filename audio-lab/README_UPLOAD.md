# Add the prototype to the existing GitHub Pages site without replacing the app

The standalone page embeds its own mock catalogue and does not need a Worker or separate data file to run.

1. Keep the existing root `index.html` untouched.
2. Add this prototype as `audio-lab/index.html` in the repository (a new folder path).
3. Commit the new file.
4. Open the GitHub Pages URL with `/audio-lab/` appended.

This is a separate prototype route. It does not change the current Sonic Companion app or the research Worker. The file-analysis mode only processes local user-selected audio in the browser. Do not point the route at Spotify audio.

For iPhone testing, use the hosted HTTPS route rather than relying on opening a local HTML file from Files. Physical iOS Safari validation has not yet been performed.
