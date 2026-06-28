
/*
 Generated Pharmora Bundle
 Do not edit directly
*/



    /* ===== js/services/wizard.core.js ===== */

    
;
/**
 * Pharmora Wizard Core
 * A reusable state machine & layout generator for multi-step guided wizards.
 */
const PharmoraWizardCore = (function () {
  'use strict';

  function createWizard(config) {
    const {
      id,                  // Unique ID (e.g. 'profile', 'contribute')
      containerId,         // HTML element ID to render into
      steps = [],          // Array of Step Definitions: { id, label, fields: [...], render, validate }
      getInitialState,    // Function returning initial state
      onComplete,          // Async save/complete callback
      onStepChange,        // Optional hook
      autosave = true,     // Persist drafts locally
      dynamicSteps         // Optional function: (state, steps) => steps
    } = config;

    const storageKey = `pharmora_draft_wizard_${id}`;

    let state = {
      currentStepIndex: 0,
      data: {}
    };

    // Load draft or initial state
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        state = JSON.parse(saved);
      } else if (getInitialState) {
        state.data = getInitialState();
      }
    } catch (e) {
      console.warn('Failed to load draft state', e);
      if (getInitialState) state.data = getInitialState();
    }

    function saveDraft() {
      if (!autosave) return;
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (e) {
        console.warn('Autosave failed', e);
      }
    }

    function clearDraft() {
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {}
    }

    function getSteps() {
      if (typeof dynamicSteps === 'function') {
        return dynamicSteps(state.data, steps);
      }
      return steps;
    }

    function getProgress() {
      const currentSteps = getSteps();
      if (currentSteps.length <= 1) return 100;
      return Math.round((state.currentStepIndex / (currentSteps.length - 1)) * 100);
    }

    async function next() {
      const currentSteps = getSteps();
      const currentStep = currentSteps[state.currentStepIndex];

      // Step-specific validation
      if (currentStep && typeof currentStep.validate === 'function') {
        const error = await currentStep.validate(state.data);
        if (error) {
          if (typeof showToast === 'function') showToast(error, 'warning');
          else alert(error);
          return;
        }
      }

      if (state.currentStepIndex < currentSteps.length - 1) {
        state.currentStepIndex++;
        saveDraft();
        render();
        if (onStepChange) onStepChange(state);
      } else {
        // Final completion check
        if (confirm('Are you sure you want to finalize and submit?')) {
          try {
            await onComplete(state.data);
            clearDraft();
            if (typeof showToast === 'function') showToast('Success!', 'success');
          } catch (err) {
            console.error('Wizard completion failed', err);
            if (typeof showToast === 'function') showToast('Submission failed. Try again.', 'error');
          }
        }
      }
    }

    function back() {
      if (state.currentStepIndex > 0) {
        state.currentStepIndex--;
        saveDraft();
        render();
        if (onStepChange) onStepChange(state);
      }
    }

    function renderProgressPills(currentSteps) {
      return `
        <div class="wizard-progress" style="display:flex;align-items:center;margin-bottom:30px;user-select:none;flex-wrap:wrap;gap:8px;">
          ${currentSteps.map((s, idx) => {
            let statusClass = '';
            if (idx === state.currentStepIndex) statusClass = 'active';
            else if (idx < state.currentStepIndex) statusClass = 'done';
            
            const numBg = statusClass === 'active' ? 'var(--primary)' : (statusClass === 'done' ? '#22c55e' : 'var(--border)');
            const numColor = statusClass === 'active' ? '#000' : '#fff';
            const labelColor = statusClass === 'active' ? 'var(--text)' : 'var(--text-muted)';
            
            return `
              <div class="wizard-pill ${statusClass}" style="display:flex;align-items:center;gap:8px;font-size:0.85rem;font-weight:600;color:${labelColor};">
                <span style="width:22px;height:22px;border-radius:50%;background:${numBg};color:${numColor};display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;">${idx + 1}</span>
                ${s.label}
              </div>
              ${idx < currentSteps.length - 1 ? '<div style="flex:1;height:1px;background:var(--border);min-width:10px;max-width:30px;"></div>' : ''}
            `;
          }).join('')}
        </div>
      `;
    }

    function render() {
      const container = document.getElementById(containerId);
      if (!container) return;

      const currentSteps = getSteps();
      const currentStep = currentSteps[state.currentStepIndex];

      if (!currentStep) return;

      // Render step HTML via config render function
      const stepContent = currentStep.render(state.data);

      container.innerHTML = `
        <div class="wizard-card card" style="max-width:820px;margin:0 auto;padding:30px;">
          ${renderProgressPills(currentSteps)}
          <div class="wizard-step-content" style="min-height:200px;">
            ${stepContent}
          </div>
          <div class="wizard-nav" style="display:flex;justify-content:space-between;align-items:center;margin-top:30px;padding-top:20px;border-top:1px solid var(--border);">
            <button class="btn" style="${state.currentStepIndex === 0 ? 'visibility:hidden;' : ''}" onclick="window.${id}WizardInstance.back()">← Back</button>
            <button class="btn btn-primary" onclick="window.${id}WizardInstance.next()">
              ${state.currentStepIndex === currentSteps.length - 1 ? '🚀 Finish & Save' : 'Continue →'}
            </button>
          </div>
        </div>
      `;
    }

    // Attach to global instance for onclick handlers
    window[`${id}WizardInstance`] = { next, back, state, saveDraft };

    // Initial render
    render();
  }

  /**
   * createWorkbench()
   * Workspace mode on top of the Wizard Core state engine.
   * Shares the same persistence, step navigation, draft system.
   * Modules replace wizard steps; each module is self-contained.
   */
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
            style="display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:12px;margin-bottom:3px;
                   color:${isActive ? 'var(--text)' : 'var(--text-soft)'};
                   background:${isActive ? 'var(--surface-light)' : 'transparent'};
                   font-weight:600;font-size:0.88rem;text-decoration:none;cursor:pointer;transition:background .15s,color .15s;"
            onmouseover="if(!this.classList.contains('wb-active'))this.style.background='var(--surface-light)'"
            onmouseout="if(!this.classList.contains('wb-active'))this.style.background='transparent'">
            <span>${mod.icon}</span>
            <span class="wb-nav-label">${mod.title}</span>
            ${mod.badgeProvider ? `<span class="wb-badge" data-badge="${mod.id}" style="margin-left:auto;background:var(--primary);color:#fff;border-radius:20px;padding:1px 7px;font-size:0.7rem;font-weight:700;display:none;"></span>` : ''}
          </a>`;
      }).join('');

      sidebar.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 14px 20px;font-size:1.5rem;font-weight:900;
                    background:linear-gradient(90deg,var(--primary),var(--secondary));-webkit-background-clip:text;background-clip:text;color:transparent;">
          ⚕ Pharmora
        </div>
        <div style="padding:0 8px;margin-bottom:12px;">
          <input id="wb-nav-search" placeholder="🔍 Find section…" type="text"
            style="width:100%;padding:8px 12px;border-radius:10px;border:1px solid var(--border);background:var(--background);color:var(--text);font-size:0.82rem;box-sizing:border-box;" />
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
              style="padding:7px 14px;border-radius:8px;border:${btn.primary ? 'none' : '1px solid var(--border)'};
                     background:${btn.primary ? 'var(--primary)' : 'var(--background)'};
                     color:${btn.primary ? '#fff' : 'var(--text)'};
                     font-weight:600;font-size:0.82rem;cursor:pointer;display:flex;align-items:center;gap:5px;">
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
        if (key === 'escape') { closeDrawer(); return; }
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
        container.innerHTML = `<div style="padding:40px;color:#ef4444;">Failed to load module: ${moduleId}. Check console.</div>`;
      }

      if (onModuleChange) onModuleChange(mod, workbench);
    }

    function refreshCurrentModule() {
      if (_activeId) navigate(_activeId);
    }

    // ── Universal Viewer & Creator Wizard (openViewer) ───
    let createWizardState = { step: 1, type: null, formData: {} };

    async function openViewer(item) {
      const drawerEl = document.getElementById(drawerContainerId);
      if (!drawerEl) return;

      _drawerOpen = true;
      drawerEl.classList.add('open');
      drawerEl.innerHTML = `<div style="padding:24px;color:var(--text-soft);">Loading…</div>`;

      // ── Handle Entity Creation Wizard ──
      if (item && (item._create || item.uuid === null)) {
        createWizardState = { step: 1, type: item.type || null, formData: {} };
        _renderCreationWizard(drawerEl);
        return;
      }

      // Detect item type and delegate to the right viewer
      const kind = _detectItemKind(item);
      const modWithViewer = _registry.find(m => m.viewer && m.viewer.handles && m.viewer.handles(item, kind));

      if (modWithViewer && modWithViewer.viewer.render) {
        try {
          const html = await modWithViewer.viewer.render(item, workbench);
          drawerEl.innerHTML = html || '';
        } catch(e) { drawerEl.innerHTML = `<div style="padding:24px;color:#ef4444;">Viewer error: ${e.message}</div>`; }
        return;
      }

      // Default entity or user viewer
      if (kind === 'entity') {
        await _renderEntityDrawer(drawerEl, item);
      } else if (kind === 'user') {
        await _renderUserDrawer(drawerEl, item);
      } else {
        drawerEl.innerHTML = `
          <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
            <h3 style="margin:0;color:var(--text);">${item.title || item.name || item.id || 'Item'}</h3>
            <button onclick="PharmoraWorkbench._wb.closeDrawer()" style="border:none;background:var(--surface-light);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1rem;color:var(--text);">✕</button>
          </div>
          <div style="padding:24px;">
            <pre style="font-size:0.75rem;color:var(--text-soft);white-space:pre-wrap;">${JSON.stringify(item, null, 2)}</pre>
          </div>`;
      }
    }

    function _detectItemKind(item) {
      if (!item) return 'unknown';
      if (item._kind === 'user' || item.uid || item.email) return 'user';
      if (item.type && item.uuid) return 'entity';
      if (item.publicId) return 'entity';
      return 'unknown';
    }

    // ── Reusable Drawer Sub-components ──
    function renderDrawerHeader(title, subtitle = '', onCloseClick = 'PharmoraWorkbench._wb.closeDrawer()') {
      return `
        <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;
                    position:sticky;top:0;background:var(--surface);z-index:1;">
          <div>
            <div style="font-size:1.15rem;font-weight:800;color:var(--text);">${title}</div>
            ${subtitle ? `<span style="font-size:0.7rem;text-transform:uppercase;background:rgba(34,211,238,.12);color:var(--primary);
                         padding:2px 8px;border-radius:6px;font-weight:700;">${subtitle}</span>` : ''}
          </div>
          <button onclick="${onCloseClick}"
            style="border:none;background:var(--surface-light);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1rem;color:var(--text);">✕</button>
        </div>
      `;
    }

    function renderDrawerBody(contentHtml) {
      return `
        <div style="padding:20px 24px;display:flex;flex-direction:column;gap:18px;overflow-y:auto;flex:1;">
          ${contentHtml}
        </div>
      `;
    }

    function renderDrawerFooter(buttonsHtml) {
      return `
        <div style="padding:16px 24px;border-top:1px solid var(--border);background:var(--surface);display:flex;justify-content:flex-end;gap:10px;">
          ${buttonsHtml}
        </div>
      `;
    }

    function renderDrawer(title, subtitle, bodyHtml, footerHtml, onCloseClick) {
      return `
        ${renderDrawerHeader(title, subtitle, onCloseClick)}
        ${renderDrawerBody(bodyHtml)}
        ${renderDrawerFooter(footerHtml)}
      `;
    }

    // ── Schema Form Fields Renderers ──
    function renderField(name, prop, requiredFields, formData) {
      const label = name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');
      const isRequired = requiredFields.includes(name);
      const requiredStar = isRequired ? '<span style="color:#ef4444;margin-left:4px;">*</span>' : '';
      const val = formData[name] !== undefined ? formData[name] : '';

      if (prop.type === 'array') {
        const arrayVal = Array.isArray(val) ? val.join(', ') : val;
        return `
          <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
            <label style="font-size:0.82rem;font-weight:700;">${label}${requiredStar} <span style="font-weight:normal;color:var(--text-soft);font-size:0.75rem;">(comma-separated)</span></label>
            <input type="text" id="wz-field-${name}" value="${arrayVal}" placeholder="e.g. value1, value2" style="padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--background);color:var(--text);" ${isRequired ? 'required' : ''}>
          </div>
        `;
      } else if (prop.enum) {
        return `
          <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
            <label style="font-size:0.82rem;font-weight:700;">${label}${requiredStar}</label>
            <select id="wz-field-${name}" style="padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--background);color:var(--text);" ${isRequired ? 'required' : ''}>
              <option value="">Select...</option>
              ${prop.enum.map(opt => `<option value="${opt}" ${opt === val ? 'selected' : ''}>${opt}</option>`).join('')}
            </select>
          </div>
        `;
      } else if (prop.type === 'boolean') {
        return `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;padding:6px 0;">
            <input type="checkbox" id="wz-field-${name}" ${val ? 'checked' : ''} style="transform:scale(1.2);">
            <label style="font-size:0.82rem;font-weight:700;cursor:pointer;" for="wz-field-${name}">${label}${requiredStar}</label>
          </div>
        `;
      } else if (name === 'description' || name === 'objectives' || name === 'outcomes' || (prop.type === 'string' && prop.maxLength > 100)) {
        return `
          <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
            <label style="font-size:0.82rem;font-weight:700;">${label}${requiredStar}</label>
            <textarea id="wz-field-${name}" rows="4" style="padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--background);color:var(--text);" ${isRequired ? 'required' : ''}>${val}</textarea>
          </div>
        `;
      } else if (prop.type === 'number') {
        return `
          <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
            <label style="font-size:0.82rem;font-weight:700;">${label}${requiredStar}</label>
            <input type="number" id="wz-field-${name}" value="${val}" style="padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--background);color:var(--text);" ${isRequired ? 'required' : ''}>
          </div>
        `;
      }
      return `
        <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
          <label style="font-size:0.82rem;font-weight:700;">${label}${requiredStar}</label>
          <input type="text" id="wz-field-${name}" value="${val}" style="padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--background);color:var(--text);" ${isRequired ? 'required' : ''}>
        </div>
      `;
    }

    function renderForm(schema, formData) {
      const contentProps = schema?.properties?.content?.properties || {};
      const requiredFields = schema?.properties?.content?.required || [];
      return Object.entries(contentProps)
        .map(([name, prop]) => renderField(name, prop, requiredFields, formData))
        .join('');
    }

    // ── Entity Creation Wizard Rendering ─────────────────
    async function _renderCreationWizard(drawerEl) {
      if (createWizardState.step === 1 && !createWizardState.type) {
        // Step 1: Selection
        let registeredTypes = [];
        if (typeof PharmoraEntityRegistry !== 'undefined') {
          registeredTypes = PharmoraEntityRegistry.getRegisteredTypes();
        }
        if (registeredTypes.length === 0) registeredTypes = ['Subject', 'Drug'];

        const bodyHtml = `
          <p style="margin:0;font-size:0.88rem;color:var(--text-soft);">Select the type of entity you want to create:</p>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${registeredTypes.map(t => `
              <button onclick="PharmoraWorkbench._wb._setCreateType('${t}')"
                style="padding:12px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--text);font-weight:700;text-align:left;cursor:pointer;">
                📋 ${t} Monograph
              </button>
            `).join('')}
          </div>
        `;
        drawerEl.innerHTML = renderDrawer('Create New Entity', '', bodyHtml, `<button onclick="PharmoraWorkbench._wb.closeDrawer()" style="padding:8px 14px;border:1px solid var(--border);background:none;color:var(--text);border-radius:8px;cursor:pointer;font-weight:600;font-size:0.85rem;">Cancel</button>`);
      } else if (createWizardState.step === 1.5) {
        // Step 1.5: Hierarchical Parent Selection Step
        const type = createWizardState.type;
        let allList = [];
        if (typeof PharmoraEntityAPI !== 'undefined') {
          allList = await PharmoraEntityAPI.listEntities().catch(() => []);
        }

        let selectHtml = '';
        if (type === 'Program') {
          const unis = allList.filter(e => e.type === 'University');
          selectHtml = `
            <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
              <label style="font-size:0.82rem;font-weight:700;">Select University (Parent)</label>
              <select id="wz-parent-uni" style="padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--background);color:var(--text);">
                <option value="">Select...</option>
                ${unis.map(u => `<option value="${u.uuid}">${u.content?.name || u.publicId}</option>`).join('')}
              </select>
            </div>
          `;
        } else if (type === 'Course') {
          const unis = allList.filter(e => e.type === 'University');
          const progs = allList.filter(e => e.type === 'Program');
          selectHtml = `
            <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
              <label style="font-size:0.82rem;font-weight:700;">Select University</label>
              <select id="wz-parent-uni" style="padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--background);color:var(--text);">
                <option value="">Select...</option>
                ${unis.map(u => `<option value="${u.uuid}">${u.content?.name || u.publicId}</option>`).join('')}
              </select>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
              <label style="font-size:0.82rem;font-weight:700;">Select Program (Parent)</label>
              <select id="wz-parent-prog" style="padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--background);color:var(--text);">
                <option value="">Select...</option>
                ${progs.map(p => `<option value="${p.uuid}">${p.content?.name || p.publicId}</option>`).join('')}
              </select>
            </div>
          `;
        } else if (type === 'Semester') {
          const progs = allList.filter(e => e.type === 'Program');
          const courses = allList.filter(e => e.type === 'Course');
          selectHtml = `
            <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
              <label style="font-size:0.82rem;font-weight:700;">Select Program</label>
              <select id="wz-parent-prog" style="padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--background);color:var(--text);">
                <option value="">Select...</option>
                ${progs.map(p => `<option value="${p.uuid}">${p.content?.name || p.publicId}</option>`).join('')}
              </select>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
              <label style="font-size:0.82rem;font-weight:700;">Select Course (Parent)</label>
              <select id="wz-parent-course" style="padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--background);color:var(--text);">
                <option value="">Select...</option>
                ${courses.map(c => `<option value="${c.uuid}">${c.content?.name || c.publicId}</option>`).join('')}
              </select>
            </div>
          `;
        } else if (type === 'Subject') {
          const courses = allList.filter(e => e.type === 'Course');
          const sems = allList.filter(e => e.type === 'Semester');
          selectHtml = `
            <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
              <label style="font-size:0.82rem;font-weight:700;">Select Course</label>
              <select id="wz-parent-course" style="padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--background);color:var(--text);">
                <option value="">Select...</option>
                ${courses.map(c => `<option value="${c.uuid}">${c.content?.name || c.publicId}</option>`).join('')}
              </select>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
              <label style="font-size:0.82rem;font-weight:700;">Select Semester (Parent)</label>
              <select id="wz-parent-semester" style="padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--background);color:var(--text);">
                <option value="">Select...</option>
                ${sems.map(s => `<option value="${s.uuid}">Semester ${s.content?.number || s.publicId}</option>`).join('')}
              </select>
            </div>
          `;
        }

        const bodyHtml = `
          <p style="margin:0 0 14px 0;font-size:0.85rem;color:var(--text-soft);">Choose the parent hierarchy path for this new ${type}:</p>
          ${selectHtml || '<p style="color:var(--text-soft);">No parent selection needed for University.</p>'}
        `;

        const footerHtml = `
          <button onclick="PharmoraWorkbench._wb.closeDrawer()" style="padding:8px 14px;border:1px solid var(--border);background:none;color:var(--text);border-radius:8px;cursor:pointer;font-weight:600;font-size:0.85rem;">Cancel</button>
          <button onclick="PharmoraWorkbench._wb._confirmHierarchyPath()" style="flex:1;padding:8px 14px;border:none;background:var(--primary);color:#fff;border-radius:8px;cursor:pointer;font-weight:700;font-size:0.85rem;">Continue to Form</button>
        `;

        drawerEl.innerHTML = renderDrawer(`Link Hierarchy: ${type}`, '', bodyHtml, footerHtml);
      } else {
        // Form step
        const type = createWizardState.type;
        let schema = null;
        if (typeof PharmoraEntityRegistry !== 'undefined') {
          schema = PharmoraEntityRegistry.getSchema(type);
        }

        const bodyHtml = renderForm(schema, createWizardState.formData);
        const footerHtml = `
          <button onclick="PharmoraWorkbench._wb.closeDrawer()" style="padding:8px 14px;border:1px solid var(--border);background:none;color:var(--text);border-radius:8px;cursor:pointer;font-weight:600;font-size:0.85rem;">Cancel</button>
          <button onclick="PharmoraWorkbench._wb._saveCreateDraft()" style="padding:8px 14px;border:1px solid var(--border);background:none;color:var(--text);border-radius:8px;cursor:pointer;font-weight:600;font-size:0.85rem;">Save Draft</button>
          <button onclick="PharmoraWorkbench._wb._submitCreate()" style="flex:1;padding:8px 14px;border:none;background:var(--primary);color:#fff;border-radius:8px;cursor:pointer;font-weight:700;font-size:0.85rem;">Create Entity</button>
        `;
        drawerEl.innerHTML = renderDrawer(`New ${type}`, 'Draft', bodyHtml, footerHtml);
      }
    }

    // Wizard Action Handlers
    function _setCreateType(type) {
      createWizardState.type = type;
      // If it's a type that requires parent hierarchy pathing, route to step 1.5 first
      if (['Program', 'Course', 'Semester', 'Subject'].includes(type)) {
        createWizardState.step = 1.5;
      } else {
        createWizardState.step = 2;
      }
      createWizardState.formData = {};
      createWizardState.selectedParentUuid = null;
      const drawerEl = document.getElementById(drawerContainerId);
      if (drawerEl) _renderCreationWizard(drawerEl);
    }

    function _confirmHierarchyPath() {
      const type = createWizardState.type;
      let parentUuid = null;
      if (type === 'Program') parentUuid = document.getElementById('wz-parent-uni')?.value;
      else if (type === 'Course') parentUuid = document.getElementById('wz-parent-prog')?.value;
      else if (type === 'Semester') parentUuid = document.getElementById('wz-parent-course')?.value;
      else if (type === 'Subject') parentUuid = document.getElementById('wz-parent-semester')?.value;

      if (['Program', 'Course', 'Semester', 'Subject'].includes(type) && !parentUuid) {
        alert('Please select a parent entity to build the hierarchy path.');
        return;
      }

      createWizardState.selectedParentUuid = parentUuid;
      createWizardState.step = 2;
      const drawerEl = document.getElementById(drawerContainerId);
      if (drawerEl) _renderCreationWizard(drawerEl);
    }

    function _gatherWzFormData() {
      const type = createWizardState.type;
      let schema = null;
      if (typeof PharmoraEntityRegistry !== 'undefined') {
        schema = PharmoraEntityRegistry.getSchema(type);
      }
      const contentProps = schema?.properties?.content?.properties || {};
      const content = {};

      Object.entries(contentProps).forEach(([name, prop]) => {
        const input = document.getElementById(`wz-field-${name}`);
        if (!input) return;

        if (prop.type === 'boolean') {
          content[name] = input.checked;
        } else if (prop.type === 'number') {
          content[name] = input.value !== '' ? Number(input.value) : 0;
        } else if (prop.type === 'array') {
          const val = input.value.trim();
          content[name] = val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
        } else {
          content[name] = input.value.trim();
        }
      });
      return content;
    }

    function _saveCreateDraft() {
      const content = _gatherWzFormData();
      createWizardState.formData = content;
      if (typeof showToast === 'function') showToast('Draft saved successfully.', 'success');
    }

    async function _submitCreate() {
      const content = _gatherWzFormData();
      const type = createWizardState.type;
      const actor = (typeof currentUser === 'function' ? currentUser()?.id : 'admin') || 'admin';

      // Required fields validation check
      let schema = null;
      if (typeof PharmoraEntityRegistry !== 'undefined') {
        schema = PharmoraEntityRegistry.getSchema(type);
      }
      const requiredFields = schema?.properties?.content?.required || [];
      const missing = requiredFields.filter(f => {
        const val = content[f];
        return val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);
      });

      if (missing.length > 0) {
        if (typeof showToast === 'function') {
          showToast(`Please fill required fields: ${missing.join(', ')}`, 'error');
        } else {
          alert(`Please fill required fields: ${missing.join(', ')}`);
        }
        return;
      }

      try {
        const created = await PharmoraEntityAPI.createEntity({
          type,
          content,
          status: 'pending_review'
        }, actor);

        // Automatically build parent hierarchy link if selected
        if (createWizardState.selectedParentUuid && typeof PharmoraRelations !== 'undefined') {
          // If parent is Semester and child is Subject, use contain relation; otherwise hasMany
          const rel = (type === 'Subject') ? 'contains_subject' : 'hasMany';
          const invRel = (type === 'Subject') ? 'part_of_semester' : 'belongsTo';
          await PharmoraRelations.linkEntities(createWizardState.selectedParentUuid, rel, created.uuid, {}, actor);
        }

        // Immediately rebuild UES Search Index so it's searchable
        if (typeof PharmoraSearchIndex !== 'undefined') {
          await PharmoraSearchIndex.buildIndex();
        }

        if (typeof showToast === 'function') showToast('Entity created successfully!', 'success');
        
        // Refresh module to display new entity
        refreshCurrentModule();
        // Immediately view new entity in drawer
        openViewer(created);
      } catch(e) {
        if (typeof showToast === 'function') showToast(`Creation failed: ${e.message}`, 'error');
      }
    }

    async function _renderEntityDrawer(drawerEl, item) {
      try {
        const entity = item.uuid
          ? (typeof PharmoraEntityAPI !== 'undefined' ? await PharmoraEntityAPI.getEntity(item.uuid) : item)
          : item;

        if (!entity) { drawerEl.innerHTML = `<div style="padding:24px;color:#ef4444;">Entity not found.</div>`; return; }

        const title = entity.content?.title || entity.content?.name || entity.content?.genericName || entity.publicId || '—';

        // Render card preview using universal renderer
        let cardHtml = '';
        if (typeof PharmoraUniversalRenderer !== 'undefined') {
          cardHtml = PharmoraUniversalRenderer.render(entity, 'card');
        } else {
          cardHtml = `<div style="padding:14px;border:1px solid var(--border);border-radius:8px;background:var(--surface);">
            <strong>${title}</strong><br><span style="color:var(--text-soft);font-size:0.8rem;">${entity.type}</span>
          </div>`;
        }

        // Check developer mode/admin check
        const user = typeof currentUser === 'function' ? currentUser() : null;
        const isDev = user && (user.role === 'admin' || user.role === 'owner');

        // Render outgoing / incoming relations list
        let relationsHtml = '';
        if (typeof PharmoraEntityRelationsComponent !== 'undefined') {
          relationsHtml = await PharmoraEntityRelationsComponent.render(entity).catch(() => '');
        }

        // Render schema field inputs
        let schema = null;
        if (typeof PharmoraEntityRegistry !== 'undefined') {
          schema = PharmoraEntityRegistry.getSchema(entity.type);
        }
        const fieldsHtml = renderForm(schema || {}, entity.content || {});

        // Workflow progress stepper representation
        const stages = ['draft', 'pending_review', 'approved', 'published', 'archived'];
        const workflowStepperHtml = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding:8px 0;border-bottom:1px solid var(--border);">
            ${stages.map((st, i) => {
              const isActive = entity.status === st;
              const isPassed = stages.indexOf(entity.status) >= i;
              const color = isActive ? 'var(--primary)' : isPassed ? '#22c55e' : 'var(--text-soft)';
              return `<span style="font-size:0.75rem;font-weight:700;color:${color};text-transform:capitalize;">${st.replace('_',' ')}</span>`;
            }).join('<span style="color:var(--border)">&rarr;</span>')}
          </div>
        `;

        drawerEl.innerHTML = `
          <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;
                      position:sticky;top:0;background:var(--surface);z-index:1;">
            <div>
              <div style="font-size:1.15rem;font-weight:800;color:var(--text);">${title}</div>
              <span style="font-size:0.7rem;text-transform:uppercase;background:rgba(34,211,238,.12);color:var(--primary);
                           padding:2px 8px;border-radius:6px;font-weight:700;">${entity.type || ''}</span>
              <span style="font-size:0.7rem;margin-left:6px;background:var(--surface-light);color:var(--text-soft);
                           padding:2px 8px;border-radius:6px;font-weight:600;">${entity.status || ''}</span>
            </div>
            <button onclick="PharmoraWorkbench._wb.closeDrawer()"
              style="border:none;background:var(--surface-light);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1rem;color:var(--text);">✕</button>
          </div>

          <!-- Navigation tabs header -->
          <div style="display:flex;background:var(--surface-light);border-bottom:1px solid var(--border);padding:0 12px;gap:8px;">
            <button onclick="document.querySelectorAll('.wb-tab-section').forEach(s => s.style.display='none');document.getElementById('wb-sec-overview').style.display='block';" style="padding:10px 14px;border:none;background:none;color:var(--text);font-size:0.8rem;font-weight:700;cursor:pointer;">Overview</button>
            <button onclick="document.querySelectorAll('.wb-tab-section').forEach(s => s.style.display='none');document.getElementById('wb-sec-properties').style.display='block';" style="padding:10px 14px;border:none;background:none;color:var(--text);font-size:0.8rem;font-weight:700;cursor:pointer;">Properties</button>
            <button onclick="document.querySelectorAll('.wb-tab-section').forEach(s => s.style.display='none');document.getElementById('wb-sec-relations').style.display='block';" style="padding:10px 14px;border:none;background:none;color:var(--text);font-size:0.8rem;font-weight:700;cursor:pointer;">Relations</button>
            <button onclick="document.querySelectorAll('.wb-tab-section').forEach(s => s.style.display='none');document.getElementById('wb-sec-history').style.display='block';" style="padding:10px 14px;border:none;background:none;color:var(--text);font-size:0.8rem;font-weight:700;cursor:pointer;">History</button>
          </div>
          
          <div style="padding:20px 24px;display:flex;flex-direction:column;gap:18px;overflow-y:auto;flex:1;">
            
            <!-- SECTION 1: Overview -->
            <div id="wb-sec-overview" class="wb-tab-section" style="display:block;">
              <!-- Moderation / Workflow Actions -->
              <div style="display:flex;gap:8px;flex-wrap:wrap;background:var(--surface);padding:10px;border-radius:8px;border:1px solid var(--border);margin-bottom:14px;">
                <button onclick="PharmoraWorkbench._wb._drawerAction('approve','${entity.uuid}')" style="${_btnStyle('var(--primary)')}">✓ Approve</button>
                <button onclick="PharmoraWorkbench._wb._drawerAction('publish','${entity.uuid}')" style="${_btnStyle('#22c55e')}">📢 Publish</button>
                <button onclick="PharmoraWorkbench._wb._drawerAction('requestChanges','${entity.uuid}')" style="${_btnStyle('#f59e0b')}">🔁 Changes</button>
                <button onclick="PharmoraWorkbench._wb._drawerAction('archive','${entity.uuid}')" style="${_btnStyle('#64748b')}">🗄 Archive</button>
              </div>
              <h4 style="margin:0 0 8px 0;font-size:0.85rem;color:var(--text-soft);text-transform:uppercase;font-weight:700;">Entity Preview</h4>
              ${cardHtml}
            </div>

            <!-- SECTION 2: Properties (Inline Schema editing) -->
            <div id="wb-sec-properties" class="wb-tab-section" style="display:none;">
              <h4 style="margin:0 0 8px 0;font-size:0.85rem;color:var(--text-soft);text-transform:uppercase;font-weight:700;">Schema Fields</h4>
              <form id="wb-drawer-fields-form" onchange="PharmoraWorkbench._wb._saveInlineChanges('${entity.uuid}')">
                ${fieldsHtml}
              </form>
            </div>

            <!-- SECTION 3: Relations graph -->
            <div id="wb-sec-relations" class="wb-tab-section" style="display:none;">
              <h4 style="margin:0 0 10px 0;font-size:0.85rem;color:var(--text-soft);text-transform:uppercase;font-weight:700;">🔗 Link Relations</h4>
              <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">
                <button onclick="PharmoraWorkbench._wb._openLinkEditor('${entity.uuid}', 'belongsTo')" style="padding:5px 10px;font-size:0.75rem;border:1px solid var(--border);background:var(--surface);color:var(--text);border-radius:6px;cursor:pointer;font-weight:600;">+ Add Parent</button>
                <button onclick="PharmoraWorkbench._wb._openLinkEditor('${entity.uuid}', 'hasMany')" style="padding:5px 10px;font-size:0.75rem;border:1px solid var(--border);background:var(--surface);color:var(--text);border-radius:6px;cursor:pointer;font-weight:600;">+ Add Child</button>
                <button onclick="PharmoraWorkbench._wb._openLinkEditor('${entity.uuid}', 'unlink')" style="padding:5px 10px;font-size:0.75rem;border:1px solid #ef4444;background:none;color:#ef4444;border-radius:6px;cursor:pointer;font-weight:600;">Remove Link</button>
              </div>
              <div id="wb-drawer-relations">${relationsHtml}</div>
            </div>

            <!-- SECTION 4: History & Timeline -->
            <div id="wb-sec-history" class="wb-tab-section" style="display:none;">
              <h4 style="margin:0 0 8px 0;font-size:0.85rem;color:var(--text-soft);text-transform:uppercase;font-weight:700;">📋 Audit Log & History</h4>
              ${workflowStepperHtml}
              <div id="wb-drawer-workflow"></div>
              <div id="wb-drawer-timeline" style="margin-top:10px;"></div>
            </div>
            
            ${isDev ? `
              <div style="border-top:1px solid var(--border);padding-top:16px;">
                <details>
                  <summary style="font-size:0.8rem;font-weight:700;color:var(--text-soft);cursor:pointer;user-select:none;">🛠 Developer JSON Payload</summary>
                  <pre style="margin-top:10px;font-size:0.72rem;color:var(--text-soft);background:var(--background);padding:10px;border-radius:8px;overflow-x:auto;">${JSON.stringify(entity, null, 2)}</pre>
                </details>
              </div>
            ` : ''}
          </div>
          <div style="padding:16px 24px;border-top:1px solid var(--border);background:var(--surface);display:flex;justify-content:flex-end;">
            <button onclick="PharmoraWorkbench._wb.closeDrawer()" style="padding:8px 16px;border:1px solid var(--border);background:none;color:var(--text);border-radius:8px;cursor:pointer;font-weight:700;font-size:0.82rem;">Close</button>
          </div>
        `;

        if (typeof PharmoraEntityAuditViewer !== 'undefined')
          PharmoraEntityAuditViewer.render(entity, 'wb-drawer-workflow');
        if (typeof PharmoraEntityTimeline !== 'undefined') {
          const tb = document.getElementById('wb-drawer-timeline');
          if (tb) tb.innerHTML = PharmoraEntityTimeline.render(entity);
        }
      } catch(err) {
        drawerEl.innerHTML = `<div style="padding:24px;color:#ef4444;">Failed to load entity: ${err.message}</div>`;
      }
    }

    // Relation Linking Picker & Creation Dialog Helper
    async function _openLinkEditor(uuid, action) {
      const drawerEl = document.getElementById(drawerContainerId);
      if (!drawerEl) return;

      // Unlink mode
      if (action === 'unlink') {
        const entity = await PharmoraEntityAPI.getEntity(uuid).catch(() => null);
        if (!entity || !entity.relations || entity.relations.length === 0) {
          if (typeof showToast === 'function') showToast('No relationships to remove.', 'info');
          return;
        }
        
        drawerEl.innerHTML = `
          <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
            <div style="font-size:1.1rem;font-weight:800;color:var(--text);">Remove Relationship</div>
            <button onclick="PharmoraWorkbench._wb.openViewer({ uuid: '${uuid}' })" style="border:none;background:var(--surface-light);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1rem;color:var(--text);">✕</button>
          </div>
          <div style="padding:24px;display:flex;flex-direction:column;gap:14px;overflow-y:auto;flex:1;">
            <p style="margin:0;font-size:0.85rem;color:var(--text-soft);">Select a relationship to remove:</p>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${entity.relations.map(rel => `
                <button onclick="PharmoraWorkbench._wb._unlinkConfirm('${uuid}', '${rel.relationType}', '${rel.targetUuid}')"
                  style="padding:10px;border-radius:8px;border:1px solid #ef4444;background:none;color:#ef4444;cursor:pointer;text-align:left;font-weight:600;font-size:0.85rem;">
                  🗑 Remove: [${rel.relationType}] &rarr; ${rel.targetType} (${rel.targetUuid.substring(0, 8)})
                </button>
              `).join('')}
            </div>
          </div>
        `;
        return;
      }

      // Link Existing or Create & Link Mode
      let list = [];
      if (typeof PharmoraEntityAPI !== 'undefined') {
        list = await PharmoraEntityAPI.listEntities().catch(() => []);
      }
      
      const relationTypes = ['belongsTo', 'hasMany', 'hasOne', 'manyToMany', 'part_of_semester', 'contains_subject'];
      
      drawerEl.innerHTML = `
        <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:1.1rem;font-weight:800;color:var(--text);">Universal Entity Linker</div>
          <button onclick="PharmoraWorkbench._wb.openViewer({ uuid: '${uuid}' })" style="border:none;background:var(--surface-light);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1rem;color:var(--text);">✕</button>
        </div>
        <div style="padding:24px;display:flex;flex-direction:column;gap:14px;overflow-y:auto;flex:1;">
          
          <!-- Section A: Link Existing -->
          <div>
            <h4 style="margin:0 0 10px 0;font-size:0.85rem;color:var(--text-soft);text-transform:uppercase;font-weight:700;">Link Existing Entity</h4>
            
            <div style="display:flex;flex-direction:column;gap:10px;background:var(--surface);padding:14px;border-radius:8px;border:1px solid var(--border);">
              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-size:0.8rem;font-weight:700;">Relation Type</label>
                <select id="link-rel-type" style="padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--background);color:var(--text);">
                  ${relationTypes.map(r => `<option value="${r}" ${r === action ? 'selected' : ''}>${r}</option>`).join('')}
                </select>
              </div>

              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-size:0.8rem;font-weight:700;">Select Target Entity</label>
                <select id="link-target-uuid" style="padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--background);color:var(--text);">
                  <option value="">Choose entity...</option>
                  ${list.filter(e => e.uuid !== uuid).map(e => `
                    <option value="${e.uuid}">${e.type}: ${e.content?.title || e.content?.name || e.publicId} (${e.uuid.substring(0,8)})</option>
                  `).join('')}
                </select>
              </div>

              <button onclick="PharmoraWorkbench._wb._linkExistingSubmit('${uuid}')"
                style="padding:8px;border:none;background:var(--primary);color:#fff;border-radius:6px;font-weight:700;cursor:pointer;font-size:0.85rem;margin-top:6px;">
                🔗 Link Entities
              </button>
            </div>
          </div>

          <!-- Section B: Create & Link -->
          <div style="border-top:1px solid var(--border);padding-top:16px;">
            <h4 style="margin:0 0 10px 0;font-size:0.85rem;color:var(--text-soft);text-transform:uppercase;font-weight:700;">Create & Link New Entity</h4>
            <p style="margin:0 0 10px 0;font-size:0.8rem;color:var(--text-soft);">Instantly spawn a child or parent node and bind it to this entity.</p>
            
            <button onclick="PharmoraWorkbench._wb._triggerCreateAndLink('${uuid}', '${action}')"
              style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--primary);background:none;color:var(--primary);font-weight:700;cursor:pointer;font-size:0.85rem;">
              ➕ Create New & Link Bidirectionally
            </button>
          </div>

        </div>
      `;
    }

    // Non-destructive unlink confirm with Undo support
    let pendingUnlink = null;

    async function _unlinkConfirm(uuid, relType, targetUuid) {
      if (pendingUnlink) {
        clearTimeout(pendingUnlink.timer);
        await commitUnlink(pendingUnlink);
      }

      pendingUnlink = {
        uuid,
        relType,
        targetUuid,
        timer: setTimeout(async () => {
          await commitUnlink(pendingUnlink);
          pendingUnlink = null;
        }, 3000)
      };

      // Instantly refresh UI locally for preview feedback
      openViewer({ uuid });

      // Trigger standard non-blocking Undo toast message
      if (typeof showToast === 'function') {
        showToast(`Relation removed. <a href="javascript:void(0)" onclick="PharmoraWorkbench._wb._restoreRelation()" style="color:#22d3ee;font-weight:700;margin-left:8px;text-decoration:underline;">Undo</a>`, 'info');
      }
    }

    async function commitUnlink(job) {
      try {
        if (typeof PharmoraRelations !== 'undefined') {
          await PharmoraRelations.unlinkEntities(job.uuid, job.relType, job.targetUuid, 'admin');
        }
      } catch(e) {
        console.warn('Unlink failed', e);
      }
    }

    async function _restoreRelation() {
      if (!pendingUnlink) return;
      clearTimeout(pendingUnlink.timer);
      pendingUnlink = null;
      if (typeof showToast === 'function') showToast('Restored relationship.', 'success');
      // Refresh UI view
      openViewer({ uuid: document.getElementById('wb-drawer-fields-form') ? document.getElementById('wb-drawer-fields-form').parentElement.parentElement.querySelector('h4').nextElementSibling.querySelector('input')?.dataset?.uuid || '' : '' });
    }

    async function _linkExistingSubmit(uuid) {
      const relType = document.getElementById('link-rel-type')?.value;
      const targetUuid = document.getElementById('link-target-uuid')?.value;
      if (!relType || !targetUuid) {
        alert('Please select both relation type and target entity.');
        return;
      }
      try {
        if (typeof PharmoraRelations !== 'undefined') {
          await PharmoraRelations.linkEntities(uuid, relType, targetUuid, {}, 'admin');
          if (typeof showToast === 'function') showToast('Linked successfully.', 'success');
          openViewer({ uuid });
        }
      } catch(e) {
        alert('Error: ' + e.message);
      }
    }

    async function _triggerCreateAndLink(uuid, action) {
      // Prompt for entity type first
      let registeredTypes = [];
      if (typeof PharmoraEntityRegistry !== 'undefined') {
        registeredTypes = PharmoraEntityRegistry.getRegisteredTypes();
      }
      if (registeredTypes.length === 0) registeredTypes = ['Subject', 'Drug'];

      const typeHtml = registeredTypes.map(t => `
        <button onclick="PharmoraWorkbench._wb._startCreationLink('${uuid}', '${action}', '${t}')"
          style="padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--text);font-weight:700;text-align:left;cursor:pointer;font-size:0.85rem;">
          📋 ${t} Monograph
        </button>
      `).join('');

      const drawerEl = document.getElementById(drawerContainerId);
      if (drawerEl) {
        drawerEl.innerHTML = `
          <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
            <div style="font-size:1.1rem;font-weight:800;color:var(--text);">Create Target Entity</div>
            <button onclick="PharmoraWorkbench._wb.openViewer({ uuid: '${uuid}' })" style="border:none;background:var(--surface-light);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1rem;color:var(--text);">✕</button>
          </div>
          <div style="padding:24px;display:flex;flex-direction:column;gap:14px;">
            <p style="margin:0;font-size:0.85rem;color:var(--text-soft);">Select target entity type to create:</p>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${typeHtml}
            </div>
          </div>
        `;
      }
    }

    async function _startCreationLink(uuid, action, type) {
      createWizardState = { step: 2, type, formData: {} };
      const drawerEl = document.getElementById(drawerContainerId);
      if (!drawerEl) return;

      // Temporarily hijack _submitCreate to perform link after creation
      const originalSubmit = workbench._submitCreate;
      workbench._submitCreate = async () => {
        const content = _gatherWzFormData();
        const actor = (typeof currentUser === 'function' ? currentUser()?.id : 'admin') || 'admin';
        
        try {
          const created = await PharmoraEntityAPI.createEntity({
            type,
            content,
            status: 'pending_review'
          }, actor);

          // Build relation
          if (typeof PharmoraRelations !== 'undefined') {
            await PharmoraRelations.linkEntities(uuid, action, created.uuid, {}, actor);
          }

          // Immediately rebuild index
          if (typeof PharmoraSearchIndex !== 'undefined') {
            await PharmoraSearchIndex.buildIndex();
          }

          if (typeof showToast === 'function') showToast('Linked entity created!', 'success');
          // Restore original submit reference
          workbench._submitCreate = originalSubmit;
          refreshCurrentModule();
          openViewer({ uuid });
        } catch(e) {
          alert('Creation failed: ' + e.message);
        }
      };
_renderCreationWizard(drawerEl);
}

    async function _saveInlineChanges(uuid) {
      const form = document.getElementById('wb-drawer-fields-form');
      if (!form) return;

      const content = {};
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        const name = input.id.replace('wz-field-', '');
        if (input.type === 'checkbox') {
          content[name] = input.checked;
        } else if (input.type === 'number') {
          content[name] = input.value !== '' ? Number(input.value) : 0;
        } else if (input.id.includes('comma-separated') || input.placeholder.includes('comma-separated')) {
          content[name] = input.value.split(',').map(s => s.trim()).filter(Boolean);
        } else {
          content[name] = input.value;
        }
      });

      const actor = (typeof currentUser === 'function' ? currentUser()?.id : 'admin') || 'admin';
      try {
        if (typeof PharmoraEntityAPI !== 'undefined') {
          const entity = await PharmoraEntityAPI.getEntity(uuid);
          if (entity) {
            entity.content = Object.assign(entity.content || {}, content);
            await PharmoraEntityAPI.updateEntity(uuid, entity, actor);
            if (typeof showToast === 'function') showToast('Changes autosaved.', 'success');
            // Rebuild index
            if (typeof PharmoraSearchIndex !== 'undefined') {
              await PharmoraSearchIndex.buildIndex();
            }
            refreshCurrentModule();
          }
        }
      } catch(e) {
        console.warn('Inline save failed', e);
      }
    }

    async function _renderUserDrawer(drawerEl, user) {
      const name  = user.name || user.displayName || user.email || user.id || 'User';
      const email = user.email || '';
      const role  = user.role || '';
      const code  = user.code || user.userCode || '—';
      drawerEl.innerHTML = `
        <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;
                    position:sticky;top:0;background:var(--surface);z-index:1;">
          <div>
            <div style="font-size:1.15rem;font-weight:800;color:var(--text);">👤 ${name}</div>
            <span style="font-size:0.7rem;background:var(--surface-light);color:var(--text-soft);padding:2px 8px;border-radius:6px;font-weight:600;">${role}</span>
          </div>
          <button onclick="PharmoraWorkbench._wb.closeDrawer()"
            style="border:none;background:var(--surface-light);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1rem;color:var(--text);">✕</button>
        </div>
        <div style="padding:20px 24px;display:flex;flex-direction:column;gap:14px;font-size:0.88rem;flex:1;overflow-y:auto;">
          <div><strong>Email:</strong> ${email}</div>
          <div><strong>ID:</strong> <code>${user.id || user.uid || '—'}</code></div>
          <div><strong>User Code:</strong> <code>${code}</code></div>
          <div><strong>Status:</strong> ${user.disabled ? '🚫 Disabled' : '✅ Active'}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
            <button onclick="location.href='../profile.html?id=${user.id || user.uid}'" style="${_btnStyle('var(--primary)')}">👤 View Profile</button>
          </div>
        </div>
        <div style="padding:16px 24px;border-top:1px solid var(--border);background:var(--surface);display:flex;justify-content:flex-end;">
          <button onclick="PharmoraWorkbench._wb.closeDrawer()" style="padding:8px 16px;border:1px solid var(--border);background:none;color:var(--text);border-radius:8px;cursor:pointer;font-weight:700;font-size:0.82rem;">Close</button>
        </div>
      `;
    }

    function _btnStyle(bg) {
      return `padding:6px 14px;border-radius:8px;border:none;background:${bg};color:#fff;font-weight:700;cursor:pointer;font-size:0.8rem;`;
    }

    async function _drawerAction(action, uuid) {
      if (!uuid || typeof PharmoraEntityReview === 'undefined') return;
      try {
        if (action === 'approve')        await PharmoraEntityReview.approve(uuid, 'admin');
        else if (action === 'publish')   await PharmoraEntityReview.publish(uuid, 'admin');
        else if (action === 'archive')   await PharmoraEntityReview.archive(uuid, 'admin');
        else if (action === 'requestChanges') {
          const c = prompt('Enter change request comments:');
          if (c) await PharmoraEntityReview.requestChanges(uuid, c, 'admin');
        }
        if (typeof showToast === 'function') showToast(`${action} applied.`, 'success');
        // Refresh drawer
        const entity = await PharmoraEntityAPI.getEntity(uuid);
        if (entity) {
          const drawerEl = document.getElementById(drawerContainerId);
          if (drawerEl) await _renderEntityDrawer(drawerEl, entity);
        }
        refreshCurrentModule();
      } catch(err) {
        if (typeof showToast === 'function') showToast(`Action failed: ${err.message}`, 'error');
      }
    }

    function closeDrawer() {
      const drawerEl = document.getElementById(drawerContainerId);
      if (drawerEl) drawerEl.classList.remove('open');
      _drawerOpen = false;
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

    // ── Public workbench API ─────────────────────────────
    const workbench = {
      navigate,
      refreshCurrentModule,
      openViewer,
      closeDrawer,
      registerModule,
      registerSearchProvider,
      search,
      boot,
      saveWorkspaceState,
      restoreWorkspaceState,
      // Expose internals for drawer action buttons wired via onclick strings
      _drawerAction,
      _setCreateType,
      _saveCreateDraft,
      _submitCreate,
      _openLinkEditor,
      _unlinkConfirm,
      _linkExistingSubmit,
      _triggerCreateAndLink,
      _startCreationLink,
      _saveInlineChanges,
      _restoreRelation,
      _confirmHierarchyPath
    };

    // Store global reference so onclick="PharmoraWorkbench._wb.closeDrawer()" works
    if (!window.PharmoraWorkbench) window.PharmoraWorkbench = {};
    window.PharmoraWorkbench._wb = workbench;

    return workbench;
  }

  return { createWizard, createWorkbench };
})();

