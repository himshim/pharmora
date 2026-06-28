/**
 * Pharmora Workbench - Relations Plugin
 * Handles linking and unlinking entities, graph relations UI and dialogs.
 */
(function () {
  'use strict';

  if (!window.PharmoraWorkbenchRelations) {
    window.PharmoraWorkbenchRelations = {};
  }

  // Non-destructive unlink confirm with Undo support
  let pendingUnlink = null;

  async function _unlinkConfirm(uuid, relType, targetUuid, workbench) {
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
    workbench.openViewer({ uuid });

    // Trigger standard non-blocking Undo toast message
    if (typeof showToast === 'function') {
      showToast(`Relation removed. <a href="javascript:void(0)" onclick="PharmoraWorkbench._wb._restoreRelation()" style="color:var(--primary);font-weight:700;margin-left:8px;text-decoration:underline;">Undo</a>`, 'info');
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

  async function _restoreRelation(workbench) {
    if (!pendingUnlink) return;
    clearTimeout(pendingUnlink.timer);
    pendingUnlink = null;
    if (typeof showToast === 'function') showToast('Restored relationship.', 'success');
    // Refresh UI view
    const formEl = document.getElementById('wb-drawer-fields-form');
    const activeUuid = formEl ? formEl.parentElement.parentElement.querySelector('h4')?.nextElementSibling?.querySelector('input')?.dataset?.uuid || '' : '';
    workbench.openViewer({ uuid: activeUuid });
  }

  async function _linkExistingSubmit(uuid, workbench) {
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
        workbench.openViewer({ uuid });
      }
    } catch(e) {
      alert('Error: ' + e.message);
    }
  }

  async function _triggerCreateAndLink(uuid, action, workbench) {
    // Prompt for entity type first
    let registeredTypes = [];
    if (typeof PharmoraEntityRegistry !== 'undefined') {
      registeredTypes = PharmoraEntityRegistry.getRegisteredTypes();
    }
    if (registeredTypes.length === 0) registeredTypes = ['Subject', 'Drug'];

    const typeHtml = registeredTypes.map(t => `
      <button onclick="PharmoraWorkbench._wb._startCreationLink('${uuid}', '${action}', '${t}')"
        style="padding:10px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--surface);color:var(--text);font-weight:700;text-align:left;cursor:pointer;font-size:var(--font-sm);">
        📋 ${t} Monograph
      </button>
    `).join('');

    const drawerEl = document.getElementById(workbench._config.drawerContainerId);
    if (drawerEl) {
      drawerEl.innerHTML = `
        <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:1.1rem;font-weight:800;color:var(--text);">Create Target Entity</div>
          <button onclick="PharmoraWorkbench._wb.openViewer({ uuid: '${uuid}' })" style="border:none;background:var(--surface-light);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1rem;color:var(--text);">✕</button>
        </div>
        <div style="padding:24px;display:flex;flex-direction:column;gap:14px;">
          <p style="margin:0;font-size:var(--font-sm);color:var(--text-soft);">Select target entity type to create:</p>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${typeHtml}
          </div>
        </div>
      `;
    }
  }

  async function _startCreationLink(uuid, action, type, workbench) {
    workbench._createWizardState = { step: 2, type, formData: {} };
    const drawerEl = document.getElementById(workbench._config.drawerContainerId);
    if (!drawerEl) return;

    // Temporarily hijack _submitCreate to perform link after creation
    const originalSubmit = workbench._submitCreate;
    workbench._submitCreate = async () => {
      const content = workbench._gatherWzFormData();
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
        workbench.refreshCurrentModule();
        workbench.openViewer({ uuid });
      } catch(e) {
        alert('Creation failed: ' + e.message);
      }
    };
    workbench._renderCreationWizard(drawerEl);
  }

  async function _openLinkEditor(uuid, action, workbench) {
    const drawerEl = document.getElementById(workbench._config.drawerContainerId);
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
          <p style="margin:0;font-size:var(--font-sm);color:var(--text-soft);">Select a relationship to remove:</p>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${entity.relations.map(rel => `
              <button onclick="PharmoraWorkbench._wb._unlinkConfirm('${uuid}', '${rel.relationType}', '${rel.targetUuid}')"
                style="padding:10px;border-radius:var(--radius-sm);border:1px solid var(--danger);background:none;color:var(--danger);cursor:pointer;text-align:left;font-weight:600;font-size:var(--font-sm);">
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
          <h4 style="margin:0 0 10px 0;font-size:var(--font-sm);color:var(--text-soft);text-transform:uppercase;font-weight:700;">Link Existing Entity</h4>
          
          <div style="display:flex;flex-direction:column;gap:10px;background:var(--surface);padding:14px;border-radius:var(--radius-sm);border:1px solid var(--border);">
            <div style="display:flex;flex-direction:column;gap:4px;">
              <label style="font-size:var(--font-xs);font-weight:700;">Relation Type</label>
              <select id="link-rel-type" style="padding:8px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--background);color:var(--text);">
                ${relationTypes.map(r => `<option value="${r}" ${r === action ? 'selected' : ''}>${r}</option>`).join('')}
              </select>
            </div>

            <div style="display:flex;flex-direction:column;gap:4px;">
              <label style="font-size:var(--font-xs);font-weight:700;">Select Target Entity</label>
              <select id="link-target-uuid" style="padding:8px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--background);color:var(--text);">
                <option value="">Choose entity...</option>
                ${list.filter(e => e.uuid !== uuid).map(e => `
                  <option value="${e.uuid}">${e.type}: ${e.content?.title || e.content?.name || e.publicId} (${e.uuid.substring(0,8)})</option>
                `).join('')}
              </select>
            </div>

            <button onclick="PharmoraWorkbench._wb._linkExistingSubmit('${uuid}')"
              style="padding:10px;border:none;background:var(--primary);color:#000;border-radius:var(--radius-sm);font-weight:700;cursor:pointer;font-size:var(--font-sm);margin-top:6px;">
              🔗 Link Entities
            </button>
          </div>
        </div>

        <!-- Section B: Create & Link -->
        <div style="border-top:1px solid var(--border);padding-top:16px;">
          <h4 style="margin:0 0 10px 0;font-size:var(--font-sm);color:var(--text-soft);text-transform:uppercase;font-weight:700;">Create & Link New Entity</h4>
          <p style="margin:0 0 10px 0;font-size:var(--font-xs);color:var(--text-soft);">Instantly spawn a child or parent node and bind it to this entity.</p>
          
          <button onclick="PharmoraWorkbench._wb._triggerCreateAndLink('${uuid}', '${action}')"
            style="width:100%;padding:10px;border-radius:var(--radius-sm);border:1px solid var(--primary);background:none;color:var(--primary);font-weight:700;cursor:pointer;font-size:var(--font-sm);">
            ➕ Create New & Link Bidirectionally
          </button>
        </div>

      </div>
    `;
  }

  function init(workbench, config) {
    workbench._unlinkConfirm = (uuid, relType, targetUuid) => _unlinkConfirm(uuid, relType, targetUuid, workbench);
    workbench._restoreRelation = () => _restoreRelation(workbench);
    workbench._linkExistingSubmit = (uuid) => _linkExistingSubmit(uuid, workbench);
    workbench._triggerCreateAndLink = (uuid, action) => _triggerCreateAndLink(uuid, action, workbench);
    workbench._startCreationLink = (uuid, action, type) => _startCreationLink(uuid, action, type, workbench);
    workbench._openLinkEditor = (uuid, action) => _openLinkEditor(uuid, action, workbench);
  }

  window.PharmoraWorkbenchRelations.init = init;
})();
