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