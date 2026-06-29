/**
 * Admin Module: Review Queue
 */
(function () {
  'use strict';

  const utils = window.PharmoraAdminUtils;

  const ModuleReviewQueue = {
    id: 'review-queue', title: 'Review Queue', icon: '📋', order: 2,
    permissions: ['content.review'],

    async badgeProvider() {
      const pending = await utils.getEntities({ status: 'pending_review' }).catch(() => []);
      return pending.length;
    },

    async render(container, ws) {
      container.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h2 style="margin:0;font-size:1.2rem;font-weight:800;">📋 Review Queue</h2>
          <span id="rq-count" style="font-size:0.82rem;color:var(--text-soft);font-weight:600;"></span>
        </div>
        <div id="rq-items" style="display:flex;flex-direction:column;gap:10px;"></div>`;

      const pending = await utils.getEntities({ status: 'pending_review' });
      const cntEl   = document.getElementById('rq-count');
      if (cntEl) cntEl.textContent = `${pending.length} pending`;

      const itemsEl = document.getElementById('rq-items');
      if (!itemsEl) return;

      if (pending.length === 0) {
        itemsEl.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-soft);">✅ All clear — nothing pending review.</div>`;
        return;
      }

      pending.forEach(ent => {
        const title = ent.content?.title || ent.content?.name || ent.content?.genericName || ent.publicId || '—';
        const row = document.createElement('div');
        row.style.cssText = 'background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px 18px;display:flex;align-items:center;gap:12px;';
        row.innerHTML = `
          <span style="font-size:0.72rem;background:rgba(34,211,238,.12);color:var(--primary);padding:2px 7px;border-radius:5px;font-weight:700;">${ent.type}</span>
          <span style="flex:1;font-weight:600;font-size:0.88rem;">${title}</span>
          <span style="font-size:0.72rem;color:var(--text-soft);">${ent.ownerId || ''}</span>
          <button data-action="approve" data-uuid="${ent.uuid}" style="padding:5px 12px;border:none;background:var(--primary);color:#fff;border-radius:6px;font-weight:700;cursor:pointer;font-size:0.78rem;">✓ Approve</button>
          <button data-action="reject"  data-uuid="${ent.uuid}" style="padding:5px 12px;border:none;background:#ef4444;color:#fff;border-radius:6px;font-weight:700;cursor:pointer;font-size:0.78rem;">✗ Reject</button>
          <button data-action="changes" data-uuid="${ent.uuid}" style="padding:5px 12px;border:none;background:#f59e0b;color:#fff;border-radius:6px;font-weight:700;cursor:pointer;font-size:0.78rem;">🔁 Changes</button>
          <button data-action="delete"  data-uuid="${ent.uuid}" style="padding:5px 12px;border:none;background:#64748b;color:#fff;border-radius:6px;font-weight:700;cursor:pointer;font-size:0.78rem;">🗑 Delete</button>
          <button data-action="open"    data-uuid="${ent.uuid}" style="padding:5px 12px;border:1px solid var(--border);background:none;color:var(--text);border-radius:6px;font-weight:600;cursor:pointer;font-size:0.78rem;">👁 View</button>
        `;

        row.querySelectorAll('button').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const uuid   = btn.dataset.uuid;
            const action = btn.dataset.action;
            if (action === 'open') { ws.openViewer({ uuid }); return; }
            try {
              if (typeof window.PharmoraEntityReview !== 'undefined') {
                if (action === 'approve') await window.PharmoraEntityReview.approve(uuid, 'admin');
                if (action === 'reject')  await window.PharmoraEntityReview.reject(uuid, prompt('Rejection reason:') || '—', 'admin');
                if (action === 'changes') await window.PharmoraEntityReview.requestChanges(uuid, prompt('Change notes:') || '—', 'admin');
              }
              if (action === 'delete' && typeof window.PharmoraEntityManager !== 'undefined') {
                await window.PharmoraEntityManager.bulkDelete([uuid], 'admin');
              }
              ws.refreshCurrentModule();
            } catch(err) {
              console.error('Review Action Error:', err);
              alert(`Action failed: ${err.message}`);
            }
          });
        });
        row.addEventListener('click', () => ws.openViewer({ uuid: ent.uuid }));
        itemsEl.appendChild(row);
      });
    },

    toolbar() {
      return [
        { label: 'Approve All', icon: '✓', action: "window._adminBulkAll('approve')", primary: true },
        { label: 'Refresh',     icon: '🔄', action: "PharmoraWorkbench._wb.refreshCurrentModule()" },
      ];
    },
    shortcuts() {
      return {
        'a': () => window._adminBulkAll && window._adminBulkAll('approve'),
      };
    },
  };

  // Expose bulk-all helper
  window._adminBulkAll = async function(action) {
    const pending = await utils.getEntities({ status: 'pending_review' }).catch(() => []);
    for (const ent of pending) {
      try {
        if (typeof PharmoraEntityReview !== 'undefined') {
          if (action === 'approve') await PharmoraEntityReview.approve(ent.uuid, 'admin');
        }
      } catch(e) {}
    }
    if (PharmoraWorkbench._wb) PharmoraWorkbench._wb.refreshCurrentModule();
  };

  window.PharmoraAdminModules = window.PharmoraAdminModules || [];
  window.PharmoraAdminModules.push(ModuleReviewQueue);
})();
