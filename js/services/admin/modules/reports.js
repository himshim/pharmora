/**
 * Admin Module: Reports
 */
(function () {
  'use strict';

  const ModuleReports = {
    id: 'reports', title: 'Reports', icon: '🚩', order: 6,
    permissions: ['forum.moderate'],

    render(container, ws) {
      container.innerHTML = `<h2 style="margin:0 0 20px;font-size:1.2rem;font-weight:800;">🚩 Reports</h2><div id="rp-mount"></div>`;
      if (typeof renderReports === 'function') {
        const stub = document.getElementById('rp-mount');
        if (stub) {
          try { renderReports(); } catch(e) {}
        }
      } else {
        document.getElementById('rp-mount').innerHTML =
          `<div style="padding:40px;text-align:center;color:var(--text-soft);">No reports available yet.</div>`;
      }
    },
  };

  window.PharmoraAdminModules = window.PharmoraAdminModules || [];
  window.PharmoraAdminModules.push(ModuleReports);
})();
