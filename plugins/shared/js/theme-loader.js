/**
 * StreamPlugins Theme Loader
 *
 * Include this script in every plugin page BEFORE other scripts.
 * It applies the saved theme instantly (no flicker) and keeps all
 * open docks / overlays in sync via the WebSocket event bus.
 */

(function () {
  const STORAGE_KEY = 'sp-theme';
  const DEFAULT_THEME = 'dark';

  function applyTheme(name) {
    if (!name || name === 'dark') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', name);
    }
    try { localStorage.setItem(STORAGE_KEY, name); } catch (_) { /* incognito */ }
  }

  // Instant paint from localStorage to prevent a flash of wrong theme
  applyTheme(localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME);

  // Once the API is available, confirm the theme from the server config
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      if (typeof StreamPluginsAPI !== 'undefined') {
        const cfg = await StreamPluginsAPI.getConfig();
        if (cfg && cfg.theme) applyTheme(cfg.theme);
      }
    } catch (_) { /* server not running yet */ }
  });

  // Real-time sync: when any dock changes the theme, all others follow
  if (typeof spWebSocket !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      spWebSocket.on('theme-changed', (payload) => {
        if (payload && payload.theme) applyTheme(payload.theme);
      });
    });
  }

  // Expose so plugins can call setTheme() directly
  window.StreamPluginsTheme = {
    apply: applyTheme,
    get current() { return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME; },
  };
})();
