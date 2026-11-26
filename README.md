# Poker Table Tracker — Premium Edition

An offline-first, mobile-oriented live poker notes app. No account, backend, API, analytics, dependencies or build step. Portuguese UI, three themes (Midnight Blue, Dark and Light), responsive tablet/desktop/mobile layout. All data is stored in the browser using localStorage.

## Run locally
Unzip the project and open `index.html` in a modern browser. Keep the files together. For reliable browser storage and service worker support, use a local server instead:

```sh
python -m http.server 8080
```

Open http://localhost:8080. Direct `file://` storage behavior varies by browser; back up before switching origin, browser or device.

## Netlify / GitHub
- Netlify Drop: drag the extracted project directory into the deploy page.
- GitHub: upload the contents of the project directory (not the ZIP) into the repository root. Connect the repository in Netlify. Use the main branch, leave the base directory and build command blank, and set the publish directory to `.`. Configuration is included in `netlify.toml`. No framework preset is needed.
- No npm install, secrets or environment variables needed.
- Open the deployed URL online once and allow the initial page load and service-worker installation to complete. Then the cached app is available offline. Reload once and verify offline access before relying on it during play. On iPhone, open in Safari and use Share > Add to Home Screen. On compatible browsers, use the browser's Install option.

## Customization
Settings contains editable tag and emoji lists. Add, rename, remove or restore defaults. Renaming updates existing players; removing an option preserves existing assignments. Casinos can be added, renamed or removed from the active list, with saved profile counts. Removed casinos retain their historical player associations and can be restored. All custom options and archived casinos are included in full JSON backups. Older backups without these fields load the default choices.

## Data
Tap a seat to edit a player. Named players are saved as reusable profiles. Use the profile's Apply action to assign to a seat. Quick removal and clearing the table do not delete profiles. Quick seat removal can be undone for six seconds. Switching seat count keeps out-of-range players until you switch back or clear the table. Notes and grind intentions save automatically. Hero and theme also persist.

Backup JSON exports either all data (including table, preferences, profiles, casinos, notes and intentions) or the old compatible profile array. Import of profile arrays merges by case-insensitive nickname; full backups replace all data after confirmation. The app reads old `tt_*` localStorage keys if present on the same browser origin and no new storage exists. To move from Base44's domain, export profiles there and import here; browser storage cannot be read across domains.

Local data is not encrypted or synchronized. Deleting browser/site data can remove it. Keep JSON backups privately and do not commit them to GitHub. Some poker rooms restrict electronic assistance or note-taking at the table; follow local rules.

## Files
- `index.html`: UI and dialogs
- `styles.css`: layout and themes
- `storage.js`: data schema, legacy migration, local save and JSON parsing
- `app.js`: UI, player/profile editing and backups
- `sw.js`, `manifest.webmanifest`, icons: offline installation
- `netlify.toml`: deploy config
- `DESIGN.md`: original visual system and design references
- `.nojekyll`: optional GitHub Pages static hosting support
- `.gitignore`: helps avoid committing personal JSON backups

When changing cached assets, increment the cache version in `sw.js`.
