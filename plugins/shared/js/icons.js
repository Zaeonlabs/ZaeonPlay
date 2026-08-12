/**
 * StreamPlugins SVG Icon Library
 *
 * Usage:
 *   SPIcons.twitch()   → returns an SVG string
 *   SPIcons.inject(el, 'twitch')  → sets el.innerHTML to the SVG
 */

const SPIcons = (() => {
  const icons = {
    twitch: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none"><path d="M3.5 2L2 5.5V20h5v3h3l3-3h4l5-5V2H3.5Zm15 10.5L15 16h-4l-3 3v-3H4.5V4h14v8.5Z" fill="${color}"/><path d="M14 7.5v4M10.5 7.5v4" stroke="${color}" stroke-width="1.5"/></svg>`,

    youtube: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29.94 29.94 0 0 0 1 12a29.94 29.94 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29.94 29.94 0 0 0 23 12a29.94 29.94 0 0 0-.46-5.58Z" fill="${color}"/><path d="m9.75 15.02 5.75-3.27-5.75-3.27v6.54Z" fill="${color === 'currentColor' ? '#000' : '#fff'}"/></svg>`,

    kick: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none"><path d="M4 3h4v6l4-6h5l-5 7 5 11h-5l-4-8v8H4V3Z" fill="${color}"/></svg>`,

    discord: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none"><path d="M19.27 5.33A18.17 18.17 0 0 0 14.82 4a12.4 12.4 0 0 0-.57 1.14 16.91 16.91 0 0 0-4.5 0A12.4 12.4 0 0 0 9.18 4a18.17 18.17 0 0 0-4.45 1.33A18.52 18.52 0 0 0 1.7 18.06a18.35 18.35 0 0 0 5.56 2.78 13.33 13.33 0 0 0 1.16-1.87 11.92 11.92 0 0 1-1.83-.87l.43-.34a13.15 13.15 0 0 0 9.96 0l.43.34c-.59.34-1.2.63-1.83.87.33.66.72 1.28 1.16 1.87a18.35 18.35 0 0 0 5.56-2.78A18.52 18.52 0 0 0 19.27 5.33ZM8.68 15.4c-1.06 0-1.93-.97-1.93-2.15S7.6 11.1 8.68 11.1s1.95.97 1.93 2.15c0 1.18-.87 2.15-1.93 2.15Zm6.64 0c-1.06 0-1.93-.97-1.93-2.15s.85-2.15 1.93-2.15 1.95.97 1.93 2.15c0 1.18-.86 2.15-1.93 2.15Z" fill="${color}"/></svg>`,

    paypal: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none"><path d="M7.02 21.5 7.8 17h-2l2.77-14h5.7c2.73 0 4.36 1.53 4.06 4.12-.4 3.36-3.06 4.88-5.82 4.88H10.7l-1.32 6.5h-1.5l-.86 3Z" fill="${color}"/></svg>`,

    stripe: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="3" fill="${color}"/><path d="M13.5 10.3c0-.62-.52-.86-1.37-.86-1.23 0-2.77.47-4 1.15V7.82c1.33-.52 2.65-.82 4-.82 3.3 0 4.37 1.6 4.37 3.53 0 3.73-5.3 3.1-5.3 4.7 0 .62.55.82 1.42.82 1.33 0 3.07-.58 4.38-1.35v2.77c-1.43.68-2.87 1.03-4.38 1.03-3.27 0-4.42-1.6-4.42-3.57 0-3.67 5.3-3.23 5.3-4.63Z" fill="${color === 'currentColor' ? '#000' : '#fff'}"/></svg>`,

    kofi: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z" fill="${color}"/></svg>`,

    obs: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="1.5" fill="none"/><circle cx="12" cy="12" r="3.5" fill="${color}"/><path d="M12 2.5c1.5 2 2 4 1.5 5.5M21.5 12c-2 1.5-4 2-5.5 1.5M12 21.5c-1.5-2-2-4-1.5-5.5M2.5 12c2-1.5 4-2 5.5-1.5" stroke="${color}" stroke-width="1.5"/></svg>`,

    settings: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>`,

    check: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,

    x: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,

    bell: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,

    eye: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>`,

    users: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,

    heart: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="${color}" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z"/></svg>`,

    chat: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,

    dollar: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,

    target: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,

    zap: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="${color}" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,

    refresh: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,

    palette: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="1.5" fill="${color}"/><circle cx="17.5" cy="10.5" r="1.5" fill="${color}"/><circle cx="8.5" cy="7.5" r="1.5" fill="${color}"/><circle cx="6.5" cy="12" r="1.5" fill="${color}"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.38-.15-.74-.41-1.01A1.49 1.49 0 0 1 14.5 18c.83 0 1.5-.67 1.5-1.5 0-4.14 2.86-7.5 6-7.5 0-3.87-3.58-7-8-7Z"/></svg>`,

    play: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="${color}" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,

    link: (color = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  };

  function inject(el, name, opts = {}) {
    const fn = icons[name];
    if (!fn) return;
    el.innerHTML = fn(opts.color);
    if (opts.size) { el.style.width = opts.size; el.style.height = opts.size; }
  }

  function html(name, opts = {}) {
    const fn = icons[name];
    return fn ? fn(opts.color) : '';
  }

  return { ...icons, inject, html };
})();
