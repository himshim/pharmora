/*
  Pharmora Entity Attachments Component
  v2.0.0
*/
(function() {
  function renderAttachments(entity) {
    if (!entity) return "";

    const relations = entity.relations || [];
    const resourceRelations = relations.filter(r => r.targetType === "Resource");

    let listHtml = "";
    if (resourceRelations.length > 0) {
      listHtml = resourceRelations.map(rel => `
        <div style="padding:8px; border:1px solid var(--border); border-radius:4px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; background:var(--surface);">
          <div>
            <span style="font-size:1.2rem; margin-right:8px;">📎</span>
            <a href="${rel.metadata?.url || "#"}" target="_blank" style="color:var(--primary); text-decoration:none; font-weight:500;">
              ${rel.metadata?.title || "Attached Resource"}
            </a>
          </div>
          <span style="font-size:0.75rem; text-transform:uppercase; background:var(--border); padding:2px 6px; border-radius:4px;">
            ${rel.metadata?.type || "Link"}
          </span>
        </div>
      `).join("");
    } else {
      listHtml = `<p style="font-size:0.85rem; color:var(--text-muted); margin:0;">No file attachments connected.</p>`;
    }

    return `
      <div class="entity-attachments" style="display:flex; flex-direction:column; gap:8px;">
        <h3 style="font-size:1.1rem; margin:0 0 4px 0; color:var(--text);">Files & Attachments</h3>
        ${listHtml}
      </div>
    `;
  }

  window.PharmoraEntityAttachments = {
    render: renderAttachments
  };
})();