window.PharmoraWizardCore = PharmoraWizardCore;

;


    /* ===== components/entity/entity.manager.js ===== */

    
;
/*
  Pharmora Universal Entity Manager UI Component
  v3.0.0 — Extended render() API: render(containerId, typeOrFilter, optionalFilter)
  Backwards compatible: render(containerId, "Subject") still works.
*/
(function() {
  'use strict';

  const ALL_TYPES = [
    'Subject','Course','Semester','Unit','Topic','Practical','QuestionBank','MCQ','Resource',
    'Book','Drug','Brand','Manufacturer','Disease','Mechanism','TherapeuticClass',
    'PharmacologicalClass','DosageForm','Excipient','AdverseEffect','Interaction','Contraindication',
    'Research','Event','Tool'
  ];

  /**
   * Normalise the arguments to a single filter object.
   * Supports:
   *   render(id, "Subject")
   *   render(id, "Subject", { status, query, sort })
   *   render(id, { type, status, query, sort, tags, owner, reviewer, layout, page, pageSize })
   */
  function _normaliseFilter(typeOrFilter, optionalFilter) {
    let filter = {};
    if (typeof typeOrFilter === 'string') {
      filter.type = typeOrFilter;
      if (optionalFilter && typeof optionalFilter === 'object') {
        Object.assign(filter, optionalFilter);
      }
    } else if (typeOrFilter && typeof typeOrFilter === 'object') {
      filter = Object.assign({}, typeOrFilter);
    }
    filter.layout   = filter.layout   || 'list';
    filter.sort     = filter.sort     || 'created';
    filter.page     = filter.page     || 1;
    filter.pageSize = filter.pageSize || 30;
    return filter;
  }

  function renderFilters(initFilter) {
    const typeOptions = ['', ...ALL_TYPES].map(t =>
      `<option value="${t}" ${t === (initFilter.type || '') ? 'selected' : ''}>${t || 'All Types'}</option>`
    ).join('');

    const statusOptions = [
      { v: '', l: 'All Statuses' },
      { v: 'draft',          l: 'Draft' },
      { v: 'pending_review', l: 'Pending Review' },
      { v: 'approved',       l: 'Approved' },
      { v: 'published',      l: 'Published' },
      { v: 'archived',       l: 'Archived' },
    ].map(s =>
      `<option value="${s.v}" ${s.v === (initFilter.status || '') ? 'selected' : ''}>${s.l}</option>`
    ).join('');

    return { typeOptions, statusOptions };
  }

  function renderToolbar(initFilter, typeOptions, statusOptions) {
    return `
      <!-- Toolbar row -->
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 16px;
                  background:var(--surface);border:1px solid var(--border);border-radius:14px;">
        <input id="em-search" type="text" placeholder="🔍 Search…" value="${initFilter.query || ''}"
          style="flex:1;min-width:150px;padding:8px 12px;border-radius:10px;border:1px solid var(--border);
                 background:var(--background);color:var(--text);font-size:0.85rem;" />

        <select id="em-type" style="padding:8px;border-radius:8px;border:1px solid var(--border);background:var(--background);color:var(--text);font-size:0.82rem;">
          ${typeOptions}
        </select>

        <select id="em-status" style="padding:8px;border-radius:8px;border:1px solid var(--border);background:var(--background);color:var(--text);font-size:0.82rem;">
          ${statusOptions}
        </select>

        <select id="em-sort" style="padding:8px;border-radius:8px;border:1px solid var(--border);background:var(--background);color:var(--text);font-size:0.82rem;">
          <option value="created" ${initFilter.sort==='created' ? 'selected' : ''}>Newest</option>
          <option value="updated" ${initFilter.sort==='updated' ? 'selected' : ''}>Updated</option>
          <option value="title"   ${initFilter.sort==='title'   ? 'selected' : ''}>Title A–Z</option>
          <option value="popular" ${initFilter.sort==='popular' ? 'selected' : ''}>Popular</option>
        </select>

        <select id="em-layout" style="padding:8px;border-radius:8px;border:1px solid var(--border);background:var(--background);color:var(--text);font-size:0.82rem;">
          <option value="list"    ${initFilter.layout==='list'    ? 'selected' : ''}>Grid Cards</option>
          <option value="table"   ${initFilter.layout==='table'   ? 'selected' : ''}>Table</option>
          <option value="compact" ${initFilter.layout==='compact' ? 'selected' : ''}>Compact</option>
        </select>

        <button id="em-create-btn" style="padding:8px 16px;border:none;background:var(--primary);color:#fff;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.82rem;">+ Create</button>
        <span id="em-count" style="font-size:0.78rem;color:var(--text-soft);font-weight:600;white-space:nowrap;"></span>
      </div>
    `;
  }

  function renderResults(layout, page_ents) {
    if (layout === 'table') {
      const autoConfig = typeof PharmoraUniversalRenderer !== 'undefined'
        ? PharmoraUniversalRenderer.getAutoConfig(page_ents[0])
        : {};
      return typeof PharmoraUniversalRenderer !== 'undefined'
        ? PharmoraUniversalRenderer.render(page_ents, 'table', autoConfig)
        : `<div style="padding:20px;color:var(--text-soft);">Renderer not available.</div>`;
    } else if (layout === 'compact') {
      return `<div style="display:flex;flex-direction:column;gap:6px;">
        ${page_ents.map(ent => {
          const title = ent.content?.title || ent.content?.name || ent.publicId || ent.type;
          return `<div data-uuid="${ent.uuid}" style="display:flex;align-items:center;gap:10px;padding:10px 14px;
                       background:var(--surface);border:1px solid var(--border);border-radius:10px;cursor:pointer;">
            <input type="checkbox" class="em-cb" data-uuid="${ent.uuid}" onclick="event.stopPropagation()">
            <span style="font-size:0.75rem;background:var(--border);padding:1px 6px;border-radius:4px;">${ent.type}</span>
            <span style="flex:1;font-weight:600;font-size:0.85rem;">${title}</span>
            <span style="font-size:0.72rem;color:var(--text-soft);">${ent.status}</span>
          </div>`;
        }).join('')}
      </div>`;
    } else {
      return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:16px;">
        ${page_ents.map(ent => {
          const config = typeof PharmoraUniversalRenderer !== 'undefined'
            ? PharmoraUniversalRenderer.getAutoConfig(ent)
            : {};
          const cardHtml = typeof PharmoraUniversalRenderer !== 'undefined'
            ? PharmoraUniversalRenderer.render(ent, 'card', config)
            : `<div style="padding:14px;">${ent.content?.title || ent.publicId}</div>`;
          return `<div style="position:relative;" data-uuid="${ent.uuid}">
            <input type="checkbox" class="em-cb" data-uuid="${ent.uuid}"
              style="position:absolute;top:10px;right:10px;z-index:10;transform:scale(1.2);" onclick="event.stopPropagation()">
            ${cardHtml}
          </div>`;
        }).join('')}
      </div>`;
    }
  }

  function renderPagination(total, page, pageSize) {
    const pages = Math.ceil(total / pageSize);
    const pg    = document.getElementById('em-pagination');
    if (!pg || pages <= 1) { if (pg) pg.innerHTML = ''; return; }
    const btnStyle = (active) =>
      `padding:6px 12px;border-radius:8px;border:1px solid var(--border);cursor:pointer;font-weight:600;font-size:0.8rem;
       background:${active ? 'var(--primary)' : 'var(--surface)'};color:${active ? '#fff' : 'var(--text)'};`;
    const nums = Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1);
    pg.innerHTML = nums.map(n =>
      `<button style="${btnStyle(n === page)}" onclick="window.__emGoPage(${n})">${n}</button>`
    ).join('');
  }

  function bindManagerEvents(loadData, selectedUuids, _updateBulkBar, initFilter) {
    const deb = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
    const reload = deb(loadData, 280);
    ['em-type','em-status','em-sort','em-layout'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => { reload(); });
    });
    document.getElementById('em-search')?.addEventListener('input', () => { reload(); });

    // Bulk actions
    document.querySelectorAll('[data-em-bulk]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const action = btn.dataset.emBulk;
        const uuids  = [...selectedUuids];
        if (!uuids.length) return;
        for (const uuid of uuids) {
          try {
            if (typeof PharmoraEntityManager !== 'undefined') {
              if (action === 'publish') await PharmoraEntityManager.bulkPublish([uuid], 'admin');
              if (action === 'archive') await PharmoraEntityManager.bulkArchive([uuid], 'admin');
              if (action === 'delete')  await PharmoraEntityManager.bulkDelete([uuid], 'admin');
            }
            if (action === 'approve' && typeof PharmoraEntityReview !== 'undefined') {
              await PharmoraEntityReview.approve(uuid, 'admin');
            }
          } catch(e) { console.warn('Bulk', action, uuid, e); }
        }
        selectedUuids.clear();
        _updateBulkBar();
        loadData();
      });
    });
    document.getElementById('em-bulk-clear')?.addEventListener('click', () => {
      selectedUuids.clear();
      document.querySelectorAll('.em-cb').forEach(cb => cb.checked = false);
      _updateBulkBar();
    });

    // Create button
    document.getElementById('em-create-btn')?.addEventListener('click', () => {
      const type = document.getElementById('em-type')?.value || '';
      if (typeof PharmoraWorkbench !== 'undefined' && PharmoraWorkbench._wb) {
        PharmoraWorkbench._wb.openViewer({ uuid: null, type, _create: true });
      } else {
        alert(`Create new ${type || 'entity'} — wire to Entity Editor.`);
      }
    });
  }

  function renderManagerUI(containerId, typeOrFilter, optionalFilter) {
    const root = document.getElementById(containerId);
    if (!root) return;

    const initFilter = _normaliseFilter(typeOrFilter, optionalFilter);
    const { typeOptions, statusOptions } = renderFilters(initFilter);

    root.innerHTML = `
      <div class="entity-manager-ui" style="display:flex;flex-direction:column;gap:18px;">
        ${renderToolbar(initFilter, typeOptions, statusOptions)}

        <!-- Bulk actions bar -->
        <div id="em-bulk-bar" style="display:none;align-items:center;gap:8px;flex-wrap:wrap;
                                     padding:10px 14px;background:rgba(34,211,238,.08);
                                     border:1px solid var(--primary);border-radius:10px;">
          <span id="em-bulk-count" style="font-weight:700;font-size:0.85rem;color:var(--primary);"></span>
          <button data-em-bulk="publish" style="padding:5px 12px;border:none;background:var(--primary);color:#fff;border-radius:6px;font-weight:700;cursor:pointer;font-size:0.8rem;">📢 Publish</button>
          <button data-em-bulk="approve" style="padding:5px 12px;border:none;background:#22c55e;color:#fff;border-radius:6px;font-weight:700;cursor:pointer;font-size:0.8rem;">✓ Approve</button>
          <button data-em-bulk="archive" style="padding:5px 12px;border:none;background:#64748b;color:#fff;border-radius:6px;font-weight:700;cursor:pointer;font-size:0.8rem;">🗄 Archive</button>
          <button data-em-bulk="delete"  style="padding:5px 12px;border:none;background:#ef4444;color:#fff;border-radius:6px;font-weight:700;cursor:pointer;font-size:0.8rem;">🗑 Delete</button>
          <button id="em-bulk-clear" style="padding:5px 12px;border:1px solid var(--border);background:none;color:var(--text-soft);border-radius:6px;font-weight:600;cursor:pointer;font-size:0.8rem;margin-left:auto;">Clear</button>
        </div>

        <!-- Content area -->
        <div id="em-content" style="min-height:200px;"></div>

        <!-- Pagination -->
        <div id="em-pagination" style="display:flex;justify-content:center;gap:8px;padding:12px 0;"></div>
      </div>
    `;

    let selectedUuids = new Set();
    let currentPage   = initFilter.page;

    function _currentFilter() {
      return {
        type:     document.getElementById('em-type')?.value     || '',
        status:   document.getElementById('em-status')?.value   || '',
        query:    document.getElementById('em-search')?.value   || '',
        sort:     document.getElementById('em-sort')?.value     || 'created',
        layout:   document.getElementById('em-layout')?.value   || 'list',
        owner:    initFilter.owner     || '',
        reviewer: initFilter.reviewer  || '',
        tags:     initFilter.tags      || [],
        page:     currentPage,
        pageSize: initFilter.pageSize  || 30,
      };
    }

    function _updateBulkBar() {
      const bar = document.getElementById('em-bulk-bar');
      const cnt = document.getElementById('em-bulk-count');
      if (bar) bar.style.display = selectedUuids.size > 0 ? 'flex' : 'none';
      if (cnt) cnt.textContent = `${selectedUuids.size} selected`;
    }

    async function loadData() {
      const f   = _currentFilter();
      const cnt = document.getElementById('em-content');
      if (cnt) cnt.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-soft);">Loading…</div>`;

      let entities = [];
      try {
        if (typeof PharmoraEntityManager !== 'undefined') {
          entities = await PharmoraEntityManager.getFilteredEntities({
            type:     f.type,
            status:   f.status,
            sortBy:   f.sort,
            owner:    f.owner,
            reviewer: f.reviewer,
            tags:     f.tags,
          });
        } else if (typeof PharmoraEntityAPI !== 'undefined') {
          entities = await PharmoraEntityAPI.listEntities();
        }
      } catch(e) {
        console.warn('[EntityManager] Data load error', e);
      }

      if (f.query) {
        const q = f.query.toLowerCase();
        entities = entities.filter(e => {
          const hay = [
            e.content?.title, e.content?.name, e.content?.genericName,
            e.type, e.publicId
          ].filter(Boolean).join(' ').toLowerCase();
          return hay.includes(q);
        });
      }

      const total    = entities.length;
      const start    = (f.page - 1) * f.pageSize;
      const page_ents = entities.slice(start, start + f.pageSize);

      const countEl = document.getElementById('em-count');
      if (countEl) countEl.textContent = `${total} entities`;

      if (!cnt) return;

      if (page_ents.length === 0) {
        cnt.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-soft);">No entities match the current filters.</div>`;
        return;
      }

      cnt.innerHTML = renderResults(f.layout, page_ents);

      cnt.querySelectorAll('.em-cb').forEach(cb => {
        cb.checked = selectedUuids.has(cb.dataset.uuid);
        cb.addEventListener('change', () => {
          if (cb.checked) selectedUuids.add(cb.dataset.uuid);
          else selectedUuids.delete(cb.dataset.uuid);
          _updateBulkBar();
        });
      });

      renderPagination(total, f.page, f.pageSize);
    }

    window.__emGoPage = (n) => { currentPage = n; loadData(); };

    bindManagerEvents(loadData, selectedUuids, _updateBulkBar, initFilter);
    loadData();
  }

  window.PharmoraEntityManagerUI = {
    render: renderManagerUI
  };

})();

