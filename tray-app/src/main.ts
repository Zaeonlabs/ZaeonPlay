/**
 * StreamPlugins Tray App
 *
 * Standalone system tray application that runs the StreamPlugins server
 * independently of OBS Studio. Users add localhost URLs as Browser Docks
 * or Browser Sources manually.
 *
 * TODO: Implement system tray icon and menu using a lightweight tray library
 * (e.g., systray2, node-systray, or Electron for full tray support).
 *
 * Tray menu items:
 * - Open Dashboard (opens http://localhost:3847/ in default browser)
 * - Start / Stop Server
 * - Copy OBS URLs (submenu with each plugin URL for easy pasting)
 * - Settings
 * - Quit
 */

console.log('[StreamPlugins Tray] Starting...');
console.log('[StreamPlugins Tray] TODO: Implement tray icon and server management');
console.log('[StreamPlugins Tray] For now, run the server directly: npm run dev --workspace=server');
