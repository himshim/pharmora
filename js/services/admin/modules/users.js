/**
 * Admin Module: User Management
 */
(function () {
  'use strict';

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

  window.PharmoraAdminModules = window.PharmoraAdminModules || [];
  window.PharmoraAdminModules.push(ModuleUsers);
})();
