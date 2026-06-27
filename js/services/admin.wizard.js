/**
 * Pharmora Admin Wizard
 * Reuses the contribute-wizard pattern (Edit -> Review -> Confirm) inside the admin console:
 *   1) Add / Edit content   — wraps the existing schema-driven form with a Review step
 *   2) Review Queue         — steps through pending submissions one at a time
 *
 * Depends on globals already provided by the admin bundle:
 *   activeCollection, activeSchema, collectFormData(), persistEntry(), showForm(),
 *   getAllReviewItems(), approveContent(), rejectContent(), contentIcon(), clean(),
 *   openAdminModal(), closeAdminModal(), currentUser(), updateRecord(), notifyUser(),
 *   showToast(), PharmoraUI, renderAdminActions(), renderAdminStats()
 */

const AdminWizard = (function () {
  'use strict';

  // ─── ADD / EDIT WIZARD ──────────────────────────────────────────────────

  let addState = null;

  function toReview(id) {
    id = id || null;

    const data = collectFormData();

    addState = {
      id,
      collection: activeCollection,
      schema: activeSchema,
      data
    };

    renderAddReview();
  }

  function renderAddReview() {
    const { id, collection, schema, data } = addState;

    const rows = schema
      .map(f => {
        let raw = data[f.name];

        if (Array.isArray(raw)) raw = raw.join(', ');
        if (typeof raw === 'boolean') raw = raw ? 'Yes' : 'No';

        if (raw === undefined || raw === null || raw === '') return '';

        return `<div style="display:flex;gap:12px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:.88rem">
          <span style="color:var(--text-muted);min-width:160px;flex-shrink:0">${clean(f.label)}</span>
          <span style="flex:1;word-break:break-word">${clean(String(raw))}</span>
        </div>`;
      })
      .filter(Boolean)
      .join('');

    const html = `
      <div style="margin-bottom:18px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
          <span style="padding:4px 12px;border-radius:50px;background:rgba(34,211,238,.12);color:var(--primary);font-size:.78rem;font-weight:700">✓ 1. Edit</span>
          <span style="flex:1;height:1px;background:var(--border)"></span>
          <span style="padding:4px 12px;border-radius:50px;background:var(--primary);color:#000;font-size:.78rem;font-weight:700">2. Review</span>
        </div>
        <h2>Review ${id ? 'Changes' : 'New ' + clean(collection)}</h2>
        <p style="color:var(--text-muted);font-size:.88rem">Confirm the details below before saving.</p>
      </div>

      <div style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:18px;padding:18px;margin-bottom:20px">
        ${rows || "<p style='color:var(--text-muted);margin:0'>No fields filled in.</p>"}
      </div>

      <div style="display:flex;gap:10px">
        <button class="btn" onclick="AdminWizard.backToForm()">← Back to Edit</button>
        <button class="btn btn-primary" id="admin-save-btn" style="flex:1" onclick="AdminWizard.confirmSave()">✅ Confirm & Save</button>
      </div>
    `;

    openAdminModal(html);
  }

  function backToForm() {
    if (!addState) return;
    showForm(addState.id, addState.data);
  }

  async function confirmSave() {
    if (!addState) return;
    const { id, data } = addState;
    addState = null;
    await persistEntry(id, data);
  }

  // ─── REVIEW QUEUE WIZARD ────────────────────────────────────────────────

  let reviewState = null;

  async function startReviewWizard() {
    const items = await getAllReviewItems();

    const pending = items.filter(x => {
      return (x.moderation?.status === 'pending') || x.status === 'pending';
    });

    if (pending.length === 0) {
      showToast('Nothing pending — all caught up', 'success');
      return;
    }

    reviewState = { queue: pending, index: 0 };
    renderReviewStep();
  }

  function humanize(key) {
    return String(key)
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, c => c.toUpperCase());
  }

  function renderReviewStep() {
    if (!reviewState) return;

    const { queue, index } = reviewState;
    const item = queue[index];

    if (!item) {
      closeReviewWizard();
      return;
    }

    const total = queue.length;
    const percent = Math.round((index / total) * 100);

    const meta = [
      ['Course', item.data?.course || item.course],
      ['Curriculum', item.data?.curriculum || item.curriculum],
      ['Semester', item.data?.semester || item.semester],
      ['Subject', item.data?.subject || item.subject]
    ].filter(([, v]) => v);

    const skipKeys = new Set([
      'id', '_collection', 'moderation', 'lifecycle', 'analytics', 'author',
      'review', 'stats', 'deleted', 'deletedAt', 'createdAt', 'tags',
      'title', 'question', 'name', 'description', 'content', 'ownership',
      'course', 'curriculum', 'semester', 'subject', 'data'
    ]);

    const extraSource = item.data && typeof item.data === 'object' ? item.data : item;

    const extraRows = Object.keys(extraSource)
      .filter(k => !skipKeys.has(k) && extraSource[k] !== undefined && extraSource[k] !== null && extraSource[k] !== '')
      .map(k => {
        let v = extraSource[k];
        if (Array.isArray(v)) v = v.join(', ');
        return `<div style="display:flex;gap:12px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:.88rem">
          <span style="color:var(--text-muted);min-width:160px;flex-shrink:0">${clean(humanize(k))}</span>
          <span style="flex:1;word-break:break-word">${clean(String(v))}</span>
        </div>`;
      })
      .join('');

    const link = item.content?.link || item.link;
    const file = item.content?.file?.name || (typeof item.content?.file === 'string' ? item.content.file : null);
    const tags = item.tags || [];

    const html = `
      <div style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px">
          <span style="font-weight:700;color:var(--text-muted);font-size:.8rem">REVIEWING ${index + 1} OF ${total}</span>
          <span style="font-size:.8rem;color:var(--text-muted)">${contentIcon(item._collection)} ${clean(item._collection)}</span>
        </div>
        <div class="analytics-bar"><div style="width:${percent}%"></div></div>
      </div>

      <h2 style="margin-bottom:4px">${clean(item.title || item.question || item.name || 'Untitled')}</h2>
      <p style="color:var(--text-muted);font-size:.85rem;margin-bottom:18px">
        👤 ${clean(item.author?.name || 'Unknown')}
        ${item.createdAt ? ' · ' + new Date(item.createdAt).toLocaleDateString() : ''}
      </p>

      <div style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:18px;padding:18px;margin-bottom:18px">
        ${meta.map(([l, v]) => `
          <div style="display:flex;gap:12px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:.88rem">
            <span style="color:var(--text-muted);min-width:160px;flex-shrink:0">${clean(l)}</span>
            <span style="flex:1">${clean(String(v))}</span>
          </div>`).join('')}
        ${extraRows}
        ${item.description ? `<p style="margin-top:12px;font-size:.9rem;line-height:1.6">${clean(item.description)}</p>` : ''}
        ${tags.length ? `<div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:6px">${tags.map(t => `<span style="padding:3px 10px;background:rgba(34,211,238,.1);color:var(--primary);border-radius:50px;font-size:.75rem;font-weight:600">${clean(t)}</span>`).join('')}</div>` : ''}
        ${link ? `<p style="margin-top:12px;font-size:.85rem"><a href="${clean(link)}" target="_blank" rel="noopener" style="color:var(--primary);word-break:break-all">🔗 ${clean(link)}</a></p>` : ''}
        ${file ? `<p style="margin-top:8px;font-size:.85rem">📎 ${clean(file)}</p>` : ''}
      </div>

      <div id="review-wizard-comment-box" style="display:none;margin-bottom:14px">
        <textarea id="review-wizard-comment" placeholder="Write feedback for the contributor..."
          style="width:100%;min-height:90px;padding:12px;border-radius:14px;background:var(--surface);border:1px solid var(--border);color:var(--text);font-family:inherit;box-sizing:border-box"></textarea>
        <button class="btn btn-primary" style="margin-top:8px" onclick="AdminWizard.reviewSendComment()">Send Comment</button>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn" onclick="AdminWizard.reviewSkip()">⏭ Skip</button>
        <button class="btn" onclick="AdminWizard.reviewToggleComment()">💬 Comment</button>
        <button class="btn" onclick="AdminWizard.reviewReject()">❌ Reject</button>
        <button class="btn btn-primary" style="flex:1" onclick="AdminWizard.reviewApprove()">✅ Approve</button>
      </div>
      <button class="btn" style="width:100%;margin-top:10px" onclick="AdminWizard.closeReviewWizard()">✕ Exit Queue</button>
    `;

    openAdminModal(html);
  }

  function reviewToggleComment() {
    const box = document.getElementById('review-wizard-comment-box');
    if (box) box.style.display = box.style.display === 'none' ? 'block' : 'none';
  }

  async function reviewSendComment() {
    if (!reviewState) return;

    const item = reviewState.queue[reviewState.index];
    const box = document.getElementById('review-wizard-comment');

    if (!box || !box.value.trim()) {
      showToast('Write a comment first', 'error');
      return;
    }

    const review = item.review || { comments: [] };
    review.comments.push({
      message: box.value.trim(),
      reviewer: typeof currentUser === 'function' ? currentUser() : null,
      time: new Date().toISOString()
    });

    await updateRecord(item._collection, item.id, { review });

    if (item.author?.id && typeof notifyUser === 'function') {
      notifyUser(item.author.id, {
        title: 'New review feedback 💬',
        message: 'A reviewer commented on your submission.',
        type: 'info'
      });
    }

    showToast('Comment added', 'success');
    box.value = '';
    reviewToggleComment();
  }

  async function reviewApprove() {
    if (!reviewState) return;
    const item = reviewState.queue[reviewState.index];
    if (!item) return;

    await approveContent(item._collection, item.id);
    reviewAdvance();
  }

  function reviewReject() {
    if (!reviewState) return;
    const item = reviewState.queue[reviewState.index];
    if (!item) return;

    PharmoraUI.prompt({
      title: 'Reject Submission ❌',
      message: 'Enter a reason — the contributor will see this so they can improve and resubmit.',
      placeholder: 'Reason for rejection',
      confirmText: 'Reject',
      onConfirm: `AdminWizard.reviewRejectConfirm('${item._collection}','${item.id}')`
    });
  }

  async function reviewRejectConfirm(collection, id, reason) {
    if (!reason) return;
    await rejectContent(collection, id, reason);
    reviewAdvance();
  }

  function reviewSkip() {
    reviewAdvance();
  }

  function reviewAdvance() {
    if (!reviewState) return;

    reviewState.index++;

    if (reviewState.index >= reviewState.queue.length) {
      showToast('Review queue complete ✅', 'success');
      closeReviewWizard();
      return;
    }

    renderReviewStep();
  }

  function closeReviewWizard() {
    reviewState = null;
    closeAdminModal();
    if (typeof renderAdminActions === 'function') renderAdminActions();
    if (typeof renderAdminStats === 'function') renderAdminStats();
  }

  // ─── PUBLIC API ───────────────────────────────────────────────────────

  return {
    // add/edit
    toReview,
    backToForm,
    confirmSave,
    // review queue
    startReviewWizard,
    reviewToggleComment,
    reviewSendComment,
    reviewApprove,
    reviewReject,
    reviewRejectConfirm,
    reviewSkip,
    closeReviewWizard
  };

})();

console.log('✓ AdminWizard ready');