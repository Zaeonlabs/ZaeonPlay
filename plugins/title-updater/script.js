/**
 * Stream Title Updater
 * Dock for updating stream title, category, and tags across all platforms.
 */

const platformList = document.getElementById('platform-list');
const updateAllBtn = document.getElementById('update-all');

SPIcons.inject(document.getElementById('header-icon'), 'refresh');
SPIcons.inject(document.getElementById('btn-icon-refresh'), 'refresh');

const PLATFORMS = [
  { id: 'twitch',  name: 'Twitch',  color: 'var(--sp-twitch)',  fields: ['title', 'category', 'tags'] },
  { id: 'youtube', name: 'YouTube', color: 'var(--sp-youtube)', fields: ['title', 'description', 'category', 'tags', 'privacy'] },
  { id: 'kick',    name: 'Kick',    color: 'var(--sp-kick)',    fields: ['title', 'category'] },
];

function fieldInput(platform, field) {
  if (field === 'description') {
    return `<div><div class="field-label">${field}</div><textarea id="${platform}-${field}" placeholder="${field}"></textarea></div>`;
  }
  if (field === 'privacy') {
    return `<div><div class="field-label">${field}</div>
      <select id="${platform}-${field}">
        <option value="public">Public</option>
        <option value="unlisted">Unlisted</option>
        <option value="private">Private</option>
      </select></div>`;
  }
  return `<div><div class="field-label">${field}</div><input type="text" id="${platform}-${field}" placeholder="${field}"></div>`;
}

async function loadStreamInfo() {
  platformList.innerHTML = PLATFORMS.map((p, i) => `
    <div class="sp-card platform-row sp-fade-in" style="animation-delay:${(i + 1) * .06}s">
      <div class="platform-row-header">
        <div class="platform-row-info">
          ${platformIcon(p.id, 'sm')}
          <span class="platform-row-name" style="color:${p.color}">${p.name}</span>
        </div>
        <span class="sp-dot sp-dot--off" id="${p.id}-dot"></span>
      </div>
      <div class="platform-row-fields">
        ${p.fields.map(f => fieldInput(p.id, f)).join('')}
      </div>
    </div>
  `).join('');
}

updateAllBtn.addEventListener('click', async () => {
  updateAllBtn.disabled = true;
  updateAllBtn.innerHTML = `<span class="sp-icon sp-icon--sm">${SPIcons.refresh()}</span> Updating&hellip;`;

  try {
    const info = {};
    for (const p of PLATFORMS) {
      info[p.id] = {};
      for (const f of p.fields) {
        const el = document.getElementById(`${p.id}-${f}`);
        if (el) info[p.id][f] = el.value.trim();
      }
    }
    await StreamPluginsAPI.updateStreamInfo(info);
    showToast('All platforms updated', 'success');
  } catch {
    showToast('Failed to update platforms', 'error');
  }

  updateAllBtn.disabled = false;
  updateAllBtn.innerHTML = `<span class="sp-icon sp-icon--sm">${SPIcons.refresh()}</span> Update All Platforms`;
});

loadStreamInfo();
