/**
 * Pharmora Workbench Core
 * Core shell, navigation, search routing, initialization.
 */
(function () {
  'use strict';

  if (!window.PharmoraWizardCore) {
    window.PharmoraWizardCore = {};
  }

  function createWorkbench(config) {
    const {
      id,
      containerId,
      sidebarId,
      toolbarId,
      drawerContainerId,
      defaultModule = null,
      autosave = true,
      onModuleChange
    } = config;

    const storageKey = `pharmora_workbench_${id}`;
    const _registry   = [];        // registered modules
    const _providers  = [];        // search providers
    let   _activeId   = null;
    let   _activeModule = null;
    let   _drawerOpen   = false;

    // ── Persistence ─────────────────────────────────────
    function saveWorkspaceState() {
      if (!autosave) return;
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          activeId: _activeId,
          ts: Date.now()
        }));
      } catch(e) {}
    }

    function restoreWorkspaceState() {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const data = JSON.parse(raw);
          if (data.activeId) return data.activeId;
        }
      } catch(e) {}
      return null;
    }

    // ── Module Registry ──────────────────────────────────
    function registerModule(def) {
      if (!def || !def.id) throw new Error('Workbench module requires an id');
      if (_registry.find(m => m.id === def.id)) {
        console.warn(`[Workbench] Module "${def.id}" already registered — skipping.`);
        return;
      }
      _registry.push({
        id:             def.id,
        title:          def.title          || def.id,
        icon:           def.icon           || '📄',
        order:          def.order          || 99,
        permissions:    def.permissions    || [],
        render:         def.render         || function(){},
        refresh:        def.refresh        || function(c, ws){ ws.navigate(def.id); },
        destroy:        def.destroy        || function(){},
        toolbar:        def.toolbar        || function(){ return []; },
        shortcuts:      def.shortcuts      || function(){ return {}; },
        badgeProvider:  def.badgeProvider  || null,
        searchProvider: def.searchProvider || null,
        viewer:         def.viewer         || null,
      });
      _registry.sort((a, b) => a.order - b.order);

      // Register any search provider the module exposes
      if (def.searchProvider) _providers.push(def.searchProvider);

      // Rebuild sidebar if already mounted
      if (document.getElementById(sidebarId)) _renderSidebar();
    }

    // ── Permission check ─────────────────────────────────
    function _hasPermissions(mod) {
      if (!mod.permissions || mod.permissions.length === 0) return true;
      if (typeof PharmoraPermissionService !== 'undefined') {
        return mod.permissions.every(p => PharmoraPermissionService.can(p));
      }
      return true; // fail open when permission service not loaded
    }

    // ── Sidebar ──────────────────────────────────────────
    function _renderSidebar() {
      const sidebar = document.getElementById(sidebarId);
      if (!sidebar) return;

      const visible = _registry.filter(_hasPermissions);

      const items = visible.map(mod => {
        const isActive = mod.id === _activeId;
        return `
          <a data-wb-module="${mod.id}" href="#"
            style="display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:var(--radius-sm);margin-bottom:3px;
                   color:${isActive ? 'var(--text)' : 'var(--text-soft)'};
                   background:${isActive ? 'var(--surface-light)' : 'transparent'};
                   font-weight:600;font-size:var(--font-sm);text-decoration:none;cursor:pointer;transition:background .15s,color .15s;"
            onmouseover="if(!this.classList.contains('wb-active'))this.style.background='var(--surface-light)'"
            onmouseout="if(!this.classList.contains('wb-active'))this.style.background='transparent'">
            <span>${mod.icon}</span>
            <span class="wb-nav-label">${mod.title}</span>
            ${mod.badgeProvider ? `<span class="wb-badge" data-badge="${mod.id}" style="margin-left:auto;background:var(--primary);color:#000;border-radius:20px;padding:1px 7px;font-size:0.7rem;font-weight:700;display:none;"></span>` : ''}
          </a>`;
      }).join('');

      sidebar.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 14px 20px;font-size:1.5rem;font-weight:900;
                    background:linear-gradient(90deg,var(--primary),var(--secondary));-webkit-background-clip:text;background-clip:text;color:transparent;">
          ⚕ Pharmora
        </div>
        <div style="padding:0 8px;margin-bottom:12px;">
          <input id="wb-nav-search" placeholder="🔍 Find section…" type="text"
            style="width:100%;padding:8px 12px;border-radius:10px;border:1px solid var(--border);background:var(--background);color:var(--text);font-size:var(--font-sm);box-sizing:border-box;" />
        </div>
        <nav id="wb-nav" style="display:flex;flex-direction:column;">${items}</nav>
      `;

      // Nav click delegation
      sidebar.querySelectorAll('[data-wb-module]').forEach(el => {
        el.addEventListener('click', e => {
          e.preventDefault();
          navigate(el.dataset.wbModule);
        });
      });

      // Sidebar search filter
      const navSearch = sidebar.querySelector('#wb-nav-search');
      if (navSearch) {
        navSearch.addEventListener('input', () => {
          const q = navSearch.value.toLowerCase();
          sidebar.querySelectorAll('[data-wb-module]').forEach(el => {
            const label = el.querySelector('.wb-nav-label')?.textContent.toLowerCase() || '';
            el.style.display = label.includes(q) ? '' : 'none';
          });
        });
      }

      // Async badge updates
      _registry.filter(m => m.badgeProvider).forEach(mod => {
        Promise.resolve(mod.badgeProvider()).then(val => {
          const badge = sidebar.querySelector(`[data-badge="${mod.id}"]`);
          if (badge && val > 0) {
            badge.textContent = val;
            badge.style.display = '';
          }
        }).catch(() => {});
      });
    }

    // ── Toolbar ──────────────────────────────────────────
    function _renderToolbar(mod) {
      const toolbar = document.getElementById(toolbarId);
      if (!toolbar) return;
      const actions = (typeof mod.toolbar === 'function') ? mod.toolbar() : [];
      if (actions.length === 0) { toolbar.innerHTML = ''; return; }
      toolbar.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 16px;
                    background:var(--surface);border-bottom:1px solid var(--border);">
          ${actions.map(btn => `
            <button onclick="${btn.action || ''}"
              style="padding:7px 14px;border-radius:var(--radius-sm);border:${btn.primary ? 'none' : '1px solid var(--border)'};
                     background:${btn.primary ? 'var(--primary)' : 'var(--background)'};
                     color:${btn.primary ? '#000' : 'var(--text)'};
                     font-weight:600;font-size:var(--font-xs);cursor:pointer;display:flex;align-items:center;gap:5px;">
              ${btn.icon || ''} ${btn.label}
            </button>
          `).join('')}
        </div>`;
    }

    // ── Keyboard shortcuts ───────────────────────────────
    let _shortcutListener = null;
    function _attachShortcuts(mod) {
      if (_shortcutListener) document.removeEventListener('keydown', _shortcutListener);
      const modShortcuts = (typeof mod.shortcuts === 'function') ? mod.shortcuts() : {};
      _shortcutListener = (e) => {
        if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;
        const key = (e.ctrlKey ? 'ctrl+' : '') + e.key.toLowerCase();
        if (key === 'escape') { workbench.closeDrawer(); return; }
        if (modShortcuts[key]) { e.preventDefault(); modShortcuts[key](e); }
      };
      document.addEventListener('keydown', _shortcutListener);
    }

    // ── Navigation ───────────────────────────────────────
    async function navigate(moduleId) {
      const mod = _registry.find(m => m.id === moduleId);
      if (!mod) { console.warn(`[Workbench] Module "${moduleId}" not found`); return; }
      if (!_hasPermissions(mod)) { console.warn(`[Workbench] Permission denied for "${moduleId}"`); return; }

      const container = document.getElementById(containerId);
      if (!container) return;

      // Destroy previous module
      if (_activeModule && typeof _activeModule.destroy === 'function') {
        try { _activeModule.destroy(container); } catch(e) {}
      }

      _activeId     = moduleId;
      _activeModule = mod;

      // Update sidebar active state
      document.querySelectorAll('[data-wb-module]').forEach(el => {
        el.style.background    = el.dataset.wbModule === moduleId ? 'var(--surface-light)' : 'transparent';
        el.style.color         = el.dataset.wbModule === moduleId ? 'var(--text)' : 'var(--text-soft)';
      });

      _renderToolbar(mod);
      _attachShortcuts(mod);
      saveWorkspaceState();

      container.innerHTML = '';
      try {
        await mod.render(container, workbench);
      } catch(err) {
        console.error(`[Workbench] Module "${moduleId}" render error`, err);
        container.innerHTML = `<div style="padding:40px;color:var(--danger);">Failed to load module: ${moduleId}. Check console.</div>`;
      }

      if (onModuleChange) onModuleChange(mod, workbench);
    }

    function refreshCurrentModule() {
      if (_activeId) navigate(_activeId);
    }

    // ── Global Search (multi-provider) ───────────────────
    function registerSearchProvider(provider) {
      if (!_providers.find(p => p.id === provider.id)) _providers.push(provider);
    }

    async function search(query) {
      const results = await Promise.allSettled(
        _providers.map(p => Promise.resolve(p.search(query)).then(r => ({ providerId: p.id, label: p.label, items: r || [] })))
      );
      return results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
        .filter(r => r.items.length > 0);
    }

    // ── Boot ─────────────────────────────────────────────
    async function boot() {
      _renderSidebar();

      // Attach global card/result click interception
      document.addEventListener('click', e => {
        const card = e.target.closest('[data-uuid],[data-wb-entity],[data-wb-user]');
        if (!card) return;
        if (card.dataset.wbUser) {
          e.preventDefault();
          workbench.openViewer({ _kind: 'user', id: card.dataset.wbUser, name: card.dataset.wbUserName || '' });
          return;
        }
        const uuid = card.dataset.uuid || card.dataset.wbEntity;
        if (uuid) {
          e.preventDefault();
          workbench.openViewer({ uuid });
        }
      });

      // Global Ctrl+K shortcut to focus workbench search
      document.addEventListener('keydown', e => {
        if (e.ctrlKey && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          const searchInput = document.querySelector('#wb-global-search, [data-wb-search]');
          if (searchInput) searchInput.focus();
        }
        if (e.key === 'Escape' && workbench._drawerOpen) workbench.closeDrawer();
      });

      // Restore last active module
      const restored = restoreWorkspaceState();
      const startId  = restored || defaultModule || (_registry[0] && _registry[0].id);
      if (startId) await navigate(startId);
    }

    // ── Base workbench instance ──
    const workbench = {
      navigate,
      refreshCurrentModule,
      registerModule,
      registerSearchProvider,
      search,
      boot,
      saveWorkspaceState,
      restoreWorkspaceState,
      _registry
    };

    // Initialize workbench modules/plugins
    if (window.PharmoraWorkbenchForm) {
      window.PharmoraWorkbenchForm.init(workbench, config);
    }
    if (window.PharmoraWorkbenchRelations) {
      window.PharmoraWorkbenchRelations.init(workbench, config);
    }
    if (window.PharmoraWorkbenchDrawer) {
      window.PharmoraWorkbenchDrawer.init(workbench, config);
    }

    // Store global reference so onclick strings can access it
    if (!window.PharmoraWorkbench) window.PharmoraWorkbench = {};
    window.PharmoraWorkbench._wb = workbench;

    return workbench;
  }

  // Attach to window.PharmoraWizardCore
  window.PharmoraWizardCore.createWorkbench = createWorkbench;
})();
