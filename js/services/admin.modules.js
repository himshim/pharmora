/**
 * Pharmora Admin Workbench Core Bootloader
 * ─────────────────────────────────────────────────────────────────────
 * Boots the Admin Workbench and dynamically registers all workspace panels
 * registered under window.PharmoraAdminModules.
 */
(function () {
  'use strict';

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
      window.PharmoraWorkbench._registry = [];

      // Register search providers first
      wb.registerSearchProvider(EntitySearchProvider);
      wb.registerSearchProvider(UserSearchProvider);

      // Register all admin modules registered globally via plugins
      const modules = window.PharmoraAdminModules || [];
      modules.sort((a, b) => (a.order || 99) - (b.order || 99)).forEach(mod => {
        wb.registerModule(mod);
        window.PharmoraWorkbench._registry.push(mod);
      });

      // Wire global search if search input exists
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
