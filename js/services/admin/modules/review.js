/**
 * Admin Module: Review Queue
 */
(function () {
  'use strict';

  const utils = window.PharmoraAdminUtils;

  // Custom Modal Prompt Helper
  function modalPrompt(title, label, defaultValue, callback) {
    if (typeof PharmoraUI !== 'undefined' && typeof PharmoraUI.modal === 'function') {
      PharmoraUI.modal({
        title,
        body: `
          <div style="display:flex;flex-direction:column;gap:6px;">
            <label style="font-size:var(--font-sm);font-weight:700;color:var(--text);">${label}</label>
            <input type="text" id="custom-prompt-input" value="${defaultValue}" style="padding:10px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--background);color:var(--text);width:100%;box-sizing:border-box;">
          </div>
        `,
        actions: `
          <button onclick="PharmoraUI.closeModal()" style="padding:8px 14px;border:1px solid var(--border);background:none;color:var(--text);border-radius:var(--radius-sm);cursor:pointer;font-weight:600;font-size:var(--font-sm);">Cancel</button>
          <button id="custom-prompt-submit" style="padding:8px 14px;border:none;background:var(--primary);color:#000;border-radius:var(--radius-sm);cursor:pointer;font-weight:700;font-size:var(--font-sm);">Submit</button>
        `
      });
      const sub = document.getElementById('custom-prompt-submit');
      if (sub) {
        sub.onclick = () => {
          const val = document.getElementById('custom-prompt-input')?.value || '';
          PharmoraUI.closeModal();
          callback(val);
        };
      }
    } else {
      const val = prompt(label, defaultValue);
      callback(val);
    }
  }

  // Custom Modal Confirm Helper
  function modalConfirm(title, message, callback) {
    if (typeof PharmoraUI !== 'undefined' && typeof PharmoraUI.modal === 'function') {
      PharmoraUI.modal({
        title,
        body: `<p style="margin:0;font-size:var(--font-sm);color:var(--text-soft);">${message}</p>`,
        actions: `
          <button onclick="PharmoraUI.closeModal()" style="padding:8px 14px;border:1px solid var(--border);background:none;color:var(--text);border-radius:var(--radius-sm);cursor:pointer;font-weight:600;font-size:var(--font-sm);">Cancel</button>
          <button id="custom-confirm-submit" style="padding:8px 14px;border:none;background:#ef4444;color:#fff;border-radius:var(--radius-sm);cursor:pointer;font-weight:700;font-size:var(--font-sm);">Confirm</button>
        `
      });
      const sub = document.getElementById('custom-confirm-submit');
      if (sub) {
        sub.onclick = () => {
          PharmoraUI.closeModal();
          callback(true);
        };
      }
    } else {
      if (confirm(message)) callback(true);
    }
  }

  let activeTab = 'curriculum';

  const ModuleReviewQueue = {
    id: 'review-queue', title: 'Review Queue', icon: '📋', order: 2,
    permissions: ['content.review'],

    async badgeProvider() {
      const pending = await utils.getEntities({ status: 'pending_review' }).catch(() => []);
      return pending.length;
    },

    async render(container, ws) {
      const pending = await utils.getEntities({ status: 'pending_review' });

      function getTabEntities(allPending, tab) {
        if (tab === 'curriculum') {
          return allPending.filter(e => ['University', 'Program', 'Course', 'Semester', 'Subject', 'Unit'].includes(e.type));
        } else if (tab === 'resources') {
          return allPending.filter(e => ['Resource', 'Practical', 'QuestionBank', 'MCQ'].includes(e.type));
        } else {
          return allPending.filter(e => ['Regulation', 'Exam', 'Job', 'Drug', 'Event', 'Certification', 'Research'].includes(e.type));
        }
      }

      function renderTabHeader() {
        return `
          <div style="display:flex;gap:8px;margin-bottom:20px;border-bottom:1px solid var(--border);padding-bottom:10px;">
            <button class="tab-btn" data-tab="curriculum" style="padding:8px 16px;border:none;border-radius:8px;background:${activeTab === 'curriculum' ? 'var(--primary)' : 'none'};color:${activeTab === 'curriculum' ? '#000' : 'var(--text)'};font-weight:700;cursor:pointer;">Curriculum</button>
            <button class="tab-btn" data-tab="resources" style="padding:8px 16px;border:none;border-radius:8px;background:${activeTab === 'resources' ? 'var(--primary)' : 'none'};color:${activeTab === 'resources' ? '#000' : 'var(--text)'};font-weight:700;cursor:pointer;">Resources & QA</button>
            <button class="tab-btn" data-tab="professional" style="padding:8px 16px;border:none;border-radius:8px;background:${activeTab === 'professional' ? 'var(--primary)' : 'none'};color:${activeTab === 'professional' ? '#000' : 'var(--text)'};font-weight:700;cursor:pointer;">Professional & Events</button>
          </div>
        `;
      }

      function renderQueue() {
        const filtered = getTabEntities(pending, activeTab);
        container.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h2 style="margin:0;font-size:1.2rem;font-weight:800;">📋 Review Queue</h2>
            <span id="rq-count" style="font-size:0.82rem;color:var(--text-soft);font-weight:600;">${filtered.length} pending</span>
          </div>
          ${renderTabHeader()}
          <div id="rq-items" style="display:flex;flex-direction:column;gap:10px;"></div>`;

        const itemsEl = document.getElementById('rq-items');
        if (!itemsEl) return;

        if (filtered.length === 0) {
          itemsEl.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-soft);">✅ All clear — nothing pending in this section.</div>`;
          return;
        }

        filtered.forEach(ent => {
          const title = ent.content?.title || ent.content?.name || ent.content?.genericName || ent.publicId || '—';
          const row = document.createElement('div');
          row.style.cssText = 'background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px 18px;display:flex;align-items:center;gap:12px;';
          row.innerHTML = `
            <span style="font-size:0.72rem;background:rgba(34,211,238,.12);color:var(--primary);padding:2px 7px;border-radius:5px;font-weight:700;">${ent.type}</span>
            <span style="flex:1;font-weight:600;font-size:0.88rem;color:var(--text);">${title}</span>
            <span style="font-size:0.72rem;color:var(--text-soft);">${ent.owner || ''}</span>
            <button data-action="approve" data-uuid="${ent.uuid}" style="padding:5px 12px;border:none;background:var(--primary);color:#000;border-radius:6px;font-weight:700;cursor:pointer;font-size:0.78rem;">✓ Approve</button>
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
                if (typeof window.PharmoraEntityReview !== 'undefined') {
                  if (action === 'approve') {
                    await window.PharmoraEntityReview.approve(uuid, 'admin');
                    ws.refreshCurrentModule();
                  }
                  if (action === 'reject') {
                    modalPrompt('Reject Entity', 'Enter rejection reason:', '—', async (reason) => {
                      if (reason) {
                        await window.PharmoraEntityReview.reject(uuid, reason, 'admin');
                        ws.refreshCurrentModule();
                      }
                    });
                  }
                  if (action === 'changes') {
                    modalPrompt('Request Changes', 'Enter change request notes:', '—', async (notes) => {
                      if (notes) {
                        await window.PharmoraEntityReview.requestChanges(uuid, notes, 'admin');
                        ws.refreshCurrentModule();
                      }
                    });
                  }
                }
                if (action === 'delete') {
                  modalConfirm('Delete Entity', 'Are you sure you want to permanently delete this entity?', async (confirmed) => {
                    if (confirmed && typeof window.PharmoraEntityManager !== 'undefined') {
                      await window.PharmoraEntityManager.bulkDelete([uuid], 'admin');
                      ws.refreshCurrentModule();
                    }
                  });
                }
              } catch(err) {
                console.error('Review Action Error:', err);
                alert(`Action failed: ${err.message}`);
              }
            });
          });
          row.addEventListener('click', () => ws.openViewer({ uuid: ent.uuid }));
          itemsEl.appendChild(row);
        });

        // Attach tab toggle handlers
        container.querySelectorAll('.tab-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            activeTab = btn.dataset.tab;
            renderQueue();
          });
        });
      }

      renderQueue();
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
    const pending = await utils.getEntities({ status: 'pending_review' }).catch(() => []);
    for (const ent of pending) {
      try {
        if (typeof PharmoraEntityReview !== 'undefined') {
          if (action === 'approve') await PharmoraEntityReview.approve(ent.uuid, 'admin');
        }
      } catch(e) {}
    }
    if (PharmoraWorkbench._wb) PharmoraWorkbench._wb.refreshCurrentModule();
  };

  window.PharmoraAdminModules = window.PharmoraAdminModules || [];
  window.PharmoraAdminModules.push(ModuleReviewQueue);
})();
