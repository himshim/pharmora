
/*
 Generated Pharmora Bundle
 Do not edit directly
*/



    /* ===== js/services/user-notification.service.js ===== */

    
;
/*
 Pharmora User Notification Service
*/



async function notifyUser(
userId,
data
){



return createRecord(

"user-notifications",

{

userId:userId,


title:data.title,


message:data.message,


type:

data.type || "info",



read:false,


createdAt:

new Date()
.toISOString()


}

);



}










async function getUserNotifications(){



let user =
currentUser();



if(!user){

return [];

}




let all =
await getRecords(
"user-notifications"
);



return all

.filter(

x=>x.userId===user.id

)

.sort(

(a,b)=>

new Date(b.createdAt)

-

new Date(a.createdAt)

);



}











async function unreadUserNotifications(){



let data =
await getUserNotifications();



return data.filter(

x=>!x.read

);



}











async function readNotification(id){



return updateRecord(

"user-notifications",

id,

{

read:true

}

);



}
;


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
        else if (action === 'reject') {
          const reason = prompt('Enter rejection reason:');
          if (reason) await PharmoraEntityReview.reject(uuid, reason, 'admin');
        }
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


    /* ===== js/services/profile.wizard.js ===== */

    
;
/**
 * Pharmora Profile Setup Wizard
 * Step-by-step profile generation module built on Wizard Core.
 */
