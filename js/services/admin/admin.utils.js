/**
 * Pharmora Admin Workbench — Shared Utilities
 */
(function () {
  'use strict';

  if (!window.PharmoraAdminUtils) {
    window.PharmoraAdminUtils = {};
  }

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

  window.PharmoraAdminUtils.h = h;
  window.PharmoraAdminUtils.statCard = statCard;
  window.PharmoraAdminUtils.getEntities = getEntities;
  window.PharmoraAdminUtils.entityRow = entityRow;
})();
