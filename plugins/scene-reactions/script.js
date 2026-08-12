/**
 * OBS Scene Reactions
 * Dock UI for configuring automated OBS actions in response to stream events.
 */

SPIcons.inject(document.getElementById('header-icon'), 'zap');
SPIcons.inject(document.getElementById('icon-obs'), 'obs');

const rulesList = document.getElementById('rules-list');
let rules = [];
let obsScenes = [];
let obsSources = [];

const TRIGGER_TYPES = [
  { value: 'raid',         label: 'Raid' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'follow',       label: 'Follow' },
  { value: 'bits',         label: 'Bits / Cheer' },
  { value: 'donation',     label: 'Donation' },
  { value: 'gift',         label: 'Gift Sub' },
  { value: 'superchat',    label: 'Super Chat' },
];

const ACTION_TYPES = [
  { value: 'switch_scene', label: 'Switch Scene' },
  { value: 'show_source',  label: 'Show Source' },
  { value: 'hide_source',  label: 'Hide Source' },
  { value: 'toggle_filter', label: 'Toggle Filter' },
  { value: 'play_media',   label: 'Play Media Source' },
];

function optionsHTML(items, selected) {
  return items.map(i => {
    const val = typeof i === 'string' ? i : i.value;
    const lbl = typeof i === 'string' ? i : i.label;
    return `<option value="${escapeHTML(val)}" ${val === selected ? 'selected' : ''}>${escapeHTML(lbl)}</option>`;
  }).join('');
}

function renderRules() {
  rulesList.innerHTML = rules.map((r, i) => `
    <div class="sp-card rule-card sp-fade-in" style="animation-delay:${i * .04}s">
      <div class="rule-header">
        <div class="rule-header-left">
          <span class="sp-icon sp-icon--sm">${SPIcons.zap()}</span>
          Rule ${i + 1}
        </div>
        <div class="sp-flex sp-items-center sp-gap-2">
          <div class="toggle-row">
            <label class="sp-toggle">
              <input type="checkbox" ${r.enabled ? 'checked' : ''} onchange="rules[${i}].enabled=this.checked">
              <span class="sp-toggle-track"></span>
            </label>
          </div>
          <button class="remove-btn" onclick="removeRule(${i})">&times;</button>
        </div>
      </div>

      <div class="rule-row">
        <div style="flex:1"><div class="field-label">Trigger</div>
          <select onchange="rules[${i}].trigger=this.value">${optionsHTML(TRIGGER_TYPES, r.trigger)}</select>
        </div>
        <div style="flex:1"><div class="field-label">Min Amount</div>
          <input type="number" value="${r.minAmount ?? 0}" min="0" placeholder="0" onchange="rules[${i}].minAmount=Number(this.value)">
        </div>
      </div>

      <div class="rule-row">
        <div style="flex:1"><div class="field-label">Action</div>
          <select onchange="rules[${i}].action=this.value">${optionsHTML(ACTION_TYPES, r.action)}</select>
        </div>
      </div>

      <div class="rule-row">
        <div style="flex:1"><div class="field-label">Scene / Source</div>
          <select onchange="rules[${i}].target=this.value">
            <option value="">-- Select --</option>
            ${obsScenes.length ? `<optgroup label="Scenes">${optionsHTML(obsScenes, r.target)}</optgroup>` : ''}
            ${obsSources.length ? `<optgroup label="Sources">${optionsHTML(obsSources, r.target)}</optgroup>` : ''}
            ${!obsScenes.length && !obsSources.length ? '<option disabled>Connect to OBS first</option>' : ''}
          </select>
        </div>
        <div style="width:100px"><div class="field-label">Duration (s)</div>
          <input type="number" value="${r.duration ?? 5}" min="0" onchange="rules[${i}].duration=Number(this.value)">
        </div>
      </div>

      <div class="rule-row">
        <div style="flex:1"><div class="field-label">Revert-to Scene</div>
          <select onchange="rules[${i}].revertScene=this.value">
            <option value="">-- None (stay) --</option>
            ${optionsHTML(obsScenes, r.revertScene)}
          </select>
        </div>
      </div>

      <div class="rule-actions">
        <button class="sp-btn sp-btn-ghost sp-btn-sm" onclick="testRule(${i})">
          <span class="sp-icon sp-icon--xs">${SPIcons.play()}</span> Test
        </button>
      </div>
    </div>
  `).join('');
}

window.removeRule = (i) => { rules.splice(i, 1); renderRules(); };

window.testRule = async (i) => {
  try {
    await StreamPluginsAPI.post('/api/obs/test-rule', { rule: rules[i] });
    showToast('Rule triggered', 'info');
  } catch {
    showToast('Failed — is OBS connected?', 'error');
  }
};

document.getElementById('add-rule-btn').addEventListener('click', () => {
  rules.push({
    trigger: 'raid', action: 'switch_scene', target: '',
    duration: 30, revertScene: '', minAmount: 0, enabled: true,
  });
  renderRules();
});

document.getElementById('obs-connect-btn').addEventListener('click', async () => {
  const host = document.getElementById('obs-host').value.trim();
  const port = document.getElementById('obs-port').value.trim();
  const password = document.getElementById('obs-password').value;

  try {
    const result = await StreamPluginsAPI.post('/api/obs/connect', { host, port: Number(port), password });
    if (result.scenes) obsScenes = result.scenes;
    if (result.sources) obsSources = result.sources;
    document.getElementById('obs-status').className = 'sp-dot sp-dot--on';
    showToast('Connected to OBS', 'success');
    renderRules();
  } catch {
    showToast('Could not connect to OBS WebSocket', 'error');
  }
});

document.getElementById('save-btn').addEventListener('click', async () => {
  try {
    await StreamPluginsAPI.updateConfig({ sceneReactions: { rules } });
    showToast('Rules saved', 'success');
  } catch {
    showToast('Failed to save', 'error');
  }
});

(async () => {
  try {
    const cfg = await StreamPluginsAPI.getConfig();
    rules = cfg.sceneReactions?.rules || [];
  } catch (_) {}

  try {
    const obs = await StreamPluginsAPI.get('/api/obs/status');
    if (obs.connected) {
      document.getElementById('obs-status').className = 'sp-dot sp-dot--on';
      if (obs.scenes) obsScenes = obs.scenes;
      if (obs.sources) obsSources = obs.sources;
    }
  } catch (_) {}

  renderRules();
})();
