/**
 * Admin Module: Verification Centre
 */
(function () {
  'use strict';

  const ModuleVerification = {
    id: 'verification', title: 'Verification', icon: '✔', order: 4,
    permissions: ['users.manage'],

    async render(container, ws) {
      container.innerHTML = `
        <h2 style="margin:0 0 20px;font-size:1.2rem;font-weight:800;">✔ Verification Centre</h2>
        <div id="vc-items" style="display:flex;flex-direction:column;gap:12px;"></div>`;

      let requests = [];
      try {
        if (typeof getVerificationRequests === 'function') requests = await getVerificationRequests();
      } catch(e) {}

      const box = document.getElementById('vc-items');
      if (!box) return;

      if (!requests.length) {
        box.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-soft);">No pending verification requests.</div>`;
        return;
      }

      requests.forEach(req => {
        const card = document.createElement('div');
        card.style.cssText = 'background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px;';
        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <div style="font-weight:700;font-size:1rem;">👤 ${req.name || req.email}</div>
            <span style="font-size:0.72rem;background:rgba(245,158,11,.15);color:#f59e0b;padding:2px 8px;border-radius:5px;font-weight:700;">Pending</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.82rem;margin-bottom:14px;">
            <div><strong>Email:</strong> ${req.email || '—'}</div>
            <div><strong>Type:</strong> ${(req.types || []).join(', ')}</div>
            <div><strong>Organization:</strong> ${req.details?.organization || '—'}</div>
            <div><strong>Attempt:</strong> #${req.attempt || 1}</div>
          </div>
          ${req.proof ? `<div style="font-size:0.8rem;margin-bottom:14px;"><strong>Proof:</strong> ${req.proof}</div>` : ''}
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button data-vc-action="approve" data-vc-id="${req.id}" style="padding:6px 14px;border:none;background:var(--primary);color:#fff;border-radius:7px;font-weight:700;cursor:pointer;font-size:0.8rem;">✔ Approve</button>
            <button data-vc-action="reject"  data-vc-id="${req.id}" style="padding:6px 14px;border:none;background:#ef4444;color:#fff;border-radius:7px;font-weight:700;cursor:pointer;font-size:0.8rem;">✗ Reject</button>
            <button onclick="location.href='../profile.html?id=${req.userId}'" style="padding:6px 14px;border:1px solid var(--border);background:none;color:var(--text);border-radius:7px;font-weight:600;cursor:pointer;font-size:0.8rem;">👤 Profile</button>
          </div>`;

        card.querySelectorAll('[data-vc-action]').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id     = btn.dataset.vcId;
            const action = btn.dataset.vcAction;
            try {
              if (action === 'approve' && typeof approveVerification === 'function') {
                await approveVerification(id);
                if (typeof saveAudit === 'function') saveAudit('verification.approve', { request: id });
              }
              if (action === 'reject' && typeof rejectVerification === 'function') {
                const reason = prompt('Rejection reason:');
                if (!reason) return;
                await rejectVerification(id, reason);
                if (typeof saveAudit === 'function') saveAudit('verification.reject', { request: id, reason });
              }
              ws.refreshCurrentModule();
            } catch(err) { alert(`Action failed: ${err.message}`); }
          });
        });
        box.appendChild(card);
      });
    },

    async badgeProvider() {
      try {
        if (typeof getVerificationRequests === 'function') {
          const r = await getVerificationRequests();
          return r.length;
        }
      } catch(e) {}
      return 0;
    },
  };

  window.PharmoraAdminModules = window.PharmoraAdminModules || [];
  window.PharmoraAdminModules.push(ModuleVerification);
})();
