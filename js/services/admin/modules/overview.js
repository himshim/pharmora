/**
 * Admin Module: Overview
 */
(function () {
  'use strict';

  const utils = window.PharmoraAdminUtils;

  const ModuleOverview = {
    id: 'overview', title: 'Overview', icon: '🏠', order: 1, permissions: [],

    async render(container, ws) {
      container.innerHTML = `<div id="ov-stats" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin-bottom:28px;"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;">
          <div id="ov-recent" style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px;"></div>
          <div id="ov-activity" style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px;"></div>
        </div>`;

      // Live counters
      const all = await utils.getEntities();
      const c   = { draft:0, pending_review:0, published:0, archived:0 };
      all.forEach(e => { if (c[e.status] !== undefined) c[e.status]++; });

      document.getElementById('ov-stats').innerHTML = [
        utils.statCard('📦', all.length,          'Total Entities'),
        utils.statCard('⏳', c.pending_review,     'Pending Review'),
        utils.statCard('📢', c.published,          'Published'),
        utils.statCard('📝', c.draft,             'Drafts'),
        utils.statCard('🗄', c.archived,          'Archived'),
      ].join('');

      // Recent entities
      const recent = all.sort((a,b) => new Date(b.updatedAt||0) - new Date(a.updatedAt||0)).slice(0, 6);
      const recBox = document.getElementById('ov-recent');
      recBox.innerHTML = `<h3 style="margin:0 0 12px;font-size:0.9rem;font-weight:700;color:var(--text);">🕒 Recently Modified</h3>`;
      recent.forEach(ent => recBox.appendChild(utils.entityRow(ent, ws)));

      // Activity feed from audit trail
      const activities = [];
      all.forEach(ent => {
        (ent.auditTrail || []).forEach(log => {
          activities.push({ ...log, type: ent.type, title: ent.content?.title || ent.publicId });
        });
      });
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const actBox = document.getElementById('ov-activity');
      actBox.innerHTML = `<h3 style="margin:0 0 12px;font-size:0.9rem;font-weight:700;color:var(--text);">⚡ Activity Stream</h3>
        ${activities.slice(0, 8).map(a => `
          <div style="font-size:0.8rem;padding:8px 0;border-bottom:1px solid var(--border);">
            <span style="color:var(--text-soft);">${new Date(a.timestamp).toLocaleTimeString()}</span>
            <strong style="text-transform:capitalize;margin:0 4px;">${a.action}</strong>
            on <strong>${a.type}</strong> — <em>${a.title}</em>
          </div>
        `).join('') || '<div style="color:var(--text-soft);font-size:0.85rem;">No activity yet.</div>'}`;
    },

    toolbar() { return [{ label: 'Refresh', icon: '🔄', action: "PharmoraWorkbench._wb.refreshCurrentModule()" }]; },
    shortcuts() { return { 'ctrl+r': () => PharmoraWorkbench._wb.refreshCurrentModule() }; },
  };

  window.PharmoraAdminModules = window.PharmoraAdminModules || [];
  window.PharmoraAdminModules.push(ModuleOverview);
})();
