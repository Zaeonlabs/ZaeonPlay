/**
 * Stream Metrics Widget
 * Displays subscriber, follower, and viewer counts per platform.
 */

const POLL_INTERVAL = 30_000;
const container = document.getElementById('metrics');

const prevValues = {};

function metricKey(platform, type) { return `${platform}-${type}`; }

function buildMetricRow(platform, type, label, value, delay) {
  const key = metricKey(platform, type);
  const prev = prevValues[key] ?? value;
  prevValues[key] = value;
  const id = `val-${key}`;
  return { id, prev, value, html: `
    <div class="metric-row" style="animation-delay:${delay}s">
      <span class="sp-icon sp-icon--sm">${iconForType(type)}</span>
      <span class="metric-label">${label}</span>
      <span class="metric-value sp-count-glow" id="${id}">${formatCount(prev)}</span>
    </div>` };
}

function iconForType(type) {
  if (typeof SPIcons === 'undefined') return '';
  if (type === 'followers') return SPIcons.users();
  if (type === 'subscribers') return SPIcons.heart();
  if (type === 'viewers') return SPIcons.eye();
  return '';
}

function renderMetrics(data) {
  if (!data || Object.keys(data).length === 0) {
    container.innerHTML = '<div class="metrics-loading">No platforms connected</div>';
    return;
  }

  const rows = [];
  let html = '';
  let i = 0;

  for (const [platform, metrics] of Object.entries(data)) {
    html += `<div class="metric-group">
      <div class="metric-group-header">
        ${platformIcon(platform, 'sm')}
        <span style="color:${platformColor(platform)}">${platformName(platform)}</span>
      </div>`;

    for (const [type, label] of [['followers', 'Followers'], ['subscribers', 'Subs'], ['viewers', 'Viewers']]) {
      if (metrics[type] !== undefined) {
        const r = buildMetricRow(platform, type, label, metrics[type], i * 0.06);
        rows.push(r);
        html += r.html;
        i++;
      }
    }
    html += '</div>';
  }

  container.innerHTML = html;

  for (const r of rows) {
    const el = document.getElementById(r.id);
    if (el && r.prev !== r.value) animateValue(el, r.prev, r.value);
  }
}

async function pollMetrics() {
  try {
    const data = await StreamPluginsAPI.getMetrics();
    renderMetrics(data);
  } catch {
    container.innerHTML = '<div class="metrics-loading sp-fade-in">Waiting for server&hellip;</div>';
  }
}

pollMetrics();
setInterval(pollMetrics, POLL_INTERVAL);
