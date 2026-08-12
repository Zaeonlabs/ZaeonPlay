/**
 * Combined Viewer Count
 * Large total + per-platform breakdown overlay.
 */

const POLL_MS = 10_000;
const totalEl = document.getElementById('vc-total');
const breakdownEl = document.getElementById('vc-breakdown');

SPIcons.inject(document.getElementById('vc-eye-icon'), 'eye');

let prevTotal = 0;
const prevPlatform = {};

async function poll() {
  try {
    const data = await StreamPluginsAPI.getMetrics();
    if (!data) return;

    let total = 0;
    const parts = [];

    for (const [platform, metrics] of Object.entries(data)) {
      const v = metrics.viewers ?? 0;
      total += v;
      parts.push({ platform, viewers: v });
    }

    animateValue(totalEl, prevTotal, total, 500);
    prevTotal = total;

    breakdownEl.innerHTML = parts.map(p => {
      const prev = prevPlatform[p.platform] ?? p.viewers;
      prevPlatform[p.platform] = p.viewers;
      return `<div class="vc-platform">
        ${platformIcon(p.platform, 'xs')}
        <span id="vc-${p.platform}">${formatCount(prev)}</span>
      </div>`;
    }).join('');

    for (const p of parts) {
      const el = document.getElementById(`vc-${p.platform}`);
      const prev = prevPlatform[p.platform] ?? p.viewers;
      if (el && prev !== p.viewers) animateValue(el, prev, p.viewers, 400);
    }
  } catch (_) {}
}

poll();
setInterval(poll, POLL_MS);
