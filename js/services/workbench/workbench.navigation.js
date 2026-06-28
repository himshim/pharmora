    // ── Boot ─────────────────────────────────────────────
    async function boot() {
      _renderSidebar();

      // Attach global card/result click interception
      document.addEventListener('click', e => {
        const card = e.target.closest('[data-uuid],[data-wb-entity],[data-wb-user]');
        if (!card) return;
        if (card.dataset.wbUser) {
          e.preventDefault();
          openViewer({ _kind: 'user', id: card.dataset.wbUser, name: card.dataset.wbUserName || '' });
          return;
        }
        const uuid = card.dataset.uuid || card.dataset.wbEntity;
        if (uuid) {
          e.preventDefault();
          openViewer({ uuid });
        }
      });

      // Global Ctrl+K shortcut to focus workbench search
      document.addEventListener('keydown', e => {
        if (e.ctrlKey && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          const searchInput = document.querySelector('#wb-global-search, [data-wb-search]');
          if (searchInput) searchInput.focus();
        }
        if (e.key === 'Escape' && _drawerOpen) closeDrawer();
      });

      // Restore last active module
      const restored = restoreWorkspaceState();
      const startId  = restored || defaultModule || (_registry[0] && _registry[0].id);
      if (startId) await navigate(startId);
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
        container.innerHTML = `<div style="padding:40px;color:#ef4444;">Failed to load module: ${moduleId}. Check console.</div>`;
      }

      if (onModuleChange) onModuleChange(mod, workbench);
    }

    function refreshCurrentModule() {
      if (_activeId) navigate(_activeId);
    }

        function closeDrawer() {
      const drawerEl = document.getElementById(drawerContainerId);
      if (drawerEl) drawerEl.classList.remove('open');
      _drawerOpen = false;
    }