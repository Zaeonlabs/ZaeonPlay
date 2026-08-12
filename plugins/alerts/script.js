/**
 * Multistream Alerts
 * Animated alert overlay for subs, follows, raids, bits, etc.
 */

const alertsContainer = document.getElementById('alerts');
const ALERT_DURATION = 5000;

function alertTypeLabel(type) {
  const labels = {
    subscription: 'New Sub', follow: 'New Follower', raid: 'Raid',
    bits: 'Bits', gift: 'Gift Sub', superchat: 'Super Chat', member: 'New Member',
  };
  return labels[type] || type || 'Alert';
}

function createAlertCard(alert) {
  const card = document.createElement('div');
  card.className = `alert-card alert-card--${alert.platform}`;

  const avatarPart = alert.avatar
    ? `<img class="alert-avatar" src="${escapeHTML(alert.avatar)}" alt="">`
    : `<div class="alert-icon-wrap">${platformIcon(alert.platform, 'md')}</div>`;

  card.innerHTML = `
    ${avatarPart}
    <div class="alert-content">
      <div class="alert-type">${alertTypeLabel(alert.type)}</div>
      <div class="alert-username">${escapeHTML(alert.username)}</div>
      ${alert.message ? `<div class="alert-message">${escapeHTML(alert.message)}</div>` : ''}
    </div>
  `;

  return card;
}

function showAlert(alert) {
  const card = createAlertCard(alert);
  alertsContainer.appendChild(card);
  setTimeout(() => card.remove(), ALERT_DURATION);
}

spWebSocket.connect();
spWebSocket.on('alert', (payload) => showAlert(payload));