;


    /* ===== js/services/verification.service.js ===== */

    
;
/*
 Pharmora Verification Service

 Handles:
 - Educator verification
 - Professional verification
 - Manual admin verification
 - Verification history
*/





async function requestVerification(data){



let user =
currentUser();



if(!user){

return null;

}




let existing =
await getRecords(
"verification-requests"
);




let active =
existing.find(

x=>

x.userId===user.id

&&

x.status==="pending"

);




if(active){



showToast(

"Verification request already pending",

"info"

);



return active;



}






return createRecord(

"verification-requests",

{


userId:user.id,


name:user.name,


email:user.email,


types:

data.types || [],



details:{


title:data.title || "",


organization:data.organization || "",


description:data.description || ""


},




proof:

data.proof || null,




status:"pending",


attempt:

existing.filter(
x=>x.userId===user.id
).length + 1,


history:[

{

action:"submitted",

date:new Date()
.toISOString()

}

],


snapshot:{


name:user.name,

email:user.email,

types:data.types || [],


details:{


title:data.title || "",

organization:data.organization || ""

}


},


createdAt:

new Date()
.toISOString()


}

);



}









async function getVerificationRequests(){



let requests =
await getRecords(
"verification-requests"
);



return requests.filter(

x=>x.status==="pending"

);



}









