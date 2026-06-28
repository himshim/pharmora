/*
  Pharmora Entity Relations Viewer Component
  v3.0.0 — Complete Knowledge Graph Editor
*/
(function() {
  async function renderRelations(entity) {
    if (!entity) return "";

    const outgoing = entity.relations || [];
    let incoming = [];
    let allEntities = [];

    if (typeof PharmoraEntityAPI !== "undefined") {
      try {
        allEntities = await PharmoraEntityAPI.listEntities();
        incoming = allEntities.filter(ent => 
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

    // ── 1. Breadcrumbs ──
    let breadcrumbHtml = `<div style="font-size:0.78rem;color:var(--text-soft);margin-bottom:12px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;">`;
    breadcrumbHtml += `<span style="cursor:pointer;color:var(--primary);" onclick="PharmoraWorkbench._wb.openViewer({ uuid: '${entity.uuid}' })">${entity.type}</span>`;
    let parentRel = incoming.find(r => r.relationType === 'belongsTo' || r.relationType === 'part_of_semester');
    if (parentRel) {
      breadcrumbHtml = `<span style="cursor:pointer;color:var(--text-soft);" onclick="PharmoraWorkbench._wb.openViewer({ uuid: '${parentRel.sourceUuid}' })">${parentRel.sourceName}</span> &rarr; ` + breadcrumbHtml;
    }
    breadcrumbHtml += `</div>`;

    // ── 2. Parents (Incoming/Explicit belongsTo) ──
    const parentListHtml = incoming.map(rel => `
      <div style="padding:10px 14px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;background:var(--surface-light);">
        <div onclick="PharmoraWorkbench._wb.openViewer({ uuid: '${rel.sourceUuid}' })" style="cursor:pointer;flex:1;">
          <span style="font-size:0.7rem;text-transform:uppercase;background:var(--border);color:var(--text-soft);padding:2px 6px;border-radius:4px;font-weight:700;margin-right:8px;">${rel.relationType}</span>
          <strong style="font-size:0.85rem;color:var(--text);">${rel.sourceName}</strong>
        </div>
        <button onclick="PharmoraWorkbench._wb._unlinkConfirm('${entity.uuid}', '${rel.relationType}', '${rel.sourceUuid}')"
                style="border:none;background:none;color:#ef4444;cursor:pointer;font-weight:700;font-size:0.8rem;padding:4px 8px;">✕ Unlink</button>
      </div>
    `).join("") || `<p style="font-size:0.82rem;color:var(--text-muted);margin:0;">No parent relationships.</p>`;

    // ── 3. Children (Outgoing/Explicit hasMany) ──
    const childrenListHtml = outgoing.map(rel => `
      <div style="padding:10px 14px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;background:var(--surface-light);">
        <div onclick="PharmoraWorkbench._wb.openViewer({ uuid: '${rel.targetUuid}' })" style="cursor:pointer;flex:1;">
          <span style="font-size:0.7rem;text-transform:uppercase;background:rgba(34,211,238,.12);color:var(--primary);padding:2px 6px;border-radius:4px;font-weight:700;margin-right:8px;">${rel.relationType}</span>
          <strong style="font-size:0.85rem;color:var(--text);">${rel.metadata?.title || rel.metadata?.name || `${rel.targetType} (${rel.targetUuid.substring(0,8)})`}</strong>
        </div>
        <button onclick="PharmoraWorkbench._wb._unlinkConfirm('${entity.uuid}', '${rel.relationType}', '${rel.targetUuid}')"
                style="border:none;background:none;color:#ef4444;cursor:pointer;font-weight:700;font-size:0.8rem;padding:4px 8px;">✕ Unlink</button>
      </div>
    `).join("") || `<p style="font-size:0.82rem;color:var(--text-muted);margin:0;">No child relationships.</p>`;

    // ── 4. Descendant Tree View (DFS Tree Node Traversal) ──
    function buildTreeHtml(nodeUuid, visited = new Set(), depth = 0) {
      if (visited.has(nodeUuid) || depth > 4) return "";
      visited.add(nodeUuid);
      const nodeObj = allEntities.find(e => e.uuid === nodeUuid);
      if (!nodeObj) return "";

      const label = nodeObj.content?.title || nodeObj.content?.name || nodeObj.publicId;
      let html = `<div style="padding-left:${depth * 14}px;margin:4px 0;font-size:0.82rem;display:flex;align-items:center;gap:6px;">
        <span style="color:var(--text-soft);font-weight:700;">&bull;</span>
        <span style="cursor:pointer;color:var(--text);" onclick="PharmoraWorkbench._wb.openViewer({ uuid: '${nodeObj.uuid}' })">${label} <small style="color:var(--text-muted);">(${nodeObj.type})</small></span>
      </div>`;

      const children = nodeObj.relations || [];
      children.forEach(c => {
        html += buildTreeHtml(c.targetUuid, visited, depth + 1);
      });
      return html;
    }
    const treeHtml = buildTreeHtml(entity.uuid) || `<p style="font-size:0.82rem;color:var(--text-muted);">No descendants tree available.</p>`;

    return `
      <div class="entity-relations-component" style="display:flex; flex-direction:column; gap:16px;">
        ${breadcrumbHtml}
        
        <div>
          <h4 style="margin:0 0 8px 0; color:var(--text); font-size:0.85rem; text-transform:uppercase; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:4px;">Parent Associations</h4>
          ${parentListHtml}
        </div>

        <div>
          <h4 style="margin:0 0 8px 0; color:var(--text); font-size:0.85rem; text-transform:uppercase; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:4px;">Child Associations</h4>
          ${childrenListHtml}
        </div>

        <div style="background:var(--background);padding:12px;border-radius:10px;border:1px solid var(--border);">
          <h4 style="margin:0 0 8px 0; color:var(--text); font-size:0.85rem; text-transform:uppercase; font-weight:700;">Descendant Tree View</h4>
          <div style="max-height:220px;overflow-y:auto;scrollbar-width:thin;">
            ${treeHtml}
          </div>
        </div>
      </div>
    `;
  }

  window.PharmoraEntityRelationsComponent = {
    render: renderRelations
  };
})();
