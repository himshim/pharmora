/*
  Pharmora Entity References Component
  v2.0.0
*/
(function() {
  function renderReferences(entity) {
    if (!entity) return "";

    const content = entity.content || {};
    const ipStandard = content.ipStandard || "";
    const nlemListed = content.nlemListed || "";
    const janAushadhi = content.janAushadhi || "";

    const referenceRelations = (entity.relations || []).filter(r => 
      r.relationType === "referenced_book" || r.relationType === "published_in" || r.relationType === "studied_in"
    );

    let listHtml = "";
    if (referenceRelations.length > 0) {
      listHtml = referenceRelations.map(rel => `
        <li style="margin-bottom:6px;">
          <a href="#entity/${rel.targetUuid}" style="color:var(--primary); text-decoration:none; font-weight:500;">
            ${rel.metadata?.title || rel.metadata?.name || `${rel.targetType} Reference`}
          </a>
          <span style="font-size:0.8rem; color:var(--text-muted); margin-left:6px;">(${rel.relationType})</span>
        </li>
      `).join("");
    }

    let standardsHtml = "";
    if (ipStandard || nlemListed || janAushadhi) {
      standardsHtml = `
        <div style="margin-top:12px; font-size:0.9rem; background:var(--bg-body); padding:10px; border-radius:4px; border:1px solid var(--border);">
          ${ipStandard ? `<p style="margin:4px 0;"><strong>Standard:</strong> ${ipStandard}</p>` : ''}
          ${nlemListed ? `<p style="margin:4px 0;"><strong>Essential Med List:</strong> ${nlemListed}</p>` : ''}
          ${janAushadhi ? `<p style="margin:4px 0;"><strong>Jan Aushadhi:</strong> ${janAushadhi}</p>` : ''}
        </div>
      `;
    }

    if (!listHtml && !standardsHtml) {
      return `<p style="font-size:0.85rem; color:var(--text-muted); margin:0;">No reference standards listed.</p>`;
    }

    return `
      <div class="entity-references">
        <h3 style="font-size:1.1rem; margin:0 0 8px 0; color:var(--text);">Citations & Reference Standards</h3>
        ${listHtml ? `<ul style="margin:0; padding-left:20px; font-size:0.9rem; color:var(--text-secondary);">${listHtml}</ul>` : ''}
        ${standardsHtml}
      </div>
    `;
  }

  window.PharmoraEntityReferences = {
    render: renderReferences
  };
})();
