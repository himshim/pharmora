/*
  Pharmora Universal Table Component
  v2.0.0
*/
(function() {
  function renderTable(entities = [], config) {
    if (!Array.isArray(entities) || entities.length === 0) {
      return `<div style="padding:20px; color:var(--text-muted); font-size:0.95rem;">No items found.</div>`;
    }

    const resolve = PharmoraUniversalRenderer.resolveField;

    // Define table columns
    const columns = config.tableColumns || [
      { label: "Code/ID", value: config.badgeField },
      { label: "Title/Name", value: config.titleField },
      { label: "Category/Sub", value: config.subtitleField },
      { label: "Status", value: "status" }
    ];

    const headerHtml = columns.map(c => `
      <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border); color: var(--text-secondary); font-weight: 600;">${c.label}</th>
    `).join("");

    const rowsHtml = entities.map(entity => {
      const cellsHtml = columns.map(c => {
        let val = resolve(entity, c.value);
        if (!val) {
          if (c.label === "Code/ID") val = entity.content?.code || entity.content?.shortName || entity.content?.icd10Code || entity.publicId;
          else if (c.label === "Title/Name") val = entity.content?.title || entity.content?.name || entity.content?.genericName;
          else if (c.label === "Category/Sub") val = entity.content?.subtitle || entity.content?.chemicalClass || entity.content?.course;
        }
        if (c.value === "status") {
          val = `<span style="background:var(--border); font-size:0.75rem; padding:2px 6px; border-radius:4px; text-transform:capitalize;">${entity.status}</span>`;
        }
        return `<td style="padding: 12px; border-bottom: 1px solid var(--border); color: var(--text);">${val || "—"}</td>`;
      }).join("");

      return `
        <tr style="cursor: pointer; transition: background 0.15s;" onclick="location.hash='#${entity.type.toLowerCase()}/${entity.uuid}'" onmouseover="this.style.background='var(--primary-light)'" onmouseout="this.style.background='transparent'">
          ${cellsHtml}
        </tr>
      `;
    }).join("");

    return `
      <div style="overflow-x: auto; width: 100%; border: 1px solid var(--border); border-radius: 8px; background: var(--surface);">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
          <thead>
            <tr style="background: var(--bg-body);">
              ${headerHtml}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  window.PharmoraUniversalTable = {
    render: renderTable
  };
})();
