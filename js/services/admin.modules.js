/**
 * Pharmora Admin Workbench Modules
 * ─────────────────────────────────────────────────────────────────────
 * Registers every admin section as a self-contained Workbench Module.
 * Each module implements: render, destroy, refresh, toolbar, shortcuts,
 * badgeProvider, searchProvider.
 *
 * ONLY this file contains admin-specific business UI.
 * Modules delegate data to UES; they own nothing.
 */
(function () {
  'use strict';

  /* ── Shared utilities ─────────────────────────────── */
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v);
    });
    children.flat().forEach(c => el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return el;
  }

  function statCard(icon, value, label, style = '') {
    return `<div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:20px;text-align:center;${style}">
      <div style="font-size:1.6rem;">${icon}</div>
      <div style="font-size:2rem;font-weight:800;margin:6px 0;">${value}</div>
      <div style="font-size:0.78rem;color:var(--text-soft);font-weight:600;">${label}</div>
    </div>`;
  }

  async function getEntities(filter = {}) {
    if (typeof PharmoraEntityAPI !== 'undefined') {
      const list = await PharmoraEntityAPI.listEntities().catch(() => []);
      let filtered = list;
      if (filter.status) filtered = filtered.filter(e => e.status === filter.status);
      if (filter.type)   filtered = filtered.filter(e => e.type   === filter.type);
      return filtered;
    }
    return [];
  }

  function entityRow(ent, ws) {
    const title  = ent.content?.title || ent.content?.name || ent.content?.genericName || ent.publicId || '—';
    const date   = ent.updatedAt ? new Date(ent.updatedAt).toLocaleDateString() : '';
    const el = h('div', {
      style: {
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 16px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '10px', cursor: 'pointer', transition: 'background .15s',
      },
      onmouseover: function () { this.style.background = 'var(--surface-light)'; },
      onmouseout:  function () { this.style.background = 'var(--surface)'; },
    });
    el.dataset.uuid = ent.uuid;
    el.innerHTML = `
      <span style="font-size:0.7rem;background:rgba(34,211,238,.12);color:var(--primary);padding:2px 7px;border-radius:5px;font-weight:700;white-space:nowrap;">${ent.type}</span>
      <span style="flex:1;font-weight:600;font-size:0.88rem;color:var(--text);">${title}</span>
      <span style="font-size:0.72rem;color:var(--text-soft);">${ent.status}</span>
      <span style="font-size:0.72rem;color:var(--text-soft);">${date}</span>
    `;
    return el;
  }

  /* ────────────────────────────────────────────────────
     MODULE 1: Overview / Dashboard
  ──────────────────────────────────────────────────── */
  const ModuleOverview = {
    id: 'overview', title: 'Overview', icon: '🏠', order: 1, permissions: [],

    async render(container, ws) {
      container.innerHTML = `<div id="ov-stats" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin-bottom:28px;"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;">
          <div id="ov-recent" style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px;"></div>
          <div id="ov-activity" style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px;"></div>
        </div>`;

      // Live counters
      const all = await getEntities();
      const c   = { draft:0, pending_review:0, published:0, archived:0 };
      all.forEach(e => { if (c[e.status] !== undefined) c[e.status]++; });

      document.getElementById('ov-stats').innerHTML = [
        statCard('📦', all.length,          'Total Entities'),
        statCard('⏳', c.pending_review,     'Pending Review'),
        statCard('📢', c.published,          'Published'),
        statCard('📝', c.draft,             'Drafts'),
        statCard('🗄', c.archived,          'Archived'),
      ].join('');

      // Recent entities
      const recent = all.sort((a,b) => new Date(b.updatedAt||0) - new Date(a.updatedAt||0)).slice(0, 6);
      const recBox = document.getElementById('ov-recent');
      recBox.innerHTML = `<h3 style="margin:0 0 12px;font-size:0.9rem;font-weight:700;color:var(--text);">🕒 Recently Modified</h3>`;
      recent.forEach(ent => recBox.appendChild(entityRow(ent, ws)));

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

  /* ────────────────────────────────────────────────────
     MODULE 2: Review Queue
  ──────────────────────────────────────────────────── */
  const ModuleReviewQueue = {
    id: 'review-queue', title: 'Review Queue', icon: '📋', order: 2,
    permissions: ['content.review'],

    async badgeProvider() {
      const pending = await getEntities({ status: 'pending_review' }).catch(() => []);
      return pending.length;
    },

    async render(container, ws) {
      container.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h2 style="margin:0;font-size:1.2rem;font-weight:800;">📋 Review Queue</h2>
          <span id="rq-count" style="font-size:0.82rem;color:var(--text-soft);font-weight:600;"></span>
        </div>
        <div id="rq-items" style="display:flex;flex-direction:column;gap:10px;"></div>`;

      const pending = await getEntities({ status: 'pending_review' });
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
              if (typeof PharmoraEntityReview !== 'undefined') {
                if (action === 'approve') await PharmoraEntityReview.approve(uuid, 'admin');
                if (action === 'reject')  await PharmoraEntityReview.reject(uuid, prompt('Rejection reason:') || '—', 'admin');
                if (action === 'changes') await PharmoraEntityReview.requestChanges(uuid, prompt('Change notes:') || '—', 'admin');
              }
              if (action === 'delete' && typeof PharmoraEntityManager !== 'undefined') {
                await PharmoraEntityManager.bulkDelete([uuid], 'admin');
              }
              ws.refreshCurrentModule();
            } catch(err) { alert(`Action failed: ${err.message}`); }
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
    const pending = await getEntities({ status: 'pending_review' }).catch(() => []);
    for (const ent of pending) {
      try {
        if (typeof PharmoraEntityReview !== 'undefined') {
          if (action === 'approve') await PharmoraEntityReview.approve(ent.uuid, 'admin');
        }
      } catch(e) {}
    }
    if (PharmoraWorkbench._wb) PharmoraWorkbench._wb.refreshCurrentModule();
  };

  /* ────────────────────────────────────────────────────
     MODULE 3: Entity Manager
  ──────────────────────────────────────────────────── */
  const ModuleEntityManager = {
    id: 'entity-manager', title: 'Entity Manager', icon: '📦', order: 3,
    permissions: ['content.manage'],

    render(container, ws) {
      container.innerHTML = '<div id="em-mount"></div>';
      PharmoraEntityManagerUI.render('em-mount', {
        layout: 'list',
        sort:   'created',
      });
    },

    toolbar() {
      return [
        { label: 'All Entities',    icon: '📦', action: "PharmoraEntityManagerUI.render('em-mount',{})" },
        { label: 'Pending',         icon: '⏳', action: "PharmoraEntityManagerUI.render('em-mount',{status:'pending_review'})" },
        { label: 'Published',       icon: '📢', action: "PharmoraEntityManagerUI.render('em-mount',{status:'published'})" },
        { label: 'Drafts',          icon: '📝', action: "PharmoraEntityManagerUI.render('em-mount',{status:'draft'})" },
        { label: 'Grid',            icon: '⊞',  action: "PharmoraEntityManagerUI.render('em-mount',{layout:'list'})" },
        { label: 'Table',           icon: '☰',  action: "PharmoraEntityManagerUI.render('em-mount',{layout:'table'})" },
        { label: 'Compact',         icon: '≡',  action: "PharmoraEntityManagerUI.render('em-mount',{layout:'compact'})" },
      ];
    },

    shortcuts() {
      return {
        'g': () => PharmoraEntityManagerUI.render('em-mount', { layout: 'list' }),
        't': () => PharmoraEntityManagerUI.render('em-mount', { layout: 'table' }),
      };
    },
  };

  /* ────────────────────────────────────────────────────
     MODULE 4: Verification Centre
  ──────────────────────────────────────────────────── */
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

  /* ────────────────────────────────────────────────────
     MODULE 5: User Management
  ──────────────────────────────────────────────────── */
  const ModuleUsers = {
    id: 'users', title: 'Users', icon: '👥', order: 5,
    permissions: ['users.manage'],

    async render(container, ws) {
      container.innerHTML = `
        <h2 style="margin:0 0 20px;font-size:1.2rem;font-weight:800;">👥 User Management</h2>
        <div style="display:flex;gap:10px;margin-bottom:20px;">
          <input id="um-search" type="text" placeholder="🔍 Search by name, email or ID…"
            style="flex:1;padding:10px 14px;border-radius:10px;border:1px solid var(--border);background:var(--background);color:var(--text);" />
          <select id="um-role-filter" style="padding:10px;border-radius:10px;border:1px solid var(--border);background:var(--background);color:var(--text);">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="reviewer">Reviewer</option>
            <option value="contributor">Contributor</option>
            <option value="student">Student</option>
          </select>
        </div>
        <div id="um-list" style="display:flex;flex-direction:column;gap:8px;min-height:100px;"></div>`;

      async function loadUsers() {
        let users = [];
        try { users = await getRecords('users'); } catch(e) {}
        const q    = document.getElementById('um-search')?.value.toLowerCase() || '';
        const role = document.getElementById('um-role-filter')?.value || '';
        let filtered = users.filter(u => {
          const hay = [u.name, u.email, u.id].filter(Boolean).join(' ').toLowerCase();
          const matchQ    = !q    || hay.includes(q);
          const matchRole = !role || (u.role || '').toLowerCase() === role;
          return matchQ && matchRole;
        });

        const list = document.getElementById('um-list');
        if (!list) return;
        if (!filtered.length) {
          list.innerHTML = `<div style="padding:30px;text-align:center;color:var(--text-soft);">No users found.</div>`;
          return;
        }
        list.innerHTML = '';
        filtered.slice(0, 50).forEach(user => {
          const row = document.createElement('div');
          row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--surface);border:1px solid var(--border);border-radius:10px;cursor:pointer;';
          row.dataset.wbUser     = user.id || user.uid || '';
          row.dataset.wbUserName = user.name || user.email || '';
          row.innerHTML = `
            <div style="width:36px;height:36px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:0.9rem;flex-shrink:0;">
              ${(user.name || user.email || '?')[0].toUpperCase()}
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-weight:600;font-size:0.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${user.name || '—'}</div>
              <div style="font-size:0.75rem;color:var(--text-soft);">${user.email || ''}</div>
            </div>
            <span style="font-size:0.72rem;background:var(--surface-light);padding:2px 7px;border-radius:5px;font-weight:600;">${user.role || 'student'}</span>
            <span style="font-size:0.72rem;color:${user.disabled ? '#ef4444' : '#22c55e'};">${user.disabled ? '🚫' : '✅'}</span>
          `;
          // Click → open user viewer in workbench drawer
          row.addEventListener('click', () => ws.openViewer({ _kind: 'user', ...user }));
          list.appendChild(row);
        });
      }

      const deb = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
      document.getElementById('um-search')?.addEventListener('input', deb(loadUsers, 280));
      document.getElementById('um-role-filter')?.addEventListener('change', loadUsers);
      await loadUsers();
    },

    toolbar() {
      return [
        { label: 'Refresh', icon: '🔄', action: "PharmoraWorkbench._wb.refreshCurrentModule()" },
      ];
    },
  };

  /* ────────────────────────────────────────────────────
     MODULE 6: Reports
  ──────────────────────────────────────────────────── */
  const ModuleReports = {
    id: 'reports', title: 'Reports', icon: '🚩', order: 6,
    permissions: ['forum.moderate'],

    render(container, ws) {
      container.innerHTML = `<h2 style="margin:0 0 20px;font-size:1.2rem;font-weight:800;">🚩 Reports</h2><div id="rp-mount"></div>`;
      if (typeof renderReports === 'function') {
        // Temporarily point legacy function to our mount target
        const orig = document.getElementById('admin-actions');
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

  /* ────────────────────────────────────────────────────
     MODULE 7: Audit Logs
  ──────────────────────────────────────────────────── */
  const ModuleAuditLogs = {
    id: 'audit-logs', title: 'Audit Logs', icon: '🧾', order: 7,
    permissions: ['users.manage'],

    async render(container, ws) {
      container.innerHTML = `<h2 style="margin:0 0 20px;font-size:1.2rem;font-weight:800;">🧾 Audit Logs</h2><div id="al-items" style="display:flex;flex-direction:column;gap:8px;"></div>`;
      const all = await getEntities();
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

  /* ────────────────────────────────────────────────────
     MODULE 8: Analytics
  ──────────────────────────────────────────────────── */
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

  /* ────────────────────────────────────────────────────
     MODULE 9: Settings
  ──────────────────────────────────────────────────── */
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

  /* ────────────────────────────────────────────────────
     MODULE 10: Extensions (Plugin Registry Viewer)
  ──────────────────────────────────────────────────── */
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

  /* ────────────────────────────────────────────────────
     SEARCH PROVIDERS
  ──────────────────────────────────────────────────── */

  const EntitySearchProvider = {
    id:    'entities',
    label: '📦 Entities',
    async search(query) {
      if (!query || typeof PharmoraEntityAPI === 'undefined') return [];
      const list = await PharmoraEntityAPI.listEntities().catch(() => []);
      const q    = query.toLowerCase();
      return list.filter(e => {
        const hay = [e.content?.title, e.content?.name, e.type, e.publicId].filter(Boolean).join(' ').toLowerCase();
        return hay.includes(q);
      }).slice(0, 20).map(e => ({
        label: e.content?.title || e.content?.name || e.publicId,
        sub:   e.type,
        uuid:  e.uuid,
        _kind: 'entity',
      }));
    },
  };

  const UserSearchProvider = {
    id:    'users',
    label: '👥 Users',
    async search(query) {
      if (!query) return [];
      let users = [];
      try { users = await getRecords('users'); } catch(e) { return []; }
      const q = query.toLowerCase();
      return users.filter(u => {
        const fields = [u.name, u.displayName, u.username, u.email, u.id, u.uid, u.code, u.userCode];
        return fields.filter(Boolean).join(' ').toLowerCase().includes(q);
      }).slice(0, 10).map(u => ({
        label: u.name || u.displayName || u.email || u.username,
        sub:   `${u.role || 'user'} — ${u.code || u.userCode || ''}`,
        _kind: 'user',
        ...u,
      }));
    },
  };

  /* ────────────────────────────────────────────────────
     ADMIN WORKBENCH BOOT
  ──────────────────────────────────────────────────── */
  window.PharmoraAdminWorkbench = {
    /**
     * Boot the Admin Workbench.
     * Call this once after pharmora-ready has fired.
     */
    boot: async function(config) {
      const wb = PharmoraWizardCore.createWorkbench({
        id:                 'admin',
        containerId:        config.workspace   || 'admin-workspace',
        sidebarId:          config.sidebar     || 'admin-sidebar',
        toolbarId:          config.toolbar     || 'admin-toolbar',
        drawerContainerId:  config.drawer      || 'entity-drawer',
        defaultModule:      config.defaultModule || 'overview',
        autosave:           true,
      });

      // Expose _registry for Extensions module
      if (!window.PharmoraWorkbench) window.PharmoraWorkbench = {};
      window.PharmoraWorkbench._registry = [];  // populated as modules register

      // Register search providers first
      wb.registerSearchProvider(EntitySearchProvider);
      wb.registerSearchProvider(UserSearchProvider);

      // Register all admin modules
      [
        ModuleOverview,
        ModuleReviewQueue,
        ModuleEntityManager,
        ModuleVerification,
        ModuleUsers,
        ModuleReports,
        ModuleAuditLogs,
        ModuleAnalytics,
        ModuleSettings,
        ModuleExtensions,
      ].forEach(mod => {
        wb.registerModule(mod);
        window.PharmoraWorkbench._registry.push(mod);
      });

      // Wire global search if a search input exists on the page
      const searchEl = document.getElementById('wb-global-search');
      if (searchEl) {
        const deb = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
        searchEl.addEventListener('input', deb(async () => {
          const q       = searchEl.value.trim();
          const resultsEl = document.getElementById('wb-search-results');
          if (!resultsEl) return;
          if (!q) { resultsEl.style.display = 'none'; return; }
          const groups = await wb.search(q);
          resultsEl.style.display = 'block';
          resultsEl.innerHTML = groups.map(g => `
            <div style="padding:8px 12px;font-size:0.72rem;font-weight:700;color:var(--text-soft);text-transform:uppercase;">${g.label}</div>
            ${g.items.map(item => {
              const clickAction = item._kind === 'user'
                ? `PharmoraWorkbench._wb.openViewer(${JSON.stringify({ _kind: 'user', id: item.id || item.uid, name: item.label, email: item.email || '', role: item.role || '', code: item.code || item.userCode || '' }).replace(/"/g, '&quot;')})`
                : `PharmoraWorkbench._wb.openViewer({ uuid: '${item.uuid}' })`;
              return `
                <div onclick="${clickAction}"
                     style="padding:10px 14px;cursor:pointer;font-size:0.85rem;border-bottom:1px solid var(--border);"
                     onmouseover="this.style.background='var(--surface-light)'" onmouseout="this.style.background=''">
                  <strong>${item.label}</strong>
                  <span style="margin-left:6px;font-size:0.75rem;color:var(--text-soft);">${item.sub || ''}</span>
                </div>
              `;
            }).join('')}
          `).join('') || '<div style="padding:12px;color:var(--text-soft);font-size:0.85rem;">No results.</div>';
        }, 300));
        document.addEventListener('click', e => {
          const res = document.getElementById('wb-search-results');
          if (res && !searchEl.contains(e.target) && !res.contains(e.target)) res.style.display = 'none';
        });
      }

      await wb.boot();
      return wb;
    },
  };

})();
