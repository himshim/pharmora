/*
  Pharmora Universal Entity Manager UI Component
  v3.0.0 — Extended render() API: render(containerId, typeOrFilter, optionalFilter)
  Backwards compatible: render(containerId, "Subject") still works.
*/
(function() {
  'use strict';

  const ALL_TYPES = [
    'Subject','Course','Semester','Unit','Topic','Practical','QuestionBank','MCQ','Resource',
    'Book','Drug','Brand','Manufacturer','Disease','Mechanism','TherapeuticClass',
    'PharmacologicalClass','DosageForm','Excipient','AdverseEffect','Interaction','Contraindication',
    'Research','Event','Tool'
  ];

  /**
   * Normalise the arguments to a single filter object.
   * Supports:
   *   render(id, "Subject")
   *   render(id, "Subject", { status, query, sort })
   *   render(id, { type, status, query, sort, tags, owner, reviewer, layout, page, pageSize })
   */
  function _normaliseFilter(typeOrFilter, optionalFilter) {
    let filter = {};
    if (typeof typeOrFilter === 'string') {
      filter.type = typeOrFilter;
      if (optionalFilter && typeof optionalFilter === 'object') {
        Object.assign(filter, optionalFilter);
      }
    } else if (typeOrFilter && typeof typeOrFilter === 'object') {
      filter = Object.assign({}, typeOrFilter);
    }
    filter.layout   = filter.layout   || 'list';
    filter.sort     = filter.sort     || 'created';
    filter.page     = filter.page     || 1;
    filter.pageSize = filter.pageSize || 30;
    return filter;
  }

  function renderFilters(initFilter) {
    const typeOptions = ['', ...ALL_TYPES].map(t =>
      `<option value="${t}" ${t === (initFilter.type || '') ? 'selected' : ''}>${t || 'All Types'}</option>`
    ).join('');

    const statusOptions = [
      { v: '', l: 'All Statuses' },
      { v: 'draft',          l: 'Draft' },
      { v: 'pending_review', l: 'Pending Review' },
      { v: 'approved',       l: 'Approved' },
      { v: 'published',      l: 'Published' },
      { v: 'archived',       l: 'Archived' },
    ].map(s =>
      `<option value="${s.v}" ${s.v === (initFilter.status || '') ? 'selected' : ''}>${s.l}</option>`
    ).join('');

    return { typeOptions, statusOptions };
  }

  function renderToolbar(initFilter, typeOptions, statusOptions) {
    return `
      <!-- Toolbar row -->
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 16px;
                  background:var(--surface);border:1px solid var(--border);border-radius:14px;">
        <input id="em-search" type="text" placeholder="🔍 Search…" value="${initFilter.query || ''}"
          style="flex:1;min-width:150px;padding:8px 12px;border-radius:10px;border:1px solid var(--border);
                 background:var(--background);color:var(--text);font-size:0.85rem;" />

        <select id="em-type" style="padding:8px;border-radius:8px;border:1px solid var(--border);background:var(--background);color:var(--text);font-size:0.82rem;">
          ${typeOptions}
        </select>

        <select id="em-status" style="padding:8px;border-radius:8px;border:1px solid var(--border);background:var(--background);color:var(--text);font-size:0.82rem;">
          ${statusOptions}
        </select>

        <select id="em-sort" style="padding:8px;border-radius:8px;border:1px solid var(--border);background:var(--background);color:var(--text);font-size:0.82rem;">
          <option value="created" ${initFilter.sort==='created' ? 'selected' : ''}>Newest</option>
          <option value="updated" ${initFilter.sort==='updated' ? 'selected' : ''}>Updated</option>
          <option value="title"   ${initFilter.sort==='title'   ? 'selected' : ''}>Title A–Z</option>
          <option value="popular" ${initFilter.sort==='popular' ? 'selected' : ''}>Popular</option>
        </select>

        <select id="em-layout" style="padding:8px;border-radius:8px;border:1px solid var(--border);background:var(--background);color:var(--text);font-size:0.82rem;">
          <option value="list"    ${initFilter.layout==='list'    ? 'selected' : ''}>Grid Cards</option>
          <option value="table"   ${initFilter.layout==='table'   ? 'selected' : ''}>Table</option>
          <option value="compact" ${initFilter.layout==='compact' ? 'selected' : ''}>Compact</option>
        </select>

        <button id="em-create-btn" style="padding:8px 16px;border:none;background:var(--primary);color:#fff;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.82rem;">+ Create</button>
        <span id="em-count" style="font-size:0.78rem;color:var(--text-soft);font-weight:600;white-space:nowrap;"></span>
      </div>
    `;
  }

  function renderResults(layout, page_ents) {
    if (layout === 'table') {
      const autoConfig = typeof PharmoraUniversalRenderer !== 'undefined'
        ? PharmoraUniversalRenderer.getAutoConfig(page_ents[0])
        : {};
      return typeof PharmoraUniversalRenderer !== 'undefined'
        ? PharmoraUniversalRenderer.render(page_ents, 'table', autoConfig)
        : `<div style="padding:20px;color:var(--text-soft);">Renderer not available.</div>`;
    } else if (layout === 'compact') {
      return `<div style="display:flex;flex-direction:column;gap:6px;">
        ${page_ents.map(ent => {
          const title = ent.content?.title || ent.content?.name || ent.publicId || ent.type;
          return `<div data-uuid="${ent.uuid}" style="display:flex;align-items:center;gap:10px;padding:10px 14px;
                       background:var(--surface);border:1px solid var(--border);border-radius:10px;cursor:pointer;">
            <input type="checkbox" class="em-cb" data-uuid="${ent.uuid}" onclick="event.stopPropagation()">
            <span style="font-size:0.75rem;background:var(--border);padding:1px 6px;border-radius:4px;">${ent.type}</span>
            <span style="flex:1;font-weight:600;font-size:0.85rem;">${title}</span>
            <span style="font-size:0.72rem;color:var(--text-soft);">${ent.status}</span>
          </div>`;
        }).join('')}
      </div>`;
    } else {
      return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:16px;">
        ${page_ents.map(ent => {
          const config = typeof PharmoraUniversalRenderer !== 'undefined'
            ? PharmoraUniversalRenderer.getAutoConfig(ent)
            : {};
          const cardHtml = typeof PharmoraUniversalRenderer !== 'undefined'
            ? PharmoraUniversalRenderer.render(ent, 'card', config)
            : `<div style="padding:14px;">${ent.content?.title || ent.publicId}</div>`;
          return `<div style="position:relative;" data-uuid="${ent.uuid}">
            <input type="checkbox" class="em-cb" data-uuid="${ent.uuid}"
              style="position:absolute;top:10px;right:10px;z-index:10;transform:scale(1.2);" onclick="event.stopPropagation()">
            ${cardHtml}
          </div>`;
        }).join('')}
      </div>`;
    }
  }

  function renderPagination(total, page, pageSize) {
    const pages = Math.ceil(total / pageSize);
    const pg    = document.getElementById('em-pagination');
    if (!pg || pages <= 1) { if (pg) pg.innerHTML = ''; return; }
    const btnStyle = (active) =>
      `padding:6px 12px;border-radius:8px;border:1px solid var(--border);cursor:pointer;font-weight:600;font-size:0.8rem;
       background:${active ? 'var(--primary)' : 'var(--surface)'};color:${active ? '#fff' : 'var(--text)'};`;
    const nums = Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1);
    pg.innerHTML = nums.map(n =>
      `<button style="${btnStyle(n === page)}" onclick="window.__emGoPage(${n})">${n}</button>`
    ).join('');
  }

  function bindManagerEvents(loadData, selectedUuids, _updateBulkBar, initFilter) {
    const deb = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
    const reload = deb(loadData, 280);
    ['em-type','em-status','em-sort','em-layout'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => { reload(); });
    });
    document.getElementById('em-search')?.addEventListener('input', () => { reload(); });

    // Bulk actions
    document.querySelectorAll('[data-em-bulk]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const action = btn.dataset.emBulk;
        const uuids  = [...selectedUuids];
        if (!uuids.length) return;
        for (const uuid of uuids) {
          try {
            if (typeof PharmoraEntityManager !== 'undefined') {
              if (action === 'publish') await PharmoraEntityManager.bulkPublish([uuid], 'admin');
              if (action === 'archive') await PharmoraEntityManager.bulkArchive([uuid], 'admin');
              if (action === 'delete')  await PharmoraEntityManager.bulkDelete([uuid], 'admin');
            }
            if (action === 'approve' && typeof PharmoraEntityReview !== 'undefined') {
              await PharmoraEntityReview.approve(uuid, 'admin');
            }
          } catch(e) { console.warn('Bulk', action, uuid, e); }
        }
        selectedUuids.clear();
        _updateBulkBar();
        loadData();
      });
    });
    document.getElementById('em-bulk-clear')?.addEventListener('click', () => {
      selectedUuids.clear();
      document.querySelectorAll('.em-cb').forEach(cb => cb.checked = false);
      _updateBulkBar();
    });

    // Create button
    document.getElementById('em-create-btn')?.addEventListener('click', () => {
      const type = document.getElementById('em-type')?.value || '';
      if (typeof PharmoraWorkbench !== 'undefined' && PharmoraWorkbench._wb) {
        PharmoraWorkbench._wb.openViewer({ uuid: null, type, _create: true });
      } else {
        alert(`Create new ${type || 'entity'} — wire to Entity Editor.`);
      }
    });
  }

  function renderManagerUI(containerId, typeOrFilter, optionalFilter) {
    const root = document.getElementById(containerId);
    if (!root) return;

    const initFilter = _normaliseFilter(typeOrFilter, optionalFilter);
    const { typeOptions, statusOptions } = renderFilters(initFilter);

    root.innerHTML = `
      <div class="entity-manager-ui" style="display:flex;flex-direction:column;gap:18px;">
        ${renderToolbar(initFilter, typeOptions, statusOptions)}

        <!-- Bulk actions bar -->
        <div id="em-bulk-bar" style="display:none;align-items:center;gap:8px;flex-wrap:wrap;
                                     padding:10px 14px;background:rgba(34,211,238,.08);
                                     border:1px solid var(--primary);border-radius:10px;">
          <span id="em-bulk-count" style="font-weight:700;font-size:0.85rem;color:var(--primary);"></span>
          <button data-em-bulk="publish" style="padding:5px 12px;border:none;background:var(--primary);color:#fff;border-radius:6px;font-weight:700;cursor:pointer;font-size:0.8rem;">📢 Publish</button>
          <button data-em-bulk="approve" style="padding:5px 12px;border:none;background:#22c55e;color:#fff;border-radius:6px;font-weight:700;cursor:pointer;font-size:0.8rem;">✓ Approve</button>
          <button data-em-bulk="archive" style="padding:5px 12px;border:none;background:#64748b;color:#fff;border-radius:6px;font-weight:700;cursor:pointer;font-size:0.8rem;">🗄 Archive</button>
          <button data-em-bulk="delete"  style="padding:5px 12px;border:none;background:#ef4444;color:#fff;border-radius:6px;font-weight:700;cursor:pointer;font-size:0.8rem;">🗑 Delete</button>
          <button id="em-bulk-clear" style="padding:5px 12px;border:1px solid var(--border);background:none;color:var(--text-soft);border-radius:6px;font-weight:600;cursor:pointer;font-size:0.8rem;margin-left:auto;">Clear</button>
        </div>

        <!-- Content area -->
        <div id="em-content" style="min-height:200px;"></div>

        <!-- Pagination -->
        <div id="em-pagination" style="display:flex;justify-content:center;gap:8px;padding:12px 0;"></div>
      </div>
    `;

    let selectedUuids = new Set();
    let currentPage   = initFilter.page;

    function _currentFilter() {
      return {
        type:     document.getElementById('em-type')?.value     || '',
        status:   document.getElementById('em-status')?.value   || '',
        query:    document.getElementById('em-search')?.value   || '',
        sort:     document.getElementById('em-sort')?.value     || 'created',
        layout:   document.getElementById('em-layout')?.value   || 'list',
        owner:    initFilter.owner     || '',
        reviewer: initFilter.reviewer  || '',
        tags:     initFilter.tags      || [],
        page:     currentPage,
        pageSize: initFilter.pageSize  || 30,
      };
    }

    function _updateBulkBar() {
      const bar = document.getElementById('em-bulk-bar');
      const cnt = document.getElementById('em-bulk-count');
      if (bar) bar.style.display = selectedUuids.size > 0 ? 'flex' : 'none';
      if (cnt) cnt.textContent = `${selectedUuids.size} selected`;
    }

    async function loadData() {
      const f   = _currentFilter();
      const cnt = document.getElementById('em-content');
      if (cnt) cnt.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-soft);">Loading…</div>`;

      let entities = [];
      try {
        if (typeof PharmoraEntityManager !== 'undefined') {
          entities = await PharmoraEntityManager.getFilteredEntities({
            type:     f.type,
            status:   f.status,
            sortBy:   f.sort,
            owner:    f.owner,
            reviewer: f.reviewer,
            tags:     f.tags,
          });
        } else if (typeof PharmoraEntityAPI !== 'undefined') {
          entities = await PharmoraEntityAPI.listEntities();
        }
      } catch(e) {
        console.warn('[EntityManager] Data load error', e);
      }

      if (f.query) {
        const q = f.query.toLowerCase();
        entities = entities.filter(e => {
          const hay = [
            e.content?.title, e.content?.name, e.content?.genericName,
            e.type, e.publicId
          ].filter(Boolean).join(' ').toLowerCase();
          return hay.includes(q);
        });
      }

      const total    = entities.length;
      const start    = (f.page - 1) * f.pageSize;
      const page_ents = entities.slice(start, start + f.pageSize);

      const countEl = document.getElementById('em-count');
      if (countEl) countEl.textContent = `${total} entities`;

      if (!cnt) return;

      if (page_ents.length === 0) {
        cnt.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-soft);">No entities match the current filters.</div>`;
        return;
      }

      cnt.innerHTML = renderResults(f.layout, page_ents);

      cnt.querySelectorAll('.em-cb').forEach(cb => {
        cb.checked = selectedUuids.has(cb.dataset.uuid);
        cb.addEventListener('change', () => {
          if (cb.checked) selectedUuids.add(cb.dataset.uuid);
          else selectedUuids.delete(cb.dataset.uuid);
          _updateBulkBar();
        });
      });

      renderPagination(total, f.page, f.pageSize);
    }

    window.__emGoPage = (n) => { currentPage = n; loadData(); };

    bindManagerEvents(loadData, selectedUuids, _updateBulkBar, initFilter);
    loadData();
  }

  window.PharmoraEntityManagerUI = {
    render: renderManagerUI
  };

})();
