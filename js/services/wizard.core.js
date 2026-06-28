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

    // ── Entity Creation Wizard Rendering ─────────────────
    function _renderCreationWizard(drawerEl) {
      if (createWizardState.step === 1 && !createWizardState.type) {
        // Step 1: Selection
        let registeredTypes = [];
        if (typeof PharmoraEntityRegistry !== 'undefined') {
          registeredTypes = PharmoraEntityRegistry.getRegisteredTypes();
        }
        if (registeredTypes.length === 0) registeredTypes = ['Subject', 'Drug'];

        drawerEl.innerHTML = `
          <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
            <div style="font-size:1.1rem;font-weight:800;color:var(--text);">Create New Entity</div>
            <button onclick="PharmoraWorkbench._wb.closeDrawer()" style="border:none;background:var(--surface-light);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1rem;color:var(--text);">✕</button>
          </div>
          <div style="padding:24px;display:flex;flex-direction:column;gap:16px;">
            <p style="margin:0;font-size:0.88rem;color:var(--text-soft);">Select the type of entity you want to create:</p>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${registeredTypes.map(t => `
                <button onclick="PharmoraWorkbench._wb._setCreateType('${t}')"
                  style="padding:12px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--text);font-weight:700;text-align:left;cursor:pointer;">
                  📋 ${t} Monograph
                </button>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        // Form step
        const type = createWizardState.type;
        let schema = null;
        if (typeof PharmoraEntityRegistry !== 'undefined') {
          schema = PharmoraEntityRegistry.getSchema(type);
        }
        const contentProps = schema?.properties?.content?.properties || {};
        const requiredFields = schema?.properties?.content?.required || [];

        const fieldsHtml = Object.entries(contentProps).map(([name, prop]) => {
          const label = name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');
          const isRequired = requiredFields.includes(name);
          const requiredStar = isRequired ? '<span style="color:#ef4444;margin-left:4px;">*</span>' : '';
          const val = createWizardState.formData[name] !== undefined ? createWizardState.formData[name] : '';

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
          } else if (name === 'description' || name === 'objectives' || name === 'outcomes' || prop.type === 'string' && prop.maxLength > 100) {
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
        }).join('');

        drawerEl.innerHTML = `
          <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:1.1rem;font-weight:800;color:var(--text);">New ${type}</div>
              <span style="font-size:0.7rem;background:var(--surface-light);color:var(--text-soft);padding:1px 6px;border-radius:4px;">Draft</span>
            </div>
            <button onclick="PharmoraWorkbench._wb.closeDrawer()" style="border:none;background:var(--surface-light);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1rem;color:var(--text);">✕</button>
          </div>
          <div style="padding:20px 24px;display:flex;flex-direction:column;gap:14px;overflow-y:auto;flex:1;">
            ${fieldsHtml}
          </div>
          <div style="padding:16px 24px;border-top:1px solid var(--border);background:var(--surface);display:flex;gap:10px;">
            <button onclick="PharmoraWorkbench._wb.closeDrawer()" style="padding:8px 14px;border:1px solid var(--border);background:none;color:var(--text);border-radius:8px;cursor:pointer;font-weight:600;font-size:0.85rem;">Cancel</button>
            <button onclick="PharmoraWorkbench._wb._saveCreateDraft()" style="padding:8px 14px;border:1px solid var(--border);background:none;color:var(--text);border-radius:8px;cursor:pointer;font-weight:600;font-size:0.85rem;">Save Draft</button>
            <button onclick="PharmoraWorkbench._wb._submitCreate()" style="flex:1;padding:8px 14px;border:none;background:var(--primary);color:#fff;border-radius:8px;cursor:pointer;font-weight:700;font-size:0.85rem;">Create Entity</button>
          </div>
        `;
      }
    }

    // Wizard Action Handlers
    function _setCreateType(type) {
      createWizardState.type = type;
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
          
          <div style="padding:20px 24px;display:flex;flex-direction:column;gap:18px;overflow-y:auto;flex:1;">
            
            <!-- Moderation / Workflow Actions -->
            <div style="display:flex;gap:8px;flex-wrap:wrap;background:var(--surface);padding:10px;border-radius:8px;border:1px solid var(--border);">
              <button onclick="PharmoraWorkbench._wb._drawerAction('approve','${entity.uuid}')" style="${_btnStyle('var(--primary)')}">✓ Approve</button>
              <button onclick="PharmoraWorkbench._wb._drawerAction('publish','${entity.uuid}')" style="${_btnStyle('#22c55e')}">📢 Publish</button>
              <button onclick="PharmoraWorkbench._wb._drawerAction('requestChanges','${entity.uuid}')" style="${_btnStyle('#f59e0b')}">🔁 Changes</button>
              <button onclick="PharmoraWorkbench._wb._drawerAction('archive','${entity.uuid}')" style="${_btnStyle('#64748b')}">🗄 Archive</button>
            </div>

            <!-- Preview Card -->
            <div style="margin-top:4px;">
              <h4 style="margin:0 0 8px 0;font-size:0.85rem;color:var(--text-soft);text-transform:uppercase;font-weight:700;">Entity Preview</h4>
              ${cardHtml}
            </div>

            <!-- Relations Editor UI -->
            <div style="border-top:1px solid var(--border);padding-top:16px;">
              <h4 style="margin:0 0 10px 0;font-size:0.85rem;color:var(--text-soft);text-transform:uppercase;font-weight:700;">🔗 Link Relations</h4>
              <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">
                <button onclick="PharmoraWorkbench._wb._openLinkEditor('${entity.uuid}', 'belongsTo')" style="padding:5px 10px;font-size:0.75rem;border:1px solid var(--border);background:var(--surface);color:var(--text);border-radius:6px;cursor:pointer;font-weight:600;">+ Add Parent</button>
                <button onclick="PharmoraWorkbench._wb._openLinkEditor('${entity.uuid}', 'hasMany')" style="padding:5px 10px;font-size:0.75rem;border:1px solid var(--border);background:var(--surface);color:var(--text);border-radius:6px;cursor:pointer;font-weight:600;">+ Add Child</button>
                <button onclick="PharmoraWorkbench._wb._openLinkEditor('${entity.uuid}', 'unlink')" style="padding:5px 10px;font-size:0.75rem;border:1px solid #ef4444;background:none;color:#ef4444;border-radius:6px;cursor:pointer;font-weight:600;">Remove Link</button>
              </div>
              <div id="wb-drawer-relations">${relationsHtml}</div>
            </div>

            <!-- Audit Trail & Timeline mounts -->
            <div style="border-top:1px solid var(--border);padding-top:16px;">
              <h4 style="margin:0 0 8px 0;font-size:0.85rem;color:var(--text-soft);text-transform:uppercase;font-weight:700;">📋 Audit Log & History</h4>
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

    // Relation Linking Dialog Helper
    async function _openLinkEditor(uuid, action) {
      if (action === 'unlink') {
        const target = prompt('Enter target Entity UUID to unlink:');
        if (!target) return;
        const type = prompt('Enter relation type to remove (e.g. belongsTo, hasMany, part_of_semester, contains_subject):', 'belongsTo');
        if (!type) return;
        try {
          if (typeof PharmoraRelations !== 'undefined') {
            await PharmoraRelations.unlinkEntities(uuid, type, target, 'admin');
            if (typeof showToast === 'function') showToast('Relation unlinked successfully.', 'success');
            // Refresh drawer
            const drawerEl = document.getElementById(drawerContainerId);
            if (drawerEl) await _renderEntityDrawer(drawerEl, { uuid });
          }
        } catch(e) {
          alert('Error: ' + e.message);
        }
        return;
      }

      const target = prompt(`Enter target Entity UUID to link as ${action}:`);
      if (!target) return;

      try {
        if (typeof PharmoraRelations !== 'undefined') {
          await PharmoraRelations.linkEntities(uuid, action, target, {}, 'admin');
          if (typeof showToast === 'function') showToast('Relation linked successfully.', 'success');
          // Refresh drawer
          const drawerEl = document.getElementById(drawerContainerId);
          if (drawerEl) await _renderEntityDrawer(drawerEl, { uuid });
        }
      } catch(e) {
        alert('Error: ' + e.message);
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
      _openLinkEditor
    };

    // Store global reference so onclick="PharmoraWorkbench._wb.closeDrawer()" works
    if (!window.PharmoraWorkbench) window.PharmoraWorkbench = {};
    window.PharmoraWorkbench._wb = workbench;

    return workbench;
  }

  return { createWizard, createWorkbench };
})();

window.PharmoraWizardCore = PharmoraWizardCore;
