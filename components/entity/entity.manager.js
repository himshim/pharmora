/*
  Pharmora Universal Entity Manager UI Component
  v2.0.0
*/
(function() {
  function renderManagerUI(containerId, initialType = "") {
    const root = document.getElementById(containerId);
    if (!root) return;

    // Define UI wrapper
    root.innerHTML = `
      <div class="entity-manager-ui" style="display:flex; flex-direction:column; gap:20px; padding:20px; font-family:sans-serif; background:var(--surface); border:1px solid var(--border); border-radius:8px;">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <h2 style="margin:0; color:var(--text);">Universal Entity Manager</h2>
          <div style="display:flex; gap:10px;">
            <button id="btn-create-entity" class="btn btn-primary" style="padding:8px 16px; background:var(--primary); color:white; border:none; border-radius:4px; cursor:pointer;">+ Create Entity</button>
          </div>
        </div>

        <!-- Filters Bar -->
        <div class="filters-bar" style="display:flex; gap:12px; flex-wrap:wrap; align-items:center; background:var(--bg-body); padding:12px; border-radius:6px; border:1px solid var(--border);">
          <div style="display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:0.75rem; color:var(--text-secondary); font-weight:bold;">Type</label>
            <select id="filter-type" style="padding:6px; border-radius:4px; border:1px solid var(--border);">
              <option value="">All Types</option>
              <option value="Subject" ${initialType === "Subject" ? "selected" : ""}>Subject</option>
              <option value="Drug">Drug</option>
            </select>
          </div>

          <div style="display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:0.75rem; color:var(--text-secondary); font-weight:bold;">Status</label>
            <select id="filter-status" style="padding:6px; border-radius:4px; border:1px solid var(--border);">
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div style="display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:0.75rem; color:var(--text-secondary); font-weight:bold;">Sort By</label>
            <select id="sort-by" style="padding:6px; border-radius:4px; border:1px solid var(--border);">
              <option value="created">Date Created</option>
              <option value="title">Title/Name</option>
              <option value="updated">Date Updated</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>

          <div style="display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:0.75rem; color:var(--text-secondary); font-weight:bold;">Layout</label>
            <select id="layout-mode" style="padding:6px; border-radius:4px; border:1px solid var(--border);">
              <option value="list">Grid Cards</option>
              <option value="table">Table View</option>
            </select>
          </div>
        </div>

        <!-- Bulk Actions Bar -->
        <div id="bulk-actions-bar" style="display:none; align-items:center; gap:12px; background:var(--primary-light); padding:10px; border-radius:6px; border:1px solid var(--primary);">
          <span id="selected-count" style="font-size:0.9rem; font-weight:bold; color:var(--primary);">0 items selected</span>
          <button id="bulk-btn-publish" style="padding:4px 8px; border:none; background:var(--primary); color:white; border-radius:4px; cursor:pointer;">Publish</button>
          <button id="bulk-btn-archive" style="padding:4px 8px; border:none; background:var(--primary); color:white; border-radius:4px; cursor:pointer;">Archive</button>
          <button id="bulk-btn-delete" style="padding:4px 8px; border:none; background:red; color:white; border-radius:4px; cursor:pointer;">Delete</button>
        </div>

        <!-- Content Container -->
        <div id="manager-entities-container" style="min-height:200px;">
          <!-- Loaded via JS -->
        </div>
      </div>
    `;

    // Fetch and render list
    async function loadData() {
      const type = document.getElementById("filter-type").value;
      const status = document.getElementById("filter-status").value;
      const sortBy = document.getElementById("sort-by").value;
      const layout = document.getElementById("layout-mode").value;

      const entities = await PharmoraEntityManager.getFilteredEntities({
        type,
        status,
        sortBy
      });

      const container = document.getElementById("manager-entities-container");
      if (layout === "list") {
        let cardsHtml = "";
        if (entities.length === 0) {
          cardsHtml = `<div style="padding:20px; color:var(--text-muted);">No entities match the filters.</div>`;
        } else {
          cardsHtml = entities.map(ent => {
            const config = typeof PharmoraSubjectRenderer !== "undefined" && ent.type === "Subject" 
              ? PharmoraSubjectRenderer.config 
              : PharmoraUniversalRenderer.getAutoConfig(ent);
            
            return `
              <div style="position:relative;">
                <input type="checkbox" class="entity-select-checkbox" data-uuid="${ent.uuid}" style="position:absolute; top:12px; right:12px; z-index:10; transform:scale(1.2);">
                ${PharmoraUniversalRenderer.render(ent, "card", config)}
              </div>
            `;
          }).join("");
        }
        container.innerHTML = `
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
            ${cardsHtml}
          </div>
        `;
      } else {
        // Table layout
        const autoConfig = entities.length > 0 ? PharmoraUniversalRenderer.getAutoConfig(entities[0]) : {};
        container.innerHTML = PharmoraUniversalRenderer.render(entities, "table", autoConfig);
      }

      attachCheckboxListeners();
    }

    function attachCheckboxListeners() {
      const checkboxes = document.querySelectorAll(".entity-select-checkbox");
      const bulkBar = document.getElementById("bulk-actions-bar");
      const selectedCount = document.getElementById("selected-count");

      checkboxes.forEach(cb => {
        cb.addEventListener("change", () => {
          const selected = Array.from(checkboxes).filter(c => c.checked);
          if (selected.length > 0) {
            bulkBar.style.display = "flex";
            selectedCount.textContent = `${selected.length} items selected`;
          } else {
            bulkBar.style.display = "none";
          }
        });
      });
    }

    // Attach filters listeners
    document.getElementById("filter-type").addEventListener("change", loadData);
    document.getElementById("filter-status").addEventListener("change", loadData);
    document.getElementById("sort-by").addEventListener("change", loadData);
    document.getElementById("layout-mode").addEventListener("change", loadData);

    // Attach bulk action buttons
    document.getElementById("bulk-btn-publish").addEventListener("click", async () => {
      const uuids = Array.from(document.querySelectorAll(".entity-select-checkbox:checked")).map(cb => cb.dataset.uuid);
      await PharmoraEntityManager.bulkPublish(uuids, "admin");
      loadData();
    });

    document.getElementById("bulk-btn-archive").addEventListener("click", async () => {
      const uuids = Array.from(document.querySelectorAll(".entity-select-checkbox:checked")).map(cb => cb.dataset.uuid);
      await PharmoraEntityManager.bulkArchive(uuids, "admin");
      loadData();
    });

    document.getElementById("bulk-btn-delete").addEventListener("click", async () => {
      const uuids = Array.from(document.querySelectorAll(".entity-select-checkbox:checked")).map(cb => cb.dataset.uuid);
      await PharmoraEntityManager.bulkDelete(uuids, "admin");
      loadData();
    });

    // Initial load
    loadData();
  }

  window.PharmoraEntityManagerUI = {
    render: renderManagerUI
  };
})();