async function approveVerification(
requestId
){



let requests =
await getRecords(
"verification-requests"
);




let request =
requests.find(

x=>x.id===requestId

);




if(!request){

return;

}




await verifyUser(

request.userId,

request.types,

"request"

);





await updateRecord(

"verification-requests",

requestId,

{

status:"approved",


history:[

...(request.history || []),

{

action:"approved",

admin:

currentUser()?.id,

date:

new Date()
.toISOString()

}

],


reviewedAt:

new Date()
.toISOString()

}

);



showToast(

"User verified",

"success"

);



}









async function rejectVerification(
requestId,
reason=""
){



let requests =
await getRecords(
"verification-requests"
);



let request =
requests.find(
x=>x.id===requestId
);



if(!request){

return;

}



await updateRecord(

"verification-requests",

requestId,

{


status:"rejected",


rejectionReason:

reason || "Not specified",



history:[

...(request.history || []),

{

action:"rejected",

reason:

reason || "Not specified",


admin:

currentUser()?.id,


date:

new Date()
.toISOString()

}

],



reviewedAt:

new Date()
.toISOString()


}

);




await createRecord(

"verification-logs",

{

targetUser:

request.userId,


action:"reject",


reason:

reason || "Not specified",


createdAt:

new Date()
.toISOString()

}

);





if(

request?.userId

&&

typeof notifyUser==="function"

){



notifyUser(

request.userId,

{

title:"Verification rejected",

message:

"Reason: "

+

(reason || "Not specified")

+

". Update details and submit again.",


type:"info"

}

);



}




showToast(

"Verification rejected",

"info"

);



}










