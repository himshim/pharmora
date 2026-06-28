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
