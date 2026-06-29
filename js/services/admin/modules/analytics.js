/**
 * Admin Module: Analytics
 */
(function () {
  'use strict';

  const ModuleAnalytics = {
    id: 'analytics', title: 'Analytics', icon: '📈', order: 8, permissions: [],

    async render(container, ws) {
      let bars = [], popular = [];
      try { if (typeof analyticsBars       === 'function') bars    = analyticsBars(); }       catch(e) {}
      try { if (typeof topAnalyticsTargets === 'function') popular = topAnalyticsTargets('search'); } catch(e) {}

      container.innerHTML = `
        <h2 style="margin:0 0 20px;font-size:1.2rem;font-weight:800;">📈 Platform Analytics</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px;">
            <h3 style="margin:0 0 14px;font-size:0.9rem;font-weight:700;">Traffic Overview</h3>
            ${bars.length ? bars.map(x => `
              <div style="margin-bottom:14px;">
                <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px;">
                  <span>${x.label}</span><strong>${x.value}</strong>
                </div>
                <div style="height:8px;background:var(--border);border-radius:20px;overflow:hidden;">
                  <div style="height:100%;width:${x.percent || 0}%;background:linear-gradient(90deg,var(--primary),var(--secondary));border-radius:20px;"></div>
                </div>
              </div>
            `).join('') : '<div style="color:var(--text-soft);font-size:0.85rem;">No analytics data yet.</div>'}
          </div>
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px;">
            <h3 style="margin:0 0 14px;font-size:0.9rem;font-weight:700;">🔥 Popular Searches</h3>
            ${popular.length ? popular.map(x => `
              <div style="display:flex;justify-content:space-between;font-size:0.82rem;padding:6px 0;border-bottom:1px solid var(--border);">
                <span>🔎 ${x[0]}</span><strong>${x[1]}</strong>
              </div>
            `).join('') : '<div style="color:var(--text-soft);font-size:0.85rem;">No search data yet.</div>'}
          </div>
        </div>`;
    },
  };

  window.PharmoraAdminModules = window.PharmoraAdminModules || [];
  window.PharmoraAdminModules.push(ModuleAnalytics);
})();