/*
 Manual admin verification
*/

async function verifyUser(
userId,
types,
method="manual",
note=""
){



let profile =
await getProfile(
userId
);



if(!profile){

return null;

}




let admin =
currentUser();




await updateRecord(

"profiles",

profile.id,

{


verification:{


verified:true,


verifiedTypes:

types,



method:method,



verifiedBy:{


id:admin?.id,


name:admin?.name


},



note:note,



verifiedAt:

new Date()
.toISOString()


}


}

);







await createRecord(

"verification-logs",

{


targetUser:userId,


action:"verify",


types:types,


method:method,


admin:{


id:admin?.id,


name:admin?.name


},



note:note,



createdAt:

new Date()
.toISOString()


}

);

if(

typeof notifyUser==="function"

){



notifyUser(

userId,

{

title:"✔ Verification Approved",

message:

"Your Pharmora profile is now verified as: "

+

types.join(", "),

type:"success"

}

);



}



}









async function removeVerification(
userId,
reason=""
){



let profile =
await getProfile(
userId
);



if(!profile){

return;

}




await updateRecord(

"profiles",

profile.id,

{


verification:{


verified:false,


verifiedTypes:[],


removedAt:

new Date()
.toISOString()


}


}

);






await createRecord(

"verification-logs",

{


targetUser:userId,


action:"remove",


reason:reason,


createdAt:

new Date()
.toISOString()


}

);



}

