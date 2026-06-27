/*
  Pharmora Entity Relations Viewer Component
  v2.0.0
*/
(function() {
  async function renderRelations(entity) {
    if (!entity) return "";

    const outgoing = entity.relations || [];
    
    // Find incoming relations by listing all entities and filtering
    let incoming = [];
    if (typeof PharmoraEntityAPI !== "undefined") {
      try {
        const allList = await PharmoraEntityAPI.listEntities();
        incoming = allList.filter(ent => 
          ent.uuid !== entity.uuid && 
          ent.relations.some(r => r.targetUuid === entity.uuid)
        ).map(ent => {
          const relationSpec = ent.relations.find(r => r.targetUuid === entity.uuid);
          return {
            sourceUuid: ent.uuid,
            sourceType: ent.type,
            relationType: relationSpec.relationType,
            metadata: relationSpec.metadata,
            sourceName: ent.content?.title || ent.content?.name || ent.publicId
          };
        });
      } catch (e) {
        console.warn("Could not load incoming relations:", e);
      }
    }

    // Render Outgoing Section
    let outgoingHtml = "";
    if (outgoing.length > 0) {
      outgoingHtml = outgoing.map(rel => `
        <div style="padding:8px; border:1px solid var(--border); border-radius:4px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; background:var(--surface);">
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; background:var(--primary-light); color:var(--primary); padding:2px 6px; border-radius:4px; font-weight:bold; margin-right:8px;">${rel.relationType}</span>
            <a href="#entity/${rel.targetUuid}" style="color:var(--text); text-decoration:none; font-weight:500;">
              ${rel.metadata?.title || rel.metadata?.name || `${rel.targetType} (ID: ${rel.targetUuid.substring(0,8)})`}
            </a>
          </div>
          <span style="font-size:0.8rem; color:var(--text-muted); text-transform:capitalize;">${rel.targetType}</span>
        </div>
      `).join("");
    } else {
      outgoingHtml = `<p style="font-size:0.85rem; color:var(--text-muted); margin:0;">No outgoing connections.</p>`;
    }

    // Render Incoming Section
    let incomingHtml = "";
    if (incoming.length > 0) {
      incomingHtml = incoming.map(rel => `
        <div style="padding:8px; border:1px solid var(--border); border-radius:4px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; background:var(--surface);">
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; background:var(--border); color:var(--text-secondary); padding:2px 6px; border-radius:4px; font-weight:bold; margin-right:8px;">${rel.relationType}</span>
            <a href="#entity/${rel.sourceUuid}" style="color:var(--text); text-decoration:none; font-weight:500;">
              ${rel.sourceName}
            </a>
          </div>
          <span style="font-size:0.8rem; color:var(--text-muted); text-transform:capitalize;">${rel.sourceType}</span>
        </div>
      `).join("");
    } else {
      incomingHtml = `<p style="font-size:0.85rem; color:var(--text-muted); margin:0;">No incoming connections.</p>`;
    }

    return `
      <div class="entity-relations-component" style="display:flex; flex-direction:column; gap:16px;">
        <div>
          <h4 style="margin:0 0 10px 0; color:var(--text); font-size:1rem; border-bottom:1px solid var(--border); padding-bottom:4px;">References to Other Nodes (Outgoing)</h4>
          ${outgoingHtml}
        </div>
        <div>
          <h4 style="margin:0 0 10px 0; color:var(--text); font-size:1rem; border-bottom:1px solid var(--border); padding-bottom:4px;">Referenced by Other Nodes (Incoming)</h4>
          ${incomingHtml}
        </div>
      </div>
    `;
  }

  window.PharmoraEntityRelationsComponent = {
    render: renderRelations
  };
})();
