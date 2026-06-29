/**
 * Admin Module: Audit Logs
 */
(function () {
  'use strict';

  const utils = window.PharmoraAdminUtils;

  const ModuleAuditLogs = {
    id: 'audit-logs', title: 'Audit Logs', icon: '🧾', order: 7,
    permissions: ['users.manage'],

    async render(container, ws) {
      container.innerHTML = `<h2 style="margin:0 0 20px;font-size:1.2rem;font-weight:800;">🧾 Audit Logs</h2><div id="al-items" style="display:flex;flex-direction:column;gap:8px;"></div>`;
      const all = await utils.getEntities();
      const logs = [];
      all.forEach(ent => {
        (ent.auditTrail || []).forEach(log => logs.push({ ...log, type: ent.type, title: ent.content?.title || ent.publicId }));
      });

      let extra = [];
      try { if (typeof getAudit === 'function') extra = await getAudit(); } catch(e) {}
      logs.push(...extra.map(a => ({ ...a, type: a.type || 'System', title: a.message || '' })));
      logs.sort((a, b) => new Date(b.timestamp || b.time || 0) - new Date(a.timestamp || a.time || 0));

      const box = document.getElementById('al-items');
      if (!box) return;
      if (!logs.length) {
        box.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-soft);">No audit events recorded yet.</div>`;
        return;
      }
      box.innerHTML = logs.slice(0, 100).map(log => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;font-size:0.82rem;">
          <span style="color:var(--text-soft);white-space:nowrap;">${new Date(log.timestamp || log.time || 0).toLocaleString()}</span>
          <strong style="text-transform:capitalize;white-space:nowrap;">${log.action || log.event || '—'}</strong>
          <span style="font-size:0.72rem;background:var(--border);padding:1px 6px;border-radius:4px;">${log.type}</span>
          <span style="flex:1;color:var(--text-soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${log.title || log.message || ''}</span>
          <span style="color:var(--text-soft);">${log.actor || ''}</span>
        </div>
      `).join('');
    },
  };

  window.PharmoraAdminModules = window.PharmoraAdminModules || [];
  window.PharmoraAdminModules.push(ModuleAuditLogs);
})();