async function verificationHistory(
userId
){


let logs =
await getRecords(
"verification-logs"
);


return logs.filter(
x=>x.targetUser===userId
);


}
;


    /* ===== js/services/admin.service.js ===== */

    
;
/*
 Pharmora Admin Review Service
 Universal Content Moderation
*/





const reviewCollections = [

"resources",

"books",

"events",

"tools",

"teaching-materials",

"question-bank",

"assignments"

];




function escapeHtml(text){


return window.PharmoraUI

?

PharmoraUI.escape(text)

:

String(text || "");


}




async function getAllReviewItems(){



let all=[];





for(let collection of reviewCollections){



try{



let data =
await getRecords(collection);




data

.filter(

x=>!x.deleted

)

.forEach(item=>{



all.push({

...item,

_collection:collection

});



});



}



catch(error){



console.warn(

"Skipped:",
collection

);



}



}





return all;



}





























function contentIcon(type){



return {

resources:"📚",

books:"📖",

events:"📅",

tools:"🧰",

"teaching-materials":"👨‍🏫",

"question-bank":"❓",

assignments:"📝"


}[type]

|| "📄";



}


function adminButton(
text,
action
){


return PharmoraUI.button({

text,

action

});


}

/*
 Admin UI helpers
*/


function adminCard(
title,
body,
icon=""
){


return PharmoraUI.card({

title:

icon+" "+title,

body

});


}




function adminBadge(status){


return PharmoraUI.badge(

status || "unknown"

);


}






async function findContent(
collection,
id
){



let items =
await getRecords(
collection
);



return items.find(

x=>x.id===id

);



}













async function saveReviewComment(
collection,
id
){



let box =
document.getElementById(
"review-message"
);



if(

!box ||

!box.value.trim()

){



showToast(

"Write a comment first",

"error"

);



return;



}





let item =
await findContent(
collection,
id
);


if(!item){


showToast(

"Item no longer exists",

"error"

);


closeAdminModal();


return;


}






let review =
item.review ||

{

comments:[]

};







review.comments.push({


message:

box.value.trim(),



reviewer:

typeof currentUser==="function"

?

currentUser()

:

null,



time:

new Date()
.toISOString()


});








await updateRecord(

collection,

id,

{

review:review

}

);

if(

item?.author?.id

&&

typeof notifyUser==="function"

){



notifyUser(

item.author.id,

{

title:"New review feedback 💬",

message:

"A reviewer commented on your submission.",

type:"info"

}

);



}


if(
typeof logActivity==="function"
){


logActivity(

"comment",

"Review comment added",

{
collection,
id
}

);


}




closeAdminModal();






showToast(

"Comment added",

"success"

);



}











