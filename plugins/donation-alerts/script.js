/**
 * Donation Alerts Overlay
 * Animated donation cards from PayPal, Stripe, Ko-fi, BMC, Streamlabs.
 */

const container = document.getElementById('donation-alerts');
const ALERT_DURATION = 6000;

const platformLabels = {
  paypal: 'PayPal', stripe: 'Stripe', kofi: 'Ko-fi',
  buymeacoffee: 'Buy Me a Coffee', streamlabs: 'Streamlabs',
};

function platformIconForDonation(source) {
  if (typeof SPIcons === 'undefined') return '';
  const map = { paypal: 'paypal', stripe: 'stripe', kofi: 'kofi' };
  const name = map[source] || 'dollar';
  return SPIcons.html(name);
}

function createDonationCard(data) {
  const card = document.createElement('div');
  card.className = `da-card da-card--${data.source || ''}`;

  const amountStr = data.currency
    ? `${data.currency}${data.amount.toFixed(2)}`
    : `$${data.amount.toFixed(2)}`;

  card.innerHTML = `
    <div class="da-amount-wrap">
      <span class="da-amount">${amountStr}</span>
    </div>
    <div class="da-content">
      <div class="da-platform-label">${platformLabels[data.source] || data.source || 'Donation'}</div>
      <div class="da-donor">${escapeHTML(data.donor || 'Anonymous')}</div>
      ${data.message ? `<div class="da-message">${escapeHTML(data.message)}</div>` : ''}
    </div>
  `;

  return card;
}

function showDonation(data) {
  const card = createDonationCard(data);
  container.appendChild(card);
  setTimeout(() => card.remove(), ALERT_DURATION);
}

spWebSocket.connect();
spWebSocket.on('donation', (payload) => showDonation(payload));
