/**
 * Discord Logger Settings
 * Configuration UI for forwarding chat and events to Discord webhooks.
 */

const saveBtn = document.getElementById('save-btn');

async function loadSettings() {
  try {
    const config = await StreamPluginsAPI.getConfig();
    const discord = config.discord || {};

    if (discord.chatWebhookUrl) document.getElementById('chat-webhook').value = discord.chatWebhookUrl;
    if (discord.eventsWebhookUrl) document.getElementById('events-webhook').value = discord.eventsWebhookUrl;

    const platforms = discord.chatPlatforms || {};
    document.getElementById('chat-twitch').checked  = platforms.twitch !== false;
    document.getElementById('chat-youtube').checked = platforms.youtube !== false;
    document.getElementById('chat-kick').checked    = platforms.kick !== false;

    const events = discord.eventTypes || {};
    document.getElementById('evt-subs').checked    = events.subscriptions !== false;
    document.getElementById('evt-follows').checked = events.follows !== false;
    document.getElementById('evt-raids').checked   = events.raids !== false;
    document.getElementById('evt-bits').checked    = events.bits !== false;
    document.getElementById('evt-gifts').checked   = events.gifts !== false;
  } catch (_) {}
}

saveBtn.addEventListener('click', async () => {
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving\u2026';

  try {
    await StreamPluginsAPI.updateConfig({
      discord: {
        chatWebhookUrl: document.getElementById('chat-webhook').value.trim(),
        eventsWebhookUrl: document.getElementById('events-webhook').value.trim(),
        chatPlatforms: {
          twitch:  document.getElementById('chat-twitch').checked,
          youtube: document.getElementById('chat-youtube').checked,
          kick:    document.getElementById('chat-kick').checked,
        },
        eventTypes: {
          subscriptions: document.getElementById('evt-subs').checked,
          follows:       document.getElementById('evt-follows').checked,
          raids:         document.getElementById('evt-raids').checked,
          bits:          document.getElementById('evt-bits').checked,
          gifts:         document.getElementById('evt-gifts').checked,
        },
      },
    });
    showToast('Settings saved', 'success');
  } catch {
    showToast('Failed to save settings', 'error');
  }

  saveBtn.disabled = false;
  saveBtn.textContent = 'Save Settings';
});

loadSettings();