async function approveContent(
collection,
id
){


let item =
await findContent(
collection,id
);


if(!item){

showToast(

"Item no longer exists",

"error"

);

return;

}


let user =
typeof currentUser==="function"
?
currentUser()
:
null;



await updateRecord(

collection,
id,

{


moderation:{


...item.moderation,


status:"approved",

reviewedBy:
user?.id || null,

reviewedAt:
new Date().toISOString()


},


lifecycle:{


...item.lifecycle,


status:"published",

publishedAt:
new Date().toISOString()


},


analytics:{


...item.analytics,


history:[

...(item.analytics?.history || []),

{

action:"approved",

by:user?.id || null,

at:new Date().toISOString()

}

]


}


}

);

/*
 Send approval notification
*/

if(
item?.ownership?.ownerId
&&
window.PharmoraNotify
){


await PharmoraNotify.send(

item.ownership.ownerId,

{

title:
"Content approved ✅",

message:
`Your submission "${escapeHtml(item.title || "content")}" is now published.`,

type:
"success",

target:
collection,

targetId:
id

}

);


}




showToast(
"Approved",
"success"
);



renderAdminStats();

renderAdminActions();



}











async function rejectContent(
collection,
id,
reason=""
){


let item =
await findContent(
collection,id
);


if(!item){

showToast(

"Item no longer exists",

"error"

);

return;

}


let user =
typeof currentUser==="function"
?
currentUser()
:
null;



await updateRecord(

collection,
id,

{


moderation:{


...item.moderation,


status:"rejected",

reason:reason,

reviewedBy:
user?.id || null,

reviewedAt:
new Date().toISOString()


},



lifecycle:{


...item.lifecycle,


status:"rejected"


},



analytics:{


...item.analytics,


history:[

...(item.analytics?.history || []),

{

action:"rejected",

reason:reason,

by:user?.id || null,

at:new Date().toISOString()

}

]


}


}

);



/*
 Send rejection notification
*/

if(
item?.ownership?.ownerId
&&
window.PharmoraNotify
){


await PharmoraNotify.send(

item.ownership.ownerId,

{

title:
"Submission needs changes ⚠️",

message:
escapeHtml(reason) || "Your submission was not approved.",

type:
"warning",

target:
collection,

targetId:
id

}

);


}



showToast(
"Rejected",
"info"
);



renderAdminStats();

renderAdminActions();



}








async function deleteContent(
collection,
id
){


return PharmoraUI.confirm({


title:"Delete Content 🗑",


message:

"This will move the content to trash. Continue?",


confirmText:"Delete",


onConfirm:

`deleteContentConfirm('${collection}','${id}')`


});


}


async function deleteContentConfirm(
collection,
id
){






return PharmoraUI.confirm({


title:"Delete Content 🗑",


message:

"This will move the content to trash. Continue?",


confirmText:"Delete",


onConfirm:

`deleteContentConfirm('${collection}','${id}')`


});






if(!ok){

return;

}








let item =
await findContent(
collection,
id
);




if(

typeof saveAudit==="function"

){


saveAudit(

"delete",

{

collection:collection,

item:item

}

);


}






await updateRecord(

collection,

id,

{

deleted:true,


deletedAt:

new Date()
.toISOString(),



lifecycle:{


status:"deleted"


}


}

);







showToast(

"Deleted",

"success"

);





renderAdminStats();

renderAdminActions();




}



/*
=========================
 PERMISSION MATRIX
=========================
*/


const permissionMatrix = [


{
key:"content.review",
label:"📋 Review Content"
},


{
key:"content.submit",
label:"🌱 Submit Content"
},


{
key:"content.autoapprove",
label:"⭐ Auto Approve Content"
},


{
key:"contributors.manage",
label:"🌱 Manage Contributors"
},


{
key:"courses.manage",
label:"🎓 Manage Courses"
},


{
key:"curriculum.manage",
label:"📘 Manage Curriculum"
},


{
key:"subjects.manage",
label:"🧪 Manage Subjects"
},


{
key:"books.manage",
label:"📚 Manage Library"
},


{
key:"events.manage",
label:"📅 Manage Events"
},


{
key:"tools.manage",
label:"🧰 Manage Tools"
},


{
key:"notifications.manage",
label:"🔔 Notifications"
},


{
key:"users.manage",
label:"👥 Manage Users"
},


{
key:"analytics.view",
label:"📈 Analytics"
}


];



async function restoreItem(
collection,
id
){



await updateRecord(

collection,

id,

{


deleted:false,


deletedAt:null,



lifecycle:{


status:"draft"


}


}

);





showToast(

"Restored",

"success"

);




renderTrash();



}






async function dismissReport(id){



await updateRecord(

"reports",

id,

{

moderation:{


status:"dismissed"


},


reviewedAt:

new Date()
.toISOString()


}

);

if(
typeof logActivity==="function"
){


logActivity(

"report.dismiss",

"Report dismissed",

{
id,
level:"info"
}

);


}

showToast(
"Report dismissed",
"success"
);



renderReports();



}




async function removeReportedContent(reportId){



let reports =
await getRecords("reports");



let report =
reports.find(
r=>r.id===reportId
);



if(!report){
return;
}




await updateRecord(

report.collection,

report.contentId,

{

deleted:true,


deletedAt:
new Date().toISOString(),



lifecycle:{


status:"deleted"


}


}

);



await updateRecord(

"reports",

reportId,

{

moderation:{


status:"removed"


},


reviewedAt:

new Date()
.toISOString()


}

);

if(
typeof logActivity==="function"
){


logActivity(

"report.remove",

"Removed reported content",

{

reportId,

collection:
report.collection,

contentId:
report.contentId,

level:"warning"

}

);


}

showToast(
"Content removed",
"success"
);



renderReports();



}
;


    /* ===== js/services/admin.review.js ===== */

    
;
async function renderAdminActions(){



let box =
document.getElementById(
"admin-actions"
);



if(!box){

return;

}


let title =
document.getElementById(
"section-title"
);



if(title){


title.innerHTML =
"Content Review Queue";


}


let items =
await getAllReviewItems();





let pending =
items.filter(x=>{

return (

x.moderation?.status==="pending"

||

x.status==="pending"

);

});







if(pending.length===0){



box.innerHTML=`


<div class="panel">

Everything reviewed

<span class="status">

✓

</span>

</div>


`;



return;



}









box.innerHTML =

`
<button
class="btn btn-primary"
onclick="AdminWizard.startReviewWizard()">

▶ Start Review Queue

</button>

<br><br>
`

+

pending.map(item=>`





<div class="panel">



<div>



<h3>

${contentIcon(item._collection)}

${

item.title ||

item.question ||

item.name ||

"Untitled"

}

</h3>





<small>


Type:

${item._collection}


<br>


👤

${item.author?.name || "Unknown"}


<br>


🎓

${item.data?.course || item.course || "-"}


<br>


📘

${item.data?.semester || item.semester || "-"}


<br>


🧪

${item.data?.subject || item.subject || "-"}


<br>


🏷

${(item.tags || []).join(", ")}


</small>




</div>








<div>


<button onclick="viewContent('${item._collection}','${item.id}')">

👁

</button>



<button onclick="commentContent('${item._collection}','${item.id}')">

💬

</button>



<button onclick="approveContent('${item._collection}','${item.id}')">

✅

</button>



<button onclick="rejectContent('${item._collection}','${item.id}')">

❌

</button>



<button onclick="deleteContent('${item._collection}','${item.id}')">

🗑

</button>


</div>





</div>




`).join("");



}

async function viewContent(
collection,
id
){



let item =
await findContent(
collection,
id
);




if(!item){

return;

}




let html = `


<div class="card">


<div class="badge">

${contentIcon(collection)}

${collection}

</div>



<br><br>



<h1>

${

item.title ||

item.question ||

"Untitled"

}

</h1>





<p>

${

item.description ||

item.data?.description ||

item.data?.answer ||

item.answer ||

""

}

</p>





<br>



<p>


⭐

${item.difficulty || ""}


<br>


🏷

${(item.tags || []).join(", ")}


</p>




</div>


`;





openAdminModal(

html

);


}










async function commentContent(
collection,
id
){



let html = `


<div class="card">


<h2>

💬 Review Comment

</h2>



<p>

Send feedback to contributor

</p>



<br>



<textarea

id="review-message"

placeholder="Write improvement suggestions, approval notes, or rejection reason..."

></textarea>





<br><br>



<button

class="btn btn-primary"

onclick="saveReviewComment('${collection}','${id}')">

Save Comment

</button>



</div>


`;




openAdminModal(

html

);



}

/*
 Review Service Export
*/


window.PharmoraReview = {


getAllReviewItems:function(){

return getAllReviewItems();

},



renderAdminActions:function(){

return renderAdminActions();

},



approveContent:function(
collection,
id
){

return approveContent(
collection,
id
);

},



rejectContent:function(
collection,
id,
reason
){

return rejectContent(
collection,
id,
reason
);

},



viewContent:function(
collection,
id
){

return viewContent(
collection,id
);

}


};



console.log(
"✓ PharmoraReview ready"
);
;


    /* ===== js/services/admin.users.js ===== */

    
;
async function renderUserManager(){


let box =
document.getElementById(
"admin-actions"
);


document.getElementById(
"section-title"
)
.innerHTML =
"👥 User Management";



box.innerHTML =

PharmoraUI.card({

title:"Find User",

html:true,

body:

`

<input

id="searchUserId"

placeholder="Search ID, name or email"

>


<br><br>


<div id="found-user"></div>

`,


actions:

PharmoraUI.button({

text:"Search",

action:"adminFindUser()"

})


});


}








async function adminFindUser(){



let query =

searchUserId.value

.trim()

.toLowerCase();




let users=[];


try{


if(
typeof getRecords==="function"
){


users =
await getRecords(
"users"
);


}


else{


users =
await getDemoUsers();


}


}
catch(e){


users=[];


}


if(
!Array.isArray(users)
){


users =
users.data

||

users.records

||

[];


}





let user =
users.find(

x=>

x.id===query

||

x.email?.toLowerCase()===query

||

x.name?.toLowerCase()

.includes(query)

);




let box =
document.getElementById(
"found-user"
);




if(!user){


box.innerHTML =
"<p>User not found</p>";


return;


}





box.innerHTML =

PharmoraUI.card({


title:

"👤 " + user.name,


html:true,


body:

`

${

PharmoraUI.panel({

left:"<b>ID</b><br>"+user.id

})

}


${

PharmoraUI.panel({

left:"<b>Email</b><br>"+user.email

})

}


${

PharmoraUI.panel({

left:"<b>Role</b>",

right:user.role

})

}


${

PharmoraUI.panel({

left:"<b>Status</b>",

right:

user.disabled

?

"🚫 Disabled"

:

"✅ Active"

})

}


${

PharmoraUI.panel({

left:"<b>Joined</b>",

right:

user.createdAt

?

new Date(user.createdAt)
.toLocaleDateString()

:

"Unknown"

})

}

`,


actions:


PharmoraUI.button({

text:"📋 Copy ID",

action:

`navigator.clipboard.writeText('${user.id}')`

})


+


PharmoraUI.button({

text:"👤 View Profile",

action:

`location.href='../profile.html?id=${user.id}'`

})


+


PharmoraUI.button({

text:"✔ Verify Educator",

action:

`adminVerifyUser('${user.id}','educator')`

})


+


PharmoraUI.button({

text:"✔ Verify Professional",

action:

`adminVerifyUser('${user.id}','professional')`

})


+


PharmoraUI.button({

text:"🚫 Ban User",

action:

`adminDisableUser('${user.id}')`

})


+


PharmoraUI.button({

text:"🔓 Restore User",

action:

`adminRestoreUser('${user.id}')`

})


+

(

currentUser().role==="owner"

?

PharmoraUI.button({

text:"👑 Make Admin",

action:

`ownerChangeRole('${user.id}','admin')`

})


+

PharmoraUI.button({

text:"⬇ Remove Admin",

action:

`ownerChangeRole('${user.id}','member')`

})

:

""

)


});



}