const PharmoraProfileWizard = (function () {
  'use strict';

  let currentProfileData = null;

  function initWizard(profileData) {
    currentProfileData = profileData;

    const steps = [
      {
        id: 'identity',
        label: 'Identity',
        validate: async (data) => {
          if (!data.displayName || !data.displayName.trim()) return 'Display name is required.';
          if (!data.username || !data.username.trim()) return 'Username is required.';
          return null;
        },
        render: (data) => `
          <h3>Step 1: Identity Details</h3>
          <div class="form-group">
            <label class="form-label">Display Name *</label>
            <input class="form-input" type="text" id="wz-displayName" value="${data.displayName || ''}" oninput="PharmoraProfileWizard.updateField('displayName', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Username *</label>
            <input class="form-input" type="text" id="wz-username" value="${data.username || ''}" oninput="PharmoraProfileWizard.updateField('username', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Avatar URL</label>
            <input class="form-input" type="text" id="wz-avatar" value="${data.avatar?.url || ''}" oninput="PharmoraProfileWizard.updateAvatar(this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Headline</label>
            <input class="form-input" type="text" id="wz-headline" value="${data.headline || ''}" oninput="PharmoraProfileWizard.updateField('headline', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Bio</label>
            <textarea class="form-input" id="wz-bio" oninput="PharmoraProfileWizard.updateField('bio', this.value)">${data.bio || ''}</textarea>
          </div>
        `
      },
      {
        id: 'category',
        label: 'Role & Classification',
        validate: async () => null,
        render: (data) => {
          const type = data.types?.[0] || 'student';
          return `
            <h3>Step 2: Profile Classification</h3>
            <div class="form-group">
              <label class="form-label">Profile Category</label>
              <select class="form-input" id="wz-type" onchange="PharmoraProfileWizard.changeType(this.value)">
                <option value="student" ${type === 'student' ? 'selected' : ''}>Student</option>
                <option value="educator" ${type === 'educator' ? 'selected' : ''}>Educator</option>
                <option value="professional" ${type === 'professional' ? 'selected' : ''}>Professional</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Position / Suggestion</label>
              <select class="form-input" id="wz-position" onchange="PharmoraProfileWizard.changePosition(this.value)">
                ${getSuggestionsHTML(type, data.positions?.[0]?.title)}
              </select>
            </div>
            <div class="form-group" id="wz-customPositionBox" style="display:${data.positions?.[0]?.title === 'Other' ? 'block' : 'none'};">
              <label class="form-label">Specify Custom Position</label>
              <input class="form-input" type="text" id="wz-customPosition" value="${data.positions?.[0]?.title === 'Other' ? (data.customPosition || '') : ''}" oninput="PharmoraProfileWizard.updateCustomPosition(this.value)">
            </div>
          `;
        }
      },
      {
        id: 'academic',
        label: 'Academic Details',
        condition: (data) => data.types?.[0] === 'student',
        validate: async () => null,
        render: (data) => `
          <h3>Step 3: Education & Studies</h3>
          <div class="form-group">
            <label class="form-label">University / College</label>
            <input class="form-input" type="text" id="wz-college" value="${data.education?.[0]?.college || ''}" oninput="PharmoraProfileWizard.updateEducation('college', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Course</label>
            <input class="form-input" type="text" id="wz-course" value="${data.education?.[0]?.course || ''}" oninput="PharmoraProfileWizard.updateEducation('course', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Graduation Year</label>
            <input class="form-input" type="number" id="wz-gradYear" value="${data.education?.[0]?.year || ''}" oninput="PharmoraProfileWizard.updateEducation('year', this.value)">
          </div>
        `
      },
      {
        id: 'professional',
        label: 'Professional Profile',
        condition: (data) => data.types?.[0] !== 'student',
        validate: async () => null,
        render: (data) => `
          <h3>Step 3: Professional Experience</h3>
          <div class="form-group">
            <label class="form-label">Workplace / Organization</label>
            <input class="form-input" type="text" id="wz-org" value="${data.positions?.[0]?.organization || ''}" oninput="PharmoraProfileWizard.updatePositionField('organization', this.value)">
          </div>
        `
      },
      {
        id: 'specialization',
        label: 'Specialization',
        validate: async () => null,
        render: (data) => `
          <h3>Step 4: Specializations & Fields</h3>
          <div class="form-group">
            <label class="form-label">Fields of Interest (comma separated)</label>
            <input class="form-input" type="text" id="wz-specs" value="${(data.specializations || []).join(', ')}" placeholder="e.g. Pharmaceutics, Pharmacology" oninput="PharmoraProfileWizard.updateSpecs(this.value)">
          </div>
        `
      },
      {
        id: 'verification',
        label: 'Verification',
        validate: async () => null,
        render: (data) => {
          const status = data.verification?.verified ? '👑 Verified Account' : (data.verification?.status || 'Not Verified');
          return `
            <h3>Step 5: Verification Center</h3>
            <div class="card" style="padding:15px;margin-bottom:15px;">
              <p>Current Status: <strong>${status}</strong></p>
              ${data.verification?.verified ? '' : `
                <div class="form-group">
                  <label class="form-label">Registration / License Proof (Optional)</label>
                  <textarea class="form-input" placeholder="Enter Registration ID, staff URL, or reference proof" oninput="PharmoraProfileWizard.updateVerificationProof(this.value)">${data.verificationProof || ''}</textarea>
                </div>
              `}
            </div>
          `;
        }
      },
      {
        id: 'links',
        label: 'Social Links',
        validate: async () => null,
        render: (data) => `
          <h3>Step 6: Links & Contact Profiles</h3>
          <div class="form-group">
            <label class="form-label">LinkedIn URL</label>
            <input class="form-input" type="url" id="wz-linkedin" value="${data.contact?.linkedin?.value || ''}" oninput="PharmoraProfileWizard.updateContact('linkedin', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Personal Website</label>
            <input class="form-input" type="url" id="wz-web" value="${data.contact?.website?.value || ''}" oninput="PharmoraProfileWizard.updateContact('website', this.value)">
          </div>
          <div class="form-group">
            <label><input type="checkbox" ${data.contact?.email?.visible ? 'checked' : ''} onchange="PharmoraProfileWizard.updateContactVisibility('email', this.checked)"> Show public email on profile</label>
          </div>
        `
      },
      {
        id: 'review',
        label: 'Review',
        validate: async () => null,
        render: (data) => `
          <h3>Step 7: Review & Finalize</h3>
          <p>Please double-check your profile configuration before saving.</p>
          <div class="card" style="padding:15px;line-height:1.6;">
            <div><strong>Display Name:</strong> ${data.displayName || ''}</div>
            <div><strong>Username:</strong> @${data.username || ''}</div>
            <div><strong>Profile Category:</strong> ${data.types?.[0] || 'member'}</div>
            <div><strong>Role Position:</strong> ${data.positions?.[0]?.title || 'Member'}</div>
            <div><strong>Specializations:</strong> ${(data.specializations || []).join(', ') || 'None'}</div>
          </div>
        `
      }
    ];

    PharmoraWizardCore.createWizard({
      id: 'profile',
      containerId: 'profile-wizard-root',
      steps,
      getInitialState: () => currentProfileData,
      dynamicSteps: (data, allSteps) => {
        // Dynamic filter based on role/condition
        return allSteps.filter(s => !s.condition || s.condition(data));
      },
      onComplete: async (finalData) => {
        // Connect profile fields with structured Organization/Course entities
        if (finalData.positions?.[0]?.organization) {
          const orgName = finalData.positions[0].organization;
          const matches = await getRecords('organizations', { name: orgName });
          if (!matches || matches.length === 0) {
            // suggest/create missing entity
            await createRecord('organizations', { name: orgName, type: 'institution' });
          }
        }

        // Apply changes reason if verified detail was updated
        const isVerified = finalData.verification?.verified;
        if (isVerified) {
          finalData.verification.status = 'pending';
          finalData.verification.verified = false;
        }

        await updateUserProfile(finalData);
        setTimeout(() => {
          location.href = `/profile.html?id=${finalData.userId}`;
        }, 700);
      }
    });
  }

  function getSuggestionsHTML(type, current) {
    const list = {
      student: ["D.Pharm Student", "B.Pharm Student", "Pharm.D Student", "M.Pharm Student", "PhD Scholar", "Other"],
      educator: ["Tutor", "Lecturer", "Assistant Professor", "Associate Professor", "Professor", "Head of Department", "Other"],
      professional: ["Community Pharmacist", "Hospital Pharmacist", "Clinical Pharmacist", "Production Chemist", "Other"]
    }[type] || ["Member", "Other"];

    return list.map(item => `<option value="${item}" ${current === item ? 'selected' : ''}>${item}</option>`).join('');
  }

  function updateField(key, value) {
    const inst = window.profileWizardInstance;
    if (inst) {
      inst.state.data[key] = value;
      inst.saveDraft();
    }
  }

  function updateAvatar(url) {
    const inst = window.profileWizardInstance;
    if (inst) {
      if (!inst.state.data.avatar) inst.state.data.avatar = {};
      inst.state.data.avatar.url = url;
      inst.saveDraft();
    }
  }

  function changeType(type) {
    const inst = window.profileWizardInstance;
    if (inst) {
      inst.state.data.types = [type];
      if (!inst.state.data.positions) inst.state.data.positions = [{}];
      inst.state.data.positions[0].title = type === 'student' ? 'B.Pharm Student' : 'Tutor';
      inst.saveDraft();
      // Force redraw of current step
      PharmoraWizardCore.createWizard(window.profileWizardInstance.config || {
        id: 'profile',
        containerId: 'profile-wizard-root',
        steps: inst.config?.steps || [],
        getInitialState: () => inst.state.data,
        onComplete: inst.config?.onComplete
      });
    }
  }

  function changePosition(val) {
    const inst = window.profileWizardInstance;
    if (inst) {
      if (!inst.state.data.positions) inst.state.data.positions = [{}];
      inst.state.data.positions[0].title = val;
      const customBox = document.getElementById('wz-customPositionBox');
      if (customBox) {
        customBox.style.display = val === 'Other' ? 'block' : 'none';
      }
      inst.saveDraft();
    }
  }

  function updateCustomPosition(val) {
    const inst = window.profileWizardInstance;
    if (inst) {
      inst.state.data.customPosition = val;
      if (inst.state.data.positions?.[0]) {
        inst.state.data.positions[0].title = val;
      }
      inst.saveDraft();
    }
  }

  function updateEducation(key, val) {
    const inst = window.profileWizardInstance;
    if (inst) {
      if (!inst.state.data.education) inst.state.data.education = [{}];
      inst.state.data.education[0][key] = val;
      inst.saveDraft();
    }
  }

  function updatePositionField(key, val) {
    const inst = window.profileWizardInstance;
    if (inst) {
      if (!inst.state.data.positions) inst.state.data.positions = [{}];
      inst.state.data.positions[0][key] = val;
      inst.saveDraft();
    }
  }

  function updateSpecs(val) {
    const inst = window.profileWizardInstance;
    if (inst) {
      inst.state.data.specializations = val.split(',').map(x => x.trim()).filter(Boolean);
      inst.saveDraft();
    }
  }

  function updateVerificationProof(val) {
    const inst = window.profileWizardInstance;
    if (inst) {
      inst.state.data.verificationProof = val;
      inst.saveDraft();
    }
  }

  function updateContact(key, val) {
    const inst = window.profileWizardInstance;
    if (inst) {
      if (!inst.state.data.contact) inst.state.data.contact = {};
      if (!inst.state.data.contact[key]) inst.state.data.contact[key] = {};
      inst.state.data.contact[key].value = val;
      inst.saveDraft();
    }
  }

  function updateContactVisibility(key, checked) {
    const inst = window.profileWizardInstance;
    if (inst) {
      if (!inst.state.data.contact) inst.state.data.contact = {};
      if (!inst.state.data.contact[key]) inst.state.data.contact[key] = {};
      inst.state.data.contact[key].visible = checked;
      inst.saveDraft();
    }
  }

  return {
    initWizard,
    updateField,
    updateAvatar,
    changeType,
    changePosition,
    updateCustomPosition,
    updateEducation,
    updatePositionField,
    updateSpecs,
    updateVerificationProof,
    updateContact,
    updateContactVisibility
  };
})();

window.PharmoraProfileWizard = PharmoraProfileWizard;

;
