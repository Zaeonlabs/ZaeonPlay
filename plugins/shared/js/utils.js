/**
 * StreamPlugins Shared Utilities
 */

/**
 * Format a large number with abbreviations (e.g., 1.2K, 45.3K, 1.1M).
 * @param {number} num
 * @returns {string}
 */
function formatCount(num) {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}

/**
 * Format a timestamp as HH:MM AM/PM.
 * @param {string|Date} timestamp
 * @returns {string}
 */
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/**
 * Escape HTML entities to prevent XSS in chat messages.
 * @param {string} text
 * @returns {string}
 */
function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Get the platform display name.
 * @param {'twitch'|'youtube'|'kick'} platform
 * @returns {string}
 */
function platformName(platform) {
  const names = { twitch: 'Twitch', youtube: 'YouTube', kick: 'Kick' };
  return names[platform] || platform;
}

/**
 * Get the platform brand color.
 * @param {'twitch'|'youtube'|'kick'} platform
 * @returns {string}
 */
function platformColor(platform) {
  const colors = { twitch: '#9146FF', youtube: '#FF0000', kick: '#53FC18' };
  return colors[platform] || '#888888';
}

/**
 * Debounce a function call.
 * @param {function} fn
 * @param {number} delay - Milliseconds
 * @returns {function}
 */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle a function call.
 * @param {function} fn
 * @param {number} limit - Milliseconds
 * @returns {function}
 */
function throttle(fn, limit) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Animate a numeric value change on a DOM element.
 * @param {HTMLElement} el - Element whose textContent will be updated
 * @param {number} from - Start value
 * @param {number} to - End value
 * @param {number} [duration=600] - Animation duration in ms
 * @param {function} [formatter=formatCount] - Value formatter
 */
function animateValue(el, from, to, duration = 600, formatter = formatCount) {
  if (from === to) { el.textContent = formatter(to); return; }
  const start = performance.now();
  el.classList.add('is-changing');
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(from + (to - from) * ease);
    el.textContent = formatter(current);
    if (progress < 1) requestAnimationFrame(tick);
    else el.classList.remove('is-changing');
  }
  requestAnimationFrame(tick);
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} [type='info']
 * @param {number} [durationMs=3200]
 */
function showToast(message, type = 'info', durationMs = 3200) {
  let container = document.getElementById('sp-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'sp-toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `sp-toast sp-toast--${type}`;
  toast.textContent = message;
  toast.style.setProperty('--_dur', `${durationMs}ms`);
  container.appendChild(toast);
  setTimeout(() => toast.remove(), durationMs + 350);
}

/**
 * Get platform icon HTML using SPIcons.
 * @param {'twitch'|'youtube'|'kick'|'discord'} platform
 * @param {string} [size='sm']
 * @returns {string}
 */
function platformIcon(platform, size = 'sm') {
  if (typeof SPIcons === 'undefined') return '';
  const colorMap = { twitch: '#9146FF', youtube: '#FF0000', kick: '#53FC18', discord: '#5865F2' };
  const svg = SPIcons.html(platform, { color: colorMap[platform] || 'currentColor' });
  return `<span class="sp-icon sp-icon--${size}">${svg}</span>`;
}