async function adminVerifyUser(
id,
type
){



await verifyUser(

id,

[
type
],

"manual"

);

if(

typeof saveAudit==="function"

){



saveAudit(

"user.verify",

{

target:id,

type:type

}

);



}

if(

typeof notifyUser==="function"

){



await notifyUser(

id,

{

title:"Verification approved ✔",


message:

"Your "

+

type

+

" status has been verified.",


type:"success"

}

);



}

PharmoraUI.confirm({

title:"Verification Complete ✔",

message:
"User verified as " + type,

confirmText:"OK"

});



adminFindUser();



}

async function ownerChangeRole(
id,
role
){



if(

changeUserRole(
id,
role
)

){

if(

typeof saveAudit==="function"

){



saveAudit(

"user.role.change",

{

target:id,

role:role

}

);



}

if(

typeof notifyUser==="function"

){



await notifyUser(

id,

{

title:"Account role updated 👑",


message:

"Your account role changed to "

+

role,


type:"info"

}

);



}

PharmoraUI.confirm({

title:"Role Updated 👑",

message:
"Role changed to " + role,

confirmText:"OK"

});



adminFindUser();



}


else{


PharmoraUI.confirm({

title:"Permission denied",

message:"Only owner can do this",

confirmText:"OK"

});


}



}

async function adminDisableUserConfirm(
id,
reason
){



return PharmoraUI.prompt({

title:"Disable User 🚫",

message:"Enter reason for disabling this account",

placeholder:"Reason",

confirmText:"Disable",

onConfirm:

`adminDisableUserConfirm('${id}')`

});



if(

disableUser(
id,
reason || ""
)

){

if(

typeof saveAudit==="function"

){



saveAudit(

"user.ban",

{

target:id,

reason:reason

}

);



}

if(

typeof notifyUser==="function"

){



await notifyUser(

id,

{

title:"Account disabled 🚫",


message:

reason ||

"Your account was disabled by administration.",


type:"warning"

}

);



}

PharmoraUI.confirm({

title:"User Disabled 🚫",

message:"User banned",

confirmText:"OK"

});


adminFindUser();


}


else{


PharmoraUI.confirm({

title:"Failed",

message:"Cannot disable this user",

confirmText:"OK"

});


}



}

async function adminRestoreUser(id){



if(

restoreUser(id)

){





if(

typeof saveAudit==="function"

){


saveAudit(

"user.restore",

{

target:id

}

);


}






if(

typeof notifyUser==="function"

){



await notifyUser(

id,

{

title:"Account restored 🔓",

message:

"Your account access has been restored.",


type:"success"

}

);



}







PharmoraUI.confirm({

title:"Restored 🔓",

message:"User restored",

confirmText:"OK"

});



adminFindUser();



}



else{



PharmoraUI.confirm({

title:"Failed",

message:"Cannot restore this user",

confirmText:"OK"

});



}



}
;


    /* ===== js/services/admin.audit.js ===== */

    
;
/*
 Admin Audit Logs
 Pharmora UI v3
*/


async function renderAuditLogs(){



let box =
document.getElementById(
"admin-actions"
);



document.getElementById(
"section-title"
)
.innerHTML =
"🧾 Audit Logs";




let logs =
typeof getAudit==="function"

?

await getAudit()

:

[];





if(!logs.length){



box.innerHTML =

PharmoraUI.empty(

"No audit records yet."

);



return;



}







box.innerHTML =

logs.map(log=>


PharmoraUI.card({


title:

"🧾 " +

(
log.type ||
log.action ||
"Audit Event"
),



html:true,



body:


PharmoraUI.panel({

left:

`

<b>User</b>

<br>

${

log.user?.name ||

log.admin?.name ||

"System"

}

`,

right:

log.time

?

new Date(
log.time
)
.toLocaleString()

:

""

})


+


PharmoraUI.panel({

left:

"<b>Details</b>",


right:

`

<pre>

${

JSON.stringify(

log.data ||

log,

null,

2

)

}

</pre>

`

})



})


)
.join("");



}
;


    /* ===== js/services/admin.reports.js ===== */

    
;
/*
 Pharmora Report Moderation
*/


async function renderReports(){

let title =
document.getElementById(
"section-title"
);


if(title){


title.innerHTML =
"🚩 Report Queue";


}

const app =
document.getElementById("admin-actions");


if(!app){
return;
}



let reports =
await getRecords("reports");



reports =
reports.filter(
r=>r.status==="pending"
);



app.innerHTML = `

<h2>
🚩 Report Queue
</h2>


${
reports.length ?

reports.map(report=>`

<div class="panel">


<div>

<strong>
${report.collection}
</strong>

<p>
${report.reason}
</p>


<small>
Reported by:
${report.reportedBy?.name || "Unknown"}
</small>


</div>


<div>


<button
onclick="dismissReport('${report.id}')">

Dismiss

</button>


<button
onclick="removeReportedContent('${report.id}')">

Remove

</button>


</div>


</div>


`).join("")


:

`

<div class="card">

🎉 No pending reports

</div>

`

}


`;



}
;


    /* ===== js/services/admin.trash.js ===== */

    
;
/*
=========================
 TRASH MANAGER
=========================
*/


async function renderTrash(){



let box =
document.getElementById(
"admin-actions"
);



if(!box){

return;

}




let deleted=[];




for(let collection of reviewCollections){



let data =
await getRecords(
collection
);



data

.filter(x=>x.deleted)

.forEach(x=>{


deleted.push({

...x,

_collection:collection

});


});


}







box.innerHTML = deleted.length

?

deleted.map(item=>`



<div class="panel">


<div>


<h3>

🗑

${item.title || item.name || "Deleted"}

</h3>



<small>

${item._collection}

</small>


</div>



<button

onclick="restoreItem('${item._collection}','${item.id}')">

♻️ Restore

</button>



</div>



`).join("")


:


`

<div class="card">

Trash empty

</div>

`;



}
;


    /* ===== js/services/admin.verification.js ===== */

    
;
async function renderVerificationCenter(){



let box =
document.getElementById(
"admin-actions"
);



document.getElementById(
"section-title"
)
.innerHTML =
"✔ Verification Requests";





let requests =
await getVerificationRequests();





if(!requests.length){



box.innerHTML =

PharmoraUI.empty(

"No pending verification requests."

);



return;



}







box.innerHTML =

requests.map(req=>


PharmoraUI.card({


title:

"👤 " + req.name,


html:true,


body:

`

${

PharmoraUI.panel({

left:"<b>Email</b>",

right:req.email

})

}


${

PharmoraUI.panel({

left:"<b>Type</b>",

right:req.types.join(", ")

})

}


${

PharmoraUI.panel({

left:"<b>Title</b>",

right:req.details?.title || ""

})

}


${

PharmoraUI.panel({

left:"<b>Organization</b>",

right:req.details?.organization || ""

})

}


${

PharmoraUI.panel({

left:"<b>Attempt</b>",

right:

"#" + (req.attempt || 1)

})

}


${

PharmoraUI.panel({

left:"<b>Proof</b>",

right:req.proof || "<i>No proof provided</i>"

})

}


${

PharmoraUI.panel({

left:"<b>History</b>",

right:

(req.history || [])

.map(h=>

(h.action || "")

+

(h.reason ? " : "+h.reason : "")

)

.join("<br>")

||

"No history"

})

}

`,


actions:


PharmoraUI.button({

text:"👤 View Profile",

action:

`location.href='../profile.html?id=${req.userId}'`

})


+


PharmoraUI.button({

text:"✔ Approve",

type:"primary",

action:

`adminApproveVerification('${req.id}')`

})


+


PharmoraUI.button({

text:"❌ Reject",

action:

`adminRejectVerification('${req.id}')`

})



})


)
.join("");



}









async function adminApproveVerification(id){



await approveVerification(id);



if(
typeof saveAudit==="function"
){


saveAudit(

"verification.approve",

{

request:id

}

);


}



PharmoraUI.confirm({

title:"Approved ✔",

message:"Verification approved",

confirmText:"OK"

});



renderVerificationCenter();



}










async function adminRejectVerification(id){



return PharmoraUI.prompt({


title:"Reject Verification ❌",


message:

"Enter rejection reason",


placeholder:

"Reason",


confirmText:"Reject",


onConfirm:

`adminRejectVerificationConfirm('${id}')`


});



}




async function adminRejectVerificationConfirm(
id,
reason
){



if(!reason){

return;

}



await rejectVerification(
id,
reason
);




if(

typeof saveAudit==="function"

){


saveAudit(

"verification.reject",

{

request:id,

reason:reason

}

);


}




PharmoraUI.confirm({

title:"Rejected",

message:"Verification rejected",

confirmText:"OK"

});



renderVerificationCenter();



}
;


    /* ===== js/services/admin.contributor.service.js ===== */

    
;
/*
 Pharmora Contributor Management
*/


async function renderContributorApplications(){



let box =
document.getElementById(
"admin-actions"
);



if(!box){

return;

}

let title =
document.getElementById(
"section-title"
);



if(title){


title.innerHTML =
"🌱 Contributor Applications";


}


let applications =
await getRecords(
"contributor-applications"
);



applications =
applications.filter(
x=>x.status==="pending"
);






if(applications.length===0){


box.innerHTML=`

<div class="card">

<h2>
🌱 Contributors
</h2>

<p>
No pending applications
</p>

</div>

`;


return;


}






box.innerHTML =

applications.map(app=>`

<div class="panel">


<div>


<h3>

🌱 ${app.name}

</h3>


<p>

${app.reason || ""}

</p>


<small>

🎓 ${app.education || ""}

<br>

📧 ${app.email}

</small>


</div>





<div>


<button

onclick="approveContributor('${app.id}','${app.userId}')">

✅

</button>



<button

onclick="rejectContributor('${app.id}','${app.userId}')">

❌

</button>


</div>



</div>


`).join("");



}











async function approveContributor(
applicationId,
userId
){



let users =
await getRecords(
"users"
);



let user =
users.find(
x=>x.id===userId
);



if(user){


await updateRecord(

"users",

userId,

{


permissions:[

...new Set([

...(user.permissions || []),

"content.submit"

])

]


}

);

if(
typeof getProfile==="function"
){



let profile =
await getProfile(userId);



if(profile){


await updateRecord(

"profiles",

profile.id,

{

contributor:{


enabled:true,


approvedAt:

new Date()
.toISOString()


}


}

);


}



}

if(

typeof refreshCurrentUser==="function"

){


refreshCurrentUser();


}

}







await updateRecord(

"contributor-applications",

applicationId,

{

status:"approved",

approvedAt:

new Date()
.toISOString()

}

);


if(

typeof logActivity==="function"

){


logActivity(

"contributor",

"Approved contributor",

{
userId:userId
}

);


}

if(

typeof notifyUser==="function"

){



notifyUser(

userId,

{

title:"🌱 Contributor Approved",

message:

"You can now submit educational content on Pharmora.",

type:"success"

}

);



}


showToast(

"Contributor approved",

"success"

);



renderContributorApplications();



}









async function rejectContributor(
id,
userId
){



await updateRecord(

"contributor-applications",

id,

{

status:"rejected"

}

);

if(

typeof logActivity==="function"

){


logActivity(

"contributor",

"Rejected contributor application",

{
id:id
}

);


}

if(

typeof notifyUser==="function"

){



notifyUser(

userId,

{

title:"Contributor Application Update",

message:

"Your contributor application was not approved. You may improve your profile and try again later.",

type:"info"

}

);



}


showToast(

"Application rejected",

"info"

);



renderContributorApplications();



}
;


    /* ===== js/services/admin.modules.js ===== */

    
;
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

;
