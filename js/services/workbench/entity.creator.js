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