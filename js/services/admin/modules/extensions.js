/**
 * Admin Module: Extensions
 */
(function () {
  'use strict';

  const ModuleExtensions = {
    id: 'extensions', title: 'Extensions', icon: '🔌', order: 10, permissions: [],

    render(container, ws) {
      // Show all currently registered workbench modules as extensions
      const modules = (window.PharmoraWorkbench?._registry || []);
      container.innerHTML = `
        <h2 style="margin:0 0 20px;font-size:1.2rem;font-weight:800;">🔌 Extensions & Modules</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;">
          ${modules.map(mod => `
            <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:16px;cursor:pointer;"
                 onclick="PharmoraWorkbench._wb.navigate('${mod.id}')">
              <div style="font-size:1.6rem;margin-bottom:8px;">${mod.icon}</div>
              <div style="font-weight:700;font-size:0.9rem;margin-bottom:4px;">${mod.title}</div>
              <div style="font-size:0.75rem;color:var(--text-soft);">Order: ${mod.order} &bull; ID: ${mod.id}</div>
            </div>
          `).join('') || '<div style="color:var(--text-soft);">No modules registered.</div>'}
        </div>
        <div style="margin-top:28px;padding:18px;background:var(--surface);border:1px solid var(--border);border-radius:14px;">
          <h3 style="margin:0 0 10px;font-size:0.9rem;font-weight:700;">Register a New Module</h3>
          <pre style="font-size:0.78rem;color:var(--text-soft);white-space:pre-wrap;">PharmoraWorkbench._wb.registerModule({
  id: 'my-module',
  title: 'My Module',
  icon: '🆕',
  render(container, ws) { container.innerHTML = '&lt;h2&gt;Hello&lt;/h2&gt;'; }
});</pre>
        </div>`;
    },
  };

  window.PharmoraAdminModules = window.PharmoraAdminModules || [];
  window.PharmoraAdminModules.push(ModuleExtensions);
})();
