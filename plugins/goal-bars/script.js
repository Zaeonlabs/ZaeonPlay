/**
 * Goal Bars
 * Animated progress bars for subscriber, follower, and donation goals.
 */

const goalsContainer = document.getElementById('goals');
const POLL_MS = 15_000;

let goals = [];

function goalIcon(type) {
  if (typeof SPIcons === 'undefined') return '';
  if (type === 'subscribers') return SPIcons.heart();
  if (type === 'followers') return SPIcons.users();
  if (type === 'donations') return SPIcons.dollar();
  return SPIcons.target();
}

function goalFillClass(type) {
  if (type === 'subscribers') return 'goal-fill--subs';
  if (type === 'followers') return 'goal-fill--followers';
  return 'goal-fill--donations';
}

function render() {
  if (!goals.length) {
    goalsContainer.innerHTML = '<div class="goals-empty sp-fade-in">No goals configured yet.</div>';
    return;
  }

  goalsContainer.innerHTML = goals.map((g, i) => {
    const pct = Math.min(100, Math.round((g.current / g.target) * 100));
    const display = g.type === 'donations'
      ? `$${g.current.toLocaleString()} / $${g.target.toLocaleString()}`
      : `${formatCount(g.current)} / ${formatCount(g.target)}`;

    return `
      <div class="goal-bar" style="animation-delay:${i * .08}s">
        <div class="goal-header">
          <div class="goal-label">
            <span class="sp-icon sp-icon--sm">${goalIcon(g.type)}</span>
            ${escapeHTML(g.label || g.type)}
          </div>
          <span class="goal-count">${display}</span>
        </div>
        <div class="goal-track">
          <div class="goal-fill ${goalFillClass(g.type)}" style="width:${pct}%">
            <span class="goal-pct">${pct}%</span>
          </div>
        </div>
      </div>`;
  }).join('');
}

async function loadGoals() {
  try {
    const config = await StreamPluginsAPI.getConfig();
    goals = config.goals || [];
  } catch (_) {}
}

async function updateCurrentValues() {
  try {
    const metrics = await StreamPluginsAPI.getMetrics();
    if (!metrics) return;

    for (const goal of goals) {
      if (goal.type === 'subscribers') {
        let total = 0;
        for (const m of Object.values(metrics)) total += (m.subscribers ?? 0);
        goal.current = total - (goal.startValue ?? 0);
      } else if (goal.type === 'followers') {
        let total = 0;
        for (const m of Object.values(metrics)) total += (m.followers ?? 0);
        goal.current = total - (goal.startValue ?? 0);
      }
    }
  } catch (_) {}
}

async function poll() {
  await loadGoals();
  await updateCurrentValues();
  render();
}

spWebSocket.connect();
spWebSocket.on('donation', (payload) => {
  for (const goal of goals) {
    if (goal.type === 'donations') {
      goal.current = (goal.current ?? 0) + (payload.amount ?? 0);
    }
  }
  render();
});

poll();
setInterval(poll, POLL_MS);
