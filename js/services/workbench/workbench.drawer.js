/**
 * Pharmora Workbench - Drawer Plugin
 * Handles entity/user views, creation workflows, and moderation queues in sliding drawers.
 */
(function () {
  'use strict';

  if (!window.PharmoraWorkbenchDrawer) {
    window.PharmoraWorkbenchDrawer = {};
  }

  // ── Helper buttons styling ──
  function btnStyle(bg) {
    return `padding:6px 14px;border-radius:var(--radius-sm);border:none;background:${bg};color:#fff;font-weight:700;cursor:pointer;font-size:var(--font-sm);`;
  }

  function renderDrawerHeader(title, subtitle = '', onCloseClick = 'PharmoraWorkbench._wb.closeDrawer()') {
    return `
      <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;
                  position:sticky;top:0;background:var(--surface);z-index:1;">
        <div>
          <div style="font-size:1.15rem;font-weight:800;color:var(--text);">${title}</div>
          ${subtitle ? `<span style="font-size:var(--font-xs);text-transform:uppercase;background:rgba(34,211,238,.12);color:var(--primary);
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

  // ── Entity Creation Wizard Rendering ─────────────────
  async function _renderCreationWizard(drawerEl, workbench) {
    const state = workbench._createWizardState;
    if (state.step === 1 && !state.type) {
      let registeredTypes = [];
      if (typeof PharmoraEntityRegistry !== 'undefined') {
        registeredTypes = PharmoraEntityRegistry.getRegisteredTypes();
      }
      if (registeredTypes.length === 0) registeredTypes = ['Subject', 'Drug'];

      const bodyHtml = `
        <p style="margin:0;font-size:var(--font-sm);color:var(--text-soft);">Select the type of entity you want to create:</p>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${registeredTypes.map(t => `
            <button onclick="PharmoraWorkbench._wb._setCreateType('${t}')"
              style="padding:12px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--surface);color:var(--text);font-weight:700;text-align:left;cursor:pointer;">
              📋 ${t} Monograph
            </button>
          `).join('')}
        </div>
      `;
      drawerEl.innerHTML = renderDrawer('Create New Entity', '', bodyHtml, `<button onclick="PharmoraWorkbench._wb.closeDrawer()" style="padding:8px 14px;border:1px solid var(--border);background:none;color:var(--text);border-radius:var(--radius-sm);cursor:pointer;font-weight:600;font-size:var(--font-sm);">Cancel</button>`);
    } else if (state.step === 1.5) {
      const type = state.type;
      let allList = [];
      if (typeof PharmoraEntityAPI !== 'undefined') {
        allList = await PharmoraEntityAPI.listEntities().catch(() => []);
      }

      let selectHtml = '';
      if (type === 'Program') {
        const unis = allList.filter(e => e.type === 'University');
        selectHtml = `
          <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
            <label style="font-size:var(--font-xs);font-weight:700;">Select University (Parent)</label>
            <select id="wz-parent-uni" style="padding:8px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--background);color:var(--text);">
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
            <label style="font-size:var(--font-xs);font-weight:700;">Select University</label>
            <select id="wz-parent-uni" style="padding:8px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--background);color:var(--text);">
              <option value="">Select...</option>
              ${unis.map(u => `<option value="${u.uuid}">${u.content?.name || u.publicId}</option>`).join('')}
            </select>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
            <label style="font-size:var(--font-xs);font-weight:700;">Select Program (Parent)</label>
            <select id="wz-parent-prog" style="padding:8px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--background);color:var(--text);">
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
            <label style="font-size:var(--font-xs);font-weight:700;">Select Program</label>
            <select id="wz-parent-prog" style="padding:8px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--background);color:var(--text);">
              <option value="">Select...</option>
              ${progs.map(p => `<option value="${p.uuid}">${p.content?.name || p.publicId}</option>`).join('')}
            </select>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
            <label style="font-size:var(--font-xs);font-weight:700;">Select Course (Parent)</label>
            <select id="wz-parent-course" style="padding:8px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--background);color:var(--text);">
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
            <label style="font-size:var(--font-xs);font-weight:700;">Select Course</label>
            <select id="wz-parent-course" style="padding:8px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--background);color:var(--text);">
              <option value="">Select...</option>
              ${courses.map(c => `<option value="${c.uuid}">${c.content?.name || c.publicId}</option>`).join('')}
            </select>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
            <label style="font-size:var(--font-xs);font-weight:700;">Select Semester (Parent)</label>
            <select id="wz-parent-semester" style="padding:8px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--background);color:var(--text);">
              <option value="">Select...</option>
              ${sems.map(s => `<option value="${s.uuid}">Semester ${s.content?.number || s.publicId}</option>`).join('')}
            </select>
          </div>
        `;
      }

      const bodyHtml = `
        <p style="margin:0 0 14px 0;font-size:var(--font-sm);color:var(--text-soft);">Choose the parent hierarchy path for this new ${type}:</p>
        ${selectHtml || '<p style="color:var(--text-soft);">No parent selection needed for University.</p>'}
      `;

      const footerHtml = `
        <button onclick="PharmoraWorkbench._wb.closeDrawer()" style="padding:8px 14px;border:1px solid var(--border);background:none;color:var(--text);border-radius:var(--radius-sm);cursor:pointer;font-weight:600;font-size:var(--font-sm);">Cancel</button>
        <button onclick="PharmoraWorkbench._wb._confirmHierarchyPath()" style="flex:1;padding:8px 14px;border:none;background:var(--primary);color:#000;border-radius:var(--radius-sm);cursor:pointer;font-weight:700;font-size:var(--font-sm);">Continue to Form</button>
      `;

      drawerEl.innerHTML = renderDrawer(`Link Hierarchy: ${type}`, '', bodyHtml, footerHtml);
    } else {
      const type = state.type;
      let schema = null;
      if (typeof PharmoraEntityRegistry !== 'undefined') {
        schema = PharmoraEntityRegistry.getSchema(type);
      }

      const bodyHtml = window.PharmoraWorkbenchForm.renderForm(schema || {}, state.formData);
      const footerHtml = `
        <button onclick="PharmoraWorkbench._wb.closeDrawer()" style="padding:8px 14px;border:1px solid var(--border);background:none;color:var(--text);border-radius:var(--radius-sm);cursor:pointer;font-weight:600;font-size:var(--font-sm);">Cancel</button>
        <button onclick="PharmoraWorkbench._wb._saveCreateDraft()" style="padding:8px 14px;border:1px solid var(--border);background:none;color:var(--text);border-radius:var(--radius-sm);cursor:pointer;font-weight:600;font-size:var(--font-sm);">Save Draft</button>
        <button onclick="PharmoraWorkbench._wb._submitCreate()" style="flex:1;padding:8px 14px;border:none;background:var(--primary);color:#000;border-radius:var(--radius-sm);cursor:pointer;font-weight:700;font-size:var(--font-sm);">Create Entity</button>
      `;
      drawerEl.innerHTML = renderDrawer(`New ${type}`, 'Draft', bodyHtml, footerHtml);
    }
  }

  function _setCreateType(type, workbench) {
    workbench._createWizardState.type = type;
    if (['Program', 'Course', 'Semester', 'Subject'].includes(type)) {
      workbench._createWizardState.step = 1.5;
    } else {
      workbench._createWizardState.step = 2;
    }
    workbench._createWizardState.formData = {};
    workbench._createWizardState.selectedParentUuid = null;
    const drawerEl = document.getElementById(workbench._config.drawerContainerId);
    if (drawerEl) _renderCreationWizard(drawerEl, workbench);
  }

  function _confirmHierarchyPath(workbench) {
    const state = workbench._createWizardState;
    const type = state.type;
    let parentUuid = null;
    if (type === 'Program') parentUuid = document.getElementById('wz-parent-uni')?.value;
    else if (type === 'Course') parentUuid = document.getElementById('wz-parent-prog')?.value;
    else if (type === 'Semester') parentUuid = document.getElementById('wz-parent-course')?.value;
    else if (type === 'Subject') parentUuid = document.getElementById('wz-parent-semester')?.value;

    if (['Program', 'Course', 'Semester', 'Subject'].includes(type) && !parentUuid) {
      alert('Please select a parent entity to build the hierarchy path.');
      return;
    }

    state.selectedParentUuid = parentUuid;
    state.step = 2;
    const drawerEl = document.getElementById(workbench._config.drawerContainerId);
    if (drawerEl) _renderCreationWizard(drawerEl, workbench);
  }

  async function _submitCreate(workbench) {
    const content = workbench._gatherWzFormData();
    const type = workbench._createWizardState.type;
    const actor = (typeof currentUser === 'function' ? currentUser()?.id : 'admin') || 'admin';

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

      if (workbench._createWizardState.selectedParentUuid && typeof PharmoraRelations !== 'undefined') {
        const rel = (type === 'Subject') ? 'contains_subject' : 'hasMany';
        await PharmoraRelations.linkEntities(workbench._createWizardState.selectedParentUuid, rel, created.uuid, {}, actor);
      }

      if (typeof PharmoraSearchIndex !== 'undefined') {
        await PharmoraSearchIndex.buildIndex();
      }

      if (typeof showToast === 'function') showToast('Entity created successfully!', 'success');
      
      workbench.refreshCurrentModule();
      workbench.openViewer(created);
    } catch(e) {
      if (typeof showToast === 'function') showToast(`Creation failed: ${e.message}`, 'error');
    }
  }

  async function _renderEntityDrawer(drawerEl, item, workbench) {
    try {
      const entity = item.uuid
        ? (typeof PharmoraEntityAPI !== 'undefined' ? await PharmoraEntityAPI.getEntity(item.uuid) : item)
        : item;

      if (!entity) { drawerEl.innerHTML = `<div style="padding:24px;color:var(--danger);">Entity not found.</div>`; return; }

      const title = entity.content?.title || entity.content?.name || entity.content?.genericName || entity.publicId || '—';

      let cardHtml = '';
      if (typeof PharmoraUniversalRenderer !== 'undefined') {
        cardHtml = PharmoraUniversalRenderer.render(entity, 'card');
      } else {
        cardHtml = `<div class="card" style="padding:14px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface);">
          <strong>${title}</strong><br><span style="color:var(--text-soft);font-size:var(--font-xs);">${entity.type}</span>
        </div>`;
      }

      const user = typeof currentUser === 'function' ? currentUser() : null;
      const isDev = user && (user.role === 'admin' || user.role === 'owner');

      let relationsHtml = '';
      if (typeof PharmoraEntityRelationsComponent !== 'undefined') {
        relationsHtml = await PharmoraEntityRelationsComponent.render(entity).catch(() => '');
      }

      let schema = null;
      if (typeof PharmoraEntityRegistry !== 'undefined') {
        schema = PharmoraEntityRegistry.getSchema(entity.type);
      }
      const fieldsHtml = window.PharmoraWorkbenchForm.renderForm(schema || {}, entity.content || {});

      const stages = ['draft', 'pending_review', 'approved', 'published', 'archived'];
      const workflowStepperHtml = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding:8px 0;border-bottom:1px solid var(--border);">
          ${stages.map((st, i) => {
            const isActive = entity.status === st;
            const isPassed = stages.indexOf(entity.status) >= i;
            const color = isActive ? 'var(--primary)' : isPassed ? 'var(--success)' : 'var(--text-soft)';
            return `<span style="font-size:var(--font-xs);font-weight:700;color:${color};text-transform:capitalize;">${st.replace('_',' ')}</span>`;
          }).join('<span style="color:var(--border)">&rarr;</span>')}
        </div>
      `;

      drawerEl.innerHTML = `
        <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;
                    position:sticky;top:0;background:var(--surface);z-index:1;">
          <div>
            <div style="font-size:1.15rem;font-weight:800;color:var(--text);">${title}</div>
            <span style="font-size:var(--font-xs);text-transform:uppercase;background:rgba(34,211,238,.12);color:var(--primary);
                         padding:2px 8px;border-radius:6px;font-weight:700;">${entity.type || ''}</span>
            <span style="font-size:var(--font-xs);margin-left:6px;background:var(--surface-light);color:var(--text-soft);
                         padding:2px 8px;border-radius:6px;font-weight:600;">${entity.status || ''}</span>
          </div>
          <button onclick="PharmoraWorkbench._wb.closeDrawer()"
            style="border:none;background:var(--surface-light);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1rem;color:var(--text);">✕</button>
        </div>

        <div style="display:flex;background:var(--surface-light);border-bottom:1px solid var(--border);padding:0 12px;gap:8px;">
          <button onclick="document.querySelectorAll('.wb-tab-section').forEach(s => s.style.display='none');document.getElementById('wb-sec-overview').style.display='block';" style="padding:10px 14px;border:none;background:none;color:var(--text);font-size:var(--font-sm);font-weight:700;cursor:pointer;">Overview</button>
          <button onclick="document.querySelectorAll('.wb-tab-section').forEach(s => s.style.display='none');document.getElementById('wb-sec-properties').style.display='block';" style="padding:10px 14px;border:none;background:none;color:var(--text);font-size:var(--font-sm);font-weight:700;cursor:pointer;">Properties</button>
          <button onclick="document.querySelectorAll('.wb-tab-section').forEach(s => s.style.display='none');document.getElementById('wb-sec-relations').style.display='block';" style="padding:10px 14px;border:none;background:none;color:var(--text);font-size:var(--font-sm);font-weight:700;cursor:pointer;">Relations</button>
          <button onclick="document.querySelectorAll('.wb-tab-section').forEach(s => s.style.display='none');document.getElementById('wb-sec-history').style.display='block';" style="padding:10px 14px;border:none;background:none;color:var(--text);font-size:var(--font-sm);font-weight:700;cursor:pointer;">History</button>
        </div>
        
        <div style="padding:20px 24px;display:flex;flex-direction:column;gap:18px;overflow-y:auto;flex:1;">
          
          <div id="wb-sec-overview" class="wb-tab-section" style="display:block;">
            <div style="display:flex;gap:8px;flex-wrap:wrap;background:var(--surface);padding:10px;border-radius:var(--radius-sm);border:1px solid var(--border);margin-bottom:14px;">
              <button onclick="PharmoraWorkbench._wb._drawerAction('approve','${entity.uuid}')" style="${btnStyle('var(--primary)')};color:#000;">✓ Approve</button>
              <button onclick="PharmoraWorkbench._wb._drawerAction('publish','${entity.uuid}')" style="${btnStyle('var(--success)')}">📢 Publish</button>
              <button onclick="PharmoraWorkbench._wb._drawerAction('requestChanges','${entity.uuid}')" style="${btnStyle('var(--warning)')}">🔁 Changes</button>
              <button onclick="PharmoraWorkbench._wb._drawerAction('archive','${entity.uuid}')" style="${btnStyle('var(--text-muted)')}">🗄 Archive</button>
            </div>
            <h4 style="margin:0 0 8px 0;font-size:var(--font-sm);color:var(--text-soft);text-transform:uppercase;font-weight:700;">Entity Preview</h4>
            ${cardHtml}
          </div>

          <div id="wb-sec-properties" class="wb-tab-section" style="display:none;">
            <h4 style="margin:0 0 8px 0;font-size:var(--font-sm);color:var(--text-soft);text-transform:uppercase;font-weight:700;">Schema Fields</h4>
            <form id="wb-drawer-fields-form" onchange="PharmoraWorkbench._wb._saveInlineChanges('${entity.uuid}')">
              ${fieldsHtml}
            </form>
          </div>

          <div id="wb-sec-relations" class="wb-tab-section" style="display:none;">
            <h4 style="margin:0 0 10px 0;font-size:var(--font-sm);color:var(--text-soft);text-transform:uppercase;font-weight:700;">🔗 Link Relations</h4>
            <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">
              <button onclick="PharmoraWorkbench._wb._openLinkEditor('${entity.uuid}', 'belongsTo')" style="padding:5px 10px;font-size:var(--font-xs);border:1px solid var(--border);background:var(--surface);color:var(--text);border-radius:6px;cursor:pointer;font-weight:600;">+ Add Parent</button>
              <button onclick="PharmoraWorkbench._wb._openLinkEditor('${entity.uuid}', 'hasMany')" style="padding:5px 10px;font-size:var(--font-xs);border:1px solid var(--border);background:var(--surface);color:var(--text);border-radius:6px;cursor:pointer;font-weight:600;">+ Add Child</button>
              <button onclick="PharmoraWorkbench._wb._openLinkEditor('${entity.uuid}', 'unlink')" style="padding:5px 10px;font-size:var(--font-xs);border:1px solid var(--danger);background:none;color:var(--danger);border-radius:6px;cursor:pointer;font-weight:600;">Remove Link</button>
            </div>
            <div id="wb-drawer-relations">${relationsHtml}</div>
          </div>

          <div id="wb-sec-history" class="wb-tab-section" style="display:none;">
            <h4 style="margin:0 0 8px 0;font-size:var(--font-sm);color:var(--text-soft);text-transform:uppercase;font-weight:700;">📋 Audit Log & History</h4>
            ${workflowStepperHtml}
            <div id="wb-drawer-workflow"></div>
            <div id="wb-drawer-timeline" style="margin-top:10px;"></div>
          </div>
          
          ${isDev ? `
            <div style="border-top:1px solid var(--border);padding-top:16px;">
              <details>
                <summary style="font-size:var(--font-xs);font-weight:700;color:var(--text-soft);cursor:pointer;user-select:none;">🛠 Developer JSON Payload</summary>
                <pre style="margin-top:10px;font-size:var(--font-xs);color:var(--text-soft);background:var(--background);padding:10px;border-radius:var(--radius-sm);overflow-x:auto;">${JSON.stringify(entity, null, 2)}</pre>
              </details>
            </div>
          ` : ''}
        </div>
        <div style="padding:16px 24px;border-top:1px solid var(--border);background:var(--surface);display:flex;justify-content:flex-end;">
          <button onclick="PharmoraWorkbench._wb.closeDrawer()" style="padding:8px 16px;border:1px solid var(--border);background:none;color:var(--text);border-radius:var(--radius-sm);cursor:pointer;font-weight:700;font-size:var(--font-sm);">Close</button>
        </div>
      `;

      if (typeof PharmoraEntityAuditViewer !== 'undefined')
        PharmoraEntityAuditViewer.render(entity, 'wb-drawer-workflow');
      if (typeof PharmoraEntityTimeline !== 'undefined') {
        const tb = document.getElementById('wb-drawer-timeline');
        if (tb) tb.innerHTML = PharmoraEntityTimeline.render(entity);
      }
    } catch(err) {
      drawerEl.innerHTML = `<div style="padding:24px;color:var(--danger);">Failed to load entity: ${err.message}</div>`;
    }
  }

  async function _renderUserDrawer(drawerEl, user, workbench) {
    const name  = user.name || user.displayName || user.email || user.id || 'User';
    const email = user.email || '';
    const role  = user.role || '';
    const code  = user.code || user.userCode || '—';
    drawerEl.innerHTML = `
      <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;
                  position:sticky;top:0;background:var(--surface);z-index:1;">
        <div>
          <div style="font-size:1.15rem;font-weight:800;color:var(--text);">👤 ${name}</div>
          <span style="font-size:var(--font-xs);background:var(--surface-light);color:var(--text-soft);padding:2px 8px;border-radius:6px;font-weight:600;">${role}</span>
        </div>
        <button onclick="PharmoraWorkbench._wb.closeDrawer()"
          style="border:none;background:var(--surface-light);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1rem;color:var(--text);">✕</button>
      </div>
      <div style="padding:20px 24px;display:flex;flex-direction:column;gap:14px;font-size:var(--font-sm);flex:1;overflow-y:auto;">
        <div><strong>Email:</strong> ${email}</div>
        <div><strong>ID:</strong> <code>${user.id || user.uid || '—'}</code></div>
        <div><strong>User Code:</strong> <code>${code}</code></div>
        <div><strong>Status:</strong> ${user.disabled ? '🚫 Disabled' : '✅ Active'}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
          <button onclick="location.href='../profile.html?id=${user.id || user.uid}'" style="${btnStyle('var(--primary)')};color:#000;">👤 View Profile</button>
        </div>
      </div>
      <div style="padding:16px 24px;border-top:1px solid var(--border);background:var(--surface);display:flex;justify-content:flex-end;">
        <button onclick="PharmoraWorkbench._wb.closeDrawer()" style="padding:8px 16px;border:1px solid var(--border);background:none;color:var(--text);border-radius:var(--radius-sm);cursor:pointer;font-weight:700;font-size:var(--font-sm);">Close</button>
      </div>
    `;
  }

  async function _drawerAction(action, uuid, workbench) {
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
      
      const entity = await PharmoraEntityAPI.getEntity(uuid);
      if (entity) {
        const drawerEl = document.getElementById(workbench._config.drawerContainerId);
        if (drawerEl) await _renderEntityDrawer(drawerEl, entity, workbench);
      }
      workbench.refreshCurrentModule();
    } catch(err) {
      if (typeof showToast === 'function') showToast(`Action failed: ${err.message}`, 'error');
    }
  }

  function init(workbench, config) {
    workbench._config = config;
    workbench._createWizardState = { step: 1, type: null, formData: {} };
    
    workbench.openViewer = async (item) => {
      const drawerEl = document.getElementById(config.drawerContainerId);
      if (!drawerEl) return;

      workbench._drawerOpen = true;
      drawerEl.classList.add('open');
      drawerEl.innerHTML = `<div style="padding:24px;color:var(--text-soft);">Loading…</div>`;

      if (item && (item._create || item.uuid === null)) {
        workbench._createWizardState = { step: 1, type: item.type || null, formData: {} };
        _renderCreationWizard(drawerEl, workbench);
        return;
      }

      const kind = item?._kind === 'user' || item?.uid || item?.email ? 'user' : (item?.type && item?.uuid ? 'entity' : (item?.publicId ? 'entity' : 'unknown'));
      const modWithViewer = workbench._registry.find(m => m.viewer && m.viewer.handles && m.viewer.handles(item, kind));

      if (modWithViewer && modWithViewer.viewer.render) {
        try {
          const html = await modWithViewer.viewer.render(item, workbench);
          drawerEl.innerHTML = html || '';
        } catch(e) { drawerEl.innerHTML = `<div style="padding:24px;color:var(--danger);">Viewer error: ${e.message}</div>`; }
        return;
      }

      if (kind === 'entity') {
        await _renderEntityDrawer(drawerEl, item, workbench);
      } else if (kind === 'user') {
        await _renderUserDrawer(drawerEl, item, workbench);
      } else {
        drawerEl.innerHTML = `
          <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
            <h3 style="margin:0;color:var(--text);">${item.title || item.name || item.id || 'Item'}</h3>
            <button onclick="PharmoraWorkbench._wb.closeDrawer()" style="border:none;background:var(--surface-light);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1rem;color:var(--text);">✕</button>
          </div>
          <div style="padding:24px;">
            <pre style="font-size:var(--font-xs);color:var(--text-soft);white-space:pre-wrap;">${JSON.stringify(item, null, 2)}</pre>
          </div>`;
      }
    };

    workbench.closeDrawer = () => {
      const drawerEl = document.getElementById(config.drawerContainerId);
      if (drawerEl) drawerEl.classList.remove('open');
      workbench._drawerOpen = false;
    };

    workbench._drawerAction = (action, uuid) => _drawerAction(action, uuid, workbench);
    workbench._setCreateType = (type) => _setCreateType(type, workbench);
    workbench._confirmHierarchyPath = () => _confirmHierarchyPath(workbench);
    workbench._submitCreate = () => _submitCreate(workbench);
    workbench._renderCreationWizard = (drawerEl) => _renderCreationWizard(drawerEl, workbench);
  }

  window.PharmoraWorkbenchDrawer.init = init;
})();
