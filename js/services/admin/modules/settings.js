/**
 * Admin Module: Settings
 */
(function () {
  'use strict';

  const ModuleSettings = {
    id: 'settings', title: 'Settings', icon: '⚙', order: 9,
    permissions: [],

    render(container, ws) {
      container.innerHTML = `
        <h2 style="margin:0 0 20px;font-size:1.2rem;font-weight:800;">⚙ Platform Settings</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px;">
            <h3 style="margin:0 0 16px;font-size:0.9rem;font-weight:700;">Site Configuration</h3>
            <div id="settings-site-mount"></div>
          </div>
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px;">
            <h3 style="margin:0 0 16px;font-size:0.9rem;font-weight:700;">Feature Flags</h3>
            <div style="font-size:0.85rem;color:var(--text-soft);">Feature flag configuration available via admin settings service.</div>
          </div>
        </div>`;

      if (typeof renderAdminSettings === 'function') {
        try { renderAdminSettings(); } catch(e) {}
      }
    },
  };

  window.PharmoraAdminModules = window.PharmoraAdminModules || [];
  window.PharmoraAdminModules.push(ModuleSettings);
})();
